using Microsoft.EntityFrameworkCore;
using VehicleManagementAPI.Data;
using VehicleManagementAPI.DTOs;
using System.Globalization;

namespace VehicleManagementAPI.Services;

public interface IReportingService
{
    Task<CostAnalyticsDTO> GetMaintenanceCostAnalyticsAsync(DateTime? startDate, DateTime? endDate);
    Task<List<FuelEfficiencyReport>> GetFuelEfficiencyReportAsync();
    Task<FuelEfficiencyReport?> GetFuelEfficiencyByVehicleAsync(int vehicleId);
}

public class ReportingService : IReportingService
{
    private readonly ApplicationDbContext _context;

    public ReportingService(ApplicationDbContext context)
    {
        _context = context;
    }

    // FINANCE OFFICER ENHANCEMENT - Cost Analytics Dashboard
    public async Task<CostAnalyticsDTO> GetMaintenanceCostAnalyticsAsync(DateTime? startDate, DateTime? endDate)
    {
        var query = _context.MaintenanceRecords
            .Include(m => m.Vehicle)
            .AsQueryable();

        if (startDate.HasValue)
            query = query.Where(m => m.CompletionDate >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(m => m.CompletionDate <= endDate.Value);

        var records = await query.ToListAsync();

        var totalCost = records.Sum(m => m.Cost);
        var vehicleCount = records.Select(m => m.VehicleID).Distinct().Count();
        var averageCostPerVehicle = vehicleCount > 0 ? totalCost / vehicleCount : 0;

        // Cost by vehicle
        var costsByVehicle = records
            .GroupBy(m => new { m.VehicleID, m.Vehicle.Make, m.Vehicle.Model, m.Vehicle.LicensePlate })
            .Select(g => new CostByVehicle
            {
                VehicleID = g.Key.VehicleID,
                VehicleInfo = $"{g.Key.Make} {g.Key.Model} ({g.Key.LicensePlate})",
                TotalCost = g.Sum(m => m.Cost),
                MaintenanceCount = g.Count()
            })
            .OrderByDescending(c => c.TotalCost)
            .ToList();

        // Cost by maintenance type
        var costsByType = records
            .GroupBy(m => m.MaintenanceType)
            .Select(g => new CostByType
            {
                MaintenanceType = g.Key,
                TotalCost = g.Sum(m => m.Cost),
                Count = g.Count()
            })
            .OrderByDescending(c => c.TotalCost)
            .ToList();

        // Cost by month
        var costsByMonth = records
            .Where(m => m.CompletionDate.HasValue)
            .GroupBy(m => new { m.CompletionDate!.Value.Year, m.CompletionDate!.Value.Month })
            .Select(g => new CostByMonth
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                MonthName = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(g.Key.Month),
                TotalCost = g.Sum(m => m.Cost)
            })
            .OrderBy(c => c.Year)
            .ThenBy(c => c.Month)
            .ToList();

        return new CostAnalyticsDTO
        {
            TotalCost = totalCost,
            AverageCostPerVehicle = averageCostPerVehicle,
            CostsByVehicle = costsByVehicle,
            CostsByType = costsByType,
            CostsByMonth = costsByMonth
        };
    }

    // DRIVER ENHANCEMENT - Fuel Efficiency Tracker
    public async Task<List<FuelEfficiencyReport>> GetFuelEfficiencyReportAsync()
    {
        var trips = await _context.Trips
            .Include(t => t.Vehicle)
            .Where(t => t.EndMileage.HasValue && t.FuelUsed.HasValue && t.FuelUsed.Value > 0)
            .ToListAsync();

        var report = trips
            .GroupBy(t => new { t.VehicleID, t.Vehicle.Make, t.Vehicle.Model, t.Vehicle.LicensePlate })
            .Select(g => new FuelEfficiencyReport
            {
                VehicleID = g.Key.VehicleID,
                VehicleInfo = $"{g.Key.Make} {g.Key.Model} ({g.Key.LicensePlate})",
                AverageFuelEfficiency = g.Average(t => t.FuelEfficiency ?? 0),
                TotalFuelUsed = g.Sum(t => t.FuelUsed ?? 0),
                TotalDistanceTraveled = g.Sum(t => (t.EndMileage ?? 0) - t.StartMileage),
                TripCount = g.Count()
            })
            .OrderByDescending(r => r.AverageFuelEfficiency)
            .ToList();

        return report;
    }

    public async Task<FuelEfficiencyReport?> GetFuelEfficiencyByVehicleAsync(int vehicleId)
    {
        var trips = await _context.Trips
            .Include(t => t.Vehicle)
            .Where(t => t.VehicleID == vehicleId && t.EndMileage.HasValue && t.FuelUsed.HasValue && t.FuelUsed.Value > 0)
            .ToListAsync();

        if (!trips.Any()) return null;

        var vehicle = trips.First().Vehicle;

        return new FuelEfficiencyReport
        {
            VehicleID = vehicleId,
            VehicleInfo = $"{vehicle.Make} {vehicle.Model} ({vehicle.LicensePlate})",
            AverageFuelEfficiency = trips.Average(t => t.FuelEfficiency ?? 0),
            TotalFuelUsed = trips.Sum(t => t.FuelUsed ?? 0),
            TotalDistanceTraveled = trips.Sum(t => (t.EndMileage ?? 0) - t.StartMileage),
            TripCount = trips.Count()
        };
    }
}
