using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VehicleManagementAPI.Models;

public class Trip
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    public Guid TripID { get; set; } = Guid.NewGuid();

    [Required]
    public Guid VehicleID { get; set; }

    [Required]
    public Guid DriverID { get; set; }

    [Required]
    public DateTime StartTime { get; set; }

    public DateTime? EndTime { get; set; }

    [Required]
    public decimal StartMileage { get; set; }

    public decimal? EndMileage { get; set; }

    public decimal? FuelUsed { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal? FuelEfficiency { get; set; } // Miles per gallon or km/L

    [StringLength(500)]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    [ForeignKey("VehicleID")]
    public virtual Vehicle Vehicle { get; set; } = null!;

    [ForeignKey("DriverID")]
    public virtual User Driver { get; set; } = null!;
}
