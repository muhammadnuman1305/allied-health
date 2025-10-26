using AlliedHealth.Domain.DTOs;

namespace AlliedHealth.Service.Contract
{
    public interface IPatientService
    {
        IQueryable<GetUserDTO> GetAll();
        Task<GetUserSummaryDTO> GetSummary();
        Task<GetUserDTO> GetUser(Guid id);
        Task<string?> CreateUser(AddUpdateUserDTO request);
        Task<string?> UpdateUser(AddUpdateUserDTO request);
        Task<string?> ToggleHide(Guid id);
    }
}
