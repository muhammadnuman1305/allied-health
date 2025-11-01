using AlliedHealth.Service.DTOs;

namespace AlliedHealth.Service.Contract
{
    public interface IWardService
    {
        IQueryable<GetWardDTO> GetAll();
        Task<GetWardSummaryDTO> GetSummary();
        Task<GetWardDetailsDTO> GetWard(Guid id);
        Task<string?> CreateWard(AddUpdateWardDTO request);
        Task<string?> UpdateWard(AddUpdateWardDTO request);
        Task<string?> ToggleHide(Guid id);
        Task<List<GetDefaultDepartmentDTO>> GetDefaultDepartments();
    }
}
