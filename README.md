This is a [**React Native**](https://reactnative.dev) project with **Picture-in-Picture (PiP)** functionality using [THEOplayer](https://www.theoplayer.com/), bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# 🎬 DolbyPIP - React Native Video Player with PiP Support

This project demonstrates how to implement Picture-in-Picture (PiP) video playback in React Native using THEOplayer SDK. The implementation supports both **Android** and **iOS** platforms with seamless transitions, background audio, and custom UI controls.

## ✨ Features

- ✅ **Picture-in-Picture (PiP)** - Video continues playing in a floating window
- ✅ **Automatic PiP Entry** - Automatically enters PiP when app goes to background (Android)
- ✅ **Manual PiP Control** - User can trigger PiP via button in controls
- ✅ **Background Audio** - Audio continues playing in background
- ✅ **Seamless Transitions** - No video restart when entering/exiting PiP
- ✅ **UI Controls Management** - Controls automatically hide/show based on PiP state
- ✅ **Platform-Specific Optimization** - Optimized for both Android and iOS
- ✅ **Safe Area Support** - Proper handling of notches and system bars

## 📋 Requirements

- **React Native**: 0.82.1+
- **Node.js**: >= 20
- **Android**: API 24+ (Android 7.0+) for PiP support
- **iOS**: iOS 15.0+ for PiP support
- **THEOplayer License**: Valid THEOplayer React Native license key required

## 🚀 Quick Start

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

### Step 1: Install Dependencies

```sh
# Install npm dependencies
npm install

# For iOS, install CocoaPods dependencies
cd ios && pod install && cd ..
```

### Step 2: Configure THEOplayer License

1. Open `App.tsx`
2. Replace the `license` key in `playerConfig` with your valid THEOplayer license:

```typescript
const playerConfig: PlayerConfiguration = {
  license: 'YOUR_THEOPLAYER_LICENSE_KEY',
  // ...
};
```

### Step 3: Run the App

```sh
# Start Metro bundler
npm start

# Run on Android (in a new terminal)
npm run android

# Run on iOS (in a new terminal)
npm run ios
```

## 📁 Project Structure

```
.
├── App.tsx                          # Main React component with PiP logic
├── index.js                         # Entry point with SafeAreaProvider wrapper
├── babel.config.js                  # Babel configuration with reanimated plugin
├── react-native-theoplayer.json     # iOS feature configuration for THEOplayer
├── PIP_IMPLEMENTATION_STEPS.md      # Detailed PiP implementation documentation
├── package.json
├── README.md
├── android/                         # Native Android project
│   ├── app/src/main/
│   │   ├── AndroidManifest.xml      # PiP configuration and permissions
│   │   └── java/com/dolbypip/
│   │       └── MainActivity.kt      # Native PiP event emitter
│   └── gradle.properties            # THEOplayer PiP reparenting flag
├── ios/                             # Native iOS project
│   └── DolbyPIP/
│       ├── Info.plist               # Background audio mode for PiP
│       └── AppDelegate.swift        # AVAudioSession configuration
└── node_modules/
```

## 🔑 Key Files

### React Native Files

- **`App.tsx`**: 
  - Initializes THEOplayer with PiP configuration
  - Handles PiP transitions and UI visibility
  - Manages presentation mode changes
  - Configures background audio

- **`index.js`**: 
  - Wraps app with `SafeAreaProvider` for safe area insets
  - Registers app component

- **`react-native-theoplayer.json`**: 
  - Declares PIP feature for iOS builds

- **`babel.config.js`**: 
  - Configures Babel with `react-native-reanimated/plugin` for animations

### Android Files

- **`android/app/src/main/AndroidManifest.xml`**: 
  - Enables PiP support (`supportsPictureInPicture="true"`)
  - Configures activity for PiP mode changes
  - Sets up resizeable activity

- **`android/app/src/main/java/com/dolbypip/MainActivity.kt`**: 
  - Emits native PiP events to JavaScript
  - Handles `onPictureInPictureModeChanged` callback

- **`android/gradle.properties`**: 
  - Enables THEOplayer PiP reparenting (`THEOplayer_reparent_on_PiP=true`)

### iOS Files

- **`ios/DolbyPIP/Info.plist`**: 
  - Adds `UIBackgroundModes` with `audio` for background playback

- **`ios/DolbyPIP/AppDelegate.swift`**: 
  - Configures `AVAudioSession` for background/PiP playback
  - Sets audio session category to `.playback`

## 📚 Dependencies

### Core Dependencies

- **`react-native-theoplayer`**: THEOplayer React Native SDK
- **`@theoplayer/react-native-ui`**: THEOplayer UI components

### Supporting Dependencies

- **`react-native-safe-area-context`**: Safe area insets for notches/system bars
- **`react-native-reanimated`**: Animations for UI components
- **`react-native-worklets`**: Required for reanimated
- **`react-native-svg`**: SVG support for UI components

## 🔧 PiP Configuration

### Android Configuration

1. **AndroidManifest.xml**: 
   - `android:supportsPictureInPicture="true"` - Enables PiP
   - `android:configChanges` - Handles configuration changes
   - `android:resizeableActivity="true"` - Multi-window support

2. **gradle.properties**: 
   - `THEOplayer_reparent_on_PiP=true` - Enables PiP reparenting

3. **MainActivity.kt**: 
   - Overrides `onPictureInPictureModeChanged` to emit events to JavaScript

### iOS Configuration

1. **Info.plist**: 
   - `UIBackgroundModes` with `audio` - Enables background audio

2. **AppDelegate.swift**: 
   - Configures `AVAudioSession` with `.playback` category

3. **react-native-theoplayer.json**: 
   - Adds `"PIP"` to iOS features array
   - **Note**: After modifying this file, run `cd ios && pod install && cd ..` to apply changes

## 📖 Detailed Documentation

For a complete step-by-step guide on implementing PiP, see **[PIP_IMPLEMENTATION_STEPS.md](./PIP_IMPLEMENTATION_STEPS.md)** which includes:

- Detailed implementation steps
- Code examples and explanations
- Platform-specific configurations
- Troubleshooting guide
- Testing checklist
- References and resources

## 🎯 How PiP Works

1. **User triggers PiP**: User presses home button (Android) or PiP button
2. **Native event**: Android/iOS system enters PiP mode
3. **Event emission**: Native code emits event to JavaScript (Android)
4. **THEOplayer event**: `PRESENTATIONMODE_CHANGE` event fires
5. **UI update**: Controls hide, status bar hides, video continues
6. **Exit PiP**: Process reverses, controls reappear

## 🧪 Testing

### Android Testing

- Test on Android 7.0+ (API 24+)
- Press home button to trigger automatic PiP
- Use PiP button in controls for manual PiP
- Verify video continues playing without restart
- Check that controls hide in PiP mode

### iOS Testing

- Test on iOS 15.0+
- Use PiP button in controls
- Verify background audio works
- Check smooth transitions
- Verify no black screens

## 🐛 Troubleshooting

### Common Issues

1. **Video not playing**: Check THEOplayer license key
2. **PiP not working**: Verify platform requirements (Android 7.0+, iOS 15.0+)
3. **Controls showing in PiP**: Check `uiHidden` state and event listeners
4. **Video restarting**: Ensure single `THEOplayerView` instance
5. **Black screen in PiP**: Check safe area insets and container styles

For more troubleshooting, see [PIP_IMPLEMENTATION_STEPS.md](./PIP_IMPLEMENTATION_STEPS.md).

## 📝 License

This project uses THEOplayer, which requires a valid license. Replace the license key in `App.tsx` with your own THEOplayer license.

## 🔗 Resources

- [THEOplayer React Native Documentation](https://optiview.dolby.com/docs/theoplayer/getting-started/frameworks/react-native/)
- [THEOplayer PiP Documentation](https://github.com/THEOplayer/react-native-theoplayer/blob/master/doc/pip.md)
- [Android PiP Guide](https://developer.android.com/develop/ui/views/picture-in-picture)
- [iOS PiP Guide](https://developer.apple.com/documentation/avkit/adopting_picture_in_picture_in_a_custom_player)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)

---

## 📝 Additional Notes

### Development Tips

- Use **Fast Refresh** for instant updates when modifying `App.tsx`
- For Android: Press <kbd>R</kbd> twice or <kbd>Ctrl</kbd>+<kbd>M</kbd> (Windows/Linux) / <kbd>Cmd ⌘</kbd>+<kbd>M</kbd> (macOS) to reload
- For iOS: Press <kbd>R</kbd> in Simulator to reload
- Build directly from Android Studio or Xcode for native debugging

### Integration

- To integrate this into an existing app, see [React Native Integration guide](https://reactnative.dev/docs/integration-with-existing-apps)
- Ensure all dependencies are installed before building
- Verify THEOplayer license is valid before deploying to production
