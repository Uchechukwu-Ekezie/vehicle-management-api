using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleManagementAPI.DTOs;
using VehicleManagementAPI.Services;

namespace VehicleManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VehiclesController : ControllerBase
{
    private readonly IVehicleService _vehicleService;

    public VehiclesController(IVehicleService vehicleService)
    {
        _vehicleService = vehicleService;
    }

    [HttpGet]
    public async Task<ActionResult<List<VehicleDTO>>> GetAllVehicles()
    {
        var vehicles = await _vehicleService.GetAllVehiclesAsync();
        return Ok(vehicles);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<VehicleDTO>> GetVehicleById(Guid id)
    {
        var vehicle = await _vehicleService.GetVehicleByIdAsync(id);
        if (vehicle == null)
            return NotFound(new { message = "Vehicle not found" });

        return Ok(vehicle);
    }

    [HttpGet("status/{status}")]
    public async Task<ActionResult<List<VehicleDTO>>> GetVehiclesByStatus(string status)
    {
        var vehicles = await _vehicleService.GetVehiclesByStatusAsync(status);
        return Ok(vehicles);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<VehicleDTO>> CreateVehicle([FromBody] CreateVehicleRequest request)
    {
        try
        {
            var vehicle = await _vehicleService.CreateVehicleAsync(request);
            return CreatedAtAction(nameof(GetVehicleById), new { id = vehicle.VehicleID }, vehicle);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<VehicleDTO>> UpdateVehicle(Guid id, [FromBody] UpdateVehicleRequest request)
    {
        var vehicle = await _vehicleService.UpdateVehicleAsync(id, request);
        if (vehicle == null)
            return NotFound(new { message = "Vehicle not found" });

        return Ok(vehicle);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteVehicle(Guid id)
    {
        var result = await _vehicleService.DeleteVehicleAsync(id);
        if (!result)
            return NotFound(new { message = "Vehicle not found" });

        return NoContent();
    }

    [HttpPost("{vehicleId}/assign/{driverId}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> AssignDriver(Guid vehicleId, Guid driverId)
    {
        var result = await _vehicleService.AssignDriverAsync(vehicleId, driverId);
        if (!result)
            return BadRequest(new { message = "Failed to assign driver. Check vehicle and driver exist." });

        return Ok(new { message = "Driver assigned successfully" });
    }
}
