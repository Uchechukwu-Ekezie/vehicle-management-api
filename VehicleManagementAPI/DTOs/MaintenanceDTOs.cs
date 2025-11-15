namespace VehicleManagementAPI.DTOs;

public class MaintenanceRecordDTO
{
    public Guid RecordID { get; set; }
    public Guid VehicleID { get; set; }
    public string VehicleInfo { get; set; } = string.Empty;
    public string MaintenanceType { get; set; } = string.Empty;
    public DateTime ScheduledDate { get; set; }
    public DateTime? CompletionDate { get; set; }
    public decimal Cost { get; set; }
    public string? MechanicNotes { get; set; }
    public Guid? PartsUsedID { get; set; }
    public string? PartsName { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal? MileageAtService { get; set; }
}

public class CreateMaintenanceRequest
{
    public Guid VehicleID { get; set; }
    public string MaintenanceType { get; set; } = string.Empty;
    public DateTime ScheduledDate { get; set; }
    public decimal Cost { get; set; }
    public string? MechanicNotes { get; set; }
    public Guid? PartsUsedID { get; set; }
}

public class UpdateMaintenanceRequest
{
    public string? MaintenanceType { get; set; }
    public DateTime? ScheduledDate { get; set; }
    public DateTime? CompletionDate { get; set; }
    public decimal? Cost { get; set; }
    public string? MechanicNotes { get; set; }
    public string? Status { get; set; }
    public decimal? MileageAtService { get; set; }
}

public class MaintenanceAlert
{
    public Guid VehicleID { get; set; }
    public string VehicleInfo { get; set; } = string.Empty;
    public string AlertType { get; set; } = string.Empty; // Mileage, Time
    public string Message { get; set; } = string.Empty;
    public decimal? CurrentMileage { get; set; }
    public DateTime? LastServiceDate { get; set; }
}
