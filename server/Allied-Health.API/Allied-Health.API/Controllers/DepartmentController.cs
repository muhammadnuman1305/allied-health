using AlliedHealth.Common.Enums;
using AlliedHealth.Domain.DTOs;
using AlliedHealth.Service.Contract;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;

namespace Allied_Health.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DepartmentController : ControllerBase
{
    private readonly IDepartmentService _deptService;
    public DepartmentController(IDepartmentService deptService)
    {
        _deptService = deptService;
    }

    [HttpGet("")]
    [EnableQuery]
    public async Task<IActionResult> GetAll()
    {
        var response = _deptService.GetAll();
        return Ok(response);
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var response = await _deptService.GetSummary();

        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetDepartment([FromRoute] Guid id)
    {
        var response = await _deptService.GetDepartment(id);

        return Ok(response);
    }

    [HttpPost("")]
    public async Task<IActionResult> CreateDepartment([FromBody] AddUpdateDepartmentDTO request)
    {
        var response = await _deptService.CreateDepartment(request);

        if (response != null)
            return BadRequest(EMessages.DeptExistAlready);

        return Ok(response);
    }

    [HttpPut("")]
    public async Task<IActionResult> UpdateDepartment([FromBody] AddUpdateDepartmentDTO request)
    {
        var response = await _deptService.UpdateDepartment(request);

        if (response != null)
            return BadRequest(EMessages.DeptNotExists);

        return Ok(response);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> ToggleHide([FromRoute] Guid id)
    {
        var response = await _deptService.ToggleHide(id);

        if (response != null)
            return BadRequest(EMessages.DeptNotExists);

        return Ok(response);
    }

    [HttpGet("dept-heads")]
    public async Task<IActionResult> GetDeptHeads()
    {
        var response = await _deptService.GetDeptHeads();

        return Ok(response);
    }
}