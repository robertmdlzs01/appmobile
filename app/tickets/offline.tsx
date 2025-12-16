import { FadeInView } from '@/components/fade-in-view';
import { PressableCard } from '@/components/pressable-card';
import Colors, { EventuColors } from '@/constants/theme';
import { Radius, Shadows } from '@/constants/theme-extended';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function OfflineQRScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[EventuColors.violet, EventuColors.magenta]}
        style={styles.gradient}
      >
        <FadeInView delay={100}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="wifi-off" size={80} color={EventuColors.white} />
            </View>
            <Text style={styles.title}>Modo Sin Conexión</Text>
            <Text style={styles.description}>
              Tus entradas ya están disponibles sin conexión. Puedes validar tus accesos incluso
              cuando no tengas datos móviles o Wi-Fi, siempre que hayas cargado previamente la información.
            </Text>
            <View style={styles.featuresContainer}>
              <View style={styles.feature}>
                <MaterialIcons name="check-circle" size={24} color={EventuColors.white} />
                <Text style={styles.featureText}>Acceso a todas tus entradas</Text>
              </View>
              <View style={styles.feature}>
                <MaterialIcons name="check-circle" size={24} color={EventuColors.white} />
                <Text style={styles.featureText}>Códigos QR disponibles</Text>
              </View>
              <View style={styles.feature}>
                <MaterialIcons name="check-circle" size={24} color={EventuColors.white} />
                <Text style={styles.featureText}>Validación sin internet</Text>
              </View>
            </View>
            <PressableCard
              style={[styles.button, { backgroundColor: EventuColors.magenta }]}
              onPress={() => router.push('/(tabs)/tickets')}
            >
              <Text style={styles.buttonText}>Ver Mis Entradas</Text>
            </PressableCard>
          </View>
        </FadeInView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  content: {
    alignItems: 'center',
    gap: 24,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: EventuColors.white,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    width: '100%',
    gap: 16,
    marginTop: 8,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: EventuColors.white,
    fontWeight: '500',
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: Radius.xl,
    marginTop: 16,
    ...Shadows.lg,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: EventuColors.white,
  },
});

