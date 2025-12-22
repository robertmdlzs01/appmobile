import { PressableCard } from '@/components/pressable-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Colors, { EventuColors } from '@/constants/theme';
import { Radius, Shadows } from '@/constants/theme-extended';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLocation } from '@/hooks/useLocation';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

export default function LocationAccessScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  const { requestPermissions, getCurrentLocation } = useLocation();
  const [loading, setLoading] = useState(false);

  const handleEnableLocation = () => {
    Alert.alert(
      'Permitir acceso a ubicación',
      'Eventu.co necesita acceso a tu ubicación para mostrarte eventos cercanos y recomendaciones personalizadas. ¿Deseas habilitar la búsqueda por localización?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => {
            handleSkipLocation();
          },
        },
        {
          text: 'Permitir',
          style: 'default',
          onPress: async () => {
            await requestLocationPermission();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const requestLocationPermission = async () => {
    setLoading(true);
    try {
      const hasPermission = await requestPermissions();
      
      if (hasPermission) {
        await getCurrentLocation();
      }

      // Limpiar el flag de onboarding completado
      await AsyncStorage.removeItem('@eventu_needs_onboarding');

      // Reemplazar completamente la navegación para que no pueda volver al proceso de registro
      // Usar replace para eliminar la ruta actual del historial
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error enabling location:', error);
      Alert.alert(
        'Error',
        'No se pudo habilitar la ubicación. Puedes continuar sin ella y configurarla más tarde desde los ajustes.',
        [
          {
            text: 'Continuar sin ubicación',
            onPress: handleSkipLocation,
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkipLocation = async () => {
    try {
      // Limpiar el flag de onboarding completado
      await AsyncStorage.removeItem('@eventu_needs_onboarding');
      
      // Reemplazar completamente la navegación para que no pueda volver al proceso de registro
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error during auto login:', error);
      Alert.alert('Error', 'No se pudo completar el proceso. Intenta nuevamente.');
    }
  };

  const benefits = [
    {
      id: '1',
      icon: 'map.fill',
      text: 'Encuentra eventos cercanos',
    },
    {
      id: '2',
      icon: 'sparkles',
      text: 'Obtén recomendaciones personalizadas',
    },
    {
      id: '3',
      icon: 'car.fill',
      text: 'Obtén direcciones a los lugares',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#FFF5FB', '#F5F0FF', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {}
          <View style={styles.illustrationContainer}>
            <LinearGradient
              colors={[EventuColors.hotPink + '15', EventuColors.magenta + '15']} 
              style={styles.illustrationCircle}
            >
              <View style={styles.iconWrapper}>
                <LinearGradient
                  colors={[EventuColors.hotPink + 'CC', EventuColors.magenta + 'CC']} 
                  style={styles.iconGradient}
                >
                  <IconSymbol name="location.fill" size={60} color={EventuColors.white} />
                </LinearGradient>
              </View>
            </LinearGradient>
          </View>

          {}
          <View style={styles.titleSection}>
            <ThemedText type="title" style={styles.title}>
              Habilitar Búsqueda por Localización
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Permite el acceso a tu ubicación para encontrar eventos cercanos y recibir recomendaciones personalizadas basadas en tu ubicación actual
            </ThemedText>
          </View>

          {}
          <View style={styles.benefitsContainer}>
            {benefits.map((benefit) => (
              <PressableCard
                key={benefit.id}
                style={styles.benefit}
                hapticFeedback={false}
              >
                <View
                  style={[
                    styles.benefitIconContainer,
                    { backgroundColor: EventuColors.hotPink + '10' }, 
                  ]}
                >
                  <IconSymbol
                    name={benefit.icon as any}
                    size={24}
                    color={EventuColors.hotPink}
                  />
                </View>
                <ThemedText style={styles.benefitText}>{benefit.text}</ThemedText>
              </PressableCard>
            ))}
          </View>

          {}
          <View style={styles.buttonsContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                { opacity: pressed || loading ? 0.8 : 1 },
              ]}
              onPress={handleEnableLocation}
              disabled={loading}
            >
              <LinearGradient
                colors={[EventuColors.hotPink + 'CC', EventuColors.magenta + 'CC']} 
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={EventuColors.white} />
                ) : (
                  <View style={styles.buttonContent}>
                    <IconSymbol name="location.fill" size={20} color={EventuColors.white} />
                    <ThemedText style={styles.buttonText}>Permitir Acceso a Ubicación</ThemedText>
                  </View>
                )}
              </LinearGradient>
            </Pressable>
          </View>

          {}
          <ThemedText style={styles.privacyText}>
            Tus datos de ubicación están seguros y solo se usan para mejorar tu
            experiencia
          </ThemedText>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: EventuColors.white,
  },
  backgroundGradient: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  illustrationContainer: {
    marginBottom: 48,
    alignItems: 'center',
  },
  illustrationCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
  },
  iconWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
    ...Shadows.md,
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    marginBottom: 16,
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  benefitsContainer: {
    width: '100%',
    marginBottom: 40,
    gap: 16,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: Radius.xl,
    backgroundColor: EventuColors.white,
    borderWidth: 1,
    borderColor: EventuColors.lightGray,
    ...Shadows.sm,
  },
  benefitIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  benefitText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  buttonsContainer: {
    width: '100%',
    marginBottom: 24,
    gap: 12,
  },
  button: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadows.md,
    shadowColor: EventuColors.hotPink + '66', 
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: EventuColors.white,
    fontSize: 17,
    fontWeight: '600',
  },
  privacyText: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
  },
});
