import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

export const lightTheme = {
  background: '#fff',
  text: '#333',
  textSecondary: '#666',
  primary: '#007AFF',
  border: '#f0f0f0',
  card: '#f9f9f9',
  cardBorder: '#eee',
  error: '#DC2626',
  errorBg: '#FEF2F2',
  success: '#10B981',
  buttonBg: '#f0f0f0',
  buttonText: '#007AFF',
  overlay: 'rgba(255,255,255,0.8)',
};

export const darkTheme = {
  background: '#1A1A1A',
  text: '#E5E5E5',
  textSecondary: '#A3A3A3',
  primary: '#0A84FF',
  border: '#333333',
  card: '#2A2A2A',
  cardBorder: '#404040',
  error: '#EF4444',
  errorBg: '#450A0A',
  success: '#059669',
  buttonBg: '#333333',
  buttonText: '#0A84FF',
  overlay: 'rgba(0,0,0,0.8)',
};

type Theme = typeof lightTheme;

const ThemeContext = createContext<{
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}>({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    setIsDark(systemColorScheme === 'dark');
  }, [systemColorScheme]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider 
      value={{ 
        theme: isDark ? darkTheme : lightTheme,
        isDark,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 