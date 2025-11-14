using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VehicleManagementAPI.Models;

public class User
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int UserID { get; set; }

    [Required]
    [StringLength(100)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [StringLength(255)]
    public string PasswordHash { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Role { get; set; } = string.Empty; // Admin, Driver, Mechanic, Finance

    [StringLength(100)]
    public string? Email { get; set; }

    [StringLength(100)]
    public string? FullName { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    public virtual ICollection<Vehicle> AssignedVehicles { get; set; } = new List<Vehicle>();
    public virtual ICollection<Trip> Trips { get; set; } = new List<Trip>();
    public virtual ICollection<Issue> ReportedIssues { get; set; } = new List<Issue>();
}
