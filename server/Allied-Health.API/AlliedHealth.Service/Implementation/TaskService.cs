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
    public class TaskService : ITaskService
    {
        private readonly AlliedHealthDbContext _dbContext;
        private readonly IConfiguration _configuration;
        private readonly IUserContext _userContext;

        public TaskService(AlliedHealthDbContext dbContext, IConfiguration configuration, IUserContext userContext) 
        {
            _dbContext = dbContext;
            _configuration = configuration;
            _userContext = userContext;
        }

        public IQueryable<GetTaskDTO> GetAll()
        {
            var now = DateOnly.FromDateTime(DateTime.UtcNow);

            var tasks = _dbContext.Tasks
                            .Select(t => new GetTaskDTO
                            {
                                Id = t.Id,
                                Title = t.Title,
                                PatientId  =t.PatientId,
                                PatientName = t.Patient.FullName,
                                DepartmentId = t.DepartmentId,
                                DepartmentName = t.Department.Name,
                                Priority = t.Priority,
                                StartDate = t.StartDate,
                                Status = (int)(t.StartDate > now
                                         ? ETaskStatus.Assigned
                                         : (t.TaskInterventions.Any(x => x.OutcomeStatus == (int)ETaskInterventionOutcomes.Unseen)
                                                ? (t.EndDate < now ? ETaskStatus.Overdue : ETaskStatus.InProgress)
                                                : ETaskStatus.Completed)),
                                EndDate = t.EndDate,
                                LastUpdated = t.ModifiedDate,
                                Hidden = t.Hidden,
                            }).AsQueryable();

            return tasks;
        }

        public async Task<GetTaskSummaryDTO> GetSummary()
        {
            var summary = await _dbContext.Tasks
                             .Where(u => u.Hidden != true)
                             .GroupBy(u => 1)
                             .Select(g => new GetTaskSummaryDTO
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

            return summary ?? new GetTaskSummaryDTO();
        }

        public async Task<GetTaskDetailsDTO> GetTask(Guid id)
        {
            var task = await _dbContext.Tasks
                        .Where(x => x.Id == id)
                        .Select(x => new GetTaskDetailsDTO
                        {
                            Id = x.Id,
                            Title = x.Title,
                            PatientId = x.PatientId,
                            DepartmentId = x.DepartmentId,
                            Priority = x.Priority,
                            Diagnosis = x.Diagnosis,
                            Goals = x.Goals,
                            StartDate = x.StartDate,
                            EndDate = x.EndDate,
                            Description = x.Description,
                            Interventions = x.TaskInterventions.Select(t => new TaskInterventionDTO
                            {
                                Id = t.InterventionId,
                                AhaId = t.AhaUserId,
                                WardId = t.WardId,
                                Start = t.StartDate,
                                End = t.EndDate,
                            }).ToList()
                        }).FirstOrDefaultAsync();

            return task;
        }

        public async Task<string?> CreateTask(AddUpdateTaskDTO request)
        {
            var patient = await _dbContext.Patients.FirstOrDefaultAsync(x => x.Id == request.PatientId);

            if (patient == null)
                return EMessages.PatientNotExists;

            var dept = await _dbContext.Departments.FirstOrDefaultAsync(x => x.Id == request.DepartmentId);

            if (dept == null)
                return EMessages.DeptNotExists;

            var taskId = Guid.NewGuid();
            var now = DateOnly.FromDateTime(DateTime.UtcNow);

            var newTask = new Task
            {
                Id = taskId,
                ReferralId = request.RefId,
                PatientId = request.PatientId,
                DepartmentId = request.DepartmentId,
                Title = request.Title,
                Priority = request.Priority,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Diagnosis = request.Diagnosis,
                Goals = request.Goals,
                Description = request.Description,
                Status = (int)((request.StartDate > now && request.EndDate > now) ? ETaskStatus.Assigned 
                               : (request.StartDate <= now && request.EndDate >= now) ? ETaskStatus.InProgress 
                               : (request.EndDate < now) ? ETaskStatus.Overdue :ETaskStatus.Assigned), // fallback
                CreatedDate = DateTime.UtcNow,
                CreatedBy = _userContext.UserId,
                Hidden = false
            };

            await _dbContext.Tasks.AddAsync(newTask);
            await _dbContext.SaveChangesAsync();

            foreach(var inv in request.Interventions)
            {
                var taskInv = new TaskIntervention
                {
                    Id = Guid.NewGuid(),
                    TaskId = taskId,
                    InterventionId = inv.Id,
                    AhaUserId = inv.AhaId,
                    StartDate = inv.Start,
                    EndDate = inv.End,
                    OutcomeStatus = (int)ETaskInterventionOutcomes.Unseen,
                    WardId = inv.WardId
                };

                await _dbContext.TaskInterventions.AddAsync(taskInv);
            }

            if(request.RefId != Guid.Empty && request.RefId != null)
            {
                var referral = await _dbContext.Referrals.FirstOrDefaultAsync(x => x.Id == request.RefId);

                referral.Status = (int)EReferralOutcomes.Accepted;
            }

            await _dbContext.SaveChangesAsync();
            return null;
        }

        public async Task<string?> UpdateTask(AddUpdateTaskDTO request)
        {
            var task = await _dbContext.Tasks
                             .Include(x => x.TaskInterventions)
                             .FirstOrDefaultAsync(x => x.Id == request.Id);

            if (task == null)
                return EMessages.TaskNotExists;

            task.Title = request.Title;
            task.Priority = request.Priority;
            task.StartDate = request.StartDate;
            task.EndDate = request.EndDate;
            task.Diagnosis = request.Diagnosis;
            task.Goals = request.Goals;
            task.Description = request.Description;
            task.ModifiedDate = DateTime.UtcNow;
            task.ModifiedBy = _userContext.UserId;

            var requestInterventionIds = request.Interventions.Select(i => i.Id).ToHashSet();
            var toRemove = task.TaskInterventions
                            .Where(ti => !requestInterventionIds.Contains(ti.InterventionId))
                            .ToList();

            _dbContext.TaskInterventions.RemoveRange(toRemove);

            // 2️⃣ Update existing interventions and add new ones
            foreach (var inv in request.Interventions)
            {
                var existing = task.TaskInterventions
                    .FirstOrDefault(ti => ti.InterventionId == inv.Id);

                if (existing != null)
                {
                    existing.AhaUserId = inv.AhaId;
                    existing.StartDate = inv.Start;
                    existing.EndDate = inv.End;
                    existing.WardId = inv.WardId;
                }
                else
                {
                    // Add new intervention
                    var newIntervention = new TaskIntervention
                    {
                        Id = Guid.NewGuid(),
                        TaskId = task.Id,
                        InterventionId = inv.Id,
                        AhaUserId = inv.AhaId,
                        StartDate = inv.Start,
                        EndDate = inv.End,
                        WardId = inv.WardId
                    };

                    await _dbContext.TaskInterventions.AddAsync(newIntervention);
                }
            }

            await _dbContext.SaveChangesAsync();
            return null;
        }

        public async Task<string?> ToggleHide(Guid id)
        {
            var task = await _dbContext.Tasks.FirstOrDefaultAsync(t => t.Id == id);

            if (task == null)
                return EMessages.UserNotExists;

            task.Hidden = !task.Hidden;
            await _dbContext.SaveChangesAsync();

            return null;
        }

        public async Task<(GetReferralTaskDetailsDTO?, string?)> GetReferralTaskDetails(Guid refId)
        {
            var referral = await _dbContext.Referrals
                            .Where(x => x.Id == refId)
                            .Select(x => new GetReferralTaskDetailsDTO
                            {
                                RefId = x.Id,
                                PatientId = x.PatientId,
                                DepartmentId = x.DestinationDepartmentId,
                                Priority = x.Priority,
                                Diagnosis = x.Diagnosis,
                                Goals = x.Goals,
                                Description = x.Description,
                                Interventions = x.ReferralInterventions.Select(t => t.InterventionId).ToList()
                            }).FirstOrDefaultAsync();

            return (referral, null);
        }
    }
}
