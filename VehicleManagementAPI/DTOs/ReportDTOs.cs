namespace VehicleManagementAPI.DTOs;

public class CostAnalyticsDTO
{
    public decimal TotalCost { get; set; }
    public decimal AverageCostPerVehicle { get; set; }
    public List<CostByVehicle> CostsByVehicle { get; set; } = new();
    public List<CostByType> CostsByType { get; set; } = new();
    public List<CostByMonth> CostsByMonth { get; set; } = new();
}

public class CostByVehicle
{
    public Guid VehicleID { get; set; }
    public string VehicleInfo { get; set; } = string.Empty;
    public decimal TotalCost { get; set; }
    public int MaintenanceCount { get; set; }
}

public class CostByType
{
    public string MaintenanceType { get; set; } = string.Empty;
    public decimal TotalCost { get; set; }
    public int Count { get; set; }
}

public class CostByMonth
{
    public int Year { get; set; }
    public int Month { get; set; }
    public string MonthName { get; set; } = string.Empty;
    public decimal TotalCost { get; set; }
}

public class FuelEfficiencyReport
{
    public Guid VehicleID { get; set; }
    public string VehicleInfo { get; set; } = string.Empty;
    public decimal AverageFuelEfficiency { get; set; }
    public decimal TotalFuelUsed { get; set; }
    public decimal TotalDistanceTraveled { get; set; }
    public int TripCount { get; set; }
}
