using AlliedHealth.Common.Enums;
using AlliedHealth.Service.DTOs;
using AlliedHealth.Service.Contract;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;

namespace Allied_Health.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PatientController : ControllerBase
{
    private readonly IPatientService _patientService;
    public PatientController(IPatientService patientService)
    {
        _patientService = patientService;
    }

    [HttpGet("")]
    [EnableQuery]
    public async Task<IActionResult> GetAll()
    {
        var response = _patientService.GetAll();
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

    [HttpPost("")]
    public async Task<IActionResult> CreatePatient([FromBody] AddUpdatePatientDTO request)
    {
        var response = await _patientService.CreatePatient(request);

        if (response != null)
            return BadRequest(EMessages.PatientExistAlready);

        return Ok(response);
    }

    [HttpPut("")]
    public async Task<IActionResult> UpdatePatient([FromBody] AddUpdatePatientDTO request)
    {
        var response = await _patientService.UpdatePatient(request);

        if (response != null)
            return BadRequest(EMessages.UserNotExists);

        return Ok(response);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> ToggleHide([FromRoute] int id)
    {
        var response = await _patientService.ToggleHide(id);

        if (response != null)
            return BadRequest(EMessages.UserNotExists);

        return Ok(response);
    }

}