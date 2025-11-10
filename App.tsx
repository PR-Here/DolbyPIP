import React, { useCallback, useEffect,  useRef, useState } from 'react';
import {
  DeviceEventEmitter,
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
  PresentationModeChangePipContext,
  THEOplayer,
  THEOplayerView,
} from 'react-native-theoplayer';
import { useSafeAreaInsets, type EdgeInsets } from 'react-native-safe-area-context';
import {
  UiContainer,
  AutoFocusGuide,
  ControlBar,
  Spacer,
  SettingsMenuButton,
  QualitySubMenu,
  PlaybackRateSubMenu,
  CenteredControlBar,
  SkipButton,
  PlayButton,
  SeekBar,
  MuteButton,
  GoToLiveButton,
  TimeLabel,
  PipButton,
  FullscreenButton,
  CenteredDelayedActivityIndicator,
  DEFAULT_THEOPLAYER_THEME,
} from '@theoplayer/react-native-ui';


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

type PlayerSurfaceProps = {
  hidden: boolean;
  showControls: boolean;
  insets: EdgeInsets;
  onPlayerReady: (player: THEOplayer) => void;
};

const PlayerSurface = React.memo(
  ({ hidden, showControls, insets, onPlayerReady }: PlayerSurfaceProps) => {
    const [player, setPlayer] = useState<THEOplayer | null>(null);

    const handleReady = useCallback(
      (readyPlayer: THEOplayer) => {
        setPlayer(readyPlayer);
        onPlayerReady(readyPlayer);
      },
      [onPlayerReady],
    );

    return (
      <View style={styles.player}>
        <THEOplayerView
          style={StyleSheet.absoluteFill}
          config={playerConfig}
          onPlayerReady={handleReady}>
          {player !== null && (
            <UiContainer
              style={hidden ? styles.overlayHidden : undefined}
              theme={{ ...DEFAULT_THEOPLAYER_THEME, fadeAnimationTimoutMs: 8000 }}
              player={player}
              behind={<CenteredDelayedActivityIndicator size={50} />}
              topStyle={{ paddingTop: insets.top }}
              bottomStyle={{ paddingBottom: insets.bottom }}
              top={
                showControls ? (
                  <AutoFocusGuide>
                    <ControlBar>
                      <Spacer />
                      <SettingsMenuButton>
                        <QualitySubMenu />
                        <PlaybackRateSubMenu />
                      </SettingsMenuButton>
                    </ControlBar>
                  </AutoFocusGuide>
                ) : null
              }
              center={
                showControls ? (
                  <AutoFocusGuide>
                    <CenteredControlBar
                      style={{ width: '50%' }}
                      left={<SkipButton skip={-10} />}
                      middle={<PlayButton />}
                      right={<SkipButton skip={30} />}
                    />
                  </AutoFocusGuide>
                ) : null
              }
              bottom={
                showControls ? (
                  <AutoFocusGuide>
                    <ControlBar>
                      <SeekBar />
                    </ControlBar>
                    <ControlBar>
                      <MuteButton />
                      <GoToLiveButton />
                      <TimeLabel showDuration />
                      <Spacer />
                      <PipButton />
                      <FullscreenButton />
                    </ControlBar>
                  </AutoFocusGuide>
                ) : null
              }
            />
          )}
        </THEOplayerView>
      </View>
    );
  },
);

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

  useEffect(() => {
    StatusBar.setHidden(false, 'fade');
    return () => {
      StatusBar.setHidden(false, 'fade');
    };
  }, []);

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

  const onPlayerReady = useCallback((player: THEOplayer) => {
    playerRef.current = player;

    const handlePresentationModeChange = (
      event: PresentationModeChangeEvent,
    ) => {
      const mode = event.presentationMode;
      const pipContext = event.context?.pip;

      const transitioning =
        pipContext === PresentationModeChangePipContext.TRANSITIONING_TO_PIP;
      const enteringPip = mode === PresentationMode.pip || transitioning;

      setUiHidden(enteringPip);
      setPresentationMode(mode);
      StatusBar.setHidden(enteringPip, 'fade');
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

  return (
    <View style={styles.root}>
      <PlayerSurface
        hidden={uiHidden}
        showControls={!uiHidden}
        insets={insets}
        onPlayerReady={onPlayerReady}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  player: {
    flex: 1,
  },
  overlayHidden: {
    opacity: 0,
    pointerEvents: 'none',
  },
});

export default App;
