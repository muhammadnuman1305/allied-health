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
public class InterventionController : ControllerBase
{
    private readonly IInterventionService _interventionService;

    public InterventionController(IInterventionService interventionService)
    {
        _interventionService = interventionService;
    }

    [HttpGet("")]
    [EnableQuery]
    public async Task<IActionResult> GetAll()
    {
        var response = _interventionService.GetAll();
        return Ok(response);
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var response = await _interventionService.GetSummary();

        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetIntervention([FromRoute] Guid id)
    {
        var response = await _interventionService.GetIntervention(id);

        return Ok(response);
    }

    [HttpPost("")]
    public async Task<IActionResult> CreateIntervention([FromBody] AddUpdateInterventionDTO request)
    {
        var response = await _interventionService.CreateIntervention(request);

        if (response != null)
            return BadRequest(EMessages.WardExistAlready);

        return Ok(response);
    }

    [HttpPut("")]
    public async Task<IActionResult> UpdateIntervention([FromBody] AddUpdateInterventionDTO request)
    {
        var response = await _interventionService.UpdateIntervention(request);

        if (response != null)
            return BadRequest(EMessages.WardNotExists);

        return Ok(response);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> ToggleHide([FromRoute] Guid id)
    {
        var response = await _interventionService.ToggleHide(id);

        if (response != null)
            return BadRequest(EMessages.WardNotExists);

        return Ok(response);
    }

    [HttpGet("specialties")]
    public async Task<IActionResult> GetInterventionSpecialities()
    {
        var response = await _interventionService.GetInterventionSpecialities();
        return Ok(response);
    }
}