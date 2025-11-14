using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VehicleManagementAPI.Models;

public class Vehicle
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int VehicleID { get; set; }

    [Required]
    [StringLength(100)]
    public string Make { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Model { get; set; } = string.Empty;

    [Required]
    public int Year { get; set; }

    [Required]
    [StringLength(17)]
    public string VIN { get; set; } = string.Empty;

    [Required]
    [StringLength(20)]
    public string LicensePlate { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Status { get; set; } = "Available"; // Available, In Use, Maintenance

    [Required]
    public decimal CurrentMileage { get; set; }

    public int? AssignedDriverID { get; set; }

    [StringLength(50)]
    public string? Color { get; set; }

    public DateTime? PurchaseDate { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    [ForeignKey("AssignedDriverID")]
    public virtual User? AssignedDriver { get; set; }

    public virtual ICollection<Trip> Trips { get; set; } = new List<Trip>();
    public virtual ICollection<MaintenanceRecord> MaintenanceRecords { get; set; } = new List<MaintenanceRecord>();
    public virtual ICollection<Inspection> Inspections { get; set; } = new List<Inspection>();
    public virtual ICollection<Issue> Issues { get; set; } = new List<Issue>();
}
