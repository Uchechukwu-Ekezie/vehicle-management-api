namespace VehicleManagementAPI.DTOs;

public class IssueDTO
{
    public Guid IssueID { get; set; }
    public Guid VehicleID { get; set; }
    public string VehicleInfo { get; set; } = string.Empty;
    public Guid ReportedByID { get; set; }
    public string ReportedByName { get; set; } = string.Empty;
    public DateTime ReportDate { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Priority { get; set; }
    public DateTime? ResolvedDate { get; set; }
    public string? Resolution { get; set; }
}

public class CreateIssueRequest
{
    public Guid VehicleID { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? Priority { get; set; } = "Medium";
}

public class UpdateIssueRequest
{
    public string? Status { get; set; }
    public string? Priority { get; set; }
    public DateTime? ResolvedDate { get; set; }
    public string? Resolution { get; set; }
}
