namespace VehicleManagementAPI.DTOs;

public class InspectionDTO
{
    public Guid InspectionID { get; set; }
    public Guid VehicleID { get; set; }
    public string VehicleInfo { get; set; } = string.Empty; // Make Model - LicensePlate
    public string InspectionType { get; set; } = string.Empty; // MOT, Insurance, Tax, Safety
    public DateTime DueDate { get; set; }
    public DateTime? CompletionDate { get; set; }
    public bool IsCompliant { get; set; }
    public string? DocumentLink { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateInspectionRequest
{
    public Guid VehicleID { get; set; }
    public string InspectionType { get; set; } = string.Empty; // MOT, Insurance, Tax, Safety
    public DateTime DueDate { get; set; }
    public string? DocumentLink { get; set; }
    public string? Notes { get; set; }
}

public class UpdateInspectionRequest
{
    public DateTime? DueDate { get; set; }
    public DateTime? CompletionDate { get; set; }
    public bool? IsCompliant { get; set; }
    public string? DocumentLink { get; set; }
    public string? Notes { get; set; }
}

public class InspectionAlert
{
    public Guid InspectionID { get; set; }
    public Guid VehicleID { get; set; }
    public string VehicleInfo { get; set; } = string.Empty;
    public string InspectionType { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
    public int DaysUntilDue { get; set; }
    public bool IsOverdue { get; set; }
}

