import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as ScreenCapture from 'expo-screen-capture';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppContextProvider } from '@/contexts/AppContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGlobalScreenCaptureBlock } from '@/hooks/useScreenCapture';
import AsyncStorage from '@react-native-async-storage/async-storage';

SplashScreen.preventAutoHideAsync();


if (Platform.OS !== 'web') {
  ScreenCapture.preventScreenCaptureAsync().catch(() => {
    
  });
}

export const unstable_settings = {
  initialRouteName: 'splash',
};

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);

  useGlobalScreenCaptureBlock(true);

  useEffect(() => {
    // Verificar si el usuario necesita completar el onboarding
    const checkOnboardingStatus = async () => {
      try {
        const needsOnboardingFlag = await AsyncStorage.getItem('@eventu_needs_onboarding');
        setNeedsOnboarding(needsOnboardingFlag === 'true');
      } catch (error) {
        setNeedsOnboarding(false);
      }
    };
    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    if (isLoading || needsOnboarding === null) return;

    const inAuthGroup = 
      segments[0] === 'welcome' || 
      segments[0] === 'login' || 
      segments[0] === 'register';
    const inAuthFlow = segments[0] === 'auth'; 
    const inTabs = segments[0] === '(tabs)';

    // Verificar el flag nuevamente cuando cambian los segmentos (especialmente cuando navega a tabs)
    const recheckOnboarding = async () => {
      try {
        const needsOnboardingFlag = await AsyncStorage.getItem('@eventu_needs_onboarding');
        const currentNeedsOnboarding = needsOnboardingFlag === 'true';
        if (currentNeedsOnboarding !== needsOnboarding) {
          setNeedsOnboarding(currentNeedsOnboarding);
        }
      } catch (error) {
        // Ignorar errores
      }
    };
    recheckOnboarding();

    if (!isAuthenticated && !inAuthGroup && !inAuthFlow) {
      router.replace('/welcome');
    } 
    else if (isAuthenticated && inAuthGroup && !needsOnboarding) {
      // Si el usuario está autenticado y trata de acceder a welcome/login/register, redirigir a tabs
      router.replace('/(tabs)');
    } 
    else if (isAuthenticated && inAuthFlow && !needsOnboarding) {
      // Si el usuario está autenticado y NO necesita onboarding, redirigir a tabs
      router.replace('/(tabs)');
    }
    else if (!isAuthenticated && inTabs) {
      router.replace('/welcome');
    }
  }, [isAuthenticated, isLoading, segments, needsOnboarding]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="splash" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="auth/onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="auth/verify-code" options={{ headerShown: false }} />
        <Stack.Screen name="auth/new-password" options={{ headerShown: false }} />
        <Stack.Screen name="auth/preferences-gender" options={{ headerShown: false }} />
        <Stack.Screen name="auth/preferences-age" options={{ headerShown: false }} />
        <Stack.Screen name="auth/complete-profile" options={{ headerShown: false }} />
        <Stack.Screen name="auth/location-access" options={{ headerShown: false }} />
        <Stack.Screen name="auth/enter-location" options={{ headerShown: false }} />
        <Stack.Screen name="search" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen name="ticket/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="tickets/history" options={{ headerShown: false }} />
        <Stack.Screen name="tickets/transfer" options={{ headerShown: false }} />
        <Stack.Screen name="tickets/offline" options={{ headerShown: false }} />
        <Stack.Screen name="tickets/event-info" options={{ headerShown: false }} />
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
    if (Platform.OS !== 'web') {
      ScreenCapture.preventScreenCaptureAsync().catch(() => {
      });
      
      const interval = setInterval(() => {
        ScreenCapture.preventScreenCaptureAsync().catch(() => {
        });
      }, 2000);
      
      return () => {
        clearInterval(interval);
      };
    }
  }, []);

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 600));
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
        if (Platform.OS !== 'web') {
          ScreenCapture.preventScreenCaptureAsync().catch(() => {
          });
        }
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
