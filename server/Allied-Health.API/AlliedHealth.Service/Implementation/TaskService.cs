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

            var tasks = (from t in _dbContext.Tasks
                         join u in _dbContext.Users on t.CreatedBy equals (Guid?)u.Id into creatorGroup
                         from creator in creatorGroup.DefaultIfEmpty()
                         select new GetTaskDTO
                         {
                             Id = t.Id,
                             Title = t.Title,
                             PatientId = t.PatientId,
                             PatientName = t.Patient.FullName,
                             DepartmentId = t.DepartmentId,
                             DepartmentName = t.Department.Name,
                             Priority = t.Priority,
                             Severity = t.Severity,
                             RequiredRepetitions = t.RequiredRepetitions,
                             CompletedRepetitions = t.CompletedRepetitions,
                             LastReviewDate = t.LastReviewDate,
                             TaskType = t.TaskType,
                             StartDate = t.StartDate,
                             Status = (int)(t.StartDate > now
                                      ? ETaskStatus.Assigned
                                      : (t.TaskInterventions.Any(x => x.OutcomeStatus == (int)ETaskInterventionOutcomes.Unseen)
                                             ? (t.EndDate < now ? ETaskStatus.Overdue : ETaskStatus.InProgress)
                                             : ETaskStatus.Completed)),
                             EndDate = t.EndDate,
                             LastUpdated = t.ModifiedDate,
                             Hidden = t.Hidden,
                             CreatedById = t.CreatedBy,
                             CreatedByName = creator != null ? creator.FirstName + " " + creator.LastName : null,
                         }).AsQueryable();

            return tasks;
        }

        public async Task<GetTaskSummaryDTO> GetSummary()
        {
            var now = DateOnly.FromDateTime(DateTime.UtcNow);
            var visibleTasks = _dbContext.Tasks.Where(t => t.Hidden != true);

            var counts = await visibleTasks
                .GroupBy(_ => 1)
                .Select(g => new
                {
                    TotalTasks    = g.Count(),
                    HighPriority  = g.Count(x => x.Priority == (int)ETaskPriorities.High),
                    MidPriority   = g.Count(x => x.Priority == (int)ETaskPriorities.Medium),
                    LowPriority   = g.Count(x => x.Priority == (int)ETaskPriorities.Low),
                })
                .FirstOrDefaultAsync();

            // Compute status counts in memory to avoid untranslatable expression
            var taskDates = await visibleTasks
                .Select(t => new
                {
                    t.StartDate,
                    t.EndDate,
                    HasUnseen = t.TaskInterventions.Any(ti => ti.OutcomeStatus == (int)ETaskInterventionOutcomes.Unseen),
                })
                .ToListAsync();

            var overdue    = taskDates.Count(t => t.StartDate <= now && t.EndDate < now && t.HasUnseen);
            var inProgress = taskDates.Count(t => t.StartDate <= now && t.EndDate >= now && t.HasUnseen);
            var completed  = taskDates.Count(t => !t.HasUnseen);

            var deptWise = await visibleTasks
                .GroupBy(t => t.Department.Name)
                .Select(d => new DeptTaskSummary { Name = d.Key, Count = d.Count() })
                .ToListAsync();

            return new GetTaskSummaryDTO
            {
                TotalTasks       = counts?.TotalTasks ?? 0,
                OverdueTasks     = overdue,
                ActiveTasks      = inProgress,
                CompletedTasks   = completed,
                HighPriority     = counts?.HighPriority ?? 0,
                MidPriority      = counts?.MidPriority ?? 0,
                LowPriority      = counts?.LowPriority ?? 0,
                DeptWiseSummary  = deptWise,
            };
        }

        public async Task<GetTaskDetailsDTO> GetTask(Guid id)
        {
            var task = await (from x in _dbContext.Tasks
                              join u in _dbContext.Users on x.CreatedBy equals (Guid?)u.Id into creatorGroup
                              from creator in creatorGroup.DefaultIfEmpty()
                              where x.Id == id
                              select new GetTaskDetailsDTO
                              {
                                  Id = x.Id,
                                  Title = x.Title,
                                  PatientId = x.PatientId,
                                  DepartmentId = x.DepartmentId,
                                  Priority = x.Priority,
                                  Severity = x.Severity,
                                  RequiredRepetitions = x.RequiredRepetitions,
                                  CompletedRepetitions = x.CompletedRepetitions,
                                  LastReviewDate = x.LastReviewDate,
                                  TaskType = x.TaskType,
                                  Diagnosis = x.Diagnosis,
                                  Goals = x.Goals,
                                  StartDate = x.StartDate,
                                  EndDate = x.EndDate,
                                  Description = x.Description,
                                  CreatedById = x.CreatedBy,
                                  CreatedByName = creator != null ? creator.FirstName + " " + creator.LastName : null,
                                  Interventions = x.TaskInterventions.Select(t => new TaskInterventionDTO
                                  {
                                      Id = t.InterventionId,
                                      AhaId = t.AhaUserId,
                                      WardId = t.WardId,
                                      Start = t.StartDate,
                                      End = t.EndDate,
                                      Components = t.SelectedComponents.Select(c => new SelectedComponentDTO
                                      {
                                          ComponentType = c.ComponentType.Name,
                                          Value = c.Value
                                      }).ToList()
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
                Severity = request.Severity,
                RequiredRepetitions = request.RequiredRepetitions,
                CompletedRepetitions = 0,
                LastReviewDate = request.LastReviewDate,
                TaskType = request.TaskType,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Diagnosis = request.Diagnosis,
                Goals = request.Goals,
                Description = request.Description,
                Status = (int)((request.StartDate > now && request.EndDate > now) ? ETaskStatus.Assigned
                               : (request.StartDate <= now && request.EndDate >= now) ? ETaskStatus.InProgress
                               : (request.EndDate < now) ? ETaskStatus.Overdue : ETaskStatus.Assigned),
                CreatedDate = DateTime.UtcNow,
                CreatedBy = _userContext.UserId,
                Hidden = false
            };

            await _dbContext.Tasks.AddAsync(newTask);
            await _dbContext.SaveChangesAsync();

            // Pre-fetch component type lookup to avoid per-row queries
            var compTypeMap = await _dbContext.ComponentTypes
                .ToDictionaryAsync(ct => ct.Name, ct => ct.Id);

            foreach (var inv in request.Interventions)
            {
                var taskInvId = Guid.NewGuid();
                var taskInv = new TaskIntervention
                {
                    Id = taskInvId,
                    TaskId = taskId,
                    InterventionId = inv.Id,
                    AhaUserId = inv.AhaId,
                    StartDate = inv.Start,
                    EndDate = inv.End,
                    OutcomeStatus = (int)ETaskInterventionOutcomes.Unseen,
                    WardId = inv.WardId
                };

                await _dbContext.TaskInterventions.AddAsync(taskInv);

                // Save any component values the clinician selected (zero is valid)
                if (inv.Components != null)
                {
                    foreach (var comp in inv.Components)
                    {
                        if (compTypeMap.TryGetValue(comp.ComponentType, out var typeId))
                        {
                            await _dbContext.TaskInterventionComponents.AddAsync(new TaskInterventionComponent
                            {
                                Id = Guid.NewGuid(),
                                TaskInterventionId = taskInvId,
                                ComponentTypeId = typeId,
                                Value = comp.Value.Trim()
                            });
                        }
                    }
                }
            }

            if (request.RefId != Guid.Empty && request.RefId != null)
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
                                 .ThenInclude(ti => ti.SelectedComponents)
                             .FirstOrDefaultAsync(x => x.Id == request.Id);

            if (task == null)
                return EMessages.TaskNotExists;

            var requestInterventionIds = request.Interventions.Select(i => i.Id).ToHashSet();

            // ── Step 1: Remove dropped interventions (CASCADE deletes their components)
            //           and flush existing SelectedComponents for kept interventions
            var toRemove = task.TaskInterventions
                .Where(ti => !requestInterventionIds.Contains(ti.InterventionId))
                .ToList();
            _dbContext.TaskInterventions.RemoveRange(toRemove);

            var keptByInterventionId = task.TaskInterventions
                .Where(ti => requestInterventionIds.Contains(ti.InterventionId))
                .ToDictionary(ti => ti.InterventionId);

            foreach (var kept in keptByInterventionId.Values)
            {
                _dbContext.TaskInterventionComponents.RemoveRange(kept.SelectedComponents);
                kept.SelectedComponents.Clear();
            }

            await _dbContext.SaveChangesAsync(); // flush all deletions first

            // ── Step 2: Update task scalars
            task.Title = request.Title;
            task.Priority = request.Priority;
            task.Severity = request.Severity;
            task.RequiredRepetitions = request.RequiredRepetitions;
            task.LastReviewDate = request.LastReviewDate;
            task.TaskType = request.TaskType;
            task.StartDate = request.StartDate;
            task.EndDate = request.EndDate;
            task.Diagnosis = request.Diagnosis;
            task.Goals = request.Goals;
            task.Description = request.Description;
            task.ModifiedDate = DateTime.UtcNow;
            task.ModifiedBy = _userContext.UserId;

            // Pre-fetch component type lookup
            var compTypeMap = await _dbContext.ComponentTypes
                .ToDictionaryAsync(ct => ct.Name, ct => ct.Id);

            // ── Step 3: Upsert interventions and insert fresh SelectedComponents
            foreach (var inv in request.Interventions)
            {
                Guid taskInvId;

                if (keptByInterventionId.TryGetValue(inv.Id, out var existing))
                {
                    existing.AhaUserId = inv.AhaId;
                    existing.StartDate = inv.Start;
                    existing.EndDate = inv.End;
                    existing.WardId = inv.WardId;
                    taskInvId = existing.Id;
                }
                else
                {
                    taskInvId = Guid.NewGuid();
                    await _dbContext.TaskInterventions.AddAsync(new TaskIntervention
                    {
                        Id = taskInvId,
                        TaskId = task.Id,
                        InterventionId = inv.Id,
                        AhaUserId = inv.AhaId,
                        StartDate = inv.Start,
                        EndDate = inv.End,
                        WardId = inv.WardId,
                        OutcomeStatus = (int)ETaskInterventionOutcomes.Unseen,
                    });
                }

                // Re-insert selected components (zero is valid)
                if (inv.Components != null)
                {
                    foreach (var comp in inv.Components)
                    {
                        if (compTypeMap.TryGetValue(comp.ComponentType, out var typeId))
                        {
                            await _dbContext.TaskInterventionComponents.AddAsync(new TaskInterventionComponent
                            {
                                Id = Guid.NewGuid(),
                                TaskInterventionId = taskInvId,
                                ComponentTypeId = typeId,
                                Value = comp.Value.Trim()
                            });
                        }
                    }
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
