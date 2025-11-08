import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import type {
  ErrorEvent,
  PresentationModeChangeEvent,
  SourceDescription,
} from 'react-native-theoplayer';
import {
  PlayerConfiguration,
  PlayerEventType,
  PresentationMode,
  THEOplayer,
} from 'react-native-theoplayer';
import {
  THEOplayerDefaultUi,
  UIFeature,
} from '@theoplayer/react-native-ui';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';


const playerConfig: PlayerConfiguration = {
  license: 'sZP7IYe6T6P1IKIK0uAgCZkgIDxKFSaoIuR-CSfo0mkKTDCc0DhtIuft3SC6FOPlUY3zWokgbgjNIOf9fKPe3Qac3L3eFSCrID0-3QxgTOz_IlUKFD0L3SBL3L46Cl4e36fVfK4_bQgZCYxNWoryIQXzImf90Sbt0u5Z3lai0u5i0Oi6Io4pIYP1UQgqWgjeCYxgflEc3Lhc3uCi0Sfc0SfcFOPeWok1dDrLYtA1Ioh6TgV6v6fVfKcqCoXVdQjLUOfVfGxEIDjiWQXrIYfpCoj-fgzVfKxqWDXNWG3ybojkbK3gflNWf6E6FOPVWo31WQ1qbta6FOPzdQ4qbQc1sD4ZFK3qWmPUFOPLIQ-LflNWfKXpIwPqdDa6Ymi6bo4pIXjNWYAZIY3LdDjpflNzbG4gFOPKIDXzUYPgbZf9DZPEIY3if6i6UQ1gWoXebZPUya', // insert THEOplayer React Native license here
  mediaControl: {
    mediaSessionEnabled: false,
  },
};

const source: SourceDescription = {
  sources: [
    {
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      type: 'video/mp4',
    },
  ],
};

function App(): React.JSX.Element {
  const playerRef = useRef<THEOplayer | null>(null);
  const presentationModeListenerRef = useRef<
    ((event: PresentationModeChangeEvent) => void) | null
  >(null);
  const errorListenerRef = useRef<((event: ErrorEvent) => void) | null>(null);
  const [presentationMode, setPresentationMode] = useState<PresentationMode>(
    PresentationMode.inline,
  );
  const [uiHidden, setUiHidden] = useState(false);
  const insets = useSafeAreaInsets();

  const containerStyle = [
    styles.root,
    {
      paddingTop:
        insets.top > 0
          ? insets.top
          : Platform.OS === 'android'
            ? StatusBar.currentHeight ?? 0
            : 0,
      paddingBottom: insets.bottom,
    },
  ];

  const onPlayerReady = useCallback((player: THEOplayer) => {
    console.log('THEOplayer ready');
    playerRef.current = player;

    const handlePresentationModeChange = (
      event: PresentationModeChangeEvent,
    ) => {
      const mode = event.presentationMode;
      setPresentationMode(mode);
      setUiHidden(mode === PresentationMode.pip);
    };

    const handleError = (event: ErrorEvent) => {
      const error = (event.error as unknown) as Record<string, unknown> | undefined;
      const errorCode = typeof error?.errorCode === 'string' ? (error.errorCode as string) : undefined;
      const errorMessage =
        typeof error?.errorMessage === 'string' ? (error.errorMessage as string) : undefined;
      console.log('THEOplayer error', {
        errorCode,
        errorMessage,
        raw: error,
      });
    };

    if (presentationModeListenerRef.current) {
      player.removeEventListener(
        PlayerEventType.PRESENTATIONMODE_CHANGE,
        presentationModeListenerRef.current,
      );
    }
    if (errorListenerRef.current) {
      player.removeEventListener(
        PlayerEventType.ERROR,
        errorListenerRef.current,
      );
    }

    presentationModeListenerRef.current = handlePresentationModeChange;
    errorListenerRef.current = handleError;

    player.addEventListener(
      PlayerEventType.PRESENTATIONMODE_CHANGE,
      handlePresentationModeChange,
    );
    player.addEventListener(PlayerEventType.ERROR, handleError);

    player.autoplay = true;
    player.pipConfiguration = {
      startsAutomatically: true,
      reparentPip: Platform.OS === 'android',
      retainPipOnSourceChange: Platform.OS === 'ios',
    };
    player.backgroundAudioConfiguration = {
      enabled: true,
      shouldResumeAfterInterruption: Platform.OS === 'ios',
    };
    player.source = source;
    setPresentationMode(player.presentationMode);
    setUiHidden(player.presentationMode === PresentationMode.pip);
  }, []);

  useEffect(() => {
    return () => {
      const player = playerRef.current;
      if (!player) {
        return;
      }

      if (presentationModeListenerRef.current) {
        player.removeEventListener(
          PlayerEventType.PRESENTATIONMODE_CHANGE,
          presentationModeListenerRef.current,
        );
      }
      if (errorListenerRef.current) {
        player.removeEventListener(
          PlayerEventType.ERROR,
          errorListenerRef.current,
        );
      }

      playerRef.current = null;
      presentationModeListenerRef.current = null;
      errorListenerRef.current = null;
    };
  }, []);

  const excludedFeatures = useMemo(() => {
    if (uiHidden) {
      return Object.values(UIFeature).filter(
        (feature): feature is UIFeature => typeof feature === 'number',
      );
    }

    return [UIFeature.Chromecast, UIFeature.PiP];
  }, [uiHidden]);


  return (
    <SafeAreaView style={containerStyle}>
      <THEOplayerDefaultUi
        style={{ flex: 1, }}
        config={playerConfig}
        onPlayerReady={onPlayerReady}
        excludedFeatures={excludedFeatures}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  player: {
    flex: 1,
  },
});

export default App;
