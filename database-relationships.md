# Database Relationships

## One-to-Many Relationships

### Users → Vehicles (Driver Assignment)
- One User (Driver) can be assigned to Many Vehicles
- Foreign Key: `Vehicles.AssignedDriverID` → `Users.UserID`
- Delete Behavior: SET NULL (if user deleted, vehicle assignment is cleared)

### Users → Trips
- One User (Driver) can have Many Trips
- Foreign Key: `Trips.DriverID` → `Users.UserID`
- Delete Behavior: RESTRICT (cannot delete user with existing trips)

### Users → Issues
- One User can report Many Issues
- Foreign Key: `Issues.ReportedByID` → `Users.UserID`
- Delete Behavior: RESTRICT (cannot delete user with reported issues)

### Vehicles → Trips
- One Vehicle can have Many Trips
- Foreign Key: `Trips.VehicleID` → `Vehicles.VehicleID`
- Delete Behavior: CASCADE (deleting vehicle deletes all trips)

### Vehicles → MaintenanceRecords
- One Vehicle can have Many Maintenance Records
- Foreign Key: `MaintenanceRecords.VehicleID` → `Vehicles.VehicleID`
- Delete Behavior: CASCADE (deleting vehicle deletes all maintenance records)

### Vehicles → Inspections
- One Vehicle can have Many Inspections
- Foreign Key: `Inspections.VehicleID` → `Vehicles.VehicleID`
- Delete Behavior: CASCADE (deleting vehicle deletes all inspections)

### Vehicles → Issues
- One Vehicle can have Many Issues
- Foreign Key: `Issues.VehicleID` → `Vehicles.VehicleID`
- Delete Behavior: CASCADE (deleting vehicle deletes all issues)

### PartsInventory → MaintenanceRecords
- One Part can be used in Many Maintenance Records
- Foreign Key: `MaintenanceRecords.PartsUsedID` → `PartsInventory.PartID`
- Delete Behavior: SET NULL (if part deleted, reference is cleared)

## Indexes

### Unique Indexes
- `Users.Username` - Ensures unique usernames
- `Users.Email` - Ensures unique email addresses
- `Vehicles.VIN` - Ensures unique Vehicle Identification Numbers
- `Vehicles.LicensePlate` - Ensures unique license plates
- `PartsInventory.SKU` - Ensures unique Stock Keeping Units

### Foreign Key Indexes (Automatically created)
- `Vehicles.AssignedDriverID`
- `Trips.VehicleID`
- `Trips.DriverID`
- `MaintenanceRecords.VehicleID`
- `MaintenanceRecords.PartsUsedID`
- `Inspections.VehicleID`
- `Issues.VehicleID`
- `Issues.ReportedByID`

## Enumerations (Stored as VARCHAR)

### User Roles
- Admin
- Driver
- Mechanic
- Finance

### Vehicle Status
- Available
- In Use
- Maintenance

### Maintenance Status
- Scheduled
- In Progress
- Completed
- Cancelled

### Issue Status
- Reported
- In Progress
- Resolved
- Closed

### Issue Priority
- Low
- Medium
- High
- Critical

### Inspection Types
- MOT (Ministry of Transport Test)
- Insurance
- Tax
- Safety

### Maintenance Types
- Service (Regular scheduled service)
- Repair (Unscheduled repair)
- Inspection
- Tire Change
- Oil Change
- Brake Service
- Other
