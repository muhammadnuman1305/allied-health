using AlliedHealth.Common.Enums;
using AlliedHealth.Service.DTOs;
using AlliedHealth.Service.Contract;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;

namespace Allied_Health.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReferralController : ControllerBase
{
    private readonly IReferralService _refService;
    private readonly IUtilityService _utilityService;

    public ReferralController(IReferralService refService, IUtilityService utilityService)
    {
        _refService = refService;
        _utilityService = utilityService;
    }

    [HttpGet("")]
    [EnableQuery]
    public async Task<IActionResult> GetAll()
    {
        var response = _refService.GetAll();
        return Ok(response);
    }

    [HttpGet("summary")] 
    public async Task<IActionResult> GetSummary()
    {
        var response = await _refService.GetSummary();
        return Ok(response);
    }

    [HttpGet("{id}")] 
    public async Task<IActionResult> GetReferral(Guid id)
    {
        var response = await _refService.GetReferral(id);
        return Ok(response);
    }

    [HttpPost("")]
    public async Task<IActionResult> CreateReferral([FromBody] AddUpdateReferralDTO request)
    {
        var response = await _refService.CreateReferral(request);

        if (response != null)
            return BadRequest(EMessages.ReferralExistAlready);

        return Ok(response);
    } 

    [HttpPut("")]
    public async Task<IActionResult> UpdateReferral([FromBody] AddUpdateReferralDTO request)
    {
        var response = await _refService.UpdateReferral(request);

        if (response != null)
            return BadRequest(EMessages.ReferralExistAlready);

        return Ok(response);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> ToggleHide(Guid id)
    {
        var response = await _refService.ToggleHide(id);


        if (response != null)
            return BadRequest(EMessages.ReferralNotExists);

        return Ok(response);
    }

    [HttpGet("aha-options")]
    public async Task<IActionResult> GetAHAOptions()
    {
        var response = await _utilityService.GetAHAOptions();
        return Ok(response);
    }

    [HttpGet("patient-options")]
    public async Task<IActionResult> GetPatientOptions()
    {
        var response = await _utilityService.GetPatientOptions();
        return Ok(response);
    }

    [HttpGet("dept-options")]
    public async Task<IActionResult> GetDeptOptions()
    {
        var response = await _utilityService.GetDeptOptions();
        return Ok(response);
    }

    [HttpGet("ward-options")]
    public async Task<IActionResult> GetWardOptions()
    {
        var response = await _utilityService.GetWardOptions();
        return Ok(response);
    }

    [HttpGet("specialties")]
    public async Task<IActionResult> GetTaskSpecialtyOptions()
    {
        var response = await _utilityService.GetSpecialityOptions();
        return Ok(response);
    }

    [HttpGet("interventions")]
    public async Task<IActionResult> GetTaskInterventionOptions()
    {
        var response = await _utilityService.GetInterventionOptions();
        return Ok(response);
    }
}