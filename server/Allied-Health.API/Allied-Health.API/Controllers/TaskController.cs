using AlliedHealth.Common.Enums;
using AlliedHealth.Service.DTOs;
using AlliedHealth.Service.Contract;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;

namespace Allied_Health.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TaskController : ControllerBase
{
    private readonly ITaskService _taskService;
    private readonly IUtilityService _utilityService;

    public TaskController(ITaskService taskService, IUtilityService utilityService)
    {
        _taskService = taskService;
        _utilityService = utilityService;
    }

    [HttpGet("")]
    [EnableQuery]
    public async Task<IActionResult> GetAll()
    {
        var response = _taskService.GetAll();
        return Ok(response);
    }

    [HttpGet("summary")] 
    public async Task<IActionResult> GetSummary()
    {
        var response = await _taskService.GetSummary();
        return Ok(response);
    }

    [HttpGet("{id}")] 
    public async Task<IActionResult> GetTask(Guid id)
    {
        var response = await _taskService.GetTask(id);
        return Ok(response);
    }

    [HttpPost("")]
    public async Task<IActionResult> CreateTask([FromBody] AddUpdateTaskDTO request)
    {
        var response = await _taskService.CreateTask(request);

        if (response != null)
            return BadRequest(EMessages.TaskExistAlready);

        return Ok(response);
    } 

    [HttpPut("")]
    public async Task<IActionResult> UpdateTask([FromBody] AddUpdateTaskDTO request)
    {
        var response = await _taskService.UpdateTask(request);

        if (response != null)
            return BadRequest(EMessages.TaskExistAlready);

        return Ok(response);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> ToggleHide(Guid id)
    {
        var response = await _taskService.ToggleHide(id);


        if (response != null)
            return BadRequest(EMessages.TaskNotExists);

        return Ok(response);
    }

    [HttpGet("referral-details")]
    public async Task<IActionResult> GetReferralTaskDetails(Guid refId)
    {
        var response = await _taskService.GetReferralTaskDetails(refId);

        if (response.Item2 != null || response.Item1 == null)
            return BadRequest(response.Item2);

        return Ok(response.Item1);
    }

    [HttpGet("aha-options")]
    public async Task<IActionResult> GetAHAOptions()
    {
        var response = await _utilityService.GetAHAOptions();
        return Ok(response);
    }

    [HttpGet("patient-options")]
    public async Task<IActionResult> GetPatientOptions()
    {
        var response = await _utilityService.GetPatientOptions();
        return Ok(response);
    }

    [HttpGet("dept-options")]
    public async Task<IActionResult> GetDeptOptions()
    {
        var response = await _utilityService.GetDeptOptions();
        return Ok(response);
    }

    [HttpGet("ward-options")]
    public async Task<IActionResult> GetWardOptions()
    {
        var response = await _utilityService.GetWardOptions();
        return Ok(response);
    }

    [HttpGet("specialties")]
    public async Task<IActionResult> GetTaskSpecialtyOptions()
    {
        var response = await _utilityService.GetSpecialityOptions();
        return Ok(response);
    }

    [HttpGet("interventions")]
    public async Task<IActionResult> GetTaskInterventionOptions()
    {
        var response = await _utilityService.GetInterventionOptions();
        return Ok(response);
    }
}