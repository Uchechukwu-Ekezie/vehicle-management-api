using Microsoft.AspNetCore.Mvc;

namespace VehicleManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new { message = "Backend is running!", timestamp = DateTime.UtcNow });
        }

        [HttpGet("health")]
        public IActionResult Health()
        {
            return Ok(new {
                status = "healthy",
                environment = "development",
                timestamp = DateTime.UtcNow,
                version = "1.0.0"
            });
        }
    }
}