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
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet("")]
    [EnableQuery]
    public async Task<IActionResult> GetAll()
    {
        var response = _userService.GetAll();
        return Ok(response);
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var response = await _userService.GetSummary();

        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser([FromRoute] Guid id)
    {
        var response = await _userService.GetUser(id);

        return Ok(response);
    }

    [HttpPost("")]
    public async Task<IActionResult> CreateUser([FromBody] AddUpdateUserDTO request)
    {
        var response = await _userService.CreateUser(request);

        if (response != null)
            return BadRequest(EMessages.UserExistAlready);

        return Ok(response);
    }

    [HttpPut("")]
    public async Task<IActionResult> UpdateUser([FromBody] AddUpdateUserDTO request)
    {
        var response = await _userService.UpdateUser(request);

        if (response != null)
            return BadRequest(EMessages.UserNotExists);

        return Ok(response);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> ToggleHide([FromRoute] Guid id)
    {
        var response = await _userService.ToggleHide(id);

        if (response != null)
            return BadRequest(EMessages.UserNotExists);

        return Ok(response);
    }

}