import { Stack } from 'expo-router';
import { ThemeProvider as CustomThemeProvider } from '../src/theme/ThemeContext';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

export default function Layout() {
  const [loaded] = useFonts({
    // Add your fonts here if needed
  });

  if (!loaded) {
    return null;
  }

  return (
    <CustomThemeProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </CustomThemeProvider>
  );
}
