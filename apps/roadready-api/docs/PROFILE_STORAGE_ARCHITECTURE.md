# Profile Storage Architecture

## Overview
User onboarding profiles follow a hybrid storage model where all profiles are stored in PostgreSQL backend, but only the active profile is synced to local storage (IndexedDB/SQLite).

## Storage Distribution

### Backend (PostgreSQL)
- **All profiles** are stored in `onboarding_profiles` table
- Users can create unlimited profiles
- Profiles persist across devices
- Profiles are backed up and recoverable

### Local Storage (IndexedDB/SQLite)
- **Only active profile** is stored in `settings` table under key `onboarding`
- Contains: `selectedState`, `selectedTestType`, `profileId`, `profileName`
- Used for offline access
- Automatically updated when profile is activated

## Data Flow

### Profile Creation
```
User creates profile → Backend PostgreSQL
                     → Profile stored in onboarding_profiles table
                     → NOT synced to local storage (unless activated)
```

### Profile Activation
```
User activates profile → POST /api/v1/onboarding-profiles/{id}/activate
                       → Backend marks profile as active
                       → Backend updates user.state and user.test_type
                       → Frontend calls syncActiveProfileToLocal()
                       → Active profile synced to local storage
                       → Previous local profile replaced
```

### App Initialization
```
App starts → GET /api/v1/onboarding-profiles/active
          → Sync active profile to local storage
          → Use local profile for offline access
```

### Profile Switching
```
User switches profile → Activate new profile on backend
                      → Sync new active profile to local
                      → Replace old local profile
                      → App uses new profile settings
```

## API Endpoints

### Get Active Profile (for local sync)
```
GET /api/v1/onboarding-profiles/active
Returns: Active profile or null
Purpose: Sync to local storage
```

### Activate Profile
```
POST /api/v1/onboarding-profiles/{id}/activate
Effect: 
- Deactivates all other profiles
- Activates selected profile
- Updates user.state and user.test_type
- Frontend syncs to local storage
```

### List All Profiles
```
GET /api/v1/onboarding-profiles/
Returns: All user profiles (from backend only)
Purpose: Display in profile management UI
```

## Frontend Implementation

### Utility Functions (`utils/profile-sync.ts`)

```typescript
// Sync active profile from backend to local storage
syncActiveProfileToLocal(): Promise<void>

// Activate profile and sync to local
activateProfile(profileId: number): Promise<void>

// Get locally stored profile
getLocalProfile(): Promise<any | null>
```

### Usage Example

```typescript
// On app initialization (splash.tsx)
import { syncActiveProfileToLocal } from '@/utils/profile-sync';
await syncActiveProfileToLocal();

// When user switches profile
import { activateProfile } from '@/utils/profile-sync';
await activateProfile(newProfileId);

// Access local profile for offline use
import { getLocalProfile } from '@/utils/profile-sync';
const profile = await getLocalProfile();
```

## Benefits

1. **Minimal Local Storage**: Only active profile stored locally
2. **Cloud Backup**: All profiles safely stored in PostgreSQL
3. **Cross-Device Sync**: Profiles available on all devices
4. **Offline Access**: Active profile available offline
5. **Fast Switching**: Quick profile activation and sync
6. **Data Efficiency**: No redundant profile data locally

## Migration Path

For existing users with local profiles:
1. On first login after update, sync local profile to backend
2. Create backend profile from local data
3. Mark as active
4. Continue using existing local profile
5. User can create additional profiles in backend

## Security

- All profiles require authentication
- Users can only access their own profiles
- Profile activation requires valid session
- Local storage encrypted by device OS
