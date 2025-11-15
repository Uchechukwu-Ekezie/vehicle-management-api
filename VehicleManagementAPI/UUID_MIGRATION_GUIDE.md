# UUID Migration Guide

This document outlines all changes needed to complete the migration from integer IDs to UUIDs (Guid).

## ✅ Completed

### Models
- ✅ Vehicle.cs - VehicleID, AssignedDriverID
- ✅ User.cs - UserID
- ✅ Trip.cs - TripID, VehicleID, DriverID
- ✅ MaintenanceRecord.cs - RecordID, VehicleID, PartsUsedID
- ✅ Issue.cs - IssueID, VehicleID, ReportedByID
- ✅ Inspection.cs - InspectionID, VehicleID
- ✅ PartsInventory.cs - PartID

### DTOs
- ✅ VehicleDTOs.cs - All Guid fields
- ✅ TripDTOs.cs - All Guid fields
- ✅ MaintenanceDTOs.cs - All Guid fields
- ✅ IssueDTOs.cs - All Guid fields
- ✅ AuthDTOs.cs - UserID in LoginResponse
- ✅ PartsInventoryDTOs.cs - PartID

### Services
- ✅ VehicleService.cs - All methods use Guid
- ✅ AuthService.cs - UserID generation and GetUserByIdAsync

### Controllers
- ✅ VehiclesController.cs - All routes use Guid
- ✅ AuthController.cs - Guid parsing from JWT claims

## 🔄 Still Need Updates

### Services (Update all int parameters to Guid)
1. **TripService.cs**
   - GetTripByIdAsync(int id) → Guid id
   - GetTripsByDriverAsync(int driverId) → Guid driverId
   - GetTripsByVehicleAsync(int vehicleId) → Guid vehicleId
   - StartTripAsync(int driverId, ...) → Guid driverId
   - EndTripAsync(int tripId, ...) → Guid tripId
   - Generate UUIDs in Create/StartTrip methods

2. **MaintenanceService.cs**
   - GetRecordByIdAsync(int id) → Guid id
   - GetRecordsByVehicleAsync(int vehicleId) → Guid vehicleId
   - UpdateRecordAsync(int id, ...) → Guid id
   - DeleteRecordAsync(int id) → Guid id
   - Generate UUID in CreateRecordAsync

3. **IssueService.cs**
   - GetIssueByIdAsync(int id) → Guid id
   - GetIssuesByVehicleAsync(int vehicleId) → Guid vehicleId
   - CreateIssueAsync(int reportedById, ...) → Guid reportedById
   - UpdateIssueAsync(int id, ...) → Guid id
   - DeleteIssueAsync(int id) → Guid id
   - Generate UUID in CreateIssueAsync

4. **PartsService.cs**
   - GetPartByIdAsync(int id) → Guid id
   - UpdatePartAsync(int id, ...) → Guid id
   - DeletePartAsync(int id) → Guid id
   - UpdateStockAsync(int partId, ...) → Guid partId
   - Generate UUID in CreatePartAsync

5. **ReportingService.cs**
   - GetFuelEfficiencyByVehicleAsync(int vehicleId) → Guid vehicleId

### Controllers (Update all int parameters to Guid and JWT claim parsing)
1. **TripsController.cs**
   - GetTripById(Guid id)
   - GetTripsByDriver(Guid driverId)
   - GetTripsByVehicle(Guid vehicleId)
   - StartTrip - Parse Guid from JWT claims
   - EndTrip(Guid id)

2. **MaintenanceController.cs**
   - GetRecordById(Guid id)
   - GetRecordsByVehicle(Guid vehicleId)
   - UpdateRecord(Guid id)
   - DeleteRecord(Guid id)

3. **IssuesController.cs**
   - GetIssueById(Guid id)
   - GetIssuesByVehicle(Guid vehicleId)
   - CreateIssue - Parse Guid from JWT claims
   - UpdateIssue(Guid id)
   - DeleteIssue(Guid id)

4. **PartsController.cs**
   - GetPartById(Guid id)
   - UpdatePart(Guid id)
   - DeletePart(Guid id)
   - UsePartStock(Guid id)

5. **ReportsController.cs**
   - GetFuelEfficiencyByVehicle(Guid vehicleId)

## Database Migration

After updating all code, create and run the migration:

```bash
cd VehicleManagementAPI
dotnet ef migrations add ConvertIdsToGuid
dotnet ef database update
```

**⚠️ WARNING**: This migration will require data migration if you have existing data. You'll need to:
1. Create temporary columns for old IDs
2. Generate UUIDs for existing records
3. Update foreign keys
4. Drop old columns

For a fresh database, you can drop all migrations and create new ones:

```bash
dotnet ef migrations remove
dotnet ef migrations add InitialCreateWithGuid
dotnet ef database update
```

## Testing Checklist

- [ ] User registration/login generates UUID
- [ ] Vehicle CRUD operations with UUIDs
- [ ] Trip creation/management with UUIDs
- [ ] Maintenance record CRUD with UUIDs
- [ ] Issue reporting/management with UUIDs
- [ ] Parts inventory with UUIDs
- [ ] All foreign key relationships work
- [ ] JWT token claims contain UUID strings
- [ ] Frontend can parse and use UUIDs from API

## Frontend Updates Needed

See `fleet-tracker-frontend/UUID_UPDATE_GUIDE.md` (to be created)

