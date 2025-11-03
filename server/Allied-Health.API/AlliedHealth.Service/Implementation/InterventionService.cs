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

        public IQueryable<GetInterventionDTO> GetAll()
        {
            var invList = _dbContext.Interventions
                            .Select(t => new GetInterventionDTO
                            {
                                Id = t.Id,
                                Name = t.Name,
                                Specialty = t.Specialty.Name,
                                LastUpdated = t.ModifiedDate,
                                Hidden = t.Hidden
                            }).AsQueryable();

            return invList;
        }

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

        public async Task<GetInterventionDetailsDTO> GetIntervention(Guid id)
        {
            var inv = await _dbContext.Interventions
                          .Where(t => t.Id == id)
                          .Select(t => new GetInterventionDetailsDTO
                          {
                              Id = t.Id,
                              Name = t.Name,
                              SpecialtyId = t.SpecialtyId,
                              Description = t.Description
                          }).FirstOrDefaultAsync();

            return inv;
        }

        public async Task<string?> CreateIntervention(AddUpdateInterventionDTO request)
        {
            var inv = await _dbContext.Interventions.FirstOrDefaultAsync(t => t.Id == request.Id || t.Name == request.Name);

            if (inv != null)
                return EMessages.InterventionExistAlready;

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

            await _dbContext.Interventions.AddAsync(newInv);
            await _dbContext.SaveChangesAsync();

            return null;
        }

        public async Task<string?> UpdateIntervention(AddUpdateInterventionDTO request)
        {
            var inv = await _dbContext.Interventions.FirstOrDefaultAsync(t => t.Id == request.Id);

            if (inv == null)
                return EMessages.InterventionNotExists;

            var existingInv = await _dbContext.Interventions.FirstOrDefaultAsync(t => t.Id != request.Id && t.Name == request.Name);

            if (existingInv != null)
                return EMessages.InterventionExistAlready;

            inv.Name = request.Name;
            inv.SpecialtyId = request.SpecialtyId;
            inv.Description = request.Description;
            inv.ModifiedDate = DateTime.UtcNow;
            inv.ModifiedBy = _userContext.UserId;

            await _dbContext.SaveChangesAsync();

            return null;
        }

        public async Task<string?> ToggleHide(Guid id)
        {
            var inv = await _dbContext.Interventions.FirstOrDefaultAsync(t => t.Id == id);

            if (inv == null)
                return EMessages.InterventionNotExists;

            inv.Hidden = !inv.Hidden;
            await _dbContext.SaveChangesAsync();

            return null;
        }

        public async Task<List<GetInterventionSpecialtiesDTO>> GetInterventionSpecialities()
        {
            var invList = await _dbContext.Specialties
                                .Select(x => new GetInterventionSpecialtiesDTO
                                {
                                    Id = x.Id,
                                    Name = x.Name,
                                }).ToListAsync();

            return invList;
        }

    }
}
