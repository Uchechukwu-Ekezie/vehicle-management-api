using Microsoft.EntityFrameworkCore;
using VehicleManagementAPI.Data;
using VehicleManagementAPI.DTOs;
using VehicleManagementAPI.Models;

namespace VehicleManagementAPI.Services;

public interface IPartsService
{
    Task<List<PartsInventoryDTO>> GetAllPartsAsync();
    Task<PartsInventoryDTO?> GetPartByIdAsync(Guid id);
    Task<List<PartsInventoryDTO>> GetLowStockPartsAsync();
    Task<PartsInventoryDTO> CreatePartAsync(CreatePartRequest request);
    Task<PartsInventoryDTO?> UpdatePartAsync(Guid id, UpdatePartRequest request);
    Task<bool> DeletePartAsync(Guid id);
    Task<bool> UpdateStockAsync(Guid partId, int quantity);
}

public class PartsService : IPartsService
{
    private readonly ApplicationDbContext _context;

    public PartsService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<PartsInventoryDTO>> GetAllPartsAsync()
    {
        return await _context.PartsInventory
            .Select(p => MapToDTO(p))
            .ToListAsync();
    }

    public async Task<PartsInventoryDTO?> GetPartByIdAsync(Guid id)
    {
        var part = await _context.PartsInventory.FindAsync(id);
        return part == null ? null : MapToDTO(part);
    }

    public async Task<List<PartsInventoryDTO>> GetLowStockPartsAsync()
    {
        return await _context.PartsInventory
            .Where(p => p.MinimumStockLevel.HasValue && p.QuantityInStock <= p.MinimumStockLevel.Value)
            .Select(p => MapToDTO(p))
            .ToListAsync();
    }

    public async Task<PartsInventoryDTO> CreatePartAsync(CreatePartRequest request)
    {
        var part = new PartsInventory
        {
            PartID = Guid.NewGuid(), // Generate UUID
            Name = request.Name,
            SKU = request.SKU,
            QuantityInStock = request.QuantityInStock,
            UnitPrice = request.UnitPrice,
            MinimumStockLevel = request.MinimumStockLevel,
            Supplier = request.Supplier,
            Description = request.Description,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.PartsInventory.Add(part);
        await _context.SaveChangesAsync();

        return MapToDTO(part);
    }

    public async Task<PartsInventoryDTO?> UpdatePartAsync(Guid id, UpdatePartRequest request)
    {
        var part = await _context.PartsInventory.FindAsync(id);
        if (part == null) return null;

        if (!string.IsNullOrEmpty(request.Name)) part.Name = request.Name;
        if (request.QuantityInStock.HasValue) part.QuantityInStock = request.QuantityInStock.Value;
        if (request.UnitPrice.HasValue) part.UnitPrice = request.UnitPrice.Value;
        if (request.MinimumStockLevel.HasValue) part.MinimumStockLevel = request.MinimumStockLevel.Value;
        if (request.Supplier != null) part.Supplier = request.Supplier;
        if (request.Description != null) part.Description = request.Description;

        part.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToDTO(part);
    }

    public async Task<bool> DeletePartAsync(Guid id)
    {
        var part = await _context.PartsInventory.FindAsync(id);
        if (part == null) return false;

        _context.PartsInventory.Remove(part);
        await _context.SaveChangesAsync();

        return true;
    }

    // MECHANIC ENHANCEMENT - Update stock when parts are used
    public async Task<bool> UpdateStockAsync(Guid partId, int quantity)
    {
        var part = await _context.PartsInventory.FindAsync(partId);
        if (part == null) return false;

        part.QuantityInStock -= quantity;
        if (part.QuantityInStock < 0) part.QuantityInStock = 0;

        part.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return true;
    }

    private static PartsInventoryDTO MapToDTO(PartsInventory part)
    {
        return new PartsInventoryDTO
        {
            PartID = part.PartID,
            Name = part.Name,
            SKU = part.SKU,
            QuantityInStock = part.QuantityInStock,
            UnitPrice = part.UnitPrice,
            MinimumStockLevel = part.MinimumStockLevel,
            Supplier = part.Supplier,
            Description = part.Description,
            IsLowStock = part.MinimumStockLevel.HasValue && part.QuantityInStock <= part.MinimumStockLevel.Value
        };
    }
}
