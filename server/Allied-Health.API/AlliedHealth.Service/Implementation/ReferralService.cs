using AlliedHealth.Domain;
using AlliedHealth.Service.DTOs;
using AlliedHealth.Service.Contract;
using AlliedHealth.Service.Contract.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using AlliedHealth.Common.Enums;
using AlliedHealth.Domain.Entities;
using Task = AlliedHealth.Domain.Entities.Task;

namespace AlliedHealth.Service.Implementation
{
    public class ReferralService : IReferralService
    {
        private readonly AlliedHealthDbContext _dbContext;
        private readonly IConfiguration _configuration;
        private readonly IUserContext _userContext;

        public ReferralService(AlliedHealthDbContext dbContext, IConfiguration configuration, IUserContext userContext) 
        {
            _dbContext = dbContext;
            _configuration = configuration;
            _userContext = userContext;
        }

        public IQueryable<GetReferralDTO> GetAll()
        {
            var tasks = _dbContext.Referrals
                            .Select(t => new GetReferralDTO
                            {
                                Id = t.Id,
                                Type = (_userContext.DepartmentId != Guid.Empty
                                            ? (t.OriginDepartmentId == _userContext.DepartmentId
                                                ? "outgoing"
                                                : (t.DestinationDepartmentId == _userContext.DepartmentId ? "incoming" : null))
                                            : null) ?? string.Empty,
                                PatientId = t.PatientId,
                                PatientName = t.Patient.FullName,
                                OriginDeptId = t.OriginDepartmentId,
                                OriginDeptName = t.OriginDepartment.Name,
                                DestinationDeptId = t.DestinationDepartmentId,
                                DestinationDeptName= t.DestinationDepartment.Name,
                                TherapistId = t.ReferringTherapist,
                                TherapistName = _dbContext.Users
                                                .Where(u => u.Id == t.ReferringTherapist)
                                                .Select(u => string.Concat(u.FirstName, " ", u.LastName))
                                                .FirstOrDefault() ?? string.Empty,
                                Priority = t.Priority,
                                ReferralDate = DateOnly.FromDateTime(t.CreatedDate),
                                LastUpdated = t.ModifiedDate,
                                Hidden = t.Hidden,
                            }).AsQueryable();

            return tasks;
        }

        public async Task<GetReferralSummaryDTO> GetSummary()
        {
            var summary = await _dbContext.Tasks
                             .Where(u => u.Hidden != true)
                             .GroupBy(u => 1)
                             .Select(g => new GetReferralSummaryDTO
                             {
                                 TotalTasks = g.Count(),
                                 OverdueTasks = g.Count(x => x.Status == (int)ETaskStatus.Overdue),
                                 ActiveTasks = g.Count(x => x.Status == (int)ETaskStatus.InProgress),
                                 CompletedTasks = g.Count(x => x.Status == (int)ETaskStatus.Completed),

                                 HighPriority = g.Count(x => x.Priority == (int)ETaskPriorities.High),
                                 MidPriority = g.Count(x => x.Priority == (int)ETaskPriorities.Medium),
                                 LowPriority = g.Count(x => x.Priority == (int)ETaskPriorities.Low),

                                 DeptWiseSummary = g.GroupBy(x => x.Department.Name)
                                                    .Select(d => new DeptTaskSummary
                                                    {
                                                        Name = d.Key,
                                                        Count = d.Count()
                                                    }).ToList()
                             }).FirstOrDefaultAsync();

            return summary ?? new GetReferralSummaryDTO();
        }

        public async Task<GetReferralDetailsDTO> GetReferral(Guid id)
        {
            var task = await _dbContext.Referrals
                        .Where(x => x.Id == id)
                        .Select(x => new GetReferralDetailsDTO
                        {
                            Id = x.Id,
                            PatientId = x.PatientId,
                            OriginDeptId = x.OriginDepartmentId,
                            DestinationDeptId = x.DestinationDepartmentId,
                            Priority = x.Priority,
                            Diagnosis = x.Diagnosis,
                            Goals = x.Goals,
                            //ReferralDate = x.CreatedDate,
                            Description = x.Description,
                            Interventions = x.ReferralInterventions.Select(x => x.InterventionId).ToList()
                        }).FirstOrDefaultAsync();

            return task;
        }

        public async Task<string?> CreateReferral(AddUpdateReferralDTO request)
        {
            var patient = await _dbContext.Patients.FirstOrDefaultAsync(x => x.Id == request.PatientId);

            if (patient == null)
                return EMessages.PatientNotExists;

            var orgDept = await _dbContext.Departments.FirstOrDefaultAsync(x => x.Id == request.OriginDeptId);
            var destDept = await _dbContext.Departments.FirstOrDefaultAsync(x => x.Id == request.DestinationDeptId);

            if (orgDept == null)
                return "Origin " + EMessages.DeptNotExists;

            if (destDept == null)
                return "Destination " + EMessages.DeptNotExists;

            var referralId = Guid.NewGuid();

            var newReferral = new Referral
            {
                Id = referralId,
                PatientId = request.PatientId,
                OriginDepartmentId = request.OriginDeptId,
                DestinationDepartmentId = request.DestinationDeptId,
                ReferringTherapist = request.TherapistId,
                Priority = request.Priority,
                Diagnosis = request.Diagnosis,
                Goals = request.Goals,
                Description = request.Description,
                Status = (int)EReferralOutcomes.Pending,
                CreatedDate = DateTime.UtcNow,
                CreatedBy = _userContext.UserId,
                Hidden = false
            };

            await _dbContext.Referrals.AddAsync(newReferral);
            await _dbContext.SaveChangesAsync();

            foreach (var inv in request.Interventions)
            {
                var refInv = new ReferralIntervention
                {
                    Id = Guid.NewGuid(),
                    ReferralId = referralId,
                    InterventionId = inv
                };

                await _dbContext.ReferralInterventions.AddAsync(refInv);
            }

            await _dbContext.SaveChangesAsync();
            return null;
        }

        public async Task<string?> UpdateReferral(AddUpdateReferralDTO request)
        {
            //var task = await _dbContext.Tasks
            //                 .Include(x => x.TaskInterventions)
            //                 .FirstOrDefaultAsync(x => x.Id == request.Id);

            //if (task == null)
            //    return EMessages.TaskNotExists;

            //task.Title = request.Title;
            //task.Priority = request.Priority;
            //task.StartDate = request.StartDate;
            //task.EndDate = request.EndDate;
            //task.Diagnosis = request.Diagnosis;
            //task.Goals = request.Goals;
            //task.Description = request.Description;
            //task.ModifiedDate = DateTime.UtcNow;
            //task.ModifiedBy = _userContext.UserId;

            //var requestInterventionIds = request.Interventions.Select(i => i.Id).ToHashSet();
            //var toRemove = task.TaskInterventions
            //                .Where(ti => !requestInterventionIds.Contains(ti.InterventionId))
            //                .ToList();

            //_dbContext.TaskInterventions.RemoveRange(toRemove);

            //// 2️⃣ Update existing interventions and add new ones
            //foreach (var inv in request.Interventions)
            //{
            //    var existing = task.TaskInterventions
            //        .FirstOrDefault(ti => ti.InterventionId == inv.Id);

            //    if (existing != null)
            //    {
            //        existing.AhaId = inv.AhaId;
            //        existing.StartDate = inv.Start;
            //        existing.EndDate = inv.End;
            //        existing.WardId = inv.WardId;
            //    }
            //    else
            //    {
            //        // Add new intervention
            //        var newIntervention = new TaskIntervention
            //        {
            //            Id = Guid.NewGuid(),
            //            TaskId = task.Id,
            //            InterventionId = inv.Id,
            //            AhaId = inv.AhaId,
            //            StartDate = inv.Start,
            //            EndDate = inv.End,
            //            WardId = inv.WardId
            //        };

            //        await _dbContext.TaskInterventions.AddAsync(newIntervention);
            //    }
            //}

            //await _dbContext.SaveChangesAsync();
            return null;
        }

        public async Task<string?> ToggleHide(Guid id)
        {
            var referral = await _dbContext.Referrals.FirstOrDefaultAsync(t => t.Id == id);

            if (referral == null)
                return EMessages.ReferralNotExists;

            referral.Hidden = !referral.Hidden;
            await _dbContext.SaveChangesAsync();

            return null;
        }
    }
}
