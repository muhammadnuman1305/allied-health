using AlliedHealth.Service.DTOs;
using AlliedHealth.Service.DTOs.AHA;

namespace AlliedHealth.Service.Contract.AHA
{
    public interface IAHAPatientService
    {
        IQueryable<GetAHAPatientDTO> GetAll(string viewMode);
        Task<GetAHAPatientSummaryDTO> GetSummary();
        Task<GetAHAPatientDetailsDTO> GetPatient(int id);
        //Task<string?> CreatePatient(AddUpdatePatientDTO request);
        //Task<string?> UpdatePatient(AddUpdatePatientDTO request);
        //Task<string?> ToggleHide(int id);
    }
}
