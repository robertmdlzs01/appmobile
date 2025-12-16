/**
 * Hook para manejar el bloqueo de capturas de pantalla y grabación
 * en toda la aplicación
 * 
 * IMPORTANTE:
 * - En iOS: Funciona automáticamente
 * - En Android: Requiere que la app tenga FLAG_SECURE en la ventana
 * - En Web: No está soportado (se ignora silenciosamente)
 */

import { useEffect, useRef } from 'react';
import * as ScreenCapture from 'expo-screen-capture';
import { Platform } from 'react-native';
import { usePathname } from 'expo-router';

/**
 * Rutas donde NO se debe bloquear la captura de pantalla
 * (por ejemplo, pantallas públicas, onboarding, etc.)
 */
const ALLOWED_ROUTES = [
  '/welcome',
  '/login',
  '/register',
  '/auth/onboarding',
  '/auth/verify-code',
  '/auth/new-password',
  '/auth/preferences-gender',
  '/auth/preferences-age',
  '/auth/preferences-interest',
  '/auth/complete-profile',
  '/auth/location-access',
  '/auth/enter-location',
];

/**
 * Rutas donde SÍ se debe bloquear la captura (pantallas sensibles)
 * Si está vacío, se bloquea en todas las rutas excepto las permitidas
 */
const BLOCKED_ROUTES: string[] = [];

/**
 * Hook para manejar el bloqueo de capturas de pantalla
 * @param enabled - Si true, bloquea capturas. Si false, permite capturas.
 * @param route - Ruta actual (opcional, se detecta automáticamente)
 */
export function useScreenCapture(enabled: boolean = true, route?: string) {
  const pathname = usePathname();
  const currentRoute = route || pathname || '';
  const isBlockedRef = useRef(false);

  useEffect(() => {
    // Verificar si esta ruta está en la lista de permitidas
    const isAllowedRoute = ALLOWED_ROUTES.some((allowedRoute) =>
      currentRoute.startsWith(allowedRoute)
    );

    // Verificar si esta ruta está específicamente bloqueada
    const isBlockedRoute = BLOCKED_ROUTES.length > 0
      ? BLOCKED_ROUTES.some((blockedRoute) => currentRoute.startsWith(blockedRoute))
      : !isAllowedRoute; // Si no hay rutas bloqueadas específicas, bloquear todo excepto las permitidas

    // Determinar si se debe bloquear
    const shouldBlock = enabled && isBlockedRoute;

    // Solo aplicar cambios si el estado cambió y no estamos en web
    if (Platform.OS === 'web') {
      return; // ScreenCapture no está disponible en web
    }

    if (shouldBlock && !isBlockedRef.current) {
      isBlockedRef.current = true;
      ScreenCapture.preventScreenCaptureAsync().catch((error) => {
        console.warn('Error preventing screen capture:', error);
      });
    } else if (!shouldBlock && isBlockedRef.current) {
      isBlockedRef.current = false;
      ScreenCapture.allowScreenCaptureAsync().catch((error) => {
        console.warn('Error allowing screen capture:', error);
      });
    }

    // Cleanup al desmontar
    return () => {
      if (isBlockedRef.current) {
        ScreenCapture.allowScreenCaptureAsync().catch(() => {
          // Ignorar errores en cleanup
        });
        isBlockedRef.current = false;
      }
    };
  }, [enabled, currentRoute]);
}

/**
 * Bloquea capturas de pantalla globalmente en toda la app
 * Se debe llamar en el layout principal
 */
export function useGlobalScreenCaptureBlock(enabled: boolean = true) {
  const pathname = usePathname();
  const currentRoute = pathname || '';
  const isBlockedRef = useRef(false);

  useEffect(() => {
    // Verificar si esta ruta está en la lista de permitidas
    const isAllowedRoute = ALLOWED_ROUTES.some((allowedRoute) =>
      currentRoute.startsWith(allowedRoute)
    );

    // Determinar si se debe bloquear
    const shouldBlock = enabled && !isAllowedRoute;

    // Solo aplicar cambios si el estado cambió y no estamos en web
    if (Platform.OS === 'web') {
      return; // ScreenCapture no está disponible en web
    }

    if (shouldBlock && !isBlockedRef.current) {
      isBlockedRef.current = true;
      ScreenCapture.preventScreenCaptureAsync().catch((error) => {
        if (__DEV__) {
          console.log('Screen capture blocked for route:', currentRoute);
        }
        console.warn('Error preventing screen capture:', error);
      });
    } else if (!shouldBlock && isBlockedRef.current) {
      isBlockedRef.current = false;
      ScreenCapture.allowScreenCaptureAsync().catch((error) => {
        if (__DEV__) {
          console.log('Screen capture allowed for route:', currentRoute);
        }
        console.warn('Error allowing screen capture:', error);
      });
    }

    // Cleanup al desmontar
    return () => {
      if (isBlockedRef.current) {
        ScreenCapture.allowScreenCaptureAsync().catch(() => {
          // Ignorar errores en cleanup
        });
        isBlockedRef.current = false;
      }
    };
  }, [enabled, currentRoute]);
}

