# API Endpoints Reference

## 🔐 Authentication & Authorization

### Public Endpoints (No Auth Required)
```
POST   /api/auth/register   - Register new user
POST   /api/auth/login      - Login (returns JWT token)
```

### Authenticated Endpoints (Token Required)
```
GET    /api/auth/me         - Get current user info
```

---

## 🚗 Vehicles (All Authenticated, Admin for CUD)

### Read Operations (All Roles)
```
GET    /api/vehicles                      - List all vehicles
GET    /api/vehicles/{id}                 - Get vehicle by ID
GET    /api/vehicles/status/{status}      - Filter by status (Available, In Use, Maintenance)
```

### Write Operations (Admin Only)
```
POST   /api/vehicles                      - Create vehicle
PUT    /api/vehicles/{id}                 - Update vehicle
DELETE /api/vehicles/{id}                 - Delete vehicle
POST   /api/vehicles/{vehicleId}/assign/{driverId} - Assign driver
```

**Example Request Bodies:**

Create Vehicle:
```json
{
  "make": "Toyota",
  "model": "Camry",
  "year": 2022,
  "vin": "1HGBH41JXMN109186",
  "licensePlate": "ABC-1234",
  "currentMileage": 15000,
  "color": "Blue"
}
```

Update Vehicle:
```json
{
  "status": "Maintenance",
  "currentMileage": 15500
}
```

---

## 🛣️ Trips

### Driver Operations
```
POST   /api/trips/start       - Start a trip (Driver only)
POST   /api/trips/{id}/end    - End trip with fuel data (Driver only)
```

### Read Operations
```
GET    /api/trips                      - All trips (Admin, Finance only)
GET    /api/trips/{id}                 - Get trip by ID
GET    /api/trips/driver/{driverId}    - Driver's trip history
GET    /api/trips/vehicle/{vehicleId}  - Vehicle's trip history
```

**Example Request Bodies:**

Start Trip:
```json
{
  "vehicleID": 1,
  "startTime": "2024-11-13T08:00:00Z",
  "startMileage": 15000,
  "notes": "Delivery route"
}
```

End Trip:
```json
{
  "endTime": "2024-11-13T10:00:00Z",
  "endMileage": 15120,
  "fuelUsed": 8.5
}
```
> **Note**: Fuel efficiency is automatically calculated!

---

## 🔧 Maintenance

### Admin Operations
```
POST   /api/maintenance/schedule        - Schedule maintenance (Admin only)
DELETE /api/maintenance/records/{id}    - Delete record (Admin only)
GET    /api/maintenance/alerts          - Predictive alerts (Admin only) ⭐
```

### Mechanic Operations
```
PUT    /api/maintenance/records/{id}    - Update record (Admin, Mechanic)
```

### Read Operations (All Roles)
```
GET    /api/maintenance                      - List all records
GET    /api/maintenance/{id}                 - Get record by ID
GET    /api/maintenance/vehicle/{vehicleId}  - Vehicle's maintenance history
```

**Example Request Bodies:**

Schedule Maintenance:
```json
{
  "vehicleID": 1,
  "maintenanceType": "Oil Change",
  "scheduledDate": "2024-11-20T09:00:00Z",
  "cost": 45.00,
  "mechanicNotes": "Regular scheduled maintenance"
}
```

Update Maintenance:
```json
{
  "status": "Completed",
  "completionDate": "2024-11-20T11:00:00Z",
  "mileageAtService": 15500
}
```

**Predictive Maintenance Alert Response:**
```json
[
  {
    "vehicleID": 1,
    "vehicleInfo": "Toyota Camry (ABC-1234)",
    "alertType": "Mileage",
    "message": "Vehicle has traveled 1,200 miles since last service. Service recommended.",
    "currentMileage": 16200,
    "lastServiceDate": "2024-10-01T10:00:00Z"
  }
]
```

---

## ⚠️ Issues

### Driver Operations
```
POST   /api/issues       - Report issue (Driver only)
```

### Mechanic Operations
```
GET    /api/issues                   - All issues (Admin, Mechanic)
GET    /api/issues/status/{status}   - Filter by status (Admin, Mechanic)
PUT    /api/issues/{id}              - Update issue (Admin, Mechanic)
```

### Read Operations
```
GET    /api/issues/{id}                 - Get issue by ID
GET    /api/issues/vehicle/{vehicleId}  - Vehicle's issues
```

### Admin Operations
```
DELETE /api/issues/{id}    - Delete issue (Admin only)
```

**Example Request Bodies:**

Report Issue:
```json
{
  "vehicleID": 1,
  "description": "Strange noise from engine",
  "priority": "High"
}
```

Update Issue:
```json
{
  "status": "Resolved",
  "resolvedDate": "2024-11-14T10:00:00Z",
  "resolution": "Replaced timing belt"
}
```

---

## 🔩 Parts Inventory (Admin, Mechanic Only)

### Admin Operations
```
POST   /api/parts       - Create part (Admin only)
DELETE /api/parts/{id}  - Delete part (Admin only)
```

### Mechanic Operations
```
GET    /api/parts              - List all parts
GET    /api/parts/{id}         - Get part by ID
GET    /api/parts/low-stock    - Low stock alerts ⭐
PUT    /api/parts/{id}         - Update part
POST   /api/parts/{id}/use     - Deduct stock quantity
```

**Example Request Bodies:**

Create Part:
```json
{
  "name": "Oil Filter",
  "sku": "OF-123",
  "quantityInStock": 50,
  "unitPrice": 12.99,
  "minimumStockLevel": 10,
  "supplier": "AutoParts Inc",
  "description": "Standard oil filter for sedans"
}
```

Update Part:
```json
{
  "quantityInStock": 45,
  "unitPrice": 13.99
}
```

Use Part (Deduct Stock):
```json
2
```
> This deducts 2 units from the part's stock.

---

## 📊 Reports

### Cost Analytics (Admin, Finance)
```
GET    /api/reports/maintenance/costs?startDate=2024-01-01&endDate=2024-12-31
```

**Response:**
```json
{
  "totalCost": 5420.50,
  "averageCostPerVehicle": 542.05,
  "costsByVehicle": [
    {
      "vehicleID": 1,
      "vehicleInfo": "Toyota Camry (ABC-1234)",
      "totalCost": 1200.00,
      "maintenanceCount": 8
    }
  ],
  "costsByType": [
    {
      "maintenanceType": "Oil Change",
      "totalCost": 360.00,
      "count": 8
    }
  ],
  "costsByMonth": [
    {
      "year": 2024,
      "month": 1,
      "monthName": "January",
      "totalCost": 450.00
    }
  ]
}
```

### Fuel Efficiency (Admin, Driver, Finance)
```
GET    /api/reports/fuel-efficiency                  - All vehicles
GET    /api/reports/fuel-efficiency/vehicle/{id}     - Specific vehicle
```

**Response:**
```json
[
  {
    "vehicleID": 1,
    "vehicleInfo": "Toyota Camry (ABC-1234)",
    "averageFuelEfficiency": 14.12,
    "totalFuelUsed": 250.5,
    "totalDistanceTraveled": 3540.0,
    "tripCount": 42
  }
]
```

---

## 🔑 Authorization Matrix

| Endpoint Category | Admin | Driver | Mechanic | Finance |
|-------------------|-------|--------|----------|---------|
| Authentication    | ✅    | ✅     | ✅       | ✅      |
| Vehicles (Read)   | ✅    | ✅     | ✅       | ✅      |
| Vehicles (Write)  | ✅    | ❌     | ❌       | ❌      |
| Trips (Start/End) | ❌    | ✅     | ❌       | ❌      |
| Trips (View All)  | ✅    | ❌     | ❌       | ✅      |
| Maintenance (Schedule) | ✅ | ❌    | ❌       | ❌      |
| Maintenance (Update)   | ✅ | ❌    | ✅       | ❌      |
| Maintenance (Alerts)   | ✅ | ❌    | ❌       | ❌      |
| Issues (Report)   | ❌    | ✅     | ❌       | ❌      |
| Issues (Update)   | ✅    | ❌     | ✅       | ❌      |
| Parts Inventory   | ✅    | ❌     | ✅       | ❌      |
| Reports (Cost)    | ✅    | ❌     | ❌       | ✅      |
| Reports (Fuel)    | ✅    | ✅     | ❌       | ✅      |

---

## 📝 Common Status Values

### Vehicle Status
- `Available` - Vehicle is ready for use
- `In Use` - Vehicle is currently on a trip
- `Maintenance` - Vehicle is undergoing maintenance

### Maintenance Status
- `Scheduled` - Maintenance is scheduled
- `In Progress` - Maintenance is ongoing
- `Completed` - Maintenance is finished
- `Cancelled` - Maintenance was cancelled

### Issue Status
- `Reported` - Issue has been reported
- `In Progress` - Issue is being worked on
- `Resolved` - Issue has been fixed
- `Closed` - Issue is closed

### Issue Priority
- `Low` - Minor issue
- `Medium` - Normal priority
- `High` - Important issue
- `Critical` - Urgent issue

### User Roles
- `Admin` - Full system access
- `Driver` - Trip logging and issue reporting
- `Mechanic` - Maintenance updates and parts management
- `Finance` - View reports and analytics

---

## 🚀 Quick Test Sequence

1. **Register Admin**
   ```bash
   POST /api/auth/register
   {
     "username": "admin",
     "password": "Admin123!",
     "role": "Admin"
   }
   ```

2. **Login**
   ```bash
   POST /api/auth/login
   {
     "username": "admin",
     "password": "Admin123!"
   }
   ```
   Save the token!

3. **Create Vehicle**
   ```bash
   POST /api/vehicles
   Authorization: Bearer {token}
   {
     "make": "Toyota",
     "model": "Camry",
     "year": 2022,
     "vin": "1HGBH41JXMN109186",
     "licensePlate": "ABC-1234",
     "currentMileage": 15000
   }
   ```

4. **Start Trip** (as Driver)
   ```bash
   POST /api/trips/start
   Authorization: Bearer {driver_token}
   {
     "vehicleID": 1,
     "startMileage": 15000
   }
   ```

5. **End Trip**
   ```bash
   POST /api/trips/1/end
   Authorization: Bearer {driver_token}
   {
     "endMileage": 15120,
     "fuelUsed": 8.5
   }
   ```

6. **View Fuel Efficiency**
   ```bash
   GET /api/reports/fuel-efficiency/vehicle/1
   Authorization: Bearer {token}
   ```

7. **Schedule Maintenance**
   ```bash
   POST /api/maintenance/schedule
   Authorization: Bearer {admin_token}
   {
     "vehicleID": 1,
     "maintenanceType": "Oil Change",
     "scheduledDate": "2024-11-20T09:00:00Z",
     "cost": 45.00
   }
   ```

8. **Check Maintenance Alerts**
   ```bash
   GET /api/maintenance/alerts
   Authorization: Bearer {admin_token}
   ```

---

## ⚡ Tips

1. **Token Format**: Always use `Bearer YOUR_TOKEN_HERE` in Authorization header
2. **DateTime Format**: Use ISO 8601 format: `2024-11-13T08:00:00Z`
3. **Decimal Values**: Use decimal notation: `15000.50` (not scientific)
4. **Case Sensitivity**: Endpoints are case-insensitive, but JSON keys are case-sensitive
5. **Token Expiry**: Default expiration is 24 hours (configurable in appsettings.json)

---

**For complete setup instructions, see README.md or QUICKSTART.md**
