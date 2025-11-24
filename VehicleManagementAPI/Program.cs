using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MySqlConnector;
using System.Text;
using VehicleManagementAPI.Data;
using VehicleManagementAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Configure Swagger with JWT authentication
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Vehicle Management API",
        Version = "v1",
        Description = "API for Vehicle Management & Maintenance Tracker System"
    });

    // Add JWT authentication to Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Configure MySQL database with Pomelo provider
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Use Railway's DATABASE_URL in Production, local MySQL in Development
if (builder.Environment.IsProduction())
{
    Console.WriteLine("=== Production Environment ===");
    
    var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL") ??
                      Environment.GetEnvironmentVariable("MYSQL_PUBLIC_URL");

    Console.WriteLine($"DATABASE_URL: {(Environment.GetEnvironmentVariable("DATABASE_URL") != null ? "Set" : "Not set")}");
    Console.WriteLine($"MYSQL_PUBLIC_URL: {(Environment.GetEnvironmentVariable("MYSQL_PUBLIC_URL") != null ? "Set" : "Not set")}");

    if (!string.IsNullOrEmpty(databaseUrl) && databaseUrl.StartsWith("mysql://"))
    {
        try
        {
            var uri = new Uri(databaseUrl);
            var userInfo = uri.UserInfo.Split(':');
            connectionString = $"Server={uri.Host};Port={uri.Port};Database={uri.AbsolutePath.TrimStart('/')};User={userInfo[0]};Password={userInfo[1]};SslMode=Required;";
            Console.WriteLine($"✓ Using Railway Database URL: {uri.Host}:{uri.Port}/{uri.AbsolutePath.TrimStart('/')}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ERROR parsing database URL: {ex.Message}");
            throw;
        }
    }
    else
    {
        // Fallback to individual Railway MySQL variables
        var host = Environment.GetEnvironmentVariable("MYSQLHOST");
        var port = Environment.GetEnvironmentVariable("MYSQLPORT");
        var user = Environment.GetEnvironmentVariable("MYSQLUSER") ?? "root";
        var password = Environment.GetEnvironmentVariable("MYSQL_ROOT_PASSWORD");
        var database = Environment.GetEnvironmentVariable("MYSQLDATABASE") ?? "railway";

        Console.WriteLine($"MYSQLHOST: {(host != null ? "Set" : "Not set")}");
        Console.WriteLine($"MYSQLPORT: {(port != null ? "Set" : "Not set")}");
        Console.WriteLine($"MYSQL_ROOT_PASSWORD: {(password != null ? "Set" : "Not set")}");
        Console.WriteLine($"MYSQLDATABASE: {database}");

        if (!string.IsNullOrEmpty(host) && !string.IsNullOrEmpty(port) && !string.IsNullOrEmpty(password))
        {
            connectionString = $"Server={host};Port={port};Database={database};User={user};Password={password};SslMode=Required;";
            Console.WriteLine($"✓ Using Railway MySQL Variables: {host}:{port}/{database}");
        }
        else
        {
            Console.WriteLine("ERROR: No database configuration found in Railway environment variables");
            throw new Exception("Database configuration is missing in production environment");
        }
    }
}
else
{
    Console.WriteLine($"=== Development Environment ===");
    Console.WriteLine($"Using Local Database: localhost:3306/vmsystem");
}

if (string.IsNullOrEmpty(connectionString))
{
    throw new Exception("Connection string is null or empty!");
}

Console.WriteLine($"Final connection string length: {connectionString.Length}");

var serverVersion = new MySqlServerVersion(new Version(8, 0, 0));
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(connectionString, serverVersion));

// Register services for dependency injection
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IVehicleService, VehicleService>();
builder.Services.AddScoped<ITripService, TripService>();
builder.Services.AddScoped<IMaintenanceService, MaintenanceService>();
builder.Services.AddScoped<IInspectionService, InspectionService>();
builder.Services.AddScoped<IIssueService, IssueService>();
builder.Services.AddScoped<IPartsService, PartsService>();
builder.Services.AddScoped<IReportingService, ReportingService>();

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ??
                Environment.GetEnvironmentVariable("JWT_SECRET_KEY") ??
                throw new Exception("JWT SecretKey not configured");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
});

builder.Services.AddAuthorization();



// Add CORS for frontend - supports both development and production
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        // Get allowed origins from environment or use defaults
        var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
            ?? new[] {
                "http://localhost:3000",
                "http://localhost:3001",
                "http://localhost:5173"
            };

        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Run database migrations automatically on startup (Railway deployment)
if (app.Environment.IsProduction())
{
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        try
        {
            var context = services.GetRequiredService<ApplicationDbContext>();
            context.Database.Migrate();
            Console.WriteLine("Database migrations applied successfully.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error applying migrations: {ex.Message}");
            // Don't throw - allow app to start even if migrations fail
        }
    }
}

// Configure the HTTP request pipeline
// Enable Swagger in all environments for API documentation
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Vehicle Management API v1");
    c.RoutePrefix = "swagger"; // Access Swagger at /swagger
});

// Conditional HTTPS redirection (Railway handles HTTPS at the edge)
if (!app.Environment.IsProduction())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
