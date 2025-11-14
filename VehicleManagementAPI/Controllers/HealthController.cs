using Microsoft.AspNetCore.Mvc;

namespace VehicleManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HealthController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public HealthController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        /// <summary>
        /// Health check endpoint for monitoring service status
        /// </summary>
        /// <returns>Health status information</returns>
        [HttpGet]
        public IActionResult GetHealth()
        {
            var health = new
            {
                status = "Healthy",
                timestamp = DateTime.UtcNow,
                environment = _configuration["ASPNETCORE_ENVIRONMENT"] ?? "Unknown",
                version = "1.0.0",
                service = "Vehicle Management API"
            };

            return Ok(health);
        }

        /// <summary>
        /// Detailed health check with database connectivity
        /// </summary>
        [HttpGet("detailed")]
        public IActionResult GetDetailedHealth([FromServices] Data.ApplicationDbContext dbContext)
        {
            var canConnectToDatabase = false;
            string databaseStatus = "Unknown";

            try
            {
                canConnectToDatabase = dbContext.Database.CanConnect();
                databaseStatus = canConnectToDatabase ? "Connected" : "Disconnected";
            }
            catch (Exception ex)
            {
                databaseStatus = $"Error: {ex.Message}";
            }

            var health = new
            {
                status = canConnectToDatabase ? "Healthy" : "Degraded",
                timestamp = DateTime.UtcNow,
                environment = _configuration["ASPNETCORE_ENVIRONMENT"] ?? "Unknown",
                version = "1.0.0",
                service = "Vehicle Management API",
                database = new
                {
                    status = databaseStatus,
                    connected = canConnectToDatabase
                }
            };

            return canConnectToDatabase ? Ok(health) : StatusCode(503, health);
        }
    }
}
