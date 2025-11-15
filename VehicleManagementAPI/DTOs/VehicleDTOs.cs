namespace VehicleManagementAPI.DTOs;

public class VehicleDTO
{
    public Guid VehicleID { get; set; }
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public string VIN { get; set; } = string.Empty;
    public string LicensePlate { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal CurrentMileage { get; set; }
    public Guid? AssignedDriverID { get; set; }
    public string? AssignedDriverName { get; set; }
    public string? Color { get; set; }
    public DateTime? PurchaseDate { get; set; }
}

public class CreateVehicleRequest
{
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public string VIN { get; set; } = string.Empty;
    public string LicensePlate { get; set; } = string.Empty;
    public decimal CurrentMileage { get; set; }
    public string? Color { get; set; }
    public DateTime? PurchaseDate { get; set; }
}

public class UpdateVehicleRequest
{
    public string? Make { get; set; }
    public string? Model { get; set; }
    public int? Year { get; set; }
    public string? LicensePlate { get; set; }
    public string? Status { get; set; }
    public decimal? CurrentMileage { get; set; }
    public Guid? AssignedDriverID { get; set; }
    public string? Color { get; set; }
}
