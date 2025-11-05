using AlliedHealth.Service.DTOs;

namespace AlliedHealth.Service.Contract
{
    public interface IDashboardService
    {
        Task<GetDashboardDetailsDTO> GetDashboardDetails();
    }
}
