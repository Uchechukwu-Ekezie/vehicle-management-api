using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VehicleManagementAPI.Models;

public class Inspection
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    public Guid InspectionID { get; set; } = Guid.NewGuid();

    [Required]
    public Guid VehicleID { get; set; }

    [Required]
    [StringLength(100)]
    public string InspectionType { get; set; } = string.Empty; // MOT, Insurance, Tax, Safety

    [Required]
    public DateTime DueDate { get; set; }

    public DateTime? CompletionDate { get; set; }

    [Required]
    public bool IsCompliant { get; set; } = false;

    [StringLength(500)]
    public string? DocumentLink { get; set; }

    [StringLength(1000)]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    [ForeignKey("VehicleID")]
    public virtual Vehicle Vehicle { get; set; } = null!;
}
