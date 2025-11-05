using AlliedHealth.Domain;
using AlliedHealth.Service.DTOs;
using AlliedHealth.Service.Contract.Authentication;
using Microsoft.Extensions.Configuration;
using AlliedHealth.Service.Contract;
using Microsoft.EntityFrameworkCore;
using AlliedHealth.Common.Enums;

namespace AlliedHealth.Service.Implementation
{
    public class DashboardService : IDashboardService
    {
        private readonly AlliedHealthDbContext _dbContext;
        private readonly IConfiguration _configuration;
        private readonly IUserContext _userContext;

        public DashboardService(AlliedHealthDbContext dbContext, IConfiguration configuration, IUserContext userContext) 
        {
            _dbContext = dbContext;
            _configuration = configuration;
            _userContext = userContext;
        }

        public async Task<GetDashboardDetailsDTO> GetDashboardDetails()
        {
            var patients = await _dbContext.Patients.CountAsync();
            var departments = await _dbContext.Departments.CountAsync();
            var specs = await _dbContext.Specialties.CountAsync();
            var users = await _dbContext.Users.CountAsync();

            // Task summary
            var tasks = await _dbContext.Tasks.Include(x => x.TaskInterventions).ToListAsync();
            var totalTasks = tasks.Count;
            var assignedTasks = tasks.Count(t => t.StartDate > DateOnly.FromDateTime(DateTime.UtcNow));
            var inProgressTasks = tasks.Count(t => t.StartDate <= DateOnly.FromDateTime(DateTime.UtcNow) && t.EndDate >= DateOnly.FromDateTime(DateTime.UtcNow) && t.TaskInterventions.Any(ti => ti.OutcomeStatus == (int)ETaskInterventionOutcomes.Unseen));
            var completedTasks = tasks.Count(t => t.TaskInterventions.Any(ti => ti.OutcomeStatus != (int)ETaskInterventionOutcomes.Unseen));
            var overdueTasks = tasks.Count(t => t.EndDate < DateOnly.FromDateTime(DateTime.UtcNow) && t.TaskInterventions.Any(ti => ti.OutcomeStatus == (int)ETaskInterventionOutcomes.Unseen));
            var highPriorityTasks = tasks.Count(t => t.Priority == (int)ETaskPriorities.High);
            var mediumPriorityTasks = tasks.Count(t => t.Priority == (int)ETaskPriorities.Medium);
            var lowPriorityTasks = tasks.Count(t => t.Priority == (int)ETaskPriorities.Low);

            // Referral summary
            var referrals = await _dbContext.Referrals.ToListAsync();
            var totalReferrals = referrals.Count;
            var pendingReferrals = referrals.Count(r => r.Status == (int)EReferralOutcomes.Pending);
            var acceptedReferrals = referrals.Count(r => r.Status == (int)EReferralOutcomes.Accepted);
            var rejectedReferrals = referrals.Count(r => r.Status == (int)EReferralOutcomes.Rejected);
            var incomingReferrals = referrals.Count(r => r.DestinationDepartmentId == _userContext.DepartmentId);
            var outgoingReferrals = referrals.Count(r => r.OriginDepartmentId == _userContext.DepartmentId);

            // Intervention outcome summary
            var seenOutcomes = tasks.Sum(t => t.TaskInterventions.Count(ti => ti.OutcomeStatus == (int)ETaskInterventionOutcomes.Seen));
            var attemptedOutcomes = tasks.Sum(t => t.TaskInterventions.Count(ti => ti.OutcomeStatus == (int)ETaskInterventionOutcomes.Attempted));
            var declinedOutcomes = tasks.Sum(t => t.TaskInterventions.Count(ti => ti.OutcomeStatus == (int)ETaskInterventionOutcomes.Declined));
            var unseenOutcomes = tasks.Sum(t => t.TaskInterventions.Count(ti => ti.OutcomeStatus == (int)ETaskInterventionOutcomes.Unseen));
            var handoverOutcomes = tasks.Sum(t => t.TaskInterventions.Count(ti => ti.OutcomeStatus == (int)ETaskInterventionOutcomes.Handover));

            return new GetDashboardDetailsDTO
            {
                TotalPatients = patients,
                TotalDepartments = departments,
                TotalSpecialties = specs,
                TotalUsers = users,
                AssignedTasks = assignedTasks,
                InProgressTasks = inProgressTasks,
                CompletedTasks = completedTasks,
                OverdueTasks = overdueTasks,
                HighPriorityTasks = highPriorityTasks,
                MediumPriorityTasks = mediumPriorityTasks,
                LowPriorityTasks = lowPriorityTasks,
                PendingReferrals = pendingReferrals,
                AcceptedReferrals = acceptedReferrals,
                RejectedReferrals = rejectedReferrals,
                TotalReferrals = totalReferrals,
                IncomingReferrals = incomingReferrals,
                OutgoingReferrals = outgoingReferrals,
                SeenOutcomes = seenOutcomes,
                AttemptedOutcomes = attemptedOutcomes,
                DeclinedOutcomes = declinedOutcomes,
                UnseenOutcomes = unseenOutcomes,
                HandoverOutcomes = handoverOutcomes
            };
        }
    }
}
