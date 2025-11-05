using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using AlliedHealth.Service.Contract;

namespace Allied_Health.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("")]
    [EnableQuery]
    public async Task<IActionResult> GetDashboardDetails()
    {
        var response = await _dashboardService.GetDashboardDetails();
        return Ok(response);
    }
}