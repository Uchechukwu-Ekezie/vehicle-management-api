using Microsoft.EntityFrameworkCore;
using VehicleManagementAPI.Data;
using VehicleManagementAPI.DTOs;
using VehicleManagementAPI.Models;

namespace VehicleManagementAPI.Services;

public interface IVehicleService
{
    Task<List<VehicleDTO>> GetAllVehiclesAsync();
    Task<VehicleDTO?> GetVehicleByIdAsync(Guid id);
    Task<List<VehicleDTO>> GetVehiclesByStatusAsync(string status);
    Task<VehicleDTO> CreateVehicleAsync(CreateVehicleRequest request);
    Task<VehicleDTO?> UpdateVehicleAsync(Guid id, UpdateVehicleRequest request);
    Task<bool> DeleteVehicleAsync(Guid id);
    Task<bool> AssignDriverAsync(Guid vehicleId, Guid driverId);
}

public class VehicleService : IVehicleService
{
    private readonly ApplicationDbContext _context;

    public VehicleService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<VehicleDTO>> GetAllVehiclesAsync()
    {
        return await _context.Vehicles
            .Include(v => v.AssignedDriver)
            .Select(v => MapToDTO(v))
            .ToListAsync();
    }

    public async Task<VehicleDTO?> GetVehicleByIdAsync(Guid id)
    {
        var vehicle = await _context.Vehicles
            .Include(v => v.AssignedDriver)
            .FirstOrDefaultAsync(v => v.VehicleID == id);

        return vehicle == null ? null : MapToDTO(vehicle);
    }

    public async Task<List<VehicleDTO>> GetVehiclesByStatusAsync(string status)
    {
        return await _context.Vehicles
            .Include(v => v.AssignedDriver)
            .Where(v => v.Status == status)
            .Select(v => MapToDTO(v))
            .ToListAsync();
    }

    public async Task<VehicleDTO> CreateVehicleAsync(CreateVehicleRequest request)
    {
        var vehicle = new Vehicle
        {
            VehicleID = Guid.NewGuid(), // Generate UUID
            Make = request.Make,
            Model = request.Model,
            Year = request.Year,
            VIN = request.VIN,
            LicensePlate = request.LicensePlate,
            CurrentMileage = request.CurrentMileage,
            Color = request.Color,
            PurchaseDate = request.PurchaseDate,
            Status = "Available",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Vehicles.Add(vehicle);
        await _context.SaveChangesAsync();

        return MapToDTO(vehicle);
    }

    public async Task<VehicleDTO?> UpdateVehicleAsync(Guid id, UpdateVehicleRequest request)
    {
        var vehicle = await _context.Vehicles
            .Include(v => v.AssignedDriver)
            .FirstOrDefaultAsync(v => v.VehicleID == id);

        if (vehicle == null) return null;

        if (!string.IsNullOrEmpty(request.Make)) vehicle.Make = request.Make;
        if (!string.IsNullOrEmpty(request.Model)) vehicle.Model = request.Model;
        if (request.Year.HasValue) vehicle.Year = request.Year.Value;
        if (!string.IsNullOrEmpty(request.LicensePlate)) vehicle.LicensePlate = request.LicensePlate;
        if (!string.IsNullOrEmpty(request.Status)) vehicle.Status = request.Status;
        if (request.CurrentMileage.HasValue) vehicle.CurrentMileage = request.CurrentMileage.Value;
        if (request.AssignedDriverID.HasValue) vehicle.AssignedDriverID = request.AssignedDriverID.Value;
        if (!string.IsNullOrEmpty(request.Color)) vehicle.Color = request.Color;

        vehicle.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToDTO(vehicle);
    }

    public async Task<bool> DeleteVehicleAsync(Guid id)
    {
        var vehicle = await _context.Vehicles.FindAsync(id);
        if (vehicle == null) return false;

        _context.Vehicles.Remove(vehicle);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> AssignDriverAsync(Guid vehicleId, Guid driverId)
    {
        var vehicle = await _context.Vehicles.FindAsync(vehicleId);
        var driver = await _context.Users.FindAsync(driverId);

        if (vehicle == null || driver == null || driver.Role != "Driver") return false;

        vehicle.AssignedDriverID = driverId;
        vehicle.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return true;
    }

    private static VehicleDTO MapToDTO(Vehicle vehicle)
    {
        return new VehicleDTO
        {
            VehicleID = vehicle.VehicleID,
            Make = vehicle.Make,
            Model = vehicle.Model,
            Year = vehicle.Year,
            VIN = vehicle.VIN,
            LicensePlate = vehicle.LicensePlate,
            Status = vehicle.Status,
            CurrentMileage = vehicle.CurrentMileage,
            AssignedDriverID = vehicle.AssignedDriverID,
            AssignedDriverName = vehicle.AssignedDriver?.FullName ?? vehicle.AssignedDriver?.Username,
            Color = vehicle.Color,
            PurchaseDate = vehicle.PurchaseDate
        };
    }
}
