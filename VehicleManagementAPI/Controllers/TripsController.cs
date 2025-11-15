using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleManagementAPI.DTOs;
using VehicleManagementAPI.Services;
using System.Security.Claims;

namespace VehicleManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TripsController : ControllerBase
{
    private readonly ITripService _tripService;

    public TripsController(ITripService tripService)
    {
        _tripService = tripService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Finance")]
    public async Task<ActionResult<List<TripDTO>>> GetAllTrips()
    {
        var trips = await _tripService.GetAllTripsAsync();
        return Ok(trips);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TripDTO>> GetTripById(Guid id)
    {
        var trip = await _tripService.GetTripByIdAsync(id);
        if (trip == null)
            return NotFound(new { message = "Trip not found" });

        return Ok(trip);
    }

    [HttpGet("driver/{driverId}")]
    public async Task<ActionResult<List<TripDTO>>> GetTripsByDriver(Guid driverId)
    {
        var trips = await _tripService.GetTripsByDriverAsync(driverId);
        return Ok(trips);
    }

    [HttpGet("vehicle/{vehicleId}")]
    public async Task<ActionResult<List<TripDTO>>> GetTripsByVehicle(Guid vehicleId)
    {
        var trips = await _tripService.GetTripsByVehicleAsync(vehicleId);
        return Ok(trips);
    }

    [HttpPost("start")]
    [Authorize(Roles = "Driver")]
    public async Task<ActionResult<TripDTO>> StartTrip([FromBody] CreateTripRequest request)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out Guid driverId))
                return Unauthorized();

            var trip = await _tripService.StartTripAsync(driverId, request);
            return CreatedAtAction(nameof(GetTripById), new { id = trip.TripID }, trip);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id}/end")]
    [Authorize(Roles = "Driver")]
    public async Task<ActionResult<TripDTO>> EndTrip(Guid id, [FromBody] EndTripRequest request)
    {
        try
        {
            var trip = await _tripService.EndTripAsync(id, request);
            if (trip == null)
                return NotFound(new { message = "Trip not found" });

            return Ok(trip);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
