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
    public class SpecialtyService : ISpecialtyService
    {
        private readonly AlliedHealthDbContext _dbContext;
        private readonly IConfiguration _configuration;
        private readonly IUserContext _userContext;

        public SpecialtyService(AlliedHealthDbContext dbContext, IConfiguration configuration, IUserContext userContext) 
        {
            _dbContext = dbContext;
            _configuration = configuration;
            _userContext = userContext;
        }

        public IQueryable<GetSpecialtyDTO> GetAll()
        {
            var specList = _dbContext.Specialties
                            .Select(t => new GetSpecialtyDTO
                            {
                                Id = t.Id,
                                Name = t.Name,
                                Description = t.Description,
                                LastUpdated = t.ModifiedDate,
                                Hidden = t.Hidden
                            }).AsQueryable();

            return specList;
        }

        public async Task<GetSpecialtySummaryDTO> GetSummary()
        {
            var summary = await _dbContext.Specialties
                             .GroupBy(u => 1)
                             .Select(g => new GetSpecialtySummaryDTO
                             {
                                TotalSpecialties = g.Count(),
                                ActiveSpecialties = g.Count(t => !t.Hidden)
                             }).FirstOrDefaultAsync();

            return summary;
        }

        public async Task<GetSpecialtyDetailsDTO> GetSpecialty(Guid id)
        {
            var spec = await _dbContext.Specialties
                          .Where(t => t.Id == id)
                          .Select(t => new GetSpecialtyDetailsDTO
                          {
                              Id = t.Id,
                              Name = t.Name,
                              Description = t.Description,
                          }).FirstOrDefaultAsync();

            return spec;
        }

        public async Task<string?> CreateSpecialty(AddUpdateSpecialtyDTO request)
        {
            var spec = await _dbContext.Specialties.FirstOrDefaultAsync(t => t.Id == request.Id || t.Name == request.Name);

            if (spec != null)
                return EMessages.SpecialtyExistAlready;

            var newSpecialty = new Specialty
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Description = request.Description,
                CreatedDate = DateTime.UtcNow,
                CreatedBy = _userContext.UserId,
                Hidden = false
            };

            await _dbContext.Specialties.AddAsync(newSpecialty);
            await _dbContext.SaveChangesAsync();

            return null;
        }

        public async Task<string?> UpdateSpecialty(AddUpdateSpecialtyDTO request)
        {
            var spec = await _dbContext.Specialties.FirstOrDefaultAsync(t => t.Id == request.Id);

            if (spec == null)
                return EMessages.SpecialtyNotExists;

            var existingSpec = await _dbContext.Specialties.FirstOrDefaultAsync(t => t.Name == request.Name);

            if (existingSpec != null)
                return EMessages.SpecialtyExistAlready;

            spec.Name = request.Name;
            spec.Description = request.Description;
            spec.ModifiedDate = DateTime.UtcNow;
            spec.ModifiedBy = _userContext.UserId;

            await _dbContext.SaveChangesAsync();
            return null;
        }

        public async Task<string?> ToggleHide(Guid id)
        {
            var spec = await _dbContext.Specialties.FirstOrDefaultAsync(t => t.Id == id);

            if (spec == null)
                return EMessages.DeptNotExists;

            spec.Hidden = !spec.Hidden;
            await _dbContext.SaveChangesAsync();

            return null;
        }
    }
}
