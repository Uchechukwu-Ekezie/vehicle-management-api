namespace VehicleManagementAPI.DTOs;

public class PartsInventoryDTO
{
    public Guid PartID { get; set; }
    public string Name { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public int QuantityInStock { get; set; }
    public decimal UnitPrice { get; set; }
    public int? MinimumStockLevel { get; set; }
    public string? Supplier { get; set; }
    public string? Description { get; set; }
    public bool IsLowStock { get; set; }
}

public class CreatePartRequest
{
    public string Name { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public int QuantityInStock { get; set; }
    public decimal UnitPrice { get; set; }
    public int? MinimumStockLevel { get; set; }
    public string? Supplier { get; set; }
    public string? Description { get; set; }
}

public class UpdatePartRequest
{
    public string? Name { get; set; }
    public int? QuantityInStock { get; set; }
    public decimal? UnitPrice { get; set; }
    public int? MinimumStockLevel { get; set; }
    public string? Supplier { get; set; }
    public string? Description { get; set; }
}
