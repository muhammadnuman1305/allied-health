using AlliedHealth.Service.DTOs;

namespace AlliedHealth.Service.Contract
{
    public interface IInterventionService
    {
        IQueryable<GetInterventionDTO> GetAll();
        Task<GetInterventionSummaryDTO> GetSummary();
        Task<GetInterventionDetailsDTO> GetIntervention(Guid id);
        Task<string?> CreateIntervention(AddUpdateInterventionDTO request);
        Task<string?> UpdateIntervention(AddUpdateInterventionDTO request);
        Task<string?> ToggleHide(Guid id);
        Task<List<GetInterventionSpecialtiesDTO>> GetInterventionSpecialities();
    }
}
