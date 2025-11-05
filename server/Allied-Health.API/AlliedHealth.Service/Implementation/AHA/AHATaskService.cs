using AlliedHealth.Domain;
using AlliedHealth.Service.Contract.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using AlliedHealth.Common.Enums;
using AlliedHealth.Service.Contract.AHA;
using AlliedHealth.Service.DTOs.AHA;

namespace AlliedHealth.Service.Implementation.AHA
{
    public class AHATaskService : IAHATaskService
    {
        private readonly AlliedHealthDbContext _dbContext;
        private readonly IConfiguration _configuration;
        private readonly IUserContext _userContext;

        public AHATaskService(AlliedHealthDbContext dbContext, IConfiguration configuration, IUserContext userContext) 
        {
            _dbContext = dbContext;
            _configuration = configuration;
            _userContext = userContext;
        }

        public IQueryable<GetAHATaskDTO> GetAll()
        {
            var tasks = _dbContext.Tasks
                            .Select(t => new GetAHATaskDTO
                            {
                                Id = t.Id,
                                Title = t.Title,
                                PatientName = t.Patient.FullName,
                                DepartmentName = t.Department.Name,
                                TherapistName = t.Department.DeptHeadUser.FirstName + " " + t.Department.DeptHeadUser.LastName,
                                Priority = t.Priority,
                                Status = t.Status,
                                StartDate = t.StartDate,
                                EndDate = t.EndDate,
                            }).AsQueryable();

            return tasks;
        }

        public IQueryable<GetMyTasksDTO> GetMyTasks()
        {
            var now = DateOnly.FromDateTime(DateTime.UtcNow);

            var tasks = _dbContext.Tasks
                        .Where(x => x.TaskInterventions.Any(t => t.AhaUserId == _userContext.UserId))
                        .Select(x => new GetMyTasksDTO
                        {
                            Id = x.Id,
                            Title = x.Title,
                            PatientId = x.PatientId,
                            PatientName = x.Patient.FullName,
                            Mrn = "MRN" + x.PatientId.ToString("D5"),
                            DepartmentName = x.Department.Name,
                            TherapistName = x.Department.DeptHeadUser.FirstName + " " + x.Department.DeptHeadUser.LastName,
                            Priority = x.Priority,
                            Status = (int)(x.StartDate > now    
                                        ? ETaskStatus.Assigned
                                        : (x.TaskInterventions.Any(t => t.OutcomeStatus == (int)ETaskInterventionOutcomes.Unseen)
                                                ? (x.EndDate < now ? ETaskStatus.Overdue : ETaskStatus.InProgress)
                                                : ETaskStatus.Completed)),
                            StartDate = x.StartDate,
                            EndDate = x.EndDate,
                            Interventions = x.TaskInterventions
                                            .Where(t => t.AhaUserId == _userContext.UserId)
                                            .Select(t => new AHATaskInterventionDTO
                                            {
                                                TaskInvId = t.Id,
                                                WardId = t.WardId,
                                                WardName = t.Ward.Name,
                                                InterventionId = t.InterventionId,
                                                InterventionName = t.Intervention.Name,
                                                OutcomeStatus = t.OutcomeStatus,
                                                Outcome = t.Outcome,
                                                OutcomeDate = t.OutcomeDate,
                                                StartDate = t.StartDate,
                                                EndDate = t.EndDate,
                                            }).ToList()
                        }).AsQueryable();

            return tasks;
        }

        public async Task<GetAHATaskSummaryDTO> GetSummary()
        {
            var summary = await _dbContext.Tasks
                             .Where(u => u.Hidden != true)
                             .GroupBy(u => 1)
                             .Select(g => new GetAHATaskSummaryDTO
                             {
                                 TotalTasks = g.Count(),
                                 MyTasks = g.Count(x => x.TaskInterventions.Any(ti => ti.AhaUserId == _userContext.UserId)),
                                 //OverdueTasks = g.Count(x => x.Status == (int)ETaskStatus.Overdue),
                                 //ActiveTasks = g.Count(x => x.Status == (int)ETaskStatus.Active),
                                 CompletedTasks = g.Count(x => x.Status == (int)ETaskStatus.Completed),
                             }).FirstOrDefaultAsync();

            return summary ?? new GetAHATaskSummaryDTO();
        }

        public async Task<GetAHATaskDetailsDTO> GetTask(Guid id)
        {
            var task = await _dbContext.Tasks
                        .Where(x => x.Id == id)
                        .Select(x => new GetAHATaskDetailsDTO
                        {
                            Id = x.Id,
                            Title = x.Title,
                            PatientName = x.Patient.FullName,
                            DepartmentName = x.Department.Name,
                            Priority = x.Priority,
                            Diagnosis = x.Diagnosis,
                            Goals = x.Goals,
                            StartDate = x.StartDate,
                            EndDate = x.EndDate,
                            Description = x.Description,
                            TotalInterventions = x.TaskInterventions.Count(),
                            //Interventions = x.TaskInterventions.Select(t => new TaskInterventionDTO
                            //{
                            //    Id = t.InterventionId,
                            //    AhaId = t.AhaId,
                            //    WardId = t.WardId,
                            //    Start = t.StartDate,
                            //    End = t.EndDate,
                            //}).ToList()
                        }).FirstOrDefaultAsync();

            return task;
        }

        public async Task<string?> UpdateTaskStatus(UpdateTaskInterventionStatus request)
        {
            var taskInv = await _dbContext.TaskInterventions.FirstOrDefaultAsync(x => x.Id == request.TaskInvId);

            if (taskInv == null)
                return EMessages.InterventionNotExists;

            taskInv.OutcomeStatus = request.OutcomeStatus;
            taskInv.Outcome = string.Empty;
            taskInv.OutcomeDate = null;
            if (request.OutcomeStatus == (int)ETaskInterventionOutcomes.Handover)
            {
                taskInv.Outcome = request.Outcome;
                taskInv.OutcomeDate = DateOnly.FromDateTime(DateTime.UtcNow);
            }

            await _dbContext.SaveChangesAsync();
            return null;
        }
        

        //public async Task<(GetReferralTaskDetailsDTO?, string?)> GetReferralTaskDetails(Guid refId)
        //{
        //    var referral = await _dbContext.Referrals
        //                    .Where(x => x.Id == refId)
        //                    .Select(x => new GetReferralTaskDetailsDTO
        //                    {
        //                        RefId = x.Id,
        //                        PatientId = x.PatientId,
        //                        DepartmentId = x.DestinationDepartmentId,
        //                        Priority = x.Priority,
        //                        Diagnosis = x.Diagnosis,
        //                        Goals = x.Goals,
        //                        Description = x.Description,
        //                        Interventions = x.ReferralInterventions.Select(t => t.InterventionId).ToList()
        //                    }).FirstOrDefaultAsync();

        //    return (referral, null);
        //}
    }
}
