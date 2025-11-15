# UUID Migration Instructions

## ⚠️ Important: Data Migration Required

The migration from `int` IDs to `Guid` UUIDs requires special handling because MySQL cannot directly convert `int` columns to `char(36)` (UUID format) without data loss.

## Option 1: Empty Database / Development (Recommended for Fresh Start)

If you're okay with losing existing data (or the database is empty):

```bash
# Remove the auto-generated migration
dotnet ef migrations remove

# Drop the database (CAUTION: This deletes all data!)
dotnet ef database drop --force

# Create a fresh migration with Guid support
dotnet ef migrations add InitialCreateWithGuid

# Apply the migration
dotnet ef database update
```

## Option 2: Production Database with Existing Data

If you have existing data that must be preserved, you'll need a manual migration script:

1. **Backup your database first!**
2. Create new `char(36)` columns for each ID
3. Generate UUIDs for existing records
4. Update foreign key relationships
5. Drop old columns

This is complex and should be done manually with SQL scripts.

## Option 3: Modify the Auto-Generated Migration

The auto-generated migration (`ConvertIdsToGuid`) tries to directly alter columns, which will fail with existing data. You would need to manually edit it to:
1. Add new Guid columns
2. Generate UUIDs for existing rows
3. Update foreign keys
4. Drop old columns

## Current Status

✅ **Code Updated**: All models, DTOs, services, and controllers now use `Guid`  
✅ **Frontend Updated**: All types now expect UUIDs as strings  
⚠️ **Database Migration**: Needs to be applied (see options above)

## After Migration

Once the database is migrated:
1. The backend will start successfully
2. The 500 errors should be resolved
3. The frontend will work with UUIDs

## Testing

After migration, test:
- ✅ Vehicle CRUD operations
- ✅ User registration/login
- ✅ JWT tokens with UUID user IDs
- ✅ All API endpoints

