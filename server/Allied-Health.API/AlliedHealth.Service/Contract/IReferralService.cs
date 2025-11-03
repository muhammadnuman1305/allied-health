using AlliedHealth.Service.DTOs;

namespace AlliedHealth.Service.Contract
{
    public interface IReferralService
    {
        IQueryable<GetReferralDTO> GetAll();
        Task<GetReferralSummaryDTO> GetSummary();
        Task<GetReferralDetailsDTO> GetReferral(Guid id);
        Task<string?> CreateReferral(AddUpdateReferralDTO request);
        Task<string?> UpdateReferral(AddUpdateReferralDTO request);
        Task<string?> ToggleHide(Guid id);
    }
}
