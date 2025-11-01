using AlliedHealth.Service.DTOs;

namespace AlliedHealth.Service.Contract
{
    public interface IUtilityService
    {
        Task<List<GetAHAOptionsDTO>> GetAHAOptions();
        Task<List<GetPatientOptionsDTO>> GetPatientOptions();
        Task<List<GetDeptOptionsDTO>> GetDeptOptions();
        Task<List<GetWardOptionsDTO>> GetWardOptions();
        Task<List<GetSpecialityOptionsDTO>> GetSpecialityOptions();
        Task<List<GetInterventionOptionsDTO>> GetInterventionOptions();
    }
}
