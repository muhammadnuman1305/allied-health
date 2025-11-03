using AlliedHealth.Service.Contract;
using AlliedHealth.Service.Contract.AHA;
using AlliedHealth.Service.DTOs.AHA;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using System.Runtime.InteropServices;

namespace Allied_Health.API.Controllers.AHA;

[ApiController]
[Route("api/aha-task")]
public class AHATaskController : ControllerBase
{
    private readonly IAHATaskService _taskService;
    private readonly IUtilityService _utilityService;

    public AHATaskController(IAHATaskService taskService, IUtilityService utilityService)
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

    [HttpGet("my-tasks")]
    [EnableQuery]
    public async Task<IActionResult> GetMyTasks()
    {
        var response = _taskService.GetMyTasks();
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

    [HttpPut("")]
    public async Task<IActionResult> UpdateTaskStatus(UpdateTaskInterventionStatus request)
    {
        var response = await _taskService.UpdateTaskStatus(request);
        return Ok(response);
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