using Microsoft.EntityFrameworkCore;
using VehicleManagementAPI.Data;
using VehicleManagementAPI.DTOs;
using VehicleManagementAPI.Models;

namespace VehicleManagementAPI.Services;

public interface IMaintenanceService
{
    Task<List<MaintenanceRecordDTO>> GetAllRecordsAsync();
    Task<MaintenanceRecordDTO?> GetRecordByIdAsync(Guid id);
    Task<List<MaintenanceRecordDTO>> GetRecordsByVehicleAsync(Guid vehicleId);
    Task<MaintenanceRecordDTO> CreateRecordAsync(CreateMaintenanceRequest request);
    Task<MaintenanceRecordDTO?> UpdateRecordAsync(Guid id, UpdateMaintenanceRequest request);
    Task<bool> DeleteRecordAsync(Guid id);
    Task<List<MaintenanceAlert>> GetMaintenanceAlertsAsync();
}

public class MaintenanceService : IMaintenanceService
{
    private readonly ApplicationDbContext _context;
    private const decimal MileageThreshold = 1000; // Miles since last service
    private const int TimeThresholdDays = 180; // 6 months

    public MaintenanceService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<MaintenanceRecordDTO>> GetAllRecordsAsync()
    {
        return await _context.MaintenanceRecords
            .Include(m => m.Vehicle)
            .Include(m => m.PartsUsed)
            .Select(m => MapToDTO(m))
            .ToListAsync();
    }

    public async Task<MaintenanceRecordDTO?> GetRecordByIdAsync(Guid id)
    {
        var record = await _context.MaintenanceRecords
            .Include(m => m.Vehicle)
            .Include(m => m.PartsUsed)
            .FirstOrDefaultAsync(m => m.RecordID == id);

        return record == null ? null : MapToDTO(record);
    }

    public async Task<List<MaintenanceRecordDTO>> GetRecordsByVehicleAsync(Guid vehicleId)
    {
        return await _context.MaintenanceRecords
            .Include(m => m.Vehicle)
            .Include(m => m.PartsUsed)
            .Where(m => m.VehicleID == vehicleId)
            .Select(m => MapToDTO(m))
            .ToListAsync();
    }

    public async Task<MaintenanceRecordDTO> CreateRecordAsync(CreateMaintenanceRequest request)
    {
        var vehicle = await _context.Vehicles.FindAsync(request.VehicleID);
        if (vehicle == null)
            throw new Exception("Vehicle not found");

        var record = new MaintenanceRecord
        {
            VehicleID = request.VehicleID,
            MaintenanceType = request.MaintenanceType,
            ScheduledDate = request.ScheduledDate,
            Cost = request.Cost,
            MechanicNotes = request.MechanicNotes,
            PartsUsedID = request.PartsUsedID,
            Status = "Scheduled",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.MaintenanceRecords.Add(record);
        await _context.SaveChangesAsync();

        var createdRecord = await _context.MaintenanceRecords
            .Include(m => m.Vehicle)
            .Include(m => m.PartsUsed)
            .FirstAsync(m => m.RecordID == record.RecordID);

        return MapToDTO(createdRecord);
    }

    public async Task<MaintenanceRecordDTO?> UpdateRecordAsync(Guid id, UpdateMaintenanceRequest request)
    {
        var record = await _context.MaintenanceRecords
            .Include(m => m.Vehicle)
            .Include(m => m.PartsUsed)
            .FirstOrDefaultAsync(m => m.RecordID == id);

        if (record == null) return null;

        if (!string.IsNullOrEmpty(request.MaintenanceType))
            record.MaintenanceType = request.MaintenanceType;
        if (request.ScheduledDate.HasValue)
            record.ScheduledDate = request.ScheduledDate.Value;
        if (request.CompletionDate.HasValue)
            record.CompletionDate = request.CompletionDate.Value;
        if (request.Cost.HasValue)
            record.Cost = request.Cost.Value;
        if (request.MechanicNotes != null)
            record.MechanicNotes = request.MechanicNotes;
        if (!string.IsNullOrEmpty(request.Status))
            record.Status = request.Status;
        if (request.MileageAtService.HasValue)
            record.MileageAtService = request.MileageAtService.Value;

        // If completing maintenance, update vehicle status
        if (request.Status == "Completed" && record.Vehicle.Status == "Maintenance")
        {
            record.Vehicle.Status = "Available";
            record.Vehicle.UpdatedAt = DateTime.UtcNow;
        }

        record.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToDTO(record);
    }

    public async Task<bool> DeleteRecordAsync(Guid id)
    {
        var record = await _context.MaintenanceRecords.FindAsync(id);
        if (record == null) return false;

        _context.MaintenanceRecords.Remove(record);
        await _context.SaveChangesAsync();

        return true;
    }

    // PREDICTIVE MAINTENANCE LOGIC - Admin Enhancement
    public async Task<List<MaintenanceAlert>> GetMaintenanceAlertsAsync()
    {
        var alerts = new List<MaintenanceAlert>();
        var vehicles = await _context.Vehicles
            .Include(v => v.MaintenanceRecords.OrderByDescending(m => m.CompletionDate))
            .ToListAsync();

        foreach (var vehicle in vehicles)
        {
            var lastService = vehicle.MaintenanceRecords
                .Where(m => m.CompletionDate != null && m.Status == "Completed")
                .OrderByDescending(m => m.CompletionDate)
                .FirstOrDefault();

            if (lastService != null)
            {
                // Check mileage threshold
                if (lastService.MileageAtService.HasValue)
                {
                    var mileageSinceService = vehicle.CurrentMileage - lastService.MileageAtService.Value;
                    if (mileageSinceService >= MileageThreshold)
                    {
                        alerts.Add(new MaintenanceAlert
                        {
                            VehicleID = vehicle.VehicleID,
                            VehicleInfo = $"{vehicle.Make} {vehicle.Model} ({vehicle.LicensePlate})",
                            AlertType = "Mileage",
                            Message = $"Vehicle has traveled {mileageSinceService:N0} miles since last service. Service recommended.",
                            CurrentMileage = vehicle.CurrentMileage,
                            LastServiceDate = lastService.CompletionDate
                        });
                    }
                }

                // Check time threshold
                if (lastService.CompletionDate.HasValue)
                {
                    var daysSinceService = (DateTime.UtcNow - lastService.CompletionDate.Value).TotalDays;
                    if (daysSinceService >= TimeThresholdDays)
                    {
                        alerts.Add(new MaintenanceAlert
                        {
                            VehicleID = vehicle.VehicleID,
                            VehicleInfo = $"{vehicle.Make} {vehicle.Model} ({vehicle.LicensePlate})",
                            AlertType = "Time",
                            Message = $"It has been {(int)daysSinceService} days since last service. Service recommended.",
                            CurrentMileage = vehicle.CurrentMileage,
                            LastServiceDate = lastService.CompletionDate
                        });
                    }
                }
            }
            else
            {
                // No service history - recommend initial service
                alerts.Add(new MaintenanceAlert
                {
                    VehicleID = vehicle.VehicleID,
                    VehicleInfo = $"{vehicle.Make} {vehicle.Model} ({vehicle.LicensePlate})",
                    AlertType = "NoHistory",
                    Message = "No maintenance history found. Initial service recommended.",
                    CurrentMileage = vehicle.CurrentMileage,
                    LastServiceDate = null
                });
            }
        }

        return alerts;
    }

    private static MaintenanceRecordDTO MapToDTO(MaintenanceRecord record)
    {
        return new MaintenanceRecordDTO
        {
            RecordID = record.RecordID,
            VehicleID = record.VehicleID,
            VehicleInfo = $"{record.Vehicle.Make} {record.Vehicle.Model} ({record.Vehicle.LicensePlate})",
            MaintenanceType = record.MaintenanceType,
            ScheduledDate = record.ScheduledDate,
            CompletionDate = record.CompletionDate,
            Cost = record.Cost,
            MechanicNotes = record.MechanicNotes,
            PartsUsedID = record.PartsUsedID,
            PartsName = record.PartsUsed?.Name,
            Status = record.Status,
            MileageAtService = record.MileageAtService
        };
    }
}
