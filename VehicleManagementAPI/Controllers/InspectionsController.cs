using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleManagementAPI.DTOs;
using VehicleManagementAPI.Services;

namespace VehicleManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InspectionsController : ControllerBase
{
    private readonly IInspectionService _inspectionService;

    public InspectionsController(IInspectionService inspectionService)
    {
        _inspectionService = inspectionService;
    }

    [HttpGet]
    public async Task<ActionResult<List<InspectionDTO>>> GetAllInspections()
    {
        var inspections = await _inspectionService.GetAllInspectionsAsync();
        return Ok(inspections);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InspectionDTO>> GetInspectionById(Guid id)
    {
        var inspection = await _inspectionService.GetInspectionByIdAsync(id);
        if (inspection == null)
            return NotFound(new { message = "Inspection not found" });

        return Ok(inspection);
    }

    [HttpGet("vehicle/{vehicleId}")]
    public async Task<ActionResult<List<InspectionDTO>>> GetInspectionsByVehicle(Guid vehicleId)
    {
        var inspections = await _inspectionService.GetInspectionsByVehicleAsync(vehicleId);
        return Ok(inspections);
    }

    [HttpGet("type/{inspectionType}")]
    public async Task<ActionResult<List<InspectionDTO>>> GetInspectionsByType(string inspectionType)
    {
        var inspections = await _inspectionService.GetInspectionsByTypeAsync(inspectionType);
        return Ok(inspections);
    }

    [HttpGet("upcoming")]
    public async Task<ActionResult<List<InspectionDTO>>> GetUpcomingInspections([FromQuery] int daysAhead = 30)
    {
        var inspections = await _inspectionService.GetUpcomingInspectionsAsync(daysAhead);
        return Ok(inspections);
    }

    [HttpGet("alerts")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<InspectionAlert>>> GetInspectionAlerts()
    {
        var alerts = await _inspectionService.GetInspectionAlertsAsync();
        return Ok(alerts);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<InspectionDTO>> CreateInspection([FromBody] CreateInspectionRequest request)
    {
        try
        {
            var inspection = await _inspectionService.CreateInspectionAsync(request);
            return CreatedAtAction(nameof(GetInspectionById), new { id = inspection.InspectionID }, inspection);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<InspectionDTO>> UpdateInspection(Guid id, [FromBody] UpdateInspectionRequest request)
    {
        var inspection = await _inspectionService.UpdateInspectionAsync(id, request);
        if (inspection == null)
            return NotFound(new { message = "Inspection not found" });

        return Ok(inspection);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteInspection(Guid id)
    {
        var result = await _inspectionService.DeleteInspectionAsync(id);
        if (!result)
            return NotFound(new { message = "Inspection not found" });

        return NoContent();
    }
}

