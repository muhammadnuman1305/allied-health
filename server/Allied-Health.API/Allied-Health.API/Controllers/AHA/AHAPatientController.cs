using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using AlliedHealth.Service.Contract.AHA;

namespace Allied_Health.API.Controllers.AHA;

[ApiController]
[Route("api/aha-patient")]
[Authorize]
public class AHAPatientController : ControllerBase
{
    private readonly IAHAPatientService _patientService;
    public AHAPatientController(IAHAPatientService patientService)
    {
        _patientService = patientService;
    }

    [HttpGet("")]
    [EnableQuery]
    public async Task<IActionResult> GetAll([FromQuery] string viewMode="all")
    {
        var response = _patientService.GetAll(viewMode);
        return Ok(response);
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