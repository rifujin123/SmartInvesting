import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, ColorScheme } from './tokens';

const THEME_KEY = '@smartinvesting_theme';

type ThemeMode = 'light' | 'dark' | 'auto';

type ThemeColors = (typeof colors)[ColorScheme];

interface ThemeContextValue {
  mode: ThemeMode;
  scheme: ColorScheme;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme() ?? 'dark';
  const [mode, setModeState] = useState<ThemeMode>('auto');
  const [scheme, setScheme] = useState<ColorScheme>(systemScheme);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_KEY);
        if (saved && (saved === 'light' || saved === 'dark' || saved === 'auto')) {
          setModeState(saved);
          if (saved === 'auto') {
            setScheme(systemScheme);
          } else {
            setScheme(saved);
          }
        }
      } catch {
        // Ignore load errors
      }
    };
    void loadTheme();
  }, [systemScheme]);

  useEffect(() => {
    if (mode === 'auto') {
      setScheme(systemScheme);
    }
  }, [mode, systemScheme]);

  const setMode = useCallback(async (newMode: ThemeMode) => {
    setModeState(newMode);
    if (newMode === 'auto') {
      setScheme(systemScheme);
    } else {
      setScheme(newMode);
    }
    try {
      await AsyncStorage.setItem(THEME_KEY, newMode);
    } catch {
      // Ignore save errors
    }
  }, [systemScheme]);

  const value: ThemeContextValue = {
    mode,
    scheme,
    colors: colors[scheme],
    setMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
