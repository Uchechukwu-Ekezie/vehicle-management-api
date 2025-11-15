# 🔧 Fix Railway Database Migration Error

## ❌ The Error You're Seeing:
```json
{
    "message": "An error occurred while saving the entity changes. See the inner exception for details."
}
```

## 🔍 Root Cause:
Your Railway database has **old tables with int IDs** but your code now uses **Guid (UUID) IDs**. The foreign keys are incompatible, causing entity save errors.

## ✅ Solution (5 minutes):

### Step 1: Reset Railway Database

1. Go to https://railway.app/dashboard
2. Click your **Vehicle Management API** project
3. Click the **MySQL** service (NOT the API service)
4. Click **Data** tab
5. Click **New Query**
6. Copy and paste this SQL:

```sql
DROP TABLE IF EXISTS `Trips`;
DROP TABLE IF EXISTS `Issues`;
DROP TABLE IF EXISTS `MaintenanceRecords`;
DROP TABLE IF EXISTS `Inspections`;
DROP TABLE IF EXISTS `PartsInventory`;
DROP TABLE IF EXISTS `Vehicles`;
DROP TABLE IF EXISTS `Users`;
DROP TABLE IF EXISTS `__EFMigrationsHistory`;

SHOW TABLES;
```

7. Click **Run** or **Execute**
8. Verify `SHOW TABLES` returns empty (or shows "Empty set")

### Step 2: Redeploy Your API

1. Go to **VehicleManagementAPI** service (your .NET API, not MySQL)
2. Click **Deployments** tab
3. Click the **⋮** (three dots) on the latest deployment
4. Click **Redeploy**
5. Wait 2-3 minutes

### Step 3: Verify Migrations

Watch the deployment logs. You should see:
```
Database migrations applied successfully.
```

### Step 4: Test Registration

Run this in your Git Bash terminal:

```bash
curl -X POST https://vehicle-management-api-production.up.railway.app/api/Auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@test.com",
    "fullName": "System Administrator",
    "password": "Admin@123",
    "role": "Admin"
  }'
```

**Expected Result:**
- Status: `200 OK`
- Response: Success message with user details

**If you still get the error:**
- Status: `400 Bad Request`
- Response: Entity error
- **Solution**: The database wasn't fully reset. Try Step 1 again.

## 🎯 What This Does:

1. **Drops all tables** - Removes incompatible int-based schema
2. **Railway auto-runs migrations** - Creates fresh UUID-based schema  
3. **All IDs are now Guid** - PartsUsedID, AssignedDriverID, VehicleID, etc.
4. **Foreign keys work** - No more type mismatch errors

## 📊 After Reset:

✅ Database is empty (expected - fresh start)
✅ All tables use UUID (Guid) for IDs
✅ `/api/Auth/register` works
✅ `/api/Vehicles` returns empty array `[]`
✅ No entity save errors

## 🚀 Next Steps:

1. Register a new admin user
2. Login to get JWT token
3. Start adding vehicles, users, etc.
4. Everything will work with UUIDs

---

**Need Help?** Let me know if:
- The SQL doesn't run (check for syntax errors)
- Railway doesn't redeploy (check environment variables)
- You still get entity errors (check migration logs)
