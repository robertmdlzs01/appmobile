import { EventuColors } from '@/constants/theme';
import { Radius, Shadows } from '@/constants/theme-extended';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Animated,
  Platform,
} from 'react-native';
export type ErrorType = 'network' | 'validation' | 'server' | 'unknown';

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  retry?: () => void;
}

interface ErrorBannerProps {
  error: AppError | null;
  onDismiss?: () => void;
  autoDismiss?: boolean;
  dismissAfter?: number;
}

export function ErrorBanner({
  error,
  onDismiss,
  autoDismiss = false,
  dismissAfter = 5000,
}: ErrorBannerProps) {
  const [slideAnim] = useState(new Animated.Value(-100));
  const [isVisible, setIsVisible] = useState(false);

  const handleDismiss = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
      onDismiss?.();
    });
  }, [slideAnim, onDismiss]);

  useEffect(() => {
    if (error) {
      setIsVisible(true);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();

      if (autoDismiss) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, dismissAfter);
        return () => clearTimeout(timer);
      }
    } else {
      handleDismiss();
    }
  }, [error, autoDismiss, dismissAfter, slideAnim, handleDismiss]);

  if (!error || !isVisible) return null;

  const getErrorIcon = () => {
    switch (error.type) {
      case 'network':
        return 'wifi-off';
      case 'validation':
        return 'error-outline';
      case 'server':
        return 'cloud-off';
      default:
        return 'error';
    }
  };

  const getErrorColor = () => {
    switch (error.type) {
      case 'network':
        return EventuColors.error;
      case 'validation':
        return '#FF9800';
      case 'server':
        return EventuColors.error;
      default:
        return EventuColors.error;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}>
      <View style={[styles.banner, { backgroundColor: getErrorColor() }]}>
        <MaterialIcons name={getErrorIcon() as any} size={20} color={EventuColors.white} />
        <Text style={styles.message} numberOfLines={2}>
          {error.message}
        </Text>
        <Pressable onPress={handleDismiss} style={styles.closeButton}>
          <MaterialIcons name="close" size={18} color={EventuColors.white} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

interface ErrorStateProps {
  error: AppError | null;
  onRetry?: () => void;
  title?: string;
  message?: string;
}

export function ErrorState({
  error,
  onRetry,
  title,
  message,
}: ErrorStateProps) {
  if (!error) return null;

  const displayTitle = title || 'Algo salió mal';
  const displayMessage = message || error.message;

  return (
    <View style={styles.errorStateContainer}>
      <MaterialIcons
        name={error.type === 'network' ? 'wifi-off' : 'error-outline'}
        size={64}
        color={EventuColors.mediumGray}
      />
      <Text style={styles.errorStateTitle}>{displayTitle}</Text>
      <Text style={styles.errorStateMessage}>{displayMessage}</Text>
      {onRetry && (
        <Pressable style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>Intentar de nuevo</Text>
        </Pressable>
      )}
    </View>
  );
}

export async function checkNetworkStatus(): Promise<boolean> {
  
  return true;
}

export function createError(
  type: ErrorType,
  message: string,
  code?: string
): AppError {
  return { type, message, code };
}

export function handleApiError(error: any): AppError {
  
  if (error.isNetworkError || error.code === 'NETWORK_ERROR' || !error.response) {
    
    const message = error.message && error.message !== 'Network request failed'
      ? error.message
      : 'No hay conexión a internet. Verifica tu conexión.';
    return createError('network', message, 'NETWORK_ERROR');
  }

  const status = error.status || error.response?.status;
  if (status >= 500) {
    return createError('server', 'Error del servidor. Por favor intenta más tarde.');
  }

  if (status === 401) {
    return createError('validation', 'Sesión expirada. Por favor inicia sesión nuevamente.');
  }

  if (status === 403) {
    return createError('validation', 'No tienes permiso para realizar esta acción.');
  }

  if (status === 404) {
    return createError('validation', 'Recurso no encontrado.');
  }

  const errorMessage =
    error.response?.data?.error?.message ||
    error.response?.data?.message ||
    error.message ||
    'Ocurrió un error. Por favor intenta nuevamente.';

  return createError('unknown', errorMessage, status?.toString());
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 16,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: Radius.lg,
    gap: 12,
    ...Shadows.lg,
  },
  message: {
    flex: 1,
    color: EventuColors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    padding: 4,
  },
  errorStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: EventuColors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  errorStateMessage: {
    fontSize: 14,
    color: EventuColors.mediumGray,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: EventuColors.hotPink,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: Radius.xl,
  },
  retryButtonText: {
    color: EventuColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
