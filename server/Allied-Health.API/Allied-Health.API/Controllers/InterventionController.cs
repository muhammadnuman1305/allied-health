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
    public IActionResult GetAll()
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

    [HttpGet("specialties")]
    public async Task<IActionResult> GetInterventionSpecialities()
    {
        var response = await _interventionService.GetInterventionSpecialities();
        return Ok(response);
    }

    [HttpGet("component-types")]
    public async Task<IActionResult> GetComponentTypes()
    {
        var response = await _interventionService.GetComponentTypes();
        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetIntervention([FromRoute] Guid id)
    {
        var response = await _interventionService.GetIntervention(id);
        if (response == null) return NotFound();
        return Ok(response);
    }

    [HttpPost("")]
    public async Task<IActionResult> CreateIntervention([FromBody] AddUpdateInterventionDTO request)
    {
        var error = await _interventionService.CreateIntervention(request);
        if (error != null) return BadRequest(error);
        return Ok();
    }

    [HttpPut("")]
    public async Task<IActionResult> UpdateIntervention([FromBody] AddUpdateInterventionDTO request)
    {
        var error = await _interventionService.UpdateIntervention(request);
        if (error != null) return BadRequest(error);
        return Ok();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> ToggleHide([FromRoute] Guid id)
    {
        var error = await _interventionService.ToggleHide(id);
        if (error != null) return BadRequest(error);
        return Ok();
    }
}
