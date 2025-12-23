import { EventuColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
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

export default function StaffProfileScreen() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalScans: 0,
    validScans: 0,
    invalidScans: 0,
    todayScans: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const scansData = await AsyncStorage.getItem('@staff_qr_scans');
      if (scansData) {
        const scans: QRScanResult[] = JSON.parse(scansData);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayScans = scans.filter((scan) => {
          const scanDate = new Date(scan.scannedAt);
          scanDate.setHours(0, 0, 0, 0);
          return scanDate.getTime() === today.getTime();
        });

        setStats({
          totalScans: scans.length,
          validScans: scans.filter((s) => s.status === 'valid').length,
          invalidScans: scans.filter((s) => s.status === 'invalid' || s.status === 'already_used').length,
          todayScans: todayScans.length,
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/welcome');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGradient}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft} />
              <Text style={styles.headerTitle}>Perfil Staff</Text>
              <View style={styles.headerLeft} />
            </View>

            {/* Profile Card */}
            <View style={styles.profileCard}>
              <View style={styles.profileImageContainer}>
                {user?.profileImage ? (
                  <Image
                    source={{ uri: user.profileImage }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <MaterialIcons name="person" size={48} color={EventuColors.magenta} />
                  </View>
                )}
                <View style={styles.staffBadge}>
                  <MaterialIcons name="verified" size={16} color={EventuColors.white} />
                </View>
              </View>

              <Text style={styles.profileName}>{user?.name || 'Staff Member'}</Text>
              <Text style={styles.profileEmail}>{user?.email || 'staff@eventu.co'}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>
                  {user?.role === 'admin' ? 'Administrador' : 'Personal Staff'}
                </Text>
              </View>
            </View>

            {/* Stats */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={EventuColors.magenta} />
              </View>
            ) : (
              <View style={styles.statsContainer}>
                <Text style={styles.sectionTitle}>Estadísticas</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <MaterialIcons name="qr-code-scanner" size={32} color={EventuColors.magenta} />
                    <Text style={styles.statNumber}>{stats.totalScans}</Text>
                    <Text style={styles.statLabel}>Total Escaneos</Text>
                  </View>
                  <View style={styles.statCard}>
                    <MaterialIcons name="check-circle" size={32} color="#10B981" />
                    <Text style={styles.statNumber}>{stats.validScans}</Text>
                    <Text style={styles.statLabel}>Válidos</Text>
                  </View>
                  <View style={styles.statCard}>
                    <MaterialIcons name="today" size={32} color={EventuColors.violet} />
                    <Text style={styles.statNumber}>{stats.todayScans}</Text>
                    <Text style={styles.statLabel}>Hoy</Text>
                  </View>
                  <View style={styles.statCard}>
                    <MaterialIcons name="error" size={32} color="#EF4444" />
                    <Text style={styles.statNumber}>{stats.invalidScans}</Text>
                    <Text style={styles.statLabel}>Inválidos</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Actions */}
            <View style={styles.actionsContainer}>
              <Text style={styles.sectionTitle}>Acciones</Text>
              
              <Pressable
                style={styles.actionButton}
                onPress={() => router.push('/(staff-tabs)/history')}
              >
                <MaterialIcons name="history" size={24} color={EventuColors.magenta} />
                <Text style={styles.actionButtonText}>Ver Historial Completo</Text>
                <MaterialIcons name="chevron-right" size={24} color={EventuColors.mediumGray} />
              </Pressable>

              <Pressable
                style={styles.actionButton}
                onPress={() => router.push('/(staff-tabs)/scanner')}
              >
                <MaterialIcons name="qr-code-scanner" size={24} color={EventuColors.magenta} />
                <Text style={styles.actionButtonText}>Abrir Lector QR</Text>
                <MaterialIcons name="chevron-right" size={24} color={EventuColors.mediumGray} />
              </Pressable>
            </View>

            {/* Logout */}
            <Pressable style={styles.logoutButton} onPress={handleLogout}>
              <MaterialIcons name="logout" size={24} color={EventuColors.white} />
              <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
            </Pressable>
          </ScrollView>
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
  scrollContent: {
    paddingBottom: 100,
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: EventuColors.black,
  },
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: EventuColors.magenta,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(228, 0, 111, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: EventuColors.magenta,
  },
  staffBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: EventuColors.magenta,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: EventuColors.white,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '800',
    color: EventuColors.black,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 15,
    color: EventuColors.mediumGray,
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: 'rgba(228, 0, 111, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '700',
    color: EventuColors.magenta,
  },
  statsContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: EventuColors.white,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
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
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: EventuColors.black,
  },
  statLabel: {
    fontSize: 13,
    color: EventuColors.mediumGray,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionsContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 12,
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
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: EventuColors.black,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    gap: 12,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: EventuColors.white,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
});

