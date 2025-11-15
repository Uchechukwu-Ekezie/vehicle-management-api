-- ============================================
-- QUICK RAILWAY DATABASE RESET
-- ============================================
-- Run this in Railway Dashboard > MySQL Service > Data > New Query
-- This will drop all tables and allow fresh migrations

DROP TABLE IF EXISTS `Trips`;

DROP TABLE IF EXISTS `Issues`;

DROP TABLE IF EXISTS `MaintenanceRecords`;

DROP TABLE IF EXISTS `Inspections`;

DROP TABLE IF EXISTS `PartsInventory`;

DROP TABLE IF EXISTS `Vehicles`;

DROP TABLE IF EXISTS `Users`;

DROP TABLE IF EXISTS `__EFMigrationsHistory`;

-- Verify tables are gone
SHOW TABLES;

-- ============================================
-- AFTER RUNNING THIS:
-- 1. Go to Railway > VehicleManagementAPI service
-- 2. Click "Deployments" tab
-- 3. Click on latest deployment > "Redeploy"
-- 4. Wait 2-3 minutes for migrations to run
-- 5. Check logs for "Database migrations applied successfully"
-- ============================================