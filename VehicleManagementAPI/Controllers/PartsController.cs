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
    private readonly ILogger<PartsController> _logger;

    public PartsController(IPartsService partsService, ILogger<PartsController> logger)
    {
        _partsService = partsService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<PartsInventoryDTO>>> GetAllParts()
    {
        var parts = await _partsService.GetAllPartsAsync();
        return Ok(parts);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PartsInventoryDTO>> GetPartById(Guid id)
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
    [Authorize(Roles = "Admin,Mechanic")]
    public async Task<ActionResult<PartsInventoryDTO>> CreatePart([FromBody] CreatePartRequest request)
    {
        try
        {
            var part = await _partsService.CreatePartAsync(request);
            return CreatedAtAction(nameof(GetPartById), new { id = part.PartID }, part);
        }
        catch (Exception ex)
        {
            // Log full exception including inner exception for debugging
            _logger.LogError(ex, "Error creating part");
            var inner = ex.InnerException?.Message;
            return BadRequest(new { message = "An error occurred while saving the entity changes. See server logs for details.", error = ex.Message, innerException = inner });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<PartsInventoryDTO>> UpdatePart(Guid id, [FromBody] UpdatePartRequest request)
    {
        var part = await _partsService.UpdatePartAsync(id, request);
        if (part == null)
            return NotFound(new { message = "Part not found" });

        return Ok(part);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeletePart(Guid id)
    {
        var result = await _partsService.DeletePartAsync(id);
        if (!result)
            return NotFound(new { message = "Part not found" });

        return NoContent();
    }

    [HttpPost("{id}/use")]
    public async Task<ActionResult> UsePartStock(Guid id, [FromBody] int quantity)
    {
        var result = await _partsService.UpdateStockAsync(id, quantity);
        if (!result)
            return NotFound(new { message = "Part not found" });

        return Ok(new { message = "Stock updated successfully" });
    }
}
