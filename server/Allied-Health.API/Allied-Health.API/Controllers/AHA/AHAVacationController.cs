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
        if (_userContext.UserId is not Guid ahaUserId)
            return Unauthorized();
        var response = _vacationService.GetMyRequests(ahaUserId);
        return Ok(response);
    }

    // AHA: check for overlapping vacation requests before submitting
    [HttpGet("check-overlap")]
    public async Task<IActionResult> CheckOverlap([FromQuery] DateOnly startDate, [FromQuery] DateOnly endDate)
    {
        if (_userContext.UserId is not Guid ahaUserId)
            return Unauthorized();
        var result = await _vacationService.CheckOverlap(ahaUserId, startDate, endDate);
        return Ok(result);
    }

    // AHA: submit a new vacation request
    [HttpPost("")]
    public async Task<IActionResult> Create([FromBody] CreateVacationRequestDTO request)
    {
        if (_userContext.UserId is not Guid ahaUserId)
            return Unauthorized();
        var error = await _vacationService.CreateRequest(ahaUserId, request);
        if (error != null)
            return BadRequest(error);
        return Ok();
    }
}
