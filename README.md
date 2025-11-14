# Vehicle Management & Maintenance Tracker API

A comprehensive backend API built with **ASP.NET Core 8.0** and **MySQL** for managing vehicle fleets, tracking maintenance, monitoring fuel efficiency, and generating cost analytics.

## 🚀 Features

### Core Functionality
- **Fleet Management**: Complete CRUD operations for vehicles with status tracking
- **Trip Logging**: Start/end trips with automatic mileage and fuel tracking
- **Maintenance Scheduling**: Schedule, track, and complete maintenance records
- **Issue Reporting**: Drivers can report vehicle issues with priority levels
- **Parts Inventory**: Track spare parts stock with low-stock alerts

### Role-Based Access Control
- **Admin**: Full system access, vehicle management, maintenance scheduling, alerts
- **Driver**: Trip logging, issue reporting, fuel efficiency viewing
- **Mechanic**: Maintenance record updates, parts inventory management
- **Finance**: Cost analytics, maintenance reports, fuel efficiency reports

### Enhancements
1. **Predictive Maintenance (Admin)**: Automatic alerts based on mileage (1000 miles) and time (6 months) thresholds
2. **Fuel Efficiency Tracker (Driver)**: Automatic calculation of MPG/km per liter for each trip
3. **Parts Inventory Management (Mechanic)**: Stock tracking with automatic deduction when parts are used
4. **Cost Analytics Dashboard (Finance)**: Comprehensive reports by vehicle, type, and month

## 📋 Prerequisites

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [MySQL Server 8.0+](https://dev.mysql.com/downloads/mysql/)
- [Visual Studio 2022](https://visualstudio.microsoft.com/) or [VS Code](https://code.visualstudio.com/)
- Git (optional)

## 🛠️ Setup Instructions

### 1. Clone or Download the Project

```bash
cd /c/Users/MSI/Desktop/vms
```

### 2. Configure MySQL Connection

Edit `appsettings.json` and update the connection string:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=VehicleManagementDB;User=root;Password=your_password;"
  }
}
```

Replace `your_password` with your MySQL root password.

### 3. Install Dependencies

```bash
cd VehicleManagementAPI
dotnet restore
```

### 4. Create and Apply Database Migrations

```bash
# Install EF Core tools if not already installed
dotnet tool install --global dotnet-ef

# Create initial migration
dotnet ef migrations add InitialCreate

# Apply migration to database (creates all tables)
dotnet ef database update
```

This will create the following tables:
- Users
- Vehicles
- Trips
- MaintenanceRecords
- Inspections
- Issues
- PartsInventory

### 5. Run the Application

```bash
dotnet run
```

The API will start on:
- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:5001`

Swagger UI (API documentation): `http://localhost:5000` or `https://localhost:5001`

## 📚 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/register` | User registration | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Vehicles
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/vehicles` | Get all vehicles | All |
| GET | `/api/vehicles/{id}` | Get vehicle by ID | All |
| GET | `/api/vehicles/status/{status}` | Get vehicles by status | All |
| POST | `/api/vehicles` | Create vehicle | Admin |
| PUT | `/api/vehicles/{id}` | Update vehicle | Admin |
| DELETE | `/api/vehicles/{id}` | Delete vehicle | Admin |
| POST | `/api/vehicles/{vehicleId}/assign/{driverId}` | Assign driver | Admin |

### Trips
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/trips` | Get all trips | Admin, Finance |
| GET | `/api/trips/{id}` | Get trip by ID | All |
| GET | `/api/trips/driver/{driverId}` | Get driver's trips | All |
| GET | `/api/trips/vehicle/{vehicleId}` | Get vehicle's trips | All |
| POST | `/api/trips/start` | Start a trip | Driver |
| POST | `/api/trips/{id}/end` | End a trip | Driver |

### Maintenance
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/maintenance` | Get all records | All |
| GET | `/api/maintenance/{id}` | Get record by ID | All |
| GET | `/api/maintenance/vehicle/{vehicleId}` | Get vehicle's records | All |
| POST | `/api/maintenance/schedule` | Schedule maintenance | Admin |
| PUT | `/api/maintenance/records/{id}` | Update record | Admin, Mechanic |
| DELETE | `/api/maintenance/records/{id}` | Delete record | Admin |
| GET | `/api/maintenance/alerts` | Get predictive alerts | Admin |

### Issues
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/issues` | Get all issues | Admin, Mechanic |
| GET | `/api/issues/{id}` | Get issue by ID | All |
| GET | `/api/issues/vehicle/{vehicleId}` | Get vehicle's issues | All |
| GET | `/api/issues/status/{status}` | Get issues by status | Admin, Mechanic |
| POST | `/api/issues` | Report issue | Driver |
| PUT | `/api/issues/{id}` | Update issue | Admin, Mechanic |
| DELETE | `/api/issues/{id}` | Delete issue | Admin |

### Parts Inventory
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/parts` | Get all parts | Admin, Mechanic |
| GET | `/api/parts/{id}` | Get part by ID | Admin, Mechanic |
| GET | `/api/parts/low-stock` | Get low-stock parts | Admin, Mechanic |
| POST | `/api/parts` | Create part | Admin |
| PUT | `/api/parts/{id}` | Update part | Admin, Mechanic |
| DELETE | `/api/parts/{id}` | Delete part | Admin |
| POST | `/api/parts/{id}/use` | Deduct stock | Admin, Mechanic |

### Reports
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/reports/maintenance/costs` | Get cost analytics | Admin, Finance |
| GET | `/api/reports/fuel-efficiency` | Get all fuel reports | Admin, Driver, Finance |
| GET | `/api/reports/fuel-efficiency/vehicle/{id}` | Get vehicle fuel report | Admin, Driver, Finance |

## 🔑 Authentication

The API uses **JWT Bearer tokens** for authentication.

### Example: Login and Use Token

1. **Register a user**:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin123!",
    "email": "admin@vms.com",
    "fullName": "Admin User",
    "role": "Admin"
  }'
```

2. **Login**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin123!"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "admin",
  "role": "Admin",
  "userID": 1
}
```

3. **Use token in subsequent requests**:
```bash
curl -X GET http://localhost:5000/api/vehicles \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🗃️ Database Schema

### Users Table
```sql
CREATE TABLE Users (
    UserID INT PRIMARY KEY AUTO_INCREMENT,
    Username VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Role VARCHAR(50) NOT NULL,
    Email VARCHAR(100) UNIQUE,
    FullName VARCHAR(100),
    CreatedAt DATETIME NOT NULL
);
```

### Vehicles Table
```sql
CREATE TABLE Vehicles (
    VehicleID INT PRIMARY KEY AUTO_INCREMENT,
    Make VARCHAR(100) NOT NULL,
    Model VARCHAR(100) NOT NULL,
    Year INT NOT NULL,
    VIN VARCHAR(17) NOT NULL UNIQUE,
    LicensePlate VARCHAR(20) NOT NULL UNIQUE,
    Status VARCHAR(50) NOT NULL DEFAULT 'Available',
    CurrentMileage DECIMAL(10,2) NOT NULL,
    AssignedDriverID INT,
    Color VARCHAR(50),
    PurchaseDate DATETIME,
    CreatedAt DATETIME NOT NULL,
    UpdatedAt DATETIME NOT NULL,
    FOREIGN KEY (AssignedDriverID) REFERENCES Users(UserID) ON DELETE SET NULL
);
```

### Trips Table
```sql
CREATE TABLE Trips (
    TripID INT PRIMARY KEY AUTO_INCREMENT,
    VehicleID INT NOT NULL,
    DriverID INT NOT NULL,
    StartTime DATETIME NOT NULL,
    EndTime DATETIME,
    StartMileage DECIMAL(10,2) NOT NULL,
    EndMileage DECIMAL(10,2),
    FuelUsed DECIMAL(10,2),
    FuelEfficiency DECIMAL(10,2),
    Notes VARCHAR(500),
    CreatedAt DATETIME NOT NULL,
    FOREIGN KEY (VehicleID) REFERENCES Vehicles(VehicleID) ON DELETE CASCADE,
    FOREIGN KEY (DriverID) REFERENCES Users(UserID) ON DELETE RESTRICT
);
```

### MaintenanceRecords Table
```sql
CREATE TABLE MaintenanceRecords (
    RecordID INT PRIMARY KEY AUTO_INCREMENT,
    VehicleID INT NOT NULL,
    MaintenanceType VARCHAR(100) NOT NULL,
    ScheduledDate DATETIME NOT NULL,
    CompletionDate DATETIME,
    Cost DECIMAL(10,2) NOT NULL,
    MechanicNotes VARCHAR(1000),
    PartsUsedID INT,
    Status VARCHAR(50) NOT NULL DEFAULT 'Scheduled',
    MileageAtService DECIMAL(10,2),
    CreatedAt DATETIME NOT NULL,
    UpdatedAt DATETIME NOT NULL,
    FOREIGN KEY (VehicleID) REFERENCES Vehicles(VehicleID) ON DELETE CASCADE,
    FOREIGN KEY (PartsUsedID) REFERENCES PartsInventory(PartID) ON DELETE SET NULL
);
```

### Inspections Table
```sql
CREATE TABLE Inspections (
    InspectionID INT PRIMARY KEY AUTO_INCREMENT,
    VehicleID INT NOT NULL,
    InspectionType VARCHAR(100) NOT NULL,
    DueDate DATETIME NOT NULL,
    CompletionDate DATETIME,
    IsCompliant BOOLEAN NOT NULL DEFAULT FALSE,
    DocumentLink VARCHAR(500),
    Notes VARCHAR(1000),
    CreatedAt DATETIME NOT NULL,
    UpdatedAt DATETIME NOT NULL,
    FOREIGN KEY (VehicleID) REFERENCES Vehicles(VehicleID) ON DELETE CASCADE
);
```

### Issues Table
```sql
CREATE TABLE Issues (
    IssueID INT PRIMARY KEY AUTO_INCREMENT,
    VehicleID INT NOT NULL,
    ReportedByID INT NOT NULL,
    ReportDate DATETIME NOT NULL,
    Description VARCHAR(1000) NOT NULL,
    Status VARCHAR(50) NOT NULL DEFAULT 'Reported',
    Priority VARCHAR(50),
    ResolvedDate DATETIME,
    Resolution VARCHAR(1000),
    CreatedAt DATETIME NOT NULL,
    UpdatedAt DATETIME NOT NULL,
    FOREIGN KEY (VehicleID) REFERENCES Vehicles(VehicleID) ON DELETE CASCADE,
    FOREIGN KEY (ReportedByID) REFERENCES Users(UserID) ON DELETE RESTRICT
);
```

### PartsInventory Table
```sql
CREATE TABLE PartsInventory (
    PartID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(200) NOT NULL,
    SKU VARCHAR(100) NOT NULL UNIQUE,
    QuantityInStock INT NOT NULL,
    UnitPrice DECIMAL(10,2) NOT NULL,
    MinimumStockLevel INT,
    Supplier VARCHAR(100),
    Description VARCHAR(500),
    CreatedAt DATETIME NOT NULL,
    UpdatedAt DATETIME NOT NULL
);
```

## 🏗️ Project Structure

```
VehicleManagementAPI/
├── Controllers/          # API endpoints (HTTP request handlers)
│   ├── AuthController.cs
│   ├── VehiclesController.cs
│   ├── TripsController.cs
│   ├── MaintenanceController.cs
│   ├── IssuesController.cs
│   ├── PartsController.cs
│   └── ReportsController.cs
├── Services/            # Business logic layer
│   ├── AuthService.cs
│   ├── VehicleService.cs
│   ├── TripService.cs
│   ├── MaintenanceService.cs
│   ├── IssueService.cs
│   ├── PartsService.cs
│   └── ReportingService.cs
├── Models/              # Entity models (database tables)
│   ├── User.cs
│   ├── Vehicle.cs
│   ├── Trip.cs
│   ├── MaintenanceRecord.cs
│   ├── Inspection.cs
│   ├── Issue.cs
│   └── PartsInventory.cs
├── DTOs/                # Data Transfer Objects (API contracts)
│   ├── AuthDTOs.cs
│   ├── VehicleDTOs.cs
│   ├── TripDTOs.cs
│   ├── MaintenanceDTOs.cs
│   ├── IssueDTOs.cs
│   ├── PartsInventoryDTOs.cs
│   └── ReportDTOs.cs
├── Data/
│   └── ApplicationDbContext.cs  # EF Core DbContext
├── Program.cs           # Application entry point and DI configuration
├── appsettings.json     # Configuration (connection strings, JWT settings)
└── VehicleManagementAPI.csproj
```

## 🧪 Testing with Swagger

1. Start the application: `dotnet run`
2. Open browser: `http://localhost:5000`
3. Click "Authorize" and enter your JWT token (from login response)
4. Test any endpoint directly from the UI

## 🔧 Common Commands

```bash
# Restore dependencies
dotnet restore

# Build project
dotnet build

# Run project
dotnet run

# Create new migration
dotnet ef migrations add MigrationName

# Apply migrations
dotnet ef database update

# Remove last migration
dotnet ef migrations remove

# Drop database
dotnet ef database drop
```

## 🐛 Troubleshooting

### MySQL Connection Issues
- Verify MySQL is running: `mysql -u root -p`
- Check connection string in `appsettings.json`
- Ensure MySQL user has proper permissions

### Migration Errors
- Delete `Migrations` folder and recreate: `dotnet ef migrations add InitialCreate`
- Drop database and recreate: `dotnet ef database drop -f && dotnet ef database update`

### JWT Token Issues
- Ensure `Authorization` header format: `Bearer YOUR_TOKEN`
- Token expires after 24 hours (configurable in `appsettings.json`)

## 📊 Sample Data

After setup, create sample data using Swagger or curl:

```bash
# Create Admin user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123!","email":"admin@vms.com","fullName":"System Admin","role":"Admin"}'

# Create vehicle (requires admin token)
curl -X POST http://localhost:5000/api/vehicles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"make":"Toyota","model":"Camry","year":2022,"vin":"1HGBH41JXMN109186","licensePlate":"ABC123","currentMileage":15000}'
```

## 📈 Enhancements Explained

### 1. Predictive Maintenance (Admin)
- Endpoint: `GET /api/maintenance/alerts`
- Checks each vehicle against thresholds:
  - **Mileage**: 1000 miles since last service
  - **Time**: 180 days (6 months) since last service
- Returns alert list with vehicle info and recommendations

### 2. Fuel Efficiency Tracker (Driver)
- Automatic calculation when ending trip: `Efficiency = (EndMileage - StartMileage) / FuelUsed`
- Stored in `FuelEfficiency` field
- Reports available via `GET /api/reports/fuel-efficiency`

### 3. Spare Parts Inventory (Mechanic)
- Track parts with SKU, quantity, price
- Low-stock alerts: `GET /api/parts/low-stock`
- Auto-deduct when used: `POST /api/parts/{id}/use`

### 4. Cost Analytics (Finance)
- Endpoint: `GET /api/reports/maintenance/costs`
- Query params: `startDate`, `endDate`
- Returns:
  - Total cost
  - Average cost per vehicle
  - Breakdown by vehicle, type, and month

## 🚀 Deployment

For production:
1. Update `appsettings.json` with production connection string
2. Change JWT secret key to a strong random value
3. Enable HTTPS and update CORS origins
4. Deploy to Azure App Service, AWS, or Docker

## 📝 License

This project is for educational/portfolio purposes.

## 🤝 Contributing

Feel free to fork and submit pull requests!

---

**Built with ❤️ using ASP.NET Core 8.0, Entity Framework Core, and MySQL**
