using AlliedHealth.Service.DTOs;

namespace AlliedHealth.Service.Contract
{
    public interface ISpecialtyService
    {
        IQueryable<GetSpecialtyDTO> GetAll();
        Task<GetSpecialtySummaryDTO> GetSummary();
        Task<GetSpecialtyDetailsDTO> GetSpecialty(Guid id);
        Task<string?> CreateSpecialty(AddUpdateSpecialtyDTO request);
        Task<string?> UpdateSpecialty(AddUpdateSpecialtyDTO request);
        Task<string?> ToggleHide(Guid id);
    }
}
