using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VehicleManagementAPI.Data;
using VehicleManagementAPI.DTOs;

namespace VehicleManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UsersController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<UserDTO>>> GetAllUsers()
    {
        var users = await _context.Users
            .Select(u => new UserDTO
            {
                UserID = u.UserID,
                Username = u.Username,
                Email = u.Email,
                FullName = u.FullName,
                Role = u.Role
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpGet("drivers")]
    public async Task<ActionResult<List<UserDTO>>> GetAllDrivers()
    {
        var drivers = await _context.Users
            .Where(u => u.Role == "Driver")
            .Select(u => new UserDTO
            {
                UserID = u.UserID,
                Username = u.Username,
                Email = u.Email,
                FullName = u.FullName,
                Role = u.Role
            })
            .ToListAsync();

        return Ok(drivers);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDTO>> GetUserById(Guid id)
    {
        var user = await _context.Users
            .Where(u => u.UserID == id)
            .Select(u => new UserDTO
            {
                UserID = u.UserID,
                Username = u.Username,
                Email = u.Email,
                FullName = u.FullName,
                Role = u.Role
            })
            .FirstOrDefaultAsync();

        if (user == null)
            return NotFound(new { message = "User not found" });

        return Ok(user);
    }
}
