# Table Naming Standardization

## Overview
Standardized table/store naming across all databases to use `test_records` consistently.

## Changes Made

### 1. **SQLite (Native - iOS/Android)**
- **Before**: `test_results` table
- **After**: `test_records` table
- **File**: `utils/database.ts`
- **Migration**: Automatic via `runMigrations()` - renames existing table

### 2. **IndexedDB (Web)**
- **Before**: `test_results` store
- **After**: `test_records` store
- **Files**: 
  - `utils/database.web.ts`
  - `utils/indexeddb.ts`
- **Migration**: Automatic via `runMigrations()` - copies data to new store

### 3. **PostgreSQL (Backend)**
- **Already**: `test_records` table
- **No changes needed**

## Consistent Naming Across All Platforms

| Platform | Database | Table/Store Name |
|----------|----------|------------------|
| iOS/Android | SQLite | `test_records` |
| Web | IndexedDB | `test_records` |
| Backend | PostgreSQL | `test_records` |

## Migration Strategy

### Automatic Migration
Both SQLite and IndexedDB migrations run automatically when the app starts:

**SQLite (Native)**:
```typescript
// In runMigrations()
const tables = await database.getAllAsync(
  "SELECT name FROM sqlite_master WHERE type='table' AND name='test_results'"
);
if (tables.length > 0) {
  await database.execAsync('ALTER TABLE test_results RENAME TO test_records;');
}
```

**IndexedDB (Web)**:
```typescript
// In runMigrations()
if (db.objectStoreNames.contains('test_results')) {
  const oldData = await getAll('test_results');
  for (const record of oldData) {
    await put('test_records', record);
  }
}
```

### No User Action Required
- Migrations run automatically on app startup
- Existing data is preserved
- No data loss
- Seamless transition

## Benefits

1. **Consistency**: Same table name across all platforms
2. **Clarity**: Easier to understand and maintain
3. **Sync**: Simplified sync logic between local and backend
4. **Documentation**: Clearer documentation and code

## Files Modified

### Backend
- No changes (already using `test_records`)

### Frontend
- ✅ `utils/database.ts` - SQLite table renamed
- ✅ `utils/database.web.ts` - IndexedDB store renamed
- ✅ `utils/indexeddb.ts` - Store initialization updated
- ✅ `docs/TEST_RECORDS_SYNC.md` - Documentation updated

### New Files
- ✅ `utils/migrate-table-names.ts` - Migration utility (optional)
- ✅ `docs/TABLE_NAMING_STANDARDIZATION.md` - This document

## Verification

### SQLite (Native)
```typescript
import { getDatabase } from '@/utils/database';
const db = getDatabase();
const tables = await db.getAllAsync(
  "SELECT name FROM sqlite_master WHERE type='table'"
);
// Should include 'test_records'
```

### IndexedDB (Web)
```typescript
import { getDB } from '@/utils/indexeddb';
const db = getDB();
console.log(db.objectStoreNames);
// Should include 'test_records'
```

### PostgreSQL (Backend)
```sql
\dt
-- Should show 'test_records' table
```

## Rollback (If Needed)

If rollback is required, reverse the table names in the same files:
1. Change `test_records` back to `test_results` in `utils/database.ts`
2. Change `test_records` back to `test_results` in `utils/database.web.ts`
3. Change `test_records` back to `test_results` in `utils/indexeddb.ts`

## Status

✅ **Complete** - All databases now use `test_records` consistently
