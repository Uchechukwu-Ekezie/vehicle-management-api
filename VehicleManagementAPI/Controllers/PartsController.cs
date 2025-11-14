using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleManagementAPI.DTOs;
using VehicleManagementAPI.Services;

namespace VehicleManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Mechanic")]
public class PartsController : ControllerBase
{
    private readonly IPartsService _partsService;

    public PartsController(IPartsService partsService)
    {
        _partsService = partsService;
    }

    [HttpGet]
    public async Task<ActionResult<List<PartsInventoryDTO>>> GetAllParts()
    {
        var parts = await _partsService.GetAllPartsAsync();
        return Ok(parts);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PartsInventoryDTO>> GetPartById(int id)
    {
        var part = await _partsService.GetPartByIdAsync(id);
        if (part == null)
            return NotFound(new { message = "Part not found" });

        return Ok(part);
    }

    [HttpGet("low-stock")]
    public async Task<ActionResult<List<PartsInventoryDTO>>> GetLowStockParts()
    {
        var parts = await _partsService.GetLowStockPartsAsync();
        return Ok(parts);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PartsInventoryDTO>> CreatePart([FromBody] CreatePartRequest request)
    {
        try
        {
            var part = await _partsService.CreatePartAsync(request);
            return CreatedAtAction(nameof(GetPartById), new { id = part.PartID }, part);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<PartsInventoryDTO>> UpdatePart(int id, [FromBody] UpdatePartRequest request)
    {
        var part = await _partsService.UpdatePartAsync(id, request);
        if (part == null)
            return NotFound(new { message = "Part not found" });

        return Ok(part);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeletePart(int id)
    {
        var result = await _partsService.DeletePartAsync(id);
        if (!result)
            return NotFound(new { message = "Part not found" });

        return NoContent();
    }

    [HttpPost("{id}/use")]
    public async Task<ActionResult> UsePartStock(int id, [FromBody] int quantity)
    {
        var result = await _partsService.UpdateStockAsync(id, quantity);
        if (!result)
            return NotFound(new { message = "Part not found" });

        return Ok(new { message = "Stock updated successfully" });
    }
}
