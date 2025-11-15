-- ============================================
-- RAILWAY DATABASE RESET SCRIPT
-- ============================================
-- This script will drop all tables and let Entity Framework 
-- recreate them with the proper UUID schema

-- 1. Drop all tables in correct order (child tables first)
DROP TABLE IF EXISTS `Trips`;
DROP TABLE IF EXISTS `Issues`;
DROP TABLE IF EXISTS `MaintenanceRecords`;
DROP TABLE IF EXISTS `Inspections`;
DROP TABLE IF EXISTS `PartsInventory`;
DROP TABLE IF EXISTS `Vehicles`;
DROP TABLE IF EXISTS `Users`;
DROP TABLE IF EXISTS `__EFMigrationsHistory`;

-- 2. Verify all tables are gone
SHOW TABLES;

-- After running this script:
-- 1. The Railway API will auto-run migrations on next deployment
-- 2. All tables will be recreated with UUID (Guid) schema
-- 3. You can register new users and create data

-- ============================================
-- How to run this script:
-- ============================================
-- Option 1: Railway Dashboard
--   1. Go to Railway > Your MySQL Service > Data
--   2. Click "New Query"
--   3. Paste this script
--   4. Click "Run"
--
-- Option 2: MySQL Workbench
--   1. Connect to Railway MySQL:
--      Host: yamanote.proxy.rlwy.net
--      Port: 30869
--      User: root
--      Password: RfeNsJfxGMoLnqbUvVfWPPtXYjvpCUun
--      Database: railway
--   2. Paste and execute this script
--
-- Option 3: Command Line (Git Bash)
--   mysql -h yamanote.proxy.rlwy.net -P 30869 -u root -pRfeNsJfxGMoLnqbUvVfWPPtXYjvpCUun railway < reset-railway-database.sql
-- ============================================
