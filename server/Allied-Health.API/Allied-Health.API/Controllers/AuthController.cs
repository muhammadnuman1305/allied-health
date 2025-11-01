using AlliedHealth.Service.DTOs;
using AlliedHealth.Service.Contract.Authentication;
using Microsoft.AspNetCore.Mvc;

namespace Allied_Health.API.Controllers;

[ApiController]
[Route("[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Authenticate(PostAuthUserDTO request)
    {
        var response = await _authService.Authenticate(request);

        if (response.Item1 == null || response.Item2 != null)
            return BadRequest(response.Item2);

        return Ok(response.Item1);
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterUserDTO request)
    {
        var response = await _authService.Register(request);

        if (response != null)
            return BadRequest(response);

        return Ok();
    }
}