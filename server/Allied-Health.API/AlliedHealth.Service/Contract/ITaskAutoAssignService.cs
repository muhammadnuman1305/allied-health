using AlliedHealth.Service.DTOs;

namespace AlliedHealth.Service.Contract
{
    public interface ITaskAutoAssignService
    {
        Task<List<AutoAssignResultDTO>> GetAutoAssignSuggestions(AutoAssignRequestDTO request);
    }
}
