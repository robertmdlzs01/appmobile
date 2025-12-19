import { FadeInView } from '@/components/fade-in-view';
import Colors, { EventuColors } from '@/constants/theme';
import { Radius, Shadows } from '@/constants/theme-extended';
import { router, useLocalSearchParams } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { OptimizedImage } from '@/components/optimized-image';

export default function EventInfoScreen() {
  const { eventId } = useLocalSearchParams();
  
  
  const eventInfo = {
    name: 'SANTALAND 2025',
    date: '12 diciembre – 14 diciembre 2025',
    time: '6:00 PM',
    location: 'Centro de Convenciones',
    address: 'Calle 50 # 46-55, Barranquilla',
    recommendations: [
      'Llegar con 30 minutos de anticipación',
      'Presentar identificación al ingreso',
      'Evento familiar, recomendado para todas las edades',
      'Se permiten cámaras y celulares',
      'Prohibido ingresar con alimentos o bebidas',
      'Estacionamiento disponible en el lugar',
    ],
    additionalInfo: [
      'Duración aproximada: 3 horas',
      'Edad mínima: Todas las edades',
      'Acceso para personas con movilidad reducida',
      'Servicio de guardarropa disponible',
    ],
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[EventuColors.violet, EventuColors.magenta]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={EventuColors.white} />
          </Pressable>
          <Text style={styles.headerTitle}>Información del Evento</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <FadeInView delay={100}>
            <View style={styles.eventHeader}>
              <Text style={styles.eventName}>{eventInfo.name}</Text>
            </View>
          </FadeInView>

          <FadeInView delay={200}>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <MaterialIcons name="access-time" size={20} color={EventuColors.magenta} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Hora</Text>
                  <Text style={styles.infoValue}>{eventInfo.time}</Text>
                </View>
              </View>
            </View>
          </FadeInView>

          <FadeInView delay={250}>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <MaterialIcons name="place" size={20} color={EventuColors.magenta} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Lugar</Text>
                  <Text style={styles.infoValue}>{eventInfo.location}</Text>
                  <Text style={styles.infoSubtext}>{eventInfo.address}</Text>
                </View>
              </View>
            </View>
          </FadeInView>

          <FadeInView delay={300}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recomendaciones de Acceso</Text>
              {eventInfo.recommendations.map((rec, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <MaterialIcons name="check-circle" size={18} color={EventuColors.magenta} />
                  <Text style={styles.recommendationText}>{rec}</Text>
                </View>
              ))}
            </View>
          </FadeInView>

          <FadeInView delay={350}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información Adicional</Text>
              {eventInfo.additionalInfo.map((info, index) => (
                <View key={index} style={styles.infoItem}>
                  <MaterialIcons name="info" size={18} color={EventuColors.violet} />
                  <Text style={styles.infoItemText}>{info}</Text>
                </View>
              ))}
            </View>
          </FadeInView>
        </ScrollView>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: EventuColors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  eventHeader: {
    marginBottom: 24,
  },
  eventName: {
    fontSize: 28,
    fontWeight: '800',
    color: EventuColors.white,
  },
  infoCard: {
    backgroundColor: EventuColors.white,
    borderRadius: Radius.xl,
    padding: 20,
    marginBottom: 16,
    ...Shadows.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  infoContent: {
    flex: 1,
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: EventuColors.mediumGray,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: EventuColors.black,
  },
  infoSubtext: {
    fontSize: 14,
    color: EventuColors.mediumGray,
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: EventuColors.white,
    marginBottom: 16,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: Radius.lg,
  },
  recommendationText: {
    flex: 1,
    fontSize: 15,
    color: EventuColors.white,
    lineHeight: 22,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: Radius.lg,
  },
  infoItemText: {
    flex: 1,
    fontSize: 15,
    color: EventuColors.white,
    lineHeight: 22,
  },
});

