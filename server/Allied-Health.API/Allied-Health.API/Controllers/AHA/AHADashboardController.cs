using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using AlliedHealth.Service.Contract.AHA;

namespace Allied_Health.API.Controllers.AHA;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AHADashboardController : ControllerBase
{
    private readonly IAHAPatientService _patientService;
    public AHADashboardController(IAHAPatientService patientService)
    {
        _patientService = patientService;
    }

    [HttpGet("")]
    [EnableQuery]
    public async Task<IActionResult> GetAll()
    {
        //var response = _patientService.GetAll();
        //return Ok(response);

        return Ok();
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var response = await _patientService.GetSummary();

        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPatient([FromRoute] int id)
    {
        var response = await _patientService.GetPatient(id);

        return Ok(response);
    }
}