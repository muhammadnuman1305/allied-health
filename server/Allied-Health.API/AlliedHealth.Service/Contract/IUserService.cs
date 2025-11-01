using AlliedHealth.Service.DTOs;

namespace AlliedHealth.Service.Contract
{
    public interface IUserService
    {
        IQueryable<GetUserDTO> GetAll();
        Task<GetUserSummaryDTO> GetSummary();
        Task<GetUserDTO> GetUser(Guid id);
        Task<string?> CreateUser(AddUpdateUserDTO request);
        Task<string?> UpdateUser(AddUpdateUserDTO request);
        Task<string?> ToggleHide(Guid id);
    }
}
