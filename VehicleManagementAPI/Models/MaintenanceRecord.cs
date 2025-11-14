using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VehicleManagementAPI.Models;

public class MaintenanceRecord
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int RecordID { get; set; }

    [Required]
    public int VehicleID { get; set; }

    [Required]
    [StringLength(100)]
    public string MaintenanceType { get; set; } = string.Empty; // Service, Repair, Inspection, etc.

    [Required]
    public DateTime ScheduledDate { get; set; }

    public DateTime? CompletionDate { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal Cost { get; set; }

    [StringLength(1000)]
    public string? MechanicNotes { get; set; }

    public int? PartsUsedID { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = "Scheduled"; // Scheduled, In Progress, Completed, Cancelled

    public decimal? MileageAtService { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    [ForeignKey("VehicleID")]
    public virtual Vehicle Vehicle { get; set; } = null!;

    [ForeignKey("PartsUsedID")]
    public virtual PartsInventory? PartsUsed { get; set; }
}
