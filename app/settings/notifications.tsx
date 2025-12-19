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
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaHeaderPadding } from '@/hooks/useSafeAreaInsets';

export default function NotificationSettingsScreen() {
  const { paddingTop: safeAreaPaddingTop } = useSafeAreaHeaderPadding();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [eventReminders, setEventReminders] = useState(true);
  const [promotional, setPromotional] = useState(false);
  const [ticketUpdates, setTicketUpdates] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(true);
  const [newEvents, setNewEvents] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {}
        <View style={[styles.header, { paddingTop: safeAreaPaddingTop + 16 }]}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={EventuColors.black} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Configuración de Notificaciones</Text>
          </View>
          <View style={styles.iconButton} />
        </View>

        {}
        <View style={styles.section}>
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MaterialIcons name="notifications" size={20} color={EventuColors.hotPink} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Activar Notificaciones</Text>
                  <Text style={styles.settingSubtitle}>Habilita todas las notificaciones</Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#767577', true: EventuColors.hotPink }}
                thumbColor={EventuColors.white}
              />
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MaterialIcons name="notifications" size={20} color={EventuColors.hotPink} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Notificaciones Push</Text>
                  <Text style={styles.settingSubtitle}>Recibe notificaciones en tiempo real</Text>
                </View>
              </View>
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{ false: '#767577', true: EventuColors.hotPink }}
                thumbColor={EventuColors.white}
                disabled={!notificationsEnabled}
              />
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MaterialIcons name="email" size={20} color={EventuColors.hotPink} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Notificaciones por Email</Text>
                  <Text style={styles.settingSubtitle}>Recibe notificaciones en tu correo</Text>
                </View>
              </View>
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: '#767577', true: EventuColors.hotPink }}
                thumbColor={EventuColors.white}
                disabled={!notificationsEnabled}
              />
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.subsectionTitle}>Tipos de Notificaciones</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MaterialIcons name="event" size={20} color={EventuColors.hotPink} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Recordatorios de Eventos</Text>
                  <Text style={styles.settingSubtitle}>Te avisamos antes de tus eventos</Text>
                </View>
              </View>
              <Switch
                value={eventReminders}
                onValueChange={setEventReminders}
                trackColor={{ false: '#767577', true: EventuColors.hotPink }}
                thumbColor={EventuColors.white}
                disabled={!notificationsEnabled}
              />
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MaterialIcons name="confirmation-number" size={20} color={EventuColors.hotPink} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Actualizaciones de Boletos</Text>
                  <Text style={styles.settingSubtitle}>Notificaciones sobre tus boletos</Text>
                </View>
              </View>
              <Switch
                value={ticketUpdates}
                onValueChange={setTicketUpdates}
                trackColor={{ false: '#767577', true: EventuColors.hotPink }}
                thumbColor={EventuColors.white}
                disabled={!notificationsEnabled}
              />
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MaterialIcons name="payment" size={20} color={EventuColors.hotPink} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Alertas de Pago</Text>
                  <Text style={styles.settingSubtitle}>Confirmaciones y recordatorios de pago</Text>
                </View>
              </View>
              <Switch
                value={paymentAlerts}
                onValueChange={setPaymentAlerts}
                trackColor={{ false: '#767577', true: EventuColors.hotPink }}
                thumbColor={EventuColors.white}
                disabled={!notificationsEnabled}
              />
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MaterialIcons name="star" size={20} color={EventuColors.hotPink} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Nuevos Eventos</Text>
                  <Text style={styles.settingSubtitle}>Eventos recomendados para ti</Text>
                </View>
              </View>
              <Switch
                value={newEvents}
                onValueChange={setNewEvents}
                trackColor={{ false: '#767577', true: EventuColors.hotPink }}
                thumbColor={EventuColors.white}
                disabled={!notificationsEnabled}
              />
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MaterialIcons name="local-offer" size={20} color={EventuColors.hotPink} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Promociones y Ofertas</Text>
                  <Text style={styles.settingSubtitle}>Descuentos y ofertas especiales</Text>
                </View>
              </View>
              <Switch
                value={promotional}
                onValueChange={setPromotional}
                trackColor={{ false: '#767577', true: EventuColors.hotPink }}
                thumbColor={EventuColors.white}
                disabled={!notificationsEnabled}
              />
            </View>
          </View>
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
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: EventuColors.black,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: EventuColors.black,
    marginTop: 8,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: EventuColors.lightGray,
    marginVertical: 20,
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
});
