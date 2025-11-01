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
public class WardController : ControllerBase
{
    private readonly IWardService _wardService;
    public WardController(IWardService wardService)
    {
        _wardService = wardService;
    }

    [HttpGet("")]
    [EnableQuery]
    public async Task<IActionResult> GetAll()
    {
        var response = _wardService.GetAll();
        return Ok(response);
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var response = await _wardService.GetSummary();

        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetWard([FromRoute] Guid id)
    {
        var response = await _wardService.GetWard(id);

        return Ok(response);
    }

    [HttpPost("")]
    public async Task<IActionResult> CreateWard([FromBody] AddUpdateWardDTO request)
    {
        var response = await _wardService.CreateWard(request);

        if (response != null)
            return BadRequest(EMessages.WardExistAlready);

        return Ok(response);
    }

    [HttpPut("")]
    public async Task<IActionResult> UpdateWard([FromBody] AddUpdateWardDTO request)
    {
        var response = await _wardService.UpdateWard(request);

        if (response != null)
            return BadRequest(EMessages.WardNotExists);

        return Ok(response);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> ToggleHide([FromRoute] Guid id)
    {
        var response = await _wardService.ToggleHide(id);

        if (response != null)
            return BadRequest(EMessages.WardNotExists);

        return Ok(response);
    }

    [HttpGet("get-dept")]
    public async Task<IActionResult> GetDefaultDepartments()
    {
        var response = await _wardService.GetDefaultDepartments();
        return Ok(response);
    }
}