using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleManagementAPI.DTOs;
using VehicleManagementAPI.Services;

namespace VehicleManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MaintenanceController : ControllerBase
{
    private readonly IMaintenanceService _maintenanceService;

    public MaintenanceController(IMaintenanceService maintenanceService)
    {
        _maintenanceService = maintenanceService;
    }

    [HttpGet]
    public async Task<ActionResult<List<MaintenanceRecordDTO>>> GetAllRecords()
    {
        var records = await _maintenanceService.GetAllRecordsAsync();
        return Ok(records);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MaintenanceRecordDTO>> GetRecordById(Guid id)
    {
        var record = await _maintenanceService.GetRecordByIdAsync(id);
        if (record == null)
            return NotFound(new { message = "Maintenance record not found" });

        return Ok(record);
    }

    [HttpGet("vehicle/{vehicleId}")]
    public async Task<ActionResult<List<MaintenanceRecordDTO>>> GetRecordsByVehicle(Guid vehicleId)
    {
        var records = await _maintenanceService.GetRecordsByVehicleAsync(vehicleId);
        return Ok(records);
    }

    [HttpPost("schedule")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<MaintenanceRecordDTO>> CreateRecord([FromBody] CreateMaintenanceRequest request)
    {
        try
        {
            var record = await _maintenanceService.CreateRecordAsync(request);
            return CreatedAtAction(nameof(GetRecordById), new { id = record.RecordID }, record);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("records/{id}")]
    [Authorize(Roles = "Admin,Mechanic")]
    public async Task<ActionResult<MaintenanceRecordDTO>> UpdateRecord(Guid id, [FromBody] UpdateMaintenanceRequest request)
    {
        var record = await _maintenanceService.UpdateRecordAsync(id, request);
        if (record == null)
            return NotFound(new { message = "Maintenance record not found" });

        return Ok(record);
    }

    [HttpDelete("records/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteRecord(Guid id)
    {
        var result = await _maintenanceService.DeleteRecordAsync(id);
        if (!result)
            return NotFound(new { message = "Maintenance record not found" });

        return NoContent();
    }

    [HttpGet("alerts")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<MaintenanceAlert>>> GetMaintenanceAlerts()
    {
        var alerts = await _maintenanceService.GetMaintenanceAlertsAsync();
        return Ok(alerts);
    }
}
