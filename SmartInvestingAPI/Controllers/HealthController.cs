using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using SmartInvestingAPI.Database;
using SmartInvestingAPI.Model.Wrappers;

namespace SmartInvestingAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly HealthCheckService healthCheckService;

    public HealthController(HealthCheckService healthCheckService)
    {
        this.healthCheckService = healthCheckService;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var report = await healthCheckService.CheckHealthAsync();

        var response = new
        {
            status = report.Status.ToString(),
            checks = report.Entries.Select(e => new
            {
                name = e.Key,
                status = e.Value.Status.ToString(),
                description = e.Value.Description,
                duration = e.Value.Duration.TotalMilliseconds
            }),
            totalDuration = report.TotalDuration.TotalMilliseconds
        };

        var statusCode = report.Status == HealthStatus.Healthy
            ? StatusCodes.Status200OK
            : StatusCodes.Status503ServiceUnavailable;

        return StatusCode(statusCode, ApiResponse<object>.Ok(response));
    }

    [HttpGet("liveness")]
    public IActionResult Liveness()
    {
        return Ok(ApiResponse<object>.Ok(new { status = "Alive" }));
    }

    [HttpGet("readiness")]
    public async Task<IActionResult> Readiness()
    {
        var report = await healthCheckService.CheckHealthAsync();
        var isReady = report.Status == HealthStatus.Healthy;

        if (isReady)
            return Ok(ApiResponse<object>.Ok(new { status = "Ready" }));

        return StatusCode(StatusCodes.Status503ServiceUnavailable,
            ApiResponse<object>.Fail("Service not ready"));
    }
}
