import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import 'react-native-reanimated';

import { FlightsProvider } from '@/lib/FlightsContext';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = { initialRouteName: '(tabs)' };

export default function RootLayout() {
  return (
    <FlightsProvider>
      <ThemeProvider value={DarkTheme}>
        <Stack screenOptions={{ contentStyle: { backgroundColor: '#000000' } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="flight/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="add-flight" options={{ presentation: 'modal', headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </FlightsProvider>
  );
}
