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
        /// Debug endpoint to check environment variables
        /// </summary>
        [HttpGet("debug")]
        public IActionResult GetDebugInfo()
        {
            var debug = new
            {
                environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT"),
                database_url = Environment.GetEnvironmentVariable("DATABASE_URL"),
                mysql_host = Environment.GetEnvironmentVariable("MYSQLHOST"),
                mysql_port = Environment.GetEnvironmentVariable("MYSQLPORT"),
                mysql_user = Environment.GetEnvironmentVariable("MYSQLUSER"),
                mysql_password = Environment.GetEnvironmentVariable("MYSQLPASSWORD") != null ? "***" : null,
                mysql_database = Environment.GetEnvironmentVariable("MYSQLDATABASE"),
                jwt_secret = Environment.GetEnvironmentVariable("JWT_SECRET_KEY") != null ? "***" : null,
                connection_string = _configuration.GetConnectionString("DefaultConnection")
            };

            return Ok(debug);
        }
    }
}
