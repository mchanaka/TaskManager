using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManagerApi.Gateways;

namespace TaskManagerApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GatewayController(IExternalApiGateway gateway) : ControllerBase
{
    [HttpGet("fetch")]
    public async Task<IActionResult> Fetch([FromQuery] string url)
    {
        if (string.IsNullOrWhiteSpace(url)) return BadRequest("url is required.");
        var result = await gateway.GetAsync(url);
        return Content(result, "application/json");
    }

    [HttpPost("send")]
    public async Task<IActionResult> Send([FromQuery] string url, [FromBody] object payload)
    {
        if (string.IsNullOrWhiteSpace(url)) return BadRequest("url is required.");
        var result = await gateway.PostAsync(url, payload);
        return Content(result, "application/json");
    }
}
