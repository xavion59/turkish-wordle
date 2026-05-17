import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { Slot } from 'expo-router';
import { SplashScreen as CustomSplash } from '../src/components/SplashScreen';
import { initCustomWords, loadUsedCustomWords, initUsedCustomWords, loadSettings, loadRemovedWords } from '../src/utils/storage';
import { loadSounds, setSoundEnabled } from '../src/utils/sounds';
import { setRemovedWords } from '../src/utils/wordList';

if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync();
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      SplashScreen.hideAsync();
    }
    (async () => {
      await initCustomWords();
      const used = await loadUsedCustomWords();
      initUsedCustomWords(used);
      const removed = await loadRemovedWords();
      setRemovedWords(removed);
      const settings = await loadSettings();
      setSoundEnabled(settings.soundEnabled);
      loadSounds();
      setReady(true);
    })();
  }, []);

  if (!ready) {
    return <CustomSplash />;
  }

  return (
    <ThemeProvider>
      <Slot />
    </ThemeProvider>
  );
}
