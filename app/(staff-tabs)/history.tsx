import { EventuColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface QRScanResult {
  id: string;
  ticketId: string;
  qrToken: string;
  scannedAt: string;
  status: 'valid' | 'invalid' | 'already_used';
  eventName?: string;
  userName?: string;
}

export default function StaffHistoryScreen() {
  const { user } = useAuth();
  const [scans, setScans] = useState<QRScanResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadScans();
  }, []);

  const loadScans = async () => {
    try {
      const scansData = await AsyncStorage.getItem('@staff_qr_scans');
      if (scansData) {
        const parsedScans: QRScanResult[] = JSON.parse(scansData);
        setScans(parsedScans);
      }
    } catch (error) {
      console.error('Error loading scans:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadScans();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return 'Hace unos segundos';
      if (diffMins === 1) return 'Hace 1 minuto';
      if (diffMins < 60) return `Hace ${diffMins} minutos`;

      const diffHours = Math.floor(diffMins / 60);
      if (diffHours === 1) return 'Hace 1 hora';
      if (diffHours < 24) return `Hace ${diffHours} horas`;

      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'Ayer';
      if (diffDays < 7) return `Hace ${diffDays} días`;

      return date.toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return '#10B981';
      case 'already_used':
        return '#F59E0B';
      case 'invalid':
        return '#EF4444';
      default:
        return EventuColors.mediumGray;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return 'check-circle';
      case 'already_used':
        return 'warning';
      case 'invalid':
        return 'error';
      default:
        return 'help';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'valid':
        return 'Válido';
      case 'already_used':
        return 'Ya usado';
      case 'invalid':
        return 'Inválido';
      default:
        return 'Desconocido';
    }
  };

  const renderScanItem = ({ item }: { item: QRScanResult }) => {
    const statusColor = getStatusColor(item.status);
    const statusIcon = getStatusIcon(item.status);
    const statusText = getStatusText(item.status);

    return (
      <View style={styles.scanCard}>
        <View style={styles.scanCardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
            <MaterialIcons name={statusIcon as any} size={20} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
          </View>
          <Text style={styles.timeText}>{formatDate(item.scannedAt)}</Text>
        </View>

        <View style={styles.scanCardBody}>
          {item.eventName && (
            <View style={styles.infoRow}>
              <MaterialIcons name="event" size={18} color={EventuColors.mediumGray} />
              <Text style={styles.infoText} numberOfLines={1}>
                {item.eventName}
              </Text>
            </View>
          )}

          {item.userName && (
            <View style={styles.infoRow}>
              <MaterialIcons name="person" size={18} color={EventuColors.mediumGray} />
              <Text style={styles.infoText} numberOfLines={1}>
                {item.userName}
              </Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <MaterialIcons name="qr-code" size={18} color={EventuColors.mediumGray} />
            <Text style={styles.ticketIdText} numberOfLines={1}>
              Ticket: {item.ticketId}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="history" size={64} color={EventuColors.mediumGray} />
      <Text style={styles.emptyTitle}>No hay escaneos registrados</Text>
      <Text style={styles.emptyText}>
        Los códigos QR que escanees aparecerán aquí
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGradient}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft} />
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Historial de Lecturas</Text>
              <Text style={styles.headerSubtitle}>{scans.length} escaneos</Text>
            </View>
            <View style={styles.headerLeft} />
          </View>

          {/* Content */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={EventuColors.white} />
              <Text style={styles.loadingText}>Cargando historial...</Text>
            </View>
          ) : (
            <FlatList
              data={scans}
              renderItem={renderScanItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={[
                styles.listContent,
                scans.length === 0 && styles.listContentEmpty,
              ]}
              ListEmptyComponent={renderEmpty}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={EventuColors.white}
                />
              }
              showsVerticalScrollIndicator={false}
            />
          )}
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: EventuColors.white,
  },
  backgroundGradient: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 20,
  },
  headerLeft: {
    width: 40,
    height: 40,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: EventuColors.black,
  },
  headerSubtitle: {
    fontSize: 14,
    color: EventuColors.mediumGray,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  listContentEmpty: {
    flex: 1,
  },
  scanCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  scanCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  timeText: {
    fontSize: 12,
    color: EventuColors.mediumGray,
    fontWeight: '500',
  },
  scanCardBody: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: EventuColors.black,
    fontWeight: '500',
  },
  ticketIdText: {
    flex: 1,
    fontSize: 13,
    color: EventuColors.mediumGray,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: EventuColors.white,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: EventuColors.black,
    fontSize: 16,
    fontWeight: '600',
  },
});

