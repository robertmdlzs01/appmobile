import { EventuColors } from '@/constants/theme';
import { Radius, Shadows } from '@/constants/theme-extended';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import {
  Dimensions,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function ExploreEventsMapScreen() {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');

  const events = [
    {
      id: '1',
      name: 'PECADORAS',
      location: 'Teatro Amira de la Rosa',
      latitude: 10.9639,
      longitude: -74.7964,
      price: '$50.000',
      date: '13 Nov 2025',
      category: 'Música',
    },
    {
      id: '2',
      name: 'Concierto Rock',
      location: 'Centro de Convenciones',
      latitude: 10.9689,
      longitude: -74.7814,
      price: '$75.000',
      date: '20 Nov 2025',
      category: 'Música',
    },
    {
      id: '3',
      name: 'Festival de Jazz',
      location: 'Parque Cultural',
      latitude: 10.9589,
      longitude: -74.8014,
      price: '$60.000',
      date: '25 Nov 2025',
      category: 'Música',
    },
  ];

  const initialRegion = {
    latitude: 10.9639,
    longitude: -74.7964,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const handleEventPress = (eventId: string) => {
    router.push(`/event/${eventId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {}
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={EventuColors.black} />
        </Pressable>
        <Text style={styles.headerTitle}>Explorar en Mapa</Text>
        <Pressable
          style={styles.iconButton}
          onPress={() => setMapType(mapType === 'standard' ? 'satellite' : 'standard')}
        >
          <MaterialIcons
            name={mapType === 'standard' ? 'satellite' : 'map'}
            size={24}
            color={EventuColors.hotPink}
          />
        </Pressable>
      </View>

      {}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <MaterialIcons name="map" size={64} color={EventuColors.mediumGray} />
          <Text style={styles.mapPlaceholderText}>Mapa interactivo</Text>
          <Text style={styles.mapPlaceholderSubtext}>
            Se requiere react-native-maps para mostrar el mapa
          </Text>
          
          {}
          <View style={styles.markersContainer}>
            {events.map((event, index) => (
              <Pressable
                key={event.id}
                style={[
                  styles.markerPlaceholder,
                  {
                    left: `${20 + index * 30}%`,
                    top: `${30 + index * 15}%`,
                  },
                ]}
                onPress={() => setSelectedEvent(event.id)}
              >
                <LinearGradient
                  colors={[EventuColors.hotPink + 'CC', EventuColors.magenta + 'CC']}
                  style={styles.marker}
                >
                  <MaterialIcons name="event" size={20} color={EventuColors.white} />
                </LinearGradient>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {}
      <View style={styles.eventsList}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            {events.length} {events.length === 1 ? 'evento' : 'eventos'} cerca
          </Text>
          <Pressable style={styles.filterButton}>
            <MaterialIcons name="tune" size={18} color={EventuColors.hotPink} />
            <Text style={styles.filterText}>Filtros</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.eventsScroll}
        >
          {events.map((event) => (
            <Pressable
              key={event.id}
              style={[
                styles.eventCard,
                selectedEvent === event.id && styles.eventCardSelected,
              ]}
              onPress={() => handleEventPress(event.id)}
            >
              <View style={styles.eventImage}>
                <MaterialIcons name="event" size={32} color={EventuColors.hotPink} />
              </View>
              <View style={styles.eventInfo}>
                <Text style={styles.eventName} numberOfLines={1}>
                  {event.name}
                </Text>
                <View style={styles.eventMeta}>
                  <MaterialIcons
                    name="place"
                    size={14}
                    color={EventuColors.mediumGray}
                  />
                  <Text style={styles.eventLocation} numberOfLines={1}>
                    {event.location}
                  </Text>
                </View>
                <View style={styles.eventFooter}>
                  <Text style={styles.eventPrice}>{event.price}</Text>
                  <Text style={styles.eventDate}>{event.date}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: EventuColors.white,
    borderBottomWidth: 1,
    borderBottomColor: EventuColors.lightGray,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: EventuColors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: EventuColors.black,
  },
  mapContainer: {
    flex: 1,
  },
  mapPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mapPlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: EventuColors.black,
    marginTop: 16,
    marginBottom: 4,
  },
  mapPlaceholderSubtext: {
    fontSize: 12,
    color: EventuColors.mediumGray,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  markersContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  markerPlaceholder: {
    position: 'absolute',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: EventuColors.white,
    ...Shadows.md,
  },
  eventsList: {
    backgroundColor: EventuColors.white,
    borderTopWidth: 1,
    borderTopColor: EventuColors.lightGray,
    paddingTop: 16,
    paddingBottom: 20,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: EventuColors.black,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: EventuColors.hotPink + '15',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: EventuColors.hotPink,
  },
  eventsScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  eventCard: {
    width: 280,
    backgroundColor: EventuColors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    ...Shadows.md,
    shadowColor: EventuColors.magenta,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  eventCardSelected: {
    borderColor: 'rgba(255, 107, 184, 0.6)',
    backgroundColor: EventuColors.hotPink + '08',
    shadowColor: EventuColors.hotPink,
    shadowOpacity: 0.25,
  },
  eventImage: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    backgroundColor: EventuColors.hotPink + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  eventInfo: {
    gap: 8,
  },
  eventName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: EventuColors.black,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventLocation: {
    flex: 1,
    fontSize: 13,
    color: EventuColors.mediumGray,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  eventPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: EventuColors.hotPink,
  },
  eventDate: {
    fontSize: 12,
    color: EventuColors.mediumGray,
  },
});
