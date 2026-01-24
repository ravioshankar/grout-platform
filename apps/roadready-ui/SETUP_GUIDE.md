# RoadReady UI - Complete Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- For iOS: macOS with Xcode
- For Android: Android Studio
- For Web: Modern browser

### Installation

```bash
cd apps/roadready-ui

# Install dependencies
npm install

# Start the development server
npm start
```

---

## 📱 Running on Different Platforms

### Option 1: Interactive Menu (Recommended)

```bash
npm start
```

Then press:
- **`a`** - Open on Android emulator/device
- **`i`** - Open on iOS simulator (macOS only)
- **`w`** - Open in web browser
- **`r`** - Reload app
- **`m`** - Toggle menu
- **`j`** - Open debugger

### Option 2: Direct Platform Launch

#### Android
```bash
npm run android
# or
npx expo start --android
```

**Requirements:**
- Android Studio installed
- Android emulator running OR
- Physical Android device connected via USB with USB debugging enabled

#### iOS (macOS only)
```bash
npm run ios
# or
npx expo start --ios
```

**Requirements:**
- Xcode installed
- iOS Simulator OR
- Physical iOS device connected

#### Web
```bash
npm run web
# or
npx expo start --web
```

**Access:** Opens automatically at http://localhost:8081

---

## 📲 Testing on Physical Devices

### Using Expo Go App (Easiest)

1. **Install Expo Go:**
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Start the dev server:**
   ```bash
   npm start
   ```

3. **Scan QR Code:**
   - iOS: Use Camera app to scan QR code
   - Android: Use Expo Go app to scan QR code

4. **App loads on your device!**

### Development Build (Advanced)

For production-like testing with native features:

```bash
# Create development build
npx expo run:android
npx expo run:ios
```

---

## 🔧 Platform-Specific Setup

### Android Setup

1. **Install Android Studio:**
   - Download from [developer.android.com](https://developer.android.com/studio)
   - Install Android SDK and emulator

2. **Set up environment variables:**
   ```bash
   # Add to ~/.zshrc or ~/.bashrc
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

3. **Create/Start emulator:**
   ```bash
   # List available emulators
   emulator -list-avds
   
   # Start emulator
   emulator -avd Pixel_5_API_33
   ```

4. **Run app:**
   ```bash
   npm run android
   ```

### iOS Setup (macOS only)

1. **Install Xcode:**
   - Download from Mac App Store
   - Install Command Line Tools:
     ```bash
     xcode-select --install
     ```

2. **Install CocoaPods:**
   ```bash
   sudo gem install cocoapods
   ```

3. **Open iOS Simulator:**
   ```bash
   open -a Simulator
   ```

4. **Run app:**
   ```bash
   npm run ios
   ```

### Web Setup

No additional setup required! Just run:
```bash
npm run web
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Metro bundler not starting"
```bash
# Clear cache and restart
npx expo start -c
```

#### 2. "Module not found" errors
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

#### 3. "Android build failed"
```bash
# Clean Android build
cd android
./gradlew clean
cd ..
npm run android
```

#### 4. "iOS build failed"
```bash
# Clean iOS build
cd ios
pod install
cd ..
npm run ios
```

#### 5. "Web not loading"
```bash
# Clear web cache
rm -rf .expo
npm run web
```

#### 6. "SQLite not working on web"
- This is expected! Web uses IndexedDB instead
- The app automatically handles this

---

## 🎯 Development Workflow

### Recommended Setup

1. **Start dev server:**
   ```bash
   npm start
   ```

2. **Open on multiple platforms simultaneously:**
   - Press `w` for web (instant reload)
   - Press `a` for Android (for native testing)
   - Press `i` for iOS (for native testing)

3. **Enable Fast Refresh:**
   - Automatically enabled
   - Saves and reloads on file changes

4. **Use React DevTools:**
   ```bash
   # Press 'j' in terminal to open debugger
   ```

---

## 📦 Building for Production

### Android APK

```bash
# Build APK
eas build --platform android --profile preview

# Or local build
npx expo run:android --variant release
```

### iOS IPA

```bash
# Build IPA (requires Apple Developer account)
eas build --platform ios --profile preview
```

### Web Build

```bash
# Build static web app
npx expo export:web

# Output in web-build/
```

---

## 🔍 Testing Features

### Test Database Features

1. **Go to Profile tab**
2. **Scroll to Developer Tools** (dev mode only)
3. **Click "Insert Mock Data"** - Adds sample test results
4. **Click "Run Migrations"** - Updates database schema

### Test All Platforms

```bash
# Terminal 1: Start dev server
npm start

# Terminal 2: Test web
npm run web

# Terminal 3: Test Android (if available)
npm run android

# Terminal 4: Test iOS (if available)
npm run ios
```

---

## 🎨 Customization

### Change App Name

Edit `app.json`:
```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug"
  }
}
```

### Change App Icon

Replace files in `assets/images/`:
- `icon.png` - App icon (1024x1024)
- `splash-icon.png` - Splash screen icon
- `favicon.png` - Web favicon

### Change Theme Colors

Edit `constants/theme.ts`:
```typescript
export const Colors = {
  light: {
    primary: '#your-color',
    // ...
  }
}
```

---

## 📊 Performance Optimization

### Enable Hermes (Android)

Already enabled in `app.json`:
```json
{
  "expo": {
    "android": {
      "jsEngine": "hermes"
    }
  }
}
```

### Enable New Architecture

Already enabled in `app.json`:
```json
{
  "expo": {
    "newArchEnabled": true
  }
}
```

### Optimize Bundle Size

```bash
# Analyze bundle
npx expo export --dump-sourcemap

# Remove unused dependencies
npm prune
```

---

## 🔐 Environment Variables

Create `.env` file (optional):
```bash
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_ENV=development
```

Access in code:
```typescript
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
```

---

## 📱 Platform-Specific Code

The app automatically handles platform differences:

**Database:**
- Native (iOS/Android): SQLite
- Web: IndexedDB

**Storage:**
- Native: AsyncStorage
- Web: localStorage

**File Extensions:**
- `.native.ts` - Native only
- `.web.ts` - Web only
- `.ts` - All platforms

---

## 🚀 Deployment

### Expo Application Services (EAS)

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login:**
   ```bash
   eas login
   ```

3. **Configure:**
   ```bash
   eas build:configure
   ```

4. **Build:**
   ```bash
   # Android
   eas build --platform android
   
   # iOS
   eas build --platform ios
   
   # Both
   eas build --platform all
   ```

5. **Submit to stores:**
   ```bash
   eas submit --platform android
   eas submit --platform ios
   ```

---

## 📚 Useful Commands

```bash
# Development
npm start              # Start dev server
npm run android        # Run on Android
npm run ios            # Run on iOS
npm run web            # Run on web

# Maintenance
npm run lint           # Check code quality
npm run reset-project  # Reset to clean state

# Expo commands
npx expo start -c      # Start with cache cleared
npx expo doctor        # Check for issues
npx expo upgrade       # Upgrade Expo SDK
npx expo install       # Install compatible packages
```

---

## 🎯 Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Start dev server: `npm start`
3. ✅ Test on web: Press `w`
4. ✅ Test on Android: Press `a` (if available)
5. ✅ Test on iOS: Press `i` (if available)
6. ✅ Make changes and see live reload
7. ✅ Build for production when ready

---

## 📞 Support

**Issues?**
- Check [Expo Documentation](https://docs.expo.dev)
- Check [React Native Documentation](https://reactnative.dev)
- Review error messages in terminal
- Clear cache: `npx expo start -c`

**Platform-Specific:**
- Android: Check Android Studio logs
- iOS: Check Xcode logs
- Web: Check browser console

---

## ✅ Verification Checklist

- [ ] Dependencies installed
- [ ] Dev server starts
- [ ] Web version loads
- [ ] Android version runs (if available)
- [ ] iOS version runs (if available)
- [ ] Database works on all platforms
- [ ] Theme switching works
- [ ] Navigation works
- [ ] All features accessible

---

**Ready to develop!** 🎉

For detailed features, see [CURRENT_FEATURES.md](CURRENT_FEATURES.md)
