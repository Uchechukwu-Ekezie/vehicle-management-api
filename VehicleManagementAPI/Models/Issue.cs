using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VehicleManagementAPI.Models;

public class Issue
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IssueID { get; set; }

    [Required]
    public int VehicleID { get; set; }

    [Required]
    public int ReportedByID { get; set; }

    [Required]
    public DateTime ReportDate { get; set; } = DateTime.UtcNow;

    [Required]
    [StringLength(1000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Status { get; set; } = "Reported"; // Reported, In Progress, Resolved, Closed

    [StringLength(50)]
    public string? Priority { get; set; } // Low, Medium, High, Critical

    public DateTime? ResolvedDate { get; set; }

    [StringLength(1000)]
    public string? Resolution { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    [ForeignKey("VehicleID")]
    public virtual Vehicle Vehicle { get; set; } = null!;

    [ForeignKey("ReportedByID")]
    public virtual User ReportedBy { get; set; } = null!;
}
