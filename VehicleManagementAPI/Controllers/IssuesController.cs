using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleManagementAPI.DTOs;
using VehicleManagementAPI.Services;
using System.Security.Claims;

namespace VehicleManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class IssuesController : ControllerBase
{
    private readonly IIssueService _issueService;

    public IssuesController(IIssueService issueService)
    {
        _issueService = issueService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Mechanic")]
    public async Task<ActionResult<List<IssueDTO>>> GetAllIssues()
    {
        var issues = await _issueService.GetAllIssuesAsync();
        return Ok(issues);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<IssueDTO>> GetIssueById(int id)
    {
        var issue = await _issueService.GetIssueByIdAsync(id);
        if (issue == null)
            return NotFound(new { message = "Issue not found" });

        return Ok(issue);
    }

    [HttpGet("vehicle/{vehicleId}")]
    public async Task<ActionResult<List<IssueDTO>>> GetIssuesByVehicle(int vehicleId)
    {
        var issues = await _issueService.GetIssuesByVehicleAsync(vehicleId);
        return Ok(issues);
    }

    [HttpGet("status/{status}")]
    [Authorize(Roles = "Admin,Mechanic")]
    public async Task<ActionResult<List<IssueDTO>>> GetIssuesByStatus(string status)
    {
        var issues = await _issueService.GetIssuesByStatusAsync(status);
        return Ok(issues);
    }

    [HttpPost]
    [Authorize(Roles = "Driver")]
    public async Task<ActionResult<IssueDTO>> CreateIssue([FromBody] CreateIssueRequest request)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out int reportedById))
                return Unauthorized();

            var issue = await _issueService.CreateIssueAsync(reportedById, request);
            return CreatedAtAction(nameof(GetIssueById), new { id = issue.IssueID }, issue);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Mechanic")]
    public async Task<ActionResult<IssueDTO>> UpdateIssue(int id, [FromBody] UpdateIssueRequest request)
    {
        var issue = await _issueService.UpdateIssueAsync(id, request);
        if (issue == null)
            return NotFound(new { message = "Issue not found" });

        return Ok(issue);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteIssue(int id)
    {
        var result = await _issueService.DeleteIssueAsync(id);
        if (!result)
            return NotFound(new { message = "Issue not found" });

        return NoContent();
    }
}
