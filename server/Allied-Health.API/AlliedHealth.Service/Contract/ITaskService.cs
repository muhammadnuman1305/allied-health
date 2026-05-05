using AlliedHealth.Service.DTOs;

namespace AlliedHealth.Service.Contract
{
    public interface ITaskService
    {
        IQueryable<GetTaskDTO> GetAll();
        System.Threading.Tasks.Task<GetTaskSummaryDTO> GetSummary();
        System.Threading.Tasks.Task<GetTaskDetailsDTO> GetTask(Guid id);
        System.Threading.Tasks.Task<string?> CreateTask(AddUpdateTaskDTO request);
        System.Threading.Tasks.Task<string?> UpdateTask(AddUpdateTaskDTO request);
        System.Threading.Tasks.Task<string?> ToggleHide(Guid id);
        System.Threading.Tasks.Task<(GetReferralTaskDetailsDTO?, string?)> GetReferralTaskDetails(Guid refId);
        System.Threading.Tasks.Task LogView(Guid taskId, Guid ahaUserId);
    }
}
