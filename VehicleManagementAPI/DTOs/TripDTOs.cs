namespace VehicleManagementAPI.DTOs;

public class TripDTO
{
    public Guid TripID { get; set; }
    public Guid VehicleID { get; set; }
    public string VehicleInfo { get; set; } = string.Empty;
    public Guid DriverID { get; set; }
    public string DriverName { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public decimal StartMileage { get; set; }
    public decimal? EndMileage { get; set; }
    public decimal? FuelUsed { get; set; }
    public decimal? FuelEfficiency { get; set; }
    public string? Notes { get; set; }
}

public class CreateTripRequest
{
    public Guid VehicleID { get; set; }
    public DateTime StartTime { get; set; } = DateTime.UtcNow;
    public decimal StartMileage { get; set; }
    public string? Notes { get; set; }
}

public class EndTripRequest
{
    public DateTime EndTime { get; set; } = DateTime.UtcNow;
    public decimal EndMileage { get; set; }
    public decimal? FuelUsed { get; set; }
}
