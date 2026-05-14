using AlliedHealth.Common.Enums;
using AlliedHealth.Domain;
using AlliedHealth.Service.DTOs;
using AlliedHealth.Service.Contract.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using AlliedHealth.Service.Contract;

namespace AlliedHealth.Service.Implementation
{
    public class UtilityService : IUtilityService
    {
        private readonly AlliedHealthDbContext _dbContext;
        private readonly IConfiguration _configuration;
        private readonly IUserContext _userContext;

        public UtilityService(AlliedHealthDbContext dbContext, IConfiguration configuration, IUserContext userContext) 
        {
            _dbContext = dbContext;
            _configuration = configuration;
            _userContext = userContext;
        }

        public async Task<List<GetAHAOptionsDTO>> GetAHAOptions()
        {
            var ahaList = await _dbContext.Users
                                .Where(x => x.Hidden != true && x.Role == (int)UserRoles.Assistant)
                                .Select(x => new GetAHAOptionsDTO
                                {
                                    Id = x.Id,
                                    Name = x.FirstName + " " + x.LastName,
                                    Specialties = x.UserSpecialties.Select(x => x.SpecialtyId).ToList()
                                }).ToListAsync();

            var today = DateOnly.FromDateTime(DateTime.Today);
            var vacations = await _dbContext.VacationRequests
                .Where(v => v.Status == (int)EVacationStatus.Approved && v.EndDate >= today)
                .Select(v => new { v.AhaUserId, v.StartDate, v.EndDate })
                .ToListAsync();

            var vacationMap = vacations
                .GroupBy(v => v.AhaUserId)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(v => new AhaVacationPeriod { StartDate = v.StartDate, EndDate = v.EndDate }).ToList()
                );

            foreach (var aha in ahaList)
            {
                if (vacationMap.TryGetValue(aha.Id, out var periods))
                    aha.Vacations = periods;
            }

            return ahaList;
        }

        public async Task<List<GetPatientOptionsDTO>> GetPatientOptions()
        {
            var patientList = await _dbContext.Patients
                                .Where(x => x.Hidden != true)
                                .Select(x => new GetPatientOptionsDTO
                                {
                                    Id = x.Id,
                                    Name = x.FullName
                                }).ToListAsync();

            return patientList;
        }

        public async Task<List<GetDeptOptionsDTO>> GetDeptOptions()
        {
            var deptList = await _dbContext.Departments
                                .Where(x => x.Hidden != true)
                                .Select(x => new GetDeptOptionsDTO
                                {
                                    Id = x.Id,
                                    Name = x.Name
                                }).ToListAsync();

            return deptList;
        }

        public async Task<List<GetWardOptionsDTO>> GetWardOptions()
        {
            var wardList = await _dbContext.Wards
                                .Where(x => x.Hidden != true)
                                .Select(x => new GetWardOptionsDTO
                                {
                                    Id = x.Id,
                                    Name = x.Name,
                                    Departments = x.DepartmentCoverages.Select(x => x.DepartmentId).ToList()
                                }).ToListAsync();

            return wardList;
        }

        public async Task<List<GetSpecialityOptionsDTO>> GetSpecialityOptions()
        {
            var specList = await _dbContext.Specialties
                                .Where(x => x.Hidden != true)
                                .Select(x => new GetSpecialityOptionsDTO
                                {
                                    Id = x.Id,
                                    Name = x.Name
                                }).ToListAsync();

            return specList;
        }


        public async Task<List<GetInterventionOptionsDTO>> GetInterventionOptions()
        {
            var inv = await _dbContext.Interventions
                                .Where(t => t.Hidden != true)
                                .Select(x => new GetInterventionOptionsDTO
                                {
                                    Id = x.Id,
                                    SpecialtyId = x.SpecialtyId,
                                    Name = x.Name,
                                    Components = x.Components
                                        .GroupBy(c => c.ComponentType.Name)
                                        .Select(g => new InterventionComponentGroupDTO
                                        {
                                            Type = g.Key,
                                            Values = g.Select(c => c.Value).ToList()
                                        }).ToList()
                                }).ToListAsync();

            return inv;
        }
    }
}
