using AlliedHealth.Service.Contract;
using AlliedHealth.Service.Contract.Authentication;
using AlliedHealth.Service.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;

namespace Allied_Health.API.Controllers.AHA;

[ApiController]
[Route("api/aha-vacation")]
public class AHAVacationController : ControllerBase
{
    private readonly IVacationService _vacationService;
    private readonly IUserContext _userContext;

    public AHAVacationController(IVacationService vacationService, IUserContext userContext)
    {
        _vacationService = vacationService;
        _userContext = userContext;
    }

    // AHA: get own vacation requests
    [HttpGet("")]
    [EnableQuery]
    public IActionResult GetMy()
    {
        var ahaUserId = _userContext.UserId;
        var response = _vacationService.GetMyRequests(ahaUserId);
        return Ok(response);
    }

    // AHA: submit a new vacation request
    [HttpPost("")]
    public async Task<IActionResult> Create([FromBody] CreateVacationRequestDTO request)
    {
        var ahaUserId = _userContext.UserId;
        var error = await _vacationService.CreateRequest(ahaUserId, request);
        if (error != null)
            return BadRequest(error);
        return Ok();
    }
}
