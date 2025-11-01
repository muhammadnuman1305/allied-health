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
public class SpecialtyController : ControllerBase
{
    private readonly ISpecialtyService _specialtyService;
    public SpecialtyController(ISpecialtyService specialtyService)
    {
        _specialtyService = specialtyService;
    }

    [HttpGet("")]
    [EnableQuery]
    public async Task<IActionResult> GetAll()
    {
        var response = _specialtyService.GetAll();
        return Ok(response);
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var response = await _specialtyService.GetSummary();

        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSpecialty([FromRoute] Guid id)
    {
        var response = await _specialtyService.GetSpecialty(id);

        return Ok(response);
    }

    [HttpPost("")]
    public async Task<IActionResult> CreateSpecialty([FromBody] AddUpdateSpecialtyDTO request)
    {
        var response = await _specialtyService.CreateSpecialty(request);

        if (response != null)
            return BadRequest(EMessages.WardExistAlready);

        return Ok(response);
    }

    [HttpPut("")]
    public async Task<IActionResult> UpdateSpecialty([FromBody] AddUpdateSpecialtyDTO request)
    {
        var response = await _specialtyService.UpdateSpecialty(request);

        if (response != null)
            return BadRequest(EMessages.WardNotExists);

        return Ok(response);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> ToggleHide([FromRoute] Guid id)
    {
        var response = await _specialtyService.ToggleHide(id);

        if (response != null)
            return BadRequest(EMessages.WardNotExists);

        return Ok(response);
    }
}