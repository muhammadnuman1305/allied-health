using Microsoft.AspNetCore.Mvc;

namespace Allied_Health.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    public TasksController()
    {

    }

    [HttpGet("")]
    public async Task<IActionResult> GetAll()
    {

        return Ok();
    }

    [HttpGet("{id}")] 
    public async Task<IActionResult> GetTask(Guid id)
    {

        return Ok();
    }

    [HttpPost("create-task")]
    public async Task<IActionResult> CreateTask([FromBody] object? task)
    {

        return Ok();
    } 

    [HttpPut("update-task")]
    public async Task<IActionResult> UpdateTask([FromBody] object? task)
    {

        return Ok();
    }

    [HttpDelete("delete-task/{id}")]
    public async Task<IActionResult> DeleteTask(Guid id)
    {

        return Ok();
    }
}