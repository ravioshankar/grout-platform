# Test Records Sync Architecture

## Overview
The RoadReady app uses a **local-first architecture** with automatic background sync to minimize server calls and provide offline functionality.

## Database Structure

### Client-Side (Local)
- **Native (iOS/Android)**: SQLite database (`test_records` table)
- **Web**: IndexedDB (`test_records` store)

### Server-Side (Backend)
- **PostgreSQL** database (`test_records` table)

## Table Structure (Identical Across All Databases)

```sql
CREATE TABLE test_records (
    id INTEGER/SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    state_code VARCHAR(2) NOT NULL,
    test_type VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    time_spent INTEGER NOT NULL,
    questions TEXT NOT NULL,          -- JSON string
    user_answers TEXT NOT NULL,       -- JSON string
    is_correct TEXT NOT NULL,         -- JSON string
    completed_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE INDEX idx_test_records_user_id ON test_records(user_id);
CREATE INDEX idx_test_records_completed_at ON test_records(completed_at);
```

## Sync Strategy

### 1. **Local-First Approach**
- All test results are **immediately saved to local database** (SQLite/IndexedDB)
- User can continue using the app offline
- No waiting for server responses

### 2. **Background Sync**
- Automatic sync runs **every 5 minutes** when online
- Syncs local records to PostgreSQL backend
- Downloads new records from backend to local database

### 3. **Sync Process**

#### Upload (Local → Backend)
```typescript
// Triggered automatically every 5 minutes
syncTestRecordsToBackend()
  → Get all local test records
  → POST each record to /api/v1/test-records/
  → Track synced/failed counts
```

#### Download (Backend → Local)
```typescript
// Triggered automatically every 5 minutes
syncTestRecordsFromBackend()
  → GET /api/v1/test-records/
  → Save each record to local database
  → Track synced/failed counts
```

## API Endpoints

### POST /api/v1/test-records/
Create new test record
```json
{
  "state_code": "CA",
  "test_type": "full-test",
  "category": "road-signs",
  "score": 85,
  "total_questions": 20,
  "correct_answers": 17,
  "time_spent": 600,
  "questions": "[...]",
  "user_answers": "[...]",
  "is_correct": "[...]"
}
```

### GET /api/v1/test-records/
Get all user's test records
```json
[
  {
    "id": 1,
    "user_id": 123,
    "state_code": "CA",
    "test_type": "full-test",
    ...
  }
]
```

### GET /api/v1/test-records/{test_id}
Get specific test record

## Benefits

### 1. **Offline Support**
- Users can take tests without internet connection
- Data syncs automatically when connection is restored

### 2. **Performance**
- Instant saves to local database
- No waiting for server responses
- Reduced server load

### 3. **Data Redundancy**
- Data exists on both client and server
- Protection against data loss
- Easy backup and restore

### 4. **Scalability**
- Server only handles sync operations
- Most reads happen from local database
- Reduced API calls

## Implementation Files

### Backend
- `app/models/test_record.py` - SQLModel definition
- `app/schemas/test_record.py` - Pydantic schemas
- `app/api/v1/endpoints/test_records.py` - API endpoints
- `alembic/versions/f12347881a84_create_test_records_table.py` - Migration

### Frontend
- `utils/database.ts` - SQLite operations (native) - `test_records` table
- `utils/database.web.ts` - IndexedDB operations (web) - `test_records` store
- `utils/indexeddb.ts` - IndexedDB initialization - `test_records` store
- `utils/sync-test-records.ts` - Sync logic
- `utils/sync-service.ts` - Background sync service
- `app/test/[state].tsx` - Test screen (saves locally + syncs)
- `app/practice/[category].tsx` - Practice screen (saves locally + syncs)

## Migration Status

✅ PostgreSQL table created
✅ SQLite table created (client-side)
✅ IndexedDB store created (web)
✅ API endpoints implemented
✅ Sync utilities implemented
✅ Background sync service configured

## Usage

### Manual Sync
```typescript
import { syncTestRecordsToBackend, syncTestRecordsFromBackend } from '@/utils/sync-test-records';

// Upload local records to backend
const uploadResult = await syncTestRecordsToBackend();
console.log(`Synced: ${uploadResult.synced}, Failed: ${uploadResult.failed}`);

// Download backend records to local
const downloadResult = await syncTestRecordsFromBackend();
console.log(`Synced: ${downloadResult.synced}, Failed: ${downloadResult.failed}`);
```

### Automatic Sync
Sync service automatically initializes and runs every 5 minutes when the app is active.

## Future Enhancements

1. **Conflict Resolution**: Handle cases where same record is modified on both client and server
2. **Delta Sync**: Only sync changed records instead of all records
3. **Compression**: Compress JSON data before syncing
4. **Batch Operations**: Batch multiple records in single API call
5. **Sync Status UI**: Show sync status to users
