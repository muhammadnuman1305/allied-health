using AlliedHealth.Service.Contract;
using AlliedHealth.Service.Contract.Authentication;
using AlliedHealth.Service.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;

namespace Allied_Health.API.Controllers;

[ApiController]
[Route("api/vacation")]
public class VacationController : ControllerBase
{
    private readonly IVacationService _vacationService;
    private readonly IUserContext _userContext;

    public VacationController(IVacationService vacationService, IUserContext userContext)
    {
        _vacationService = vacationService;
        _userContext = userContext;
    }

    // AHP: get all vacation requests across all assistants
    [HttpGet("")]
    [EnableQuery]
    public IActionResult GetAll()
    {
        var response = _vacationService.GetAllRequests();
        return Ok(response);
    }

    // AHP: approve or reject a vacation request
    [HttpPut("review")]
    public async Task<IActionResult> Review([FromBody] ReviewVacationRequestDTO request)
    {
        var reviewerId = _userContext.UserId;
        var error = await _vacationService.ReviewRequest(reviewerId, request);
        if (error != null)
            return BadRequest(error);
        return Ok();
    }
}
