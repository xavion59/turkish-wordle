import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeColors, ThemeMode } from '../types';
import { lightColors, darkColors } from '../utils/constants';

interface ThemeContextType {
  theme: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>('system');

  const isDark =
    theme === 'system' ? systemColorScheme === 'dark' : theme === 'dark';

  const colors = isDark ? darkColors : lightColors;

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    AsyncStorage.setItem('@theme', newTheme).catch((e) =>
      console.error('Failed to save theme:', e)
    );
  }, []);

  useEffect(() => {
    AsyncStorage.getItem('@theme').then((saved) => {
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        setThemeState(saved as ThemeMode);
      }
    }).catch((e) => console.error('Failed to load theme:', e));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, colors, isDark, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
