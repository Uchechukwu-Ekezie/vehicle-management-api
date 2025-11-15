using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleManagementAPI.DTOs;
using VehicleManagementAPI.Services;

namespace VehicleManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IReportingService _reportingService;

    public ReportsController(IReportingService reportingService)
    {
        _reportingService = reportingService;
    }

    [HttpGet("maintenance/costs")]
    [Authorize(Roles = "Admin,Finance")]
    public async Task<ActionResult<CostAnalyticsDTO>> GetMaintenanceCosts(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var analytics = await _reportingService.GetMaintenanceCostAnalyticsAsync(startDate, endDate);
        return Ok(analytics);
    }

    [HttpGet("fuel-efficiency")]
    [Authorize(Roles = "Admin,Driver,Finance")]
    public async Task<ActionResult<List<FuelEfficiencyReport>>> GetFuelEfficiencyReport()
    {
        var report = await _reportingService.GetFuelEfficiencyReportAsync();
        return Ok(report);
    }

    [HttpGet("fuel-efficiency/vehicle/{vehicleId}")]
    [Authorize(Roles = "Admin,Driver,Finance")]
    public async Task<ActionResult<FuelEfficiencyReport>> GetFuelEfficiencyByVehicle(Guid vehicleId)
    {
        var report = await _reportingService.GetFuelEfficiencyByVehicleAsync(vehicleId);
        if (report == null)
            return NotFound(new { message = "No fuel efficiency data found for this vehicle" });

        return Ok(report);
    }
}
