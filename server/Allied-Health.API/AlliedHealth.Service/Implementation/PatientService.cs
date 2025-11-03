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
    public class PatientService : IPatientService
    {
        private readonly AlliedHealthDbContext _dbContext;
        private readonly IConfiguration _configuration;
        private readonly IUserContext _userContext;

        public PatientService(AlliedHealthDbContext dbContext, IConfiguration configuration, IUserContext userContext) 
        {
            _dbContext = dbContext;
            _configuration = configuration;
            _userContext = userContext;
        }

        public IQueryable<GetPatientDTO> GetAll()
        {
            var patientsList = _dbContext.Patients
                            //.Where(t => t.Id != _userContext.UserId)
                            .Select(t => new GetPatientDTO
                            {
                                Id = t.Id,
                                FullName = t.FullName,
                                Age = DateTime.Now.Year - t.DateOfBirth.Year,
                                Gender = t.Gender == 0 ? "Male" : t.Gender == 1 ? "Female" : "Other",
                                LastUpdated = t.LastModifiedDate,
                                Hidden = t.Hidden
                            }).AsQueryable();

            return patientsList;
        }

        public async Task<GetPatientSummaryDTO> GetSummary()
        {
            var summary = await _dbContext.Patients
                             .Where(u => u.Hidden != true)
                             .GroupBy(u => 1)
                             .Select(g => new GetPatientSummaryDTO
                             {
                                    TotalPatients = g.Count(),
                                    NewPatients = g.Count(u => u.CreatedDate >= DateTime.UtcNow.AddDays(-7)),
                                    ActiveTasks = g.Sum(u => u.Tasks.Count(t => t.Status == (int)ETaskStatus.InProgress)),
                                    CompletedTasks = g.Sum(u => u.Tasks.Count(t => t.Status == (int)ETaskStatus.Completed))
                             }).FirstOrDefaultAsync();

            return summary ?? new GetPatientSummaryDTO();
        }

        public async Task<GetPatientDetailsDTO> GetPatient(int id)
        {
            var patient = await _dbContext.Patients
                          .Where(t => t.Id == id)
                          .Select(t => new GetPatientDetailsDTO
                          {
                              Id = t.Id,
                              FullName = t.FullName,
                              Email = t.Email,
                              Gender = t.Gender,
                              DateOfBirth = t.DateOfBirth,
                              PrimaryPhone = t.PrimaryPhone,
                              EmergencyContactName = t.EmergencyContactName,
                              EmergencyContactPhone = t.EmergencyContactPhone,
                              EmergencyContactEmail = t.EmergencyContactEmail
                          }).FirstOrDefaultAsync();

            return patient;
        }

        public async Task<string?> CreatePatient(AddUpdatePatientDTO request)
        {
            var patient = await _dbContext.Patients.FirstOrDefaultAsync(t => t.Email == request.Email);

            if (patient != null)
                return EMessages.PatientExistAlready;

            var newPatient = new Patient
            {
                FullName = request.FullName,
                Email = request.Email,
                Gender = request.Gender,
                DateOfBirth = request.DateOfBirth,
                PrimaryPhone = request.PrimaryPhone,
                EmergencyContactName = request.EmergencyContactName,
                EmergencyContactPhone = request.EmergencyContactPhone,
                EmergencyContactEmail = request.EmergencyContactEmail,
                CreatedDate = DateTime.UtcNow,
                CreatedBy = _userContext.UserId,
                Hidden = false
            };

            await _dbContext.Patients.AddAsync(newPatient);
            await _dbContext.SaveChangesAsync();

            return null;
        }

        public async Task<string?> UpdatePatient(AddUpdatePatientDTO request)
        {
            var patient = await _dbContext.Patients.FirstOrDefaultAsync(t => t.Id == request.Id);

            if (patient == null)
                return EMessages.PatientNotExists;

            patient.FullName = request.FullName;
            patient.Gender = request.Gender;
            patient.DateOfBirth = request.DateOfBirth;
            patient.PrimaryPhone = request.PrimaryPhone;
            patient.EmergencyContactName = request.EmergencyContactName;
            patient.EmergencyContactPhone = request.EmergencyContactPhone;
            patient.EmergencyContactEmail = request.EmergencyContactEmail;

            await _dbContext.SaveChangesAsync();

            return null;
        }

        public async Task<string?> ToggleHide(int id)
        {
            var patient = await _dbContext.Patients.FirstOrDefaultAsync(t => t.Id == id);

            if (patient == null)
                return EMessages.PatientNotExists;

            patient.Hidden = !patient.Hidden;
            await _dbContext.SaveChangesAsync();

            return null;
        }
    }
}
