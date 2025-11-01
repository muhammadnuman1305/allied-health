using AlliedHealth.Service.DTOs;

namespace AlliedHealth.Service.Contract
{
    public interface IDepartmentService
    {
        IQueryable<GetDepartmentDTO> GetAll();
        Task<GetDepartmentSummaryDTO> GetSummary();
        Task<GetDepartmentDetailsDTO> GetDepartment(Guid id);
        Task<string?> CreateDepartment(AddUpdateDepartmentDTO request);
        Task<string?> UpdateDepartment(AddUpdateDepartmentDTO request);
        Task<string?> ToggleHide(Guid id);
        Task<List<GetDeptHeadOptions>> GetDeptHeads();
    }
}
