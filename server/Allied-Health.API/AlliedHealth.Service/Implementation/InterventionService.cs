using AlliedHealth.Common.Enums;
using AlliedHealth.Domain;
using AlliedHealth.Service.DTOs;
using AlliedHealth.Domain.Entities;
using AlliedHealth.Service.Contract;
using AlliedHealth.Service.Contract.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace AlliedHealth.Service.Implementation
{
    public class InterventionService : IInterventionService
    {
        private readonly AlliedHealthDbContext _dbContext;
        private readonly IConfiguration _configuration;
        private readonly IUserContext _userContext;

        public InterventionService(AlliedHealthDbContext dbContext, IConfiguration configuration, IUserContext userContext)
        {
            _dbContext = dbContext;
            _configuration = configuration;
            _userContext = userContext;
        }

        // ────────────────────────────────────────────────────────────────────────
        // List (OData)
        // ────────────────────────────────────────────────────────────────────────
        public IQueryable<GetInterventionDTO> GetAll()
        {
            return _dbContext.Interventions
                .Select(t => new GetInterventionDTO
                {
                    Id = t.Id,
                    Name = t.Name,
                    Specialty = t.Specialty.Name,
                    LastUpdated = t.ModifiedDate,
                    Hidden = t.Hidden
                }).AsQueryable();
        }

        // ────────────────────────────────────────────────────────────────────────
        // Summary
        // ────────────────────────────────────────────────────────────────────────
        public async Task<GetInterventionSummaryDTO> GetSummary()
        {
            var summary = await _dbContext.Interventions
                .GroupBy(u => 1)
                .Select(g => new GetInterventionSummaryDTO
                {
                    TotalInterventions = g.Count(),
                    ActiveInterventions = g.Count(u => u.Hidden != true),
                }).FirstOrDefaultAsync();

            return summary ?? new GetInterventionSummaryDTO();
        }

        // ────────────────────────────────────────────────────────────────────────
        // Get single intervention with components grouped by type
        // ────────────────────────────────────────────────────────────────────────
        public async Task<GetInterventionDetailsDTO> GetIntervention(Guid id)
        {
            var inv = await _dbContext.Interventions
                .Where(t => t.Id == id)
                .Select(t => new
                {
                    t.Id,
                    t.Name,
                    t.SpecialtyId,
                    t.Description,
                    RawComponents = t.Components.Select(c => new
                    {
                        TypeName = c.ComponentType.Name,
                        c.Value
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (inv == null) return null!;

            // Group components by type
            var grouped = inv.RawComponents
                .GroupBy(c => c.TypeName)
                .Select(g => new InterventionComponentGroupDTO
                {
                    Type = g.Key,
                    Values = g.Select(x => x.Value).ToList()
                }).ToList();

            return new GetInterventionDetailsDTO
            {
                Id = inv.Id,
                Name = inv.Name,
                SpecialtyId = inv.SpecialtyId,
                Description = inv.Description,
                Components = grouped
            };
        }

        // ────────────────────────────────────────────────────────────────────────
        // Create
        // ────────────────────────────────────────────────────────────────────────
        public async Task<string?> CreateIntervention(AddUpdateInterventionDTO request)
        {
            // Validate: at least one component required
            if (request.Components == null || request.Components.Count == 0)
                return "At least one component is required.";

            // Validate: no empty component values
            if (request.Components.Any(c => string.IsNullOrWhiteSpace(c.Value) || string.IsNullOrWhiteSpace(c.ComponentType)))
                return "All component types and values must be non-empty.";

            var existing = await _dbContext.Interventions.FirstOrDefaultAsync(t => t.Name == request.Name);
            if (existing != null)
                return EMessages.InterventionExistAlready;

            // Resolve component type IDs
            var typeNames = request.Components.Select(c => c.ComponentType).Distinct().ToList();
            var typeMap = await _dbContext.ComponentTypes
                .Where(ct => typeNames.Contains(ct.Name))
                .ToDictionaryAsync(ct => ct.Name, ct => ct.Id);

            // Reject unknown component types
            var unknown = typeNames.Except(typeMap.Keys).ToList();
            if (unknown.Any())
                return $"Unknown component types: {string.Join(", ", unknown)}";

            var newInv = new Intervention
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                SpecialtyId = request.SpecialtyId,
                Description = request.Description,
                CreatedDate = DateTime.UtcNow,
                CreatedBy = _userContext.UserId,
                Hidden = false
            };

            newInv.Components = request.Components.Select(c => new InterventionComponent
            {
                Id = Guid.NewGuid(),
                InterventionId = newInv.Id,
                ComponentTypeId = typeMap[c.ComponentType],
                Value = c.Value.Trim()
            }).ToList();

            await _dbContext.Interventions.AddAsync(newInv);
            await _dbContext.SaveChangesAsync();

            return null;
        }

        // ────────────────────────────────────────────────────────────────────────
        // Update
        // ────────────────────────────────────────────────────────────────────────
        public async Task<string?> UpdateIntervention(AddUpdateInterventionDTO request)
        {
            // Validate: at least one component required
            if (request.Components == null || request.Components.Count == 0)
                return "At least one component is required.";

            if (request.Components.Any(c => string.IsNullOrWhiteSpace(c.Value) || string.IsNullOrWhiteSpace(c.ComponentType)))
                return "All component types and values must be non-empty.";

            var inv = await _dbContext.Interventions
                .Include(i => i.Components)
                .FirstOrDefaultAsync(t => t.Id == request.Id);

            if (inv == null)
                return EMessages.InterventionNotExists;

            var nameConflict = await _dbContext.Interventions
                .FirstOrDefaultAsync(t => t.Id != request.Id && t.Name == request.Name);
            if (nameConflict != null)
                return EMessages.InterventionExistAlready;

            // Resolve component type IDs
            var typeNames = request.Components.Select(c => c.ComponentType).Distinct().ToList();
            var typeMap = await _dbContext.ComponentTypes
                .Where(ct => typeNames.Contains(ct.Name))
                .ToDictionaryAsync(ct => ct.Name, ct => ct.Id);

            var unknown = typeNames.Except(typeMap.Keys).ToList();
            if (unknown.Any())
                return $"Unknown component types: {string.Join(", ", unknown)}";

            // Step 1: explicitly delete old components and flush
            _dbContext.InterventionComponents.RemoveRange(inv.Components);
            inv.Components.Clear();  // detach from navigation so EF doesn't interfere
            await _dbContext.SaveChangesAsync();

            // Step 2: update the intervention scalar fields
            inv.Name = request.Name;
            inv.SpecialtyId = request.SpecialtyId;
            inv.Description = request.Description;
            inv.ModifiedDate = DateTime.UtcNow;
            inv.ModifiedBy = _userContext.UserId;

            // Step 3: insert new components directly via DbSet
            var newComponents = request.Components.Select(c => new InterventionComponent
            {
                Id = Guid.NewGuid(),
                InterventionId = inv.Id,
                ComponentTypeId = typeMap[c.ComponentType],
                Value = c.Value.Trim()
            }).ToList();

            await _dbContext.InterventionComponents.AddRangeAsync(newComponents);
            await _dbContext.SaveChangesAsync();

            return null;
        }

        // ────────────────────────────────────────────────────────────────────────
        // Toggle hide
        // ────────────────────────────────────────────────────────────────────────
        public async Task<string?> ToggleHide(Guid id)
        {
            var inv = await _dbContext.Interventions.FirstOrDefaultAsync(t => t.Id == id);

            if (inv == null)
                return EMessages.InterventionNotExists;

            inv.Hidden = !inv.Hidden;
            await _dbContext.SaveChangesAsync();

            return null;
        }

        // ────────────────────────────────────────────────────────────────────────
        // Specialty options (for dropdown)
        // ────────────────────────────────────────────────────────────────────────
        public async Task<List<GetInterventionSpecialtiesDTO>> GetInterventionSpecialities()
        {
            return await _dbContext.Specialties
                .Select(x => new GetInterventionSpecialtiesDTO
                {
                    Id = x.Id,
                    Name = x.Name,
                }).ToListAsync();
        }

        // ────────────────────────────────────────────────────────────────────────
        // Component-type options (for dropdown)
        // ────────────────────────────────────────────────────────────────────────
        public async Task<List<GetComponentTypeDTO>> GetComponentTypes()
        {
            return await _dbContext.ComponentTypes
                .OrderBy(ct => ct.Id)
                .Select(ct => new GetComponentTypeDTO
                {
                    Id = ct.Id,
                    Name = ct.Name
                }).ToListAsync();
        }
    }
}
