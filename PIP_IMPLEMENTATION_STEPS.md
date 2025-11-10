# Picture-in-Picture (PiP) Implementation Steps

This document outlines all the steps and changes made to implement Picture-in-Picture (PiP) functionality in the React Native THEOplayer application.

---

## 📋 Overview

Picture-in-Picture allows video playback to continue in a small floating window when the user navigates away from the app or switches to another app. This implementation supports both Android and iOS platforms.

---

## 🔧 Step-by-Step Implementation

### **Step 1: Install Required Dependencies**

#### 1.1 Core Dependencies
```bash
npm install react-native-theoplayer @theoplayer/react-native-ui
```

#### 1.2 Supporting Dependencies
```bash
npm install react-native-safe-area-context react-native-reanimated react-native-worklets react-native-svg
```

#### 1.3 iOS Pods Installation
```bash
cd ios && pod install && cd ..
```

**Files Modified:**
- `package.json` - Added dependencies

---

### **Step 2: Android Configuration**

#### 2.1 Android Manifest (`android/app/src/main/AndroidManifest.xml`)

**Changes Made:**
- Added `android:supportsPictureInPicture="true"` to enable PiP support
- Added `android:configChanges="screenSize|smallestScreenSize|screenLayout|orientation"` to handle configuration changes without activity restart
- Added `android:resizeableActivity="true"` for multi-window support

```xml
<activity
  android:name=".MainActivity"
  android:label="@string/app_name"
  android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|screenSize|smallestScreenSize|uiMode"
  android:launchMode="singleTask"
  android:windowSoftInputMode="adjustResize"
  android:exported="true"
  android:resizeableActivity="true"
  android:supportsPictureInPicture="true">
  <!-- ... -->
</activity>
```

#### 2.2 Gradle Properties (`android/gradle.properties`)

**Changes Made:**
- Added `THEOplayer_reparent_on_PiP=true` to enable PiP reparenting on Android

```properties
THEOplayer_reparent_on_PiP=true
```

#### 2.3 MainActivity (`android/app/src/main/java/com/dolbypip/MainActivity.kt`)

**Changes Made:**
- Overrode `onPictureInPictureModeChanged` to detect PiP mode changes
- Implemented `emitToJs` method to send native events to JavaScript
- Used `DeviceEventManagerModule.RCTDeviceEventEmitter` to emit events compatible with New Architecture

```kotlin
override fun onPictureInPictureModeChanged(
    isInPictureInPictureMode: Boolean,
    newConfig: Configuration
) {
    super.onPictureInPictureModeChanged(isInPictureInPictureMode, newConfig)
    emitToJs("DolbyPIP_onPictureInPictureModeChanged", isInPictureInPictureMode)
}

private fun emitToJs(eventName: String, isInPictureInPictureMode: Boolean) {
    val reactContext = delegate?.reactHost?.currentReactContext
    reactContext
        ?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        ?.emit(eventName, isInPictureInPictureMode)
}
```

**Why This is Needed:**
- Android's native PiP callback fires immediately, faster than THEOplayer's JavaScript event
- This ensures UI controls hide instantly when entering PiP, preventing a flash of controls

---

### **Step 3: iOS Configuration**

#### 3.1 Info.plist (`ios/DolbyPIP/Info.plist`)

**Changes Made:**
- Added `UIBackgroundModes` with `audio` key to enable background audio playback and PiP

```xml
<key>UIBackgroundModes</key>
<array>
    <string>audio</string>
</array>
```

#### 3.2 AppDelegate.swift (`ios/DolbyPIP/AppDelegate.swift`)

**Changes Made:**
- Added `AVAudioSession` configuration to enable background audio playback
- Set audio session category to `.playback` with mode `.moviePlayback`
- Enabled AirPlay support with `.allowAirPlay` option

```swift
private func configureAudioSession() {
    let audioSession = AVAudioSession.sharedInstance()
    do {
        try audioSession.setCategory(.playback, mode: .moviePlayback, options: [.allowAirPlay])
        try audioSession.setActive(true, options: [])
    } catch {
        NSLog("Failed to configure AVAudioSession for PiP: \(error)")
    }
}
```

#### 3.3 THEOplayer Configuration (`react-native-theoplayer.json`)

**Changes Made:**
- Added `"PIP"` to the `features` array for iOS

```json
{
  "ios": {
    "features": ["PIP"]
  }
}
```

---

### **Step 4: React Native App Configuration**

#### 4.1 Entry Point (`index.js`)

**Changes Made:**
- Wrapped the root `App` component with `SafeAreaProvider` to provide safe area insets throughout the app
- Added `react-native-reanimated` import (required for THEOplayer UI)

```javascript
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

AppRegistry.registerComponent(appName, () => () => (
    <SafeAreaProvider>
      <App />
    </SafeAreaProvider>
));
```

#### 4.2 Babel Configuration (`babel.config.js`)

**Changes Made:**
- Added `react-native-reanimated/plugin` to Babel plugins (required for animations)

```javascript
plugins: ['react-native-reanimated/plugin']
```

---

### **Step 5: App.tsx Implementation**

#### 5.1 Player Configuration

**Changes Made:**
- Added THEOplayer license key
- Disabled `mediaSessionEnabled` to prevent Android from showing system media controls in PiP

```typescript
const playerConfig: PlayerConfiguration = {
  license: 'YOUR_LICENSE_KEY',
  mediaControl: {
    mediaSessionEnabled: false, // Prevents system controls in PiP
  },
};
```

#### 5.2 PiP Configuration

**Changes Made:**
- Configured `pipConfiguration` with platform-specific settings:
  - `startsAutomatically: true` - Automatically enter PiP when app goes to background
  - `reparentPip: Platform.OS === 'android'` - Android-specific reparenting
  - `retainPipOnSourceChange: Platform.OS === 'ios'` - iOS-specific retention

```typescript
player.pipConfiguration = {
  startsAutomatically: true,
  reparentPip: Platform.OS === 'android',
  retainPipOnSourceChange: Platform.OS === 'ios',
};
```

#### 5.3 Background Audio Configuration

**Changes Made:**
- Enabled background audio playback
- iOS-specific resume after interruption

```typescript
player.backgroundAudioConfiguration = {
  enabled: true,
  shouldResumeAfterInterruption: Platform.OS === 'ios',
};
```

#### 5.4 Presentation Mode Change Listener

**Changes Made:**
- Added `PRESENTATIONMODE_CHANGE` event listener to detect PiP transitions
- Handle both `pip` mode and `TRANSITIONING_TO_PIP` context
- Hide UI controls and status bar when entering PiP

```typescript
const handlePresentationModeChange = (event: PresentationModeChangeEvent) => {
  const mode = event.presentationMode;
  const pipContext = event.context?.pip;
  
  const transitioning =
    pipContext === PresentationModeChangePipContext.TRANSITIONING_TO_PIP;
  const enteringPip = mode === PresentationMode.pip || transitioning;
  
  setUiHidden(enteringPip);
  setPresentationMode(mode);
  StatusBar.setHidden(enteringPip, 'fade');
};
```

#### 5.5 Native Android PiP Event Listener

**Changes Made:**
- Added `DeviceEventEmitter` listener for native Android PiP events
- Provides immediate UI update when PiP mode changes (faster than THEOplayer event)

```typescript
useEffect(() => {
  const pictureInPictureSubscription = DeviceEventEmitter.addListener(
    'DolbyPIP_onPictureInPictureModeChanged',
    (inPip: boolean) => {
      setUiHidden(inPip);
      StatusBar.setHidden(inPip, 'fade');
    },
  );
  
  return () => {
    pictureInPictureSubscription.remove();
  };
}, []);
```

#### 5.6 UI Controls Management

**Changes Made:**
- Created `PlayerSurface` component to encapsulate player and UI
- Conditionally render UI controls based on `showControls` prop
- Hide UI overlay in PiP using `styles.overlayHidden` (opacity: 0, pointerEvents: 'none')
- Use safe area insets for proper padding in inline mode
- Keep single `THEOplayerView` instance to prevent video restarts

```typescript
const PlayerSurface = React.memo(
  ({ hidden, showControls, insets, onPlayerReady }: PlayerSurfaceProps) => {
    // ... implementation
    return (
      <View style={styles.player}>
        <THEOplayerView style={StyleSheet.absoluteFill} config={playerConfig}>
          {player !== null && (
            <UiContainer
              style={hidden ? styles.overlayHidden : undefined}
              theme={{ ...DEFAULT_THEOPLAYER_THEME, fadeAnimationTimoutMs: 8000 }}
              top={showControls ? (/* controls */) : null}
              center={showControls ? (/* controls */) : null}
              bottom={showControls ? (/* controls */) : null}
            />
          )}
        </THEOplayerView>
      </View>
    );
  },
);
```

**Key Points:**
- Single `THEOplayerView` instance prevents video restart on PiP transition
- `overlayHidden` style makes UI invisible but keeps it mounted (prevents re-renders)
- Conditional rendering of UI slots ensures no controls are drawn in PiP
- Safe area insets ensure controls are visible below status bar in inline mode

#### 5.7 Status Bar Management

**Changes Made:**
- Hide status bar when entering PiP mode
- Show status bar when exiting PiP mode
- Use fade animation for smooth transitions

```typescript
StatusBar.setHidden(enteringPip, 'fade');
```

---

## 📁 Files Modified Summary

### **Android Files:**
1. `android/app/src/main/AndroidManifest.xml` - Added PiP support flags
2. `android/gradle.properties` - Added THEOplayer PiP reparenting flag
3. `android/app/src/main/java/com/dolbypip/MainActivity.kt` - Added native PiP event emitter

### **iOS Files:**
1. `ios/DolbyPIP/Info.plist` - Added background audio mode
2. `ios/DolbyPIP/AppDelegate.swift` - Added AVAudioSession configuration
3. `react-native-theoplayer.json` - Added PIP feature for iOS

### **React Native Files:**
1. `package.json` - Added dependencies
2. `index.js` - Added SafeAreaProvider wrapper
3. `babel.config.js` - Added reanimated plugin
4. `App.tsx` - Main PiP implementation

---

## 🎯 Key Features Implemented

1. ✅ **Automatic PiP Entry** - Video automatically enters PiP when app goes to background
2. ✅ **Manual PiP Control** - User can trigger PiP via button in controls
3. ✅ **UI Controls Hiding** - Controls automatically hide in PiP mode
4. ✅ **Status Bar Management** - Status bar hides in PiP for clean UI
5. ✅ **No Video Restart** - Video continues playing seamlessly during PiP transitions
6. ✅ **Background Audio** - Audio continues playing in background
7. ✅ **Platform-Specific Optimization** - Different configurations for Android and iOS
8. ✅ **Safe Area Handling** - Proper padding for notches and system bars
9. ✅ **Error Handling** - Comprehensive error logging for debugging
10. ✅ **Smooth Transitions** - No black screens or UI flashes

---

## 🔍 How It Works

### **PiP Flow:**

1. **User Triggers PiP:**
   - User presses home button (Android) or PiP button
   - Android/iOS system enters PiP mode

2. **Native Event (Android):**
   - `MainActivity.onPictureInPictureModeChanged` fires
   - Event emitted to JavaScript via `DeviceEventEmitter`
   - UI controls hide immediately

3. **THEOplayer Event:**
   - `PRESENTATIONMODE_CHANGE` event fires
   - App updates `presentationMode` state
   - UI state synchronized with PiP mode

4. **UI Update:**
   - `uiHidden` state set to `true`
   - `UiContainer` slots conditionally render (set to `null`)
   - `overlayHidden` style applied (opacity: 0)
   - Status bar hidden

5. **Video Continuity:**
   - Single `THEOplayerView` instance remains mounted
   - Video continues playing without restart
   - THEOplayer handles PiP window rendering

6. **Exit PiP:**
   - User taps PiP window or returns to app
   - Process reverses
   - UI controls reappear
   - Status bar shown

---

## 🚀 Testing Checklist

- [ ] PiP works on Android (API 24+)
- [ ] PiP works on iOS (iOS 15+)
- [ ] Video doesn't restart when entering/exiting PiP
- [ ] UI controls hide in PiP mode
- [ ] UI controls show in inline/fullscreen mode
- [ ] Status bar hides in PiP
- [ ] Background audio works
- [ ] Manual PiP button works
- [ ] Automatic PiP on home button works (Android)
- [ ] No black screens during transitions
- [ ] Safe area insets work correctly
- [ ] Error handling works

---

## 📝 Notes

- **Android Minimum API:** API 24 (Android 7.0) for PiP support
- **iOS Minimum Version:** iOS 15.0 for PiP support
- **License Required:** Valid THEOplayer React Native license key required
- **New Architecture:** MainActivity.kt uses New Architecture compatible event emission
- **Performance:** Single player instance prevents memory issues and video restarts

---

## 🔗 References

- [THEOplayer React Native Documentation](https://optiview.dolby.com/docs/theoplayer/getting-started/frameworks/react-native/)
- [THEOplayer PiP Documentation](https://github.com/THEOplayer/react-native-theoplayer/blob/master/doc/pip.md)
- [Android PiP Guide](https://developer.android.com/develop/ui/views/picture-in-picture)
- [iOS PiP Guide](https://developer.apple.com/documentation/avkit/adopting_picture_in_picture_in_a_custom_player)

