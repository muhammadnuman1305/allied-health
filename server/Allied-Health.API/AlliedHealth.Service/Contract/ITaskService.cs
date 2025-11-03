using AlliedHealth.Service.DTOs;

namespace AlliedHealth.Service.Contract
{
    public interface ITaskService
    {
        IQueryable<GetTaskDTO> GetAll();
        Task<GetTaskSummaryDTO> GetSummary();
        Task<GetTaskDetailsDTO> GetTask(Guid id);
        Task<string?> CreateTask(AddUpdateTaskDTO request);
        Task<string?> UpdateTask(AddUpdateTaskDTO request);
        Task<string?> ToggleHide(Guid id);
        Task<(GetReferralTaskDetailsDTO?, string?)> GetReferralTaskDetails(Guid refId);
    }
}
