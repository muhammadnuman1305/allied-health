using AlliedHealth.Domain.DTOs;

namespace AlliedHealth.Service.Contract
{
    public interface IPatientService
    {
        IQueryable<GetPatientDTO> GetAll();
        Task<GetPatientSummaryDTO> GetSummary();
        Task<GetPatientDetailsDTO> GetPatient(int id);
        Task<string?> CreatePatient(AddUpdatePatientDTO request);
        Task<string?> UpdatePatient(AddUpdatePatientDTO request);
        Task<string?> ToggleHide(int id);
    }
}
