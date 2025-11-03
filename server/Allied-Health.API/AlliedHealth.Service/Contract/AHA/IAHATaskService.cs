using AlliedHealth.Service.DTOs;
using AlliedHealth.Service.DTOs.AHA;

namespace AlliedHealth.Service.Contract.AHA
{
    public interface IAHATaskService
    {
        IQueryable<GetAHATaskDTO> GetAll();
        IQueryable<GetMyTasksDTO> GetMyTasks();
        Task<GetAHATaskSummaryDTO> GetSummary();
        Task<GetAHATaskDetailsDTO> GetTask(Guid id);
        Task<string?> UpdateTaskStatus(UpdateTaskInterventionStatus request);
    }
}
