import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AppContextProvider } from '@/contexts/AppContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: 'welcome',
};

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = 
      segments[0] === 'welcome' || 
      segments[0] === 'login' || 
      segments[0] === 'register' ||
      segments[0] === 'auth';
    const inTabs = segments[0] === '(tabs)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/welcome');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (!isAuthenticated && inTabs) {
      router.replace('/welcome');
    }
  }, [isAuthenticated, isLoading, segments]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="auth/onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="auth/verify-code" options={{ headerShown: false }} />
        <Stack.Screen name="auth/new-password" options={{ headerShown: false }} />
        <Stack.Screen name="auth/preferences-gender" options={{ headerShown: false }} />
        <Stack.Screen name="auth/preferences-age" options={{ headerShown: false }} />
        <Stack.Screen name="auth/preferences-interest" options={{ headerShown: false }} />
        <Stack.Screen name="auth/complete-profile" options={{ headerShown: false }} />
        <Stack.Screen name="auth/location-access" options={{ headerShown: false }} />
        <Stack.Screen name="auth/enter-location" options={{ headerShown: false }} />
        <Stack.Screen name="search" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen name="ticket/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="event/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="event/select-seat" options={{ headerShown: false }} />
        <Stack.Screen name="event/video" options={{ headerShown: false }} />
        <Stack.Screen name="event/gallery" options={{ headerShown: false }} />
        <Stack.Screen name="events/map" options={{ headerShown: false }} />
        <Stack.Screen name="booking/details" options={{ headerShown: false }} />
        <Stack.Screen name="booking/review" options={{ headerShown: false }} />
        <Stack.Screen name="booking/payment" options={{ headerShown: false }} />
        <Stack.Screen name="booking/add-card" options={{ headerShown: false }} />
        <Stack.Screen name="booking/confirmation" options={{ headerShown: false }} />
        <Stack.Screen name="booking/payment-rejected" options={{ headerShown: false }} />
        <Stack.Screen name="wallet/index" options={{ headerShown: false }} />
        <Stack.Screen name="wallet/add" options={{ headerShown: false }} />
        <Stack.Screen name="settings/security" options={{ headerShown: false }} />
        <Stack.Screen name="settings/notifications" options={{ headerShown: false }} />
        <Stack.Screen name="help" options={{ headerShown: false }} />
        <Stack.Screen name="profile/edit" options={{ headerShown: false }} />
        <Stack.Screen name="profile/payment-methods" options={{ headerShown: false }} />
        <Stack.Screen name="profile/add-card" options={{ headerShown: false }} />
        <Stack.Screen name="profile/password" options={{ headerShown: false }} />
        <Stack.Screen name="profile/privacy" options={{ headerShown: false }} />
        <Stack.Screen name="profile/billing" options={{ headerShown: false }} />
        <Stack.Screen name="profile/billing/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 600));
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContextProvider>
          <RootLayoutNav />
        </AppContextProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
