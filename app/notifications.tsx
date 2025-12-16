import { EventuColors } from '@/constants/theme';
import { Radius, Shadows } from '@/constants/theme-extended';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function NotificationsScreen() {

  const notifications = [
    {
      id: '1',
      type: 'ticket-available',
      title: 'Entrada disponible',
      body: 'Tu entrada para SANTALAND 2025 está lista y disponible',
      time: 'Hace 2 horas',
      read: false,
      icon: 'confirmation-number',
    },
    {
      id: '2',
      type: 'transfer-request',
      title: 'Solicitud de transferencia',
      body: 'Has recibido una solicitud de transferencia de entrada',
      time: 'Hace 5 horas',
      read: false,
      icon: 'swap-horiz',
    },
    {
      id: '3',
      type: 'event-reminder',
      title: 'Recordatorio de evento',
      body: 'SANTALAND 2025 comienza mañana a las 6:00 PM',
      time: 'Ayer',
      read: true,
      icon: 'notifications-active',
    },
    {
      id: '4',
      type: 'app-update',
      title: 'Actualización importante',
      body: 'Nueva versión de Eventu.co disponible con mejoras',
      time: 'Hace 1 día',
      read: true,
      icon: 'system-update',
    },
    {
      id: '5',
      type: 'transfer-completed',
      title: 'Transferencia completada',
      body: 'Tu transferencia de entrada ha sido aceptada',
      time: 'Hace 2 días',
      read: true,
      icon: 'check-circle',
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    
    alert('Todas las notificaciones marcadas como leídas');
  };

  const handleClearAll = () => {
    
    alert('Todas las notificaciones eliminadas');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {}
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={EventuColors.black} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Notificaciones</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          <Pressable style={styles.iconButton} onPress={handleMarkAllRead}>
            <MaterialIcons name="done-all" size={24} color={EventuColors.hotPink} />
          </Pressable>
        </View>

        {}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Notificaciones Recientes</Text>
            {notifications.length > 0 && (
              <Pressable onPress={handleClearAll}>
                <Text style={styles.clearText}>Limpiar todo</Text>
              </Pressable>
            )}
          </View>

          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="notifications-none" size={64} color={EventuColors.mediumGray} />
              <Text style={styles.emptyTitle}>No hay notificaciones</Text>
              <Text style={styles.emptySubtitle}>
                Tus notificaciones aparecerán aquí
              </Text>
            </View>
          ) : (
            notifications.map((notification) => (
              <Pressable
                key={notification.id}
                style={[
                  styles.notificationCard,
                  !notification.read && styles.notificationCardUnread,
                ]}
              >
                <View style={styles.notificationIcon}>
                  <MaterialIcons
                    name={notification.icon as any}
                    size={24}
                    color={EventuColors.hotPink}
                  />
                </View>
                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    {!notification.read && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.notificationBody}>{notification.body}</Text>
                  <Text style={styles.notificationTime}>{notification.time}</Text>
                </View>
                <Pressable style={styles.deleteButton}>
                  <MaterialIcons name="close" size={18} color={EventuColors.mediumGray} />
                </Pressable>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
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
    paddingBottom: 20,
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
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: EventuColors.black,
  },
  badge: {
    backgroundColor: EventuColors.hotPink,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: EventuColors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: EventuColors.black,
    marginBottom: 16,
  },
  clearText: {
    fontSize: 14,
    color: EventuColors.hotPink,
    fontWeight: '600',
  },
  settingCard: {
    backgroundColor: EventuColors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Shadows.sm,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: EventuColors.black,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: EventuColors.mediumGray,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: EventuColors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: EventuColors.mediumGray,
    textAlign: 'center',
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: EventuColors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Shadows.sm,
  },
  notificationCardUnread: {
    backgroundColor: EventuColors.hotPink + '08',
    borderLeftWidth: 3,
    borderLeftColor: EventuColors.hotPink,
  },
  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: EventuColors.hotPink + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: EventuColors.black,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: EventuColors.hotPink,
  },
  notificationBody: {
    fontSize: 14,
    color: EventuColors.mediumGray,
    marginBottom: 4,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: EventuColors.mediumGray,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
