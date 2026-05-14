using AlliedHealth.Service.DTOs;

namespace AlliedHealth.Service.Contract
{
    public interface IVacationService
    {
        // AHA: own requests
        IQueryable<GetVacationRequestDTO> GetMyRequests(Guid ahaUserId);
        Task<string?> CreateRequest(Guid ahaUserId, CreateVacationRequestDTO request);

        // AHP: all requests + review
        IQueryable<GetVacationRequestDTO> GetAllRequests();
        Task<string?> ReviewRequest(Guid reviewerId, ReviewVacationRequestDTO request);
    }
}
