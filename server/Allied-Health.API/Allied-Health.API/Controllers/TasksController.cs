using AlliedHealth.Common.Enums;
using AlliedHealth.Domain.DTOs;
using AlliedHealth.Service.Contract;
using Microsoft.AspNetCore.Mvc;

namespace Allied_Health.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    [HttpGet("")]
    public async Task<IActionResult> GetAll()
    {
        var response = _taskService.GetAll();
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
        var response = await _taskService.CreateTask(request);

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
}