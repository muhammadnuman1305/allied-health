using AlliedHealth.Service.DTOs;

namespace AlliedHealth.Service.Contract
{
    public interface IReferralService
    {
        IQueryable<GetReferralDTO> GetAll();
        Task<GetReferralSummaryDTO> GetSummary();
        Task<GetReferralDetailsDTO> GetTask(Guid id);
        Task<string?> CreateTask(AddUpdateReferralDTO request);
        Task<string?> UpdateTask(AddUpdateReferralDTO request);
        Task<string?> ToggleHide(Guid id);
    }
}
