using Microsoft.EntityFrameworkCore;
using VehicleManagementAPI.Data;
using VehicleManagementAPI.DTOs;
using VehicleManagementAPI.Models;

namespace VehicleManagementAPI.Services;

public interface IIssueService
{
    Task<List<IssueDTO>> GetAllIssuesAsync();
    Task<IssueDTO?> GetIssueByIdAsync(Guid id);
    Task<List<IssueDTO>> GetIssuesByVehicleAsync(Guid vehicleId);
    Task<List<IssueDTO>> GetIssuesByStatusAsync(string status);
    Task<IssueDTO> CreateIssueAsync(Guid reportedById, CreateIssueRequest request);
    Task<IssueDTO?> UpdateIssueAsync(Guid id, UpdateIssueRequest request);
    Task<bool> DeleteIssueAsync(Guid id);
}

public class IssueService : IIssueService
{
    private readonly ApplicationDbContext _context;

    public IssueService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<IssueDTO>> GetAllIssuesAsync()
    {
        return await _context.Issues
            .Include(i => i.Vehicle)
            .Include(i => i.ReportedBy)
            .Select(i => MapToDTO(i))
            .ToListAsync();
    }

    public async Task<IssueDTO?> GetIssueByIdAsync(Guid id)
    {
        var issue = await _context.Issues
            .Include(i => i.Vehicle)
            .Include(i => i.ReportedBy)
            .FirstOrDefaultAsync(i => i.IssueID == id);

        return issue == null ? null : MapToDTO(issue);
    }

    public async Task<List<IssueDTO>> GetIssuesByVehicleAsync(Guid vehicleId)
    {
        return await _context.Issues
            .Include(i => i.Vehicle)
            .Include(i => i.ReportedBy)
            .Where(i => i.VehicleID == vehicleId)
            .Select(i => MapToDTO(i))
            .ToListAsync();
    }

    public async Task<List<IssueDTO>> GetIssuesByStatusAsync(string status)
    {
        return await _context.Issues
            .Include(i => i.Vehicle)
            .Include(i => i.ReportedBy)
            .Where(i => i.Status == status)
            .Select(i => MapToDTO(i))
            .ToListAsync();
    }

    public async Task<IssueDTO> CreateIssueAsync(Guid reportedById, CreateIssueRequest request)
    {
        var vehicle = await _context.Vehicles.FindAsync(request.VehicleID);
        if (vehicle == null)
            throw new Exception("Vehicle not found");

        var issue = new Issue
        {
            VehicleID = request.VehicleID,
            ReportedByID = reportedById,
            ReportDate = DateTime.UtcNow,
            Description = request.Description,
            Priority = request.Priority ?? "Medium",
            Status = "Reported",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Issues.Add(issue);
        await _context.SaveChangesAsync();

        var createdIssue = await _context.Issues
            .Include(i => i.Vehicle)
            .Include(i => i.ReportedBy)
            .FirstAsync(i => i.IssueID == issue.IssueID);

        return MapToDTO(createdIssue);
    }

    public async Task<IssueDTO?> UpdateIssueAsync(Guid id, UpdateIssueRequest request)
    {
        var issue = await _context.Issues
            .Include(i => i.Vehicle)
            .Include(i => i.ReportedBy)
            .FirstOrDefaultAsync(i => i.IssueID == id);

        if (issue == null) return null;

        if (!string.IsNullOrEmpty(request.Status)) issue.Status = request.Status;
        if (!string.IsNullOrEmpty(request.Priority)) issue.Priority = request.Priority;
        if (request.ResolvedDate.HasValue) issue.ResolvedDate = request.ResolvedDate.Value;
        if (request.Resolution != null) issue.Resolution = request.Resolution;

        issue.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToDTO(issue);
    }

    public async Task<bool> DeleteIssueAsync(Guid id)
    {
        var issue = await _context.Issues.FindAsync(id);
        if (issue == null) return false;

        _context.Issues.Remove(issue);
        await _context.SaveChangesAsync();

        return true;
    }

    private static IssueDTO MapToDTO(Issue issue)
    {
        return new IssueDTO
        {
            IssueID = issue.IssueID,
            VehicleID = issue.VehicleID,
            VehicleInfo = $"{issue.Vehicle.Make} {issue.Vehicle.Model} ({issue.Vehicle.LicensePlate})",
            ReportedByID = issue.ReportedByID,
            ReportedByName = issue.ReportedBy.FullName ?? issue.ReportedBy.Username,
            ReportDate = issue.ReportDate,
            Description = issue.Description,
            Status = issue.Status,
            Priority = issue.Priority,
            ResolvedDate = issue.ResolvedDate,
            Resolution = issue.Resolution
        };
    }
}
