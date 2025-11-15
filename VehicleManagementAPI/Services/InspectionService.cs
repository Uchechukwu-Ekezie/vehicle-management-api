using Microsoft.EntityFrameworkCore;
using VehicleManagementAPI.Data;
using VehicleManagementAPI.DTOs;
using VehicleManagementAPI.Models;

namespace VehicleManagementAPI.Services;

public interface IInspectionService
{
    Task<List<InspectionDTO>> GetAllInspectionsAsync();
    Task<InspectionDTO?> GetInspectionByIdAsync(Guid id);
    Task<List<InspectionDTO>> GetInspectionsByVehicleAsync(Guid vehicleId);
    Task<List<InspectionDTO>> GetInspectionsByTypeAsync(string inspectionType);
    Task<List<InspectionDTO>> GetUpcomingInspectionsAsync(int daysAhead = 30);
    Task<List<InspectionAlert>> GetInspectionAlertsAsync();
    Task<InspectionDTO> CreateInspectionAsync(CreateInspectionRequest request);
    Task<InspectionDTO?> UpdateInspectionAsync(Guid id, UpdateInspectionRequest request);
    Task<bool> DeleteInspectionAsync(Guid id);
}

public class InspectionService : IInspectionService
{
    private readonly ApplicationDbContext _context;

    public InspectionService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<InspectionDTO>> GetAllInspectionsAsync()
    {
        var inspections = await _context.Inspections
            .Include(i => i.Vehicle)
            .OrderByDescending(i => i.DueDate)
            .ToListAsync();

        return inspections.Select(MapToDTO).ToList();
    }

    public async Task<InspectionDTO?> GetInspectionByIdAsync(Guid id)
    {
        var inspection = await _context.Inspections
            .Include(i => i.Vehicle)
            .FirstOrDefaultAsync(i => i.InspectionID == id);

        return inspection == null ? null : MapToDTO(inspection);
    }

    public async Task<List<InspectionDTO>> GetInspectionsByVehicleAsync(Guid vehicleId)
    {
        var inspections = await _context.Inspections
            .Include(i => i.Vehicle)
            .Where(i => i.VehicleID == vehicleId)
            .OrderByDescending(i => i.DueDate)
            .ToListAsync();

        return inspections.Select(MapToDTO).ToList();
    }

    public async Task<List<InspectionDTO>> GetInspectionsByTypeAsync(string inspectionType)
    {
        var inspections = await _context.Inspections
            .Include(i => i.Vehicle)
            .Where(i => i.InspectionType == inspectionType)
            .OrderByDescending(i => i.DueDate)
            .ToListAsync();

        return inspections.Select(MapToDTO).ToList();
    }

    public async Task<List<InspectionDTO>> GetUpcomingInspectionsAsync(int daysAhead = 30)
    {
        var cutoffDate = DateTime.UtcNow.AddDays(daysAhead);
        var inspections = await _context.Inspections
            .Include(i => i.Vehicle)
            .Where(i => i.DueDate <= cutoffDate && i.CompletionDate == null)
            .OrderBy(i => i.DueDate)
            .ToListAsync();

        return inspections.Select(MapToDTO).ToList();
    }

    public async Task<List<InspectionAlert>> GetInspectionAlertsAsync()
    {
        var now = DateTime.UtcNow;
        var cutoffDate = now.AddDays(30);
        
        var inspections = await _context.Inspections
            .Include(i => i.Vehicle)
            .Where(i => i.DueDate <= cutoffDate && 
                       (i.CompletionDate == null || !i.IsCompliant))
            .OrderBy(i => i.DueDate)
            .ToListAsync();

        return inspections.Select(i => new InspectionAlert
        {
            InspectionID = i.InspectionID,
            VehicleID = i.VehicleID,
            VehicleInfo = $"{i.Vehicle.Make} {i.Vehicle.Model} - {i.Vehicle.LicensePlate}",
            InspectionType = i.InspectionType,
            DueDate = i.DueDate,
            DaysUntilDue = (i.DueDate.Date - now.Date).Days,
            IsOverdue = i.DueDate.Date < now.Date
        }).ToList();
    }

    public async Task<InspectionDTO> CreateInspectionAsync(CreateInspectionRequest request)
    {
        // Verify vehicle exists
        var vehicle = await _context.Vehicles.FindAsync(request.VehicleID);
        if (vehicle == null)
            throw new Exception("Vehicle not found");

        var inspection = new Inspection
        {
            InspectionID = Guid.NewGuid(),
            VehicleID = request.VehicleID,
            InspectionType = request.InspectionType,
            DueDate = request.DueDate,
            IsCompliant = false,
            DocumentLink = request.DocumentLink,
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Inspections.Add(inspection);
        await _context.SaveChangesAsync();

        // Reload with vehicle for DTO mapping
        await _context.Entry(inspection).Reference(i => i.Vehicle).LoadAsync();

        return MapToDTO(inspection);
    }

    public async Task<InspectionDTO?> UpdateInspectionAsync(Guid id, UpdateInspectionRequest request)
    {
        var inspection = await _context.Inspections
            .Include(i => i.Vehicle)
            .FirstOrDefaultAsync(i => i.InspectionID == id);

        if (inspection == null)
            return null;

        if (request.DueDate.HasValue)
            inspection.DueDate = request.DueDate.Value;

        if (request.CompletionDate.HasValue)
            inspection.CompletionDate = request.CompletionDate.Value;

        if (request.IsCompliant.HasValue)
            inspection.IsCompliant = request.IsCompliant.Value;

        if (request.DocumentLink != null)
            inspection.DocumentLink = request.DocumentLink;

        if (request.Notes != null)
            inspection.Notes = request.Notes;

        inspection.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToDTO(inspection);
    }

    public async Task<bool> DeleteInspectionAsync(Guid id)
    {
        var inspection = await _context.Inspections.FindAsync(id);
        if (inspection == null)
            return false;

        _context.Inspections.Remove(inspection);
        await _context.SaveChangesAsync();

        return true;
    }

    private InspectionDTO MapToDTO(Inspection inspection)
    {
        return new InspectionDTO
        {
            InspectionID = inspection.InspectionID,
            VehicleID = inspection.VehicleID,
            VehicleInfo = $"{inspection.Vehicle.Make} {inspection.Vehicle.Model} - {inspection.Vehicle.LicensePlate}",
            InspectionType = inspection.InspectionType,
            DueDate = inspection.DueDate,
            CompletionDate = inspection.CompletionDate,
            IsCompliant = inspection.IsCompliant,
            DocumentLink = inspection.DocumentLink,
            Notes = inspection.Notes,
            CreatedAt = inspection.CreatedAt,
            UpdatedAt = inspection.UpdatedAt
        };
    }
}

