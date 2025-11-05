using AlliedHealth.Common.Enums;
using AlliedHealth.Domain;
using AlliedHealth.Domain.Entities;
using AlliedHealth.Service.Contract.AHA;
using AlliedHealth.Service.Contract.Authentication;
using AlliedHealth.Service.DTOs.AHA;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace AlliedHealth.Service.Implementation.AHA
{
    public class AHAPatientService : IAHAPatientService
    {
        private readonly AlliedHealthDbContext _dbContext;
        private readonly IConfiguration _configuration;
        private readonly IUserContext _userContext;

        public AHAPatientService(AlliedHealthDbContext dbContext, IConfiguration configuration, IUserContext userContext) 
        {
            _dbContext = dbContext;
            _configuration = configuration;
            _userContext = userContext;
        }

        public IQueryable<GetAHAPatientDTO> GetAll(string viewMode)
        {
            var patientsList = _dbContext.Patients
                                .AsNoTracking()
                                .Where(p =>
                                    !string.Equals(viewMode, "mine", StringComparison.OrdinalIgnoreCase)
                                    || p.Tasks.Any(t => t.TaskInterventions.Any(i => i.AhaUserId == _userContext.UserId))
                                )
                                .Select(t => new GetAHAPatientDTO
                                {
                                    Id = t.Id,
                                    FullName = t.FullName,
                                    Age = DateTime.Now.Year - t.DateOfBirth.Year,
                                    Gender = t.Gender == 0 ? "Male" : t.Gender == 1 ? "Female" : "Other",
                                    Phone = t.PrimaryPhone,
                                    ActiveTasks = t.Tasks.Count(x => x.Status == (int)ETaskStatus.InProgress),
                                    LastActivityDate = t.Tasks.Select(x => (DateTime?)x.ModifiedDate).Max(),
                                    Hidden = t.Hidden
                                }).AsQueryable();

            return patientsList;
        }

        public async Task<GetAHAPatientSummaryDTO> GetSummary()
        {
            var summary = await _dbContext.Patients
                             .Where(u => u.Hidden != true)
                             .GroupBy(u => 1)
                             .Select(g => new GetAHAPatientSummaryDTO
                             {
                                    TotalPatients = g.Count(),
                                    NewPatients = g.Count(u => u.CreatedDate >= DateTime.UtcNow.AddDays(-7)),
                                    ActiveTasks = g.Sum(u => u.Tasks.Count(t => t.Status == (int)ETaskStatus.InProgress)),
                                    CompletedTasks = g.Sum(u => u.Tasks.Count(t => t.Status == (int)ETaskStatus.Completed))
                             }).FirstOrDefaultAsync();

            return summary ?? new GetAHAPatientSummaryDTO();
        }

        public async Task<GetAHAPatientDetailsDTO> GetPatient(int id)
        {
            var patient = await _dbContext.Patients
                          .Where(t => t.Id == id)
                          .Select(t => new GetAHAPatientDetailsDTO
                          {
                              Id = t.Id,
                              FullName = t.FullName,
                              Mrn = "MRN" + t.Id.ToString("D5"),
                              Age = DateTime.Now.Year - t.DateOfBirth.Year,
                              Gender = t.Gender == 0 ? "Male" : t.Gender == 1 ? "Female" : "Other",
                              DateOfBirth = t.DateOfBirth,
                              PrimaryPhone = t.PrimaryPhone,
                              Email = t.Email,
                              EmergencyContactName = t.EmergencyContactName,
                              EmergencyContactPhone = t.EmergencyContactPhone,
                              EmergencyContactEmail = t.EmergencyContactEmail,

                              // Summary
                              ActiveTasks = t.Tasks.Count(x => x.Status == (int)ETaskStatus.InProgress),
                              TotalTasks = t.Tasks.Count(),
                              TotalReferrals = t.Referrals.Count()
                          }).FirstOrDefaultAsync();

            return patient;
        }
    }
}
