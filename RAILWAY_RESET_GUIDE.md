# 🔄 Railway Database Reset - Complete Guide

## ⚠️ PROBLEM
Your Railway database has **mixed schema** - some tables have `int` IDs, some have `Guid` (UUID) IDs. This causes the entity error:
```
"An error occurred while saving the entity changes. See the inner exception for details."
```

## ✅ SOLUTION
Reset the database so Entity Framework can recreate ALL tables with the proper UUID schema.

---

## 🎯 **Method 1: Railway Dashboard (RECOMMENDED)**

### Step 1: Access Railway Database

1. Go to: https://railway.app/dashboard
2. Click on your **Vehicle Management API** project
3. Click on the **MySQL** service (NOT the API service)
4. Click the **Data** tab

### Step 2: Drop All Tables

In the **Query** section, paste this SQL and click **Run**:

```sql
-- Drop all tables in correct order
DROP TABLE IF EXISTS `Trips`;
DROP TABLE IF EXISTS `Issues`;
DROP TABLE IF EXISTS `MaintenanceRecords`;
DROP TABLE IF EXISTS `Inspections`;
DROP TABLE IF EXISTS `PartsInventory`;
DROP TABLE IF EXISTS `Vehicles`;
DROP TABLE IF EXISTS `Users`;
DROP TABLE IF EXISTS `__EFMigrationsHistory`;

-- Verify all tables are gone
SHOW TABLES;
```

### Step 3: Trigger API Redeploy

After dropping tables, Railway API will auto-run migrations on next deployment:

**Option A: Automatic (wait for next git push)**
- Railway watches your GitHub repo
- Any push triggers redeploy
- Migrations run automatically

**Option B: Manual redeploy**
1. Go to your **VehicleManagementAPI** service (not MySQL)
2. Click **Deployments** tab
3. Click the **⋮** menu on latest deployment
4. Click **Redeploy**

---

## 🎯 **Method 2: Manual SQL via External Tool**

### Using MySQL Workbench:

1. Download: https://dev.mysql.com/downloads/workbench/
2. Create new connection:
   - **Connection Name**: Railway Vehicle API
   - **Hostname**: `yamanote.proxy.rlwy.net`
   - **Port**: `30869`
   - **Username**: `root`
   - **Password**: `RfeNsJfxGMoLnqbUvVfWPPtXYjvpCUun`
   - **Default Schema**: `railway`
3. Connect and run the SQL from `reset-railway-database.sql`

### Using DBeaver (Free Alternative):

1. Download: https://dbeaver.io/download/
2. Create new MySQL connection with same credentials above
3. Run the reset script

---

## 🎯 **Method 3: Railway CLI (Advanced)**

### Install Railway CLI:

```bash
npm install -g @railway/cli
```

### Reset Database:

```bash
# Login to Railway
railway login

# Link to your project
railway link

# Connect to MySQL
railway run mysql -h $MYSQLHOST -P $MYSQLPORT -u root -p$MYSQLPASSWORD railway

# In MySQL prompt, run:
DROP TABLE IF EXISTS Trips;
DROP TABLE IF EXISTS Issues;
DROP TABLE IF EXISTS MaintenanceRecords;
DROP TABLE IF EXISTS Inspections;
DROP TABLE IF EXISTS PartsInventory;
DROP TABLE IF EXISTS Vehicles;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS __EFMigrationsHistory;
SHOW TABLES;
exit
```

---

## ✅ **After Reset - Verification**

### 1. Check Railway Deployment Logs

1. Go to Railway → **VehicleManagementAPI** service
2. Click **Deployments** tab
3. Click latest deployment
4. Check logs for:
   ```
   Database migrations applied successfully.
   ```

### 2. Test Registration

Run this in Git Bash:

```bash
cd /c/Users/MSI/Desktop/vms
bash test-railway-endpoints.sh
```

You should see:
- ✅ Registration: Status 200
- ✅ Login: Token received
- ✅ Vehicles endpoint: Status 200 (empty array)

### 3. Test from Frontend

```bash
cd /c/Users/MSI/Desktop/vms/fleet-tracker-frontend
npm run dev
```

1. Go to http://localhost:3000/signup
2. Register a new admin user:
   - **Username**: admin
   - **Email**: admin@test.com
   - **Full Name**: System Administrator
   - **Password**: Admin@123 (or stronger)
   - **Role**: Administrator
3. Click **Sign Up**
4. Should redirect to login page
5. Login with credentials
6. Admin dashboard should load without errors

---

## 🔧 **Configure Environment Variables (One-Time Setup)**

While you're in Railway Dashboard:

### 1. Go to VehicleManagementAPI Service

Click on your **VehicleManagementAPI** service (not MySQL)

### 2. Add CORS Configuration

Click **Variables** tab → **+ New Variable**

Add this variable:

```
Name: AllowedOrigins
Value: ["http://localhost:3000","http://localhost:3001","http://localhost:5173"]
```

**Important**: No spaces in the JSON array!

### 3. Save and Redeploy

Railway will automatically redeploy with the new environment variable.

---

## 📊 **What Happens After Reset?**

1. **Database is empty** - All old data deleted
2. **Schema is clean** - All tables use UUID (Guid) for IDs
3. **Migrations work** - Entity Framework creates proper schema
4. **No type conflicts** - PartsUsedID, AssignedDriverID, etc. are all Guid
5. **Foreign keys work** - Navigation properties load correctly

---

## 🎉 **Expected Results**

After completing the reset:

✅ **Backend:**
- `/api/Auth/register` → Returns 200 OK
- `/api/Auth/login` → Returns JWT token
- `/api/Vehicles` → Returns empty array `[]`
- `/api/Users` → Returns users array
- No entity saving errors
- No navigation property errors

✅ **Frontend:**
- Admin dashboard loads
- Vehicle list displays (empty at first)
- "Add Vehicle" works
- "Assign Driver" modal works
- No CORS errors
- No 500 server errors

---

## ⚠️ **Troubleshooting**

### If you still get entity errors after reset:

1. **Check Railway logs** for migration errors
2. **Verify SHOW TABLES returns empty** (or new UUID tables)
3. **Try manual redeploy** from Railway dashboard
4. **Check connection string** in Railway (should match appsettings.json)

### If CORS errors persist:

1. Check Railway Variables tab has `AllowedOrigins` set
2. Verify no typos in the JSON array
3. Redeploy after adding variables

### If migrations don't run:

1. Check Railway environment is set to **Production**
2. Verify `Program.cs` has `app.Environment.IsProduction()` check
3. Check Railway logs for migration messages

---

## 🚀 **Quick Start After Reset**

```bash
# 1. Reset database in Railway Dashboard
#    (Run DROP TABLE commands)

# 2. Wait for Railway to redeploy
#    (Check Deployments tab for "Active" status)

# 3. Test endpoints
cd /c/Users/MSI/Desktop/vms
bash test-railway-endpoints.sh

# 4. Start frontend
cd fleet-tracker-frontend
npm run dev

# 5. Register first user at http://localhost:3000/signup
```

---

## 📝 **Summary**

**Problem**: Database has mixed int/Guid schema causing entity save errors

**Solution**: Drop all tables → Let Railway auto-run migrations → Fresh UUID schema

**Time**: 5-10 minutes (mostly waiting for Railway redeploy)

**Data Loss**: Yes, all existing data deleted (expected for development reset)

---

**Need help?** Let me know which method you're using and I'll guide you through it step-by-step! 🚀
