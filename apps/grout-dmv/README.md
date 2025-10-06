# RoadReady - DMV Test Prep App 🚗

A comprehensive DMV test preparation app built with Expo and React Native, featuring local-first data storage with SQLite (native) and IndexedDB (web).

## Features

### Core Functionality
- **Practice by Category**: Study specific topics (Road Signs, Traffic Laws, Safe Driving, Parking, Right of Way, Emergency)
- **Full DMV Tests**: Timed practice tests simulating real DMV conditions
- **Test Reports**: Detailed analysis of test performance with question-by-question review
- **Progress Tracking**: Monitor your learning progress across categories
- **Bookmarks**: Save difficult questions for later review
- **Study Plan**: 7-day structured study plan with daily tasks
- **Daily Goals**: Track daily question completion with progress visualization

### Data Storage
- **Local-First Architecture**: All data stored locally on device
- **Platform-Specific Storage**:
  - **Native (iOS/Android)**: SQLite database via expo-sqlite
  - **Web**: IndexedDB for structured data storage
- **Database Tables**:
  - `user_profile`: User preferences and settings
  - `test_results`: Complete test history with questions and answers
  - `bookmarks`: Saved questions for review
  - `study_plan`: Daily study progress tracking
  - `settings`: Key-value store for app settings (theme, onboarding, daily goals)

### Settings Storage (Key-Value)
- `theme`: User's theme preference (light/dark/auto)
- `onboarding`: Onboarding completion status and selections
- `daily_goal_date`: Current date for daily goal tracking
- `daily_goal_progress`: Number of questions answered today

### UI/UX Features
- **Theme Support**: Light, Dark, and Auto modes with smooth transitions
- **Responsive Design**: Optimized for phones and tablets
- **Traffic Signal Theme**: Color scheme inspired by traffic lights (Red/Yellow/Green)
- **Animated Logo**: Custom RoadReady logo with traffic light animation
- **Study Reminders**: Encouragement to maintain study streaks

### Development Features
- **Mock Data Generator**: Insert test data for development testing
- **Database Migrations**: Manual migration tool for schema updates
- **Error Handling**: Comprehensive error handling across all database operations

## Get Started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

3. Run on your preferred platform:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser
   - Scan QR code with Expo Go app for physical device

## Project Structure

```
app/
├── (tabs)/              # Tab navigation screens
│   ├── index.tsx        # Home/Dashboard
│   ├── categories.tsx   # Practice categories
│   ├── explore.tsx      # Tips and features
│   └── profile.tsx      # User profile and settings
├── practice/[category].tsx  # Category practice mode
├── test/[state].tsx     # Full DMV test
├── report/[testId].tsx  # Test result report
├── setup.tsx            # Test setup screen
├── onboarding.tsx       # First-time user onboarding
├── splash.tsx           # Splash screen
├── bookmarks.tsx        # Bookmarked questions
├── progress.tsx         # Learning progress
├── study-plan.tsx       # 7-day study plan
└── privacy-policy.tsx   # Privacy policy

components/
├── themed-text.tsx      # Themed text component
├── themed-view.tsx      # Themed view component
├── app-header.tsx       # App header with logo
├── logo.tsx             # Animated RoadReady logo
├── daily-goal.tsx       # Daily goal tracker
├── study-reminder.tsx   # Study reminder card
└── theme-toggle.tsx     # Theme switcher

utils/
├── database.ts          # SQLite database (native)
├── database.web.ts      # IndexedDB implementation (web)
├── indexeddb.ts         # IndexedDB utilities
├── storage.ts           # Storage abstraction layer
├── local-db.ts          # Local database wrapper
└── mock-data.ts         # Mock data generator

constants/
├── questions.ts         # Question database
├── states.ts            # US states with passing scores
├── test-types.ts        # License types and categories
├── types.ts             # TypeScript types
└── theme.ts             # Theme colors and configuration
```

## Database Schema

### user_profile
- `id`: INTEGER PRIMARY KEY
- `selected_state`: TEXT
- `selected_test_type`: TEXT
- `theme`: TEXT (light/dark/auto)
- `created_at`: INTEGER
- `updated_at`: INTEGER

### test_results
- `id`: TEXT PRIMARY KEY
- `state_code`: TEXT
- `score`: INTEGER
- `total_questions`: INTEGER
- `correct_answers`: INTEGER
- `category`: TEXT
- `license_test_type`: TEXT
- `completed_at`: INTEGER
- `time_spent`: INTEGER
- `test_type`: TEXT (full-test/practice)
- `questions`: TEXT (JSON)
- `user_answers`: TEXT (JSON)
- `is_correct`: TEXT (JSON)

### bookmarks
- `id`: TEXT PRIMARY KEY
- `question`: TEXT
- `options`: TEXT (JSON)
- `correct_answer`: INTEGER
- `category`: TEXT
- `state_code`: TEXT
- `explanation`: TEXT
- `created_at`: INTEGER

### settings (Key-Value Store)
- `id`: INTEGER PRIMARY KEY
- `key`: TEXT UNIQUE
- `value`: TEXT
- `updated_at`: INTEGER

## Development

### Mock Data
In development mode, use the "Insert Mock Data" button in Profile settings to generate test data.

### Database Migrations
Run migrations manually via "Run Migrations" button in Profile settings (dev mode only).

### Theme Testing
Test all three theme modes (Light/Dark/Auto) using the theme toggle in Profile settings.

## Technical Highlights

### Platform-Specific Implementation
- Uses `.web.ts` extension for web-specific implementations
- Native platforms use SQLite via expo-sqlite
- Web platform uses IndexedDB for structured storage

### Error Handling
- Comprehensive try-catch blocks in all database operations
- Graceful fallbacks for database initialization failures
- User-friendly error messages

### Performance
- Local-first architecture for instant data access
- Efficient database queries with proper indexing
- Optimized re-renders with React hooks

### Data Privacy
- All data stored locally on device
- No external API calls or data transmission
- User data never leaves the device

## Technologies Used

- **Framework**: Expo SDK 54
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **Database**: expo-sqlite (native), IndexedDB (web)
- **UI**: React Native, Expo Vector Icons
- **State Management**: React Hooks
- **Styling**: StyleSheet API with theme support

## License

MIT
