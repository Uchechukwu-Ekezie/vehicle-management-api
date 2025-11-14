using Microsoft.EntityFrameworkCore;
using VehicleManagementAPI.Models;

namespace VehicleManagementAPI.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Vehicle> Vehicles { get; set; }
    public DbSet<Trip> Trips { get; set; }
    public DbSet<MaintenanceRecord> MaintenanceRecords { get; set; }
    public DbSet<Inspection> Inspections { get; set; }
    public DbSet<Issue> Issues { get; set; }
    public DbSet<PartsInventory> PartsInventory { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User Configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.Username).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
        });

        // Vehicle Configuration
        modelBuilder.Entity<Vehicle>(entity =>
        {
            entity.HasIndex(e => e.VIN).IsUnique();
            entity.HasIndex(e => e.LicensePlate).IsUnique();

            entity.HasOne(v => v.AssignedDriver)
                .WithMany(u => u.AssignedVehicles)
                .HasForeignKey(v => v.AssignedDriverID)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Trip Configuration
        modelBuilder.Entity<Trip>(entity =>
        {
            entity.HasOne(t => t.Vehicle)
                .WithMany(v => v.Trips)
                .HasForeignKey(t => t.VehicleID)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(t => t.Driver)
                .WithMany(u => u.Trips)
                .HasForeignKey(t => t.DriverID)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // MaintenanceRecord Configuration
        modelBuilder.Entity<MaintenanceRecord>(entity =>
        {
            entity.HasOne(m => m.Vehicle)
                .WithMany(v => v.MaintenanceRecords)
                .HasForeignKey(m => m.VehicleID)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(m => m.PartsUsed)
                .WithMany(p => p.MaintenanceRecords)
                .HasForeignKey(m => m.PartsUsedID)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Inspection Configuration
        modelBuilder.Entity<Inspection>(entity =>
        {
            entity.HasOne(i => i.Vehicle)
                .WithMany(v => v.Inspections)
                .HasForeignKey(i => i.VehicleID)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Issue Configuration
        modelBuilder.Entity<Issue>(entity =>
        {
            entity.HasOne(i => i.Vehicle)
                .WithMany(v => v.Issues)
                .HasForeignKey(i => i.VehicleID)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(i => i.ReportedBy)
                .WithMany(u => u.ReportedIssues)
                .HasForeignKey(i => i.ReportedByID)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // PartsInventory Configuration
        modelBuilder.Entity<PartsInventory>(entity =>
        {
            entity.HasIndex(e => e.SKU).IsUnique();
        });
    }
}
