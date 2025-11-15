using Microsoft.EntityFrameworkCore;
using VehicleManagementAPI.Data;
using VehicleManagementAPI.DTOs;
using VehicleManagementAPI.Models;

namespace VehicleManagementAPI.Services;

public interface ITripService
{
    Task<List<TripDTO>> GetAllTripsAsync();
    Task<TripDTO?> GetTripByIdAsync(Guid id);
    Task<List<TripDTO>> GetTripsByDriverAsync(Guid driverId);
    Task<List<TripDTO>> GetTripsByVehicleAsync(Guid vehicleId);
    Task<TripDTO> StartTripAsync(Guid driverId, CreateTripRequest request);
    Task<TripDTO?> EndTripAsync(Guid tripId, EndTripRequest request);
}

public class TripService : ITripService
{
    private readonly ApplicationDbContext _context;

    public TripService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<TripDTO>> GetAllTripsAsync()
    {
        return await _context.Trips
            .Include(t => t.Vehicle)
            .Include(t => t.Driver)
            .Select(t => MapToDTO(t))
            .ToListAsync();
    }

    public async Task<TripDTO?> GetTripByIdAsync(Guid id)
    {
        var trip = await _context.Trips
            .Include(t => t.Vehicle)
            .Include(t => t.Driver)
            .FirstOrDefaultAsync(t => t.TripID == id);

        return trip == null ? null : MapToDTO(trip);
    }

    public async Task<List<TripDTO>> GetTripsByDriverAsync(Guid driverId)
    {
        return await _context.Trips
            .Include(t => t.Vehicle)
            .Include(t => t.Driver)
            .Where(t => t.DriverID == driverId)
            .Select(t => MapToDTO(t))
            .ToListAsync();
    }

    public async Task<List<TripDTO>> GetTripsByVehicleAsync(Guid vehicleId)
    {
        return await _context.Trips
            .Include(t => t.Vehicle)
            .Include(t => t.Driver)
            .Where(t => t.VehicleID == vehicleId)
            .Select(t => MapToDTO(t))
            .ToListAsync();
    }

    public async Task<TripDTO> StartTripAsync(Guid driverId, CreateTripRequest request)
    {
        var vehicle = await _context.Vehicles.FindAsync(request.VehicleID);
        if (vehicle == null)
            throw new Exception("Vehicle not found");

        if (vehicle.Status != "Available")
            throw new Exception("Vehicle is not available for trips");

        var trip = new Trip
        {
            TripID = Guid.NewGuid(), // Generate UUID
            VehicleID = request.VehicleID,
            DriverID = driverId,
            StartTime = request.StartTime,
            StartMileage = request.StartMileage,
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow
        };

        vehicle.Status = "In Use";
        vehicle.UpdatedAt = DateTime.UtcNow;

        _context.Trips.Add(trip);
        await _context.SaveChangesAsync();

        var createdTrip = await _context.Trips
            .Include(t => t.Vehicle)
            .Include(t => t.Driver)
            .FirstAsync(t => t.TripID == trip.TripID);

        return MapToDTO(createdTrip);
    }

    public async Task<TripDTO?> EndTripAsync(Guid tripId, EndTripRequest request)
    {
        var trip = await _context.Trips
            .Include(t => t.Vehicle)
            .Include(t => t.Driver)
            .FirstOrDefaultAsync(t => t.TripID == tripId);

        if (trip == null) return null;

        if (trip.EndTime != null)
            throw new Exception("Trip has already been ended");

        trip.EndTime = request.EndTime;
        trip.EndMileage = request.EndMileage;
        trip.FuelUsed = request.FuelUsed;

        // Calculate fuel efficiency: Distance / Fuel
        if (request.FuelUsed.HasValue && request.FuelUsed.Value > 0)
        {
            var distance = request.EndMileage - trip.StartMileage;
            trip.FuelEfficiency = distance / request.FuelUsed.Value;
        }

        // Update vehicle mileage and status
        trip.Vehicle.CurrentMileage = request.EndMileage;
        trip.Vehicle.Status = "Available";
        trip.Vehicle.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToDTO(trip);
    }

    private static TripDTO MapToDTO(Trip trip)
    {
        return new TripDTO
        {
            TripID = trip.TripID,
            VehicleID = trip.VehicleID,
            VehicleInfo = $"{trip.Vehicle.Make} {trip.Vehicle.Model} ({trip.Vehicle.LicensePlate})",
            DriverID = trip.DriverID,
            DriverName = trip.Driver.FullName ?? trip.Driver.Username,
            StartTime = trip.StartTime,
            EndTime = trip.EndTime,
            StartMileage = trip.StartMileage,
            EndMileage = trip.EndMileage,
            FuelUsed = trip.FuelUsed,
            FuelEfficiency = trip.FuelEfficiency,
            Notes = trip.Notes
        };
    }
}
