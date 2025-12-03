import { EventuColors } from '@/constants/theme';
import { Radius, Shadows } from '@/constants/theme-extended';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
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

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(false);

  const invoice = {
    id: id || 'INV-2025-001',
    eventName: 'PECADORAS',
    date: '15 de Junio, 2025',
    time: '20:00',
    venue: 'Teatro Amira de la Rosa',
    amount: 120000,
    subtotal: 110000,
    serviceFee: 10000,
    status: 'paid',
    tickets: [
      { id: '1', type: 'General', quantity: 2, price: 55000 },
    ],
    paymentMethod: 'VISA •••• 8756',
    paymentDate: '15 de Junio, 2025',
    buyerName: 'Alex Parkinson',
    buyerEmail: 'alex@example.com',
    buyerPhone: '+57 300 123 4567',
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      
      alert(`Descargando factura ${invoice.id}`);
    } catch (error) {
      console.error('Error downloading invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {}
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={EventuColors.black} />
          </Pressable>
          <Text style={styles.headerTitle}>Detalle de Factura</Text>
          <View style={styles.iconButton} />
        </View>

        {}
        <View style={styles.invoiceCard}>
          <View style={styles.invoiceHeader}>
            <View>
              <Text style={styles.invoiceNumber}>{invoice.id}</Text>
              <Text style={styles.invoiceDate}>{invoice.date}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                invoice.status === 'paid'
                  ? styles.statusBadgePaid
                  : styles.statusBadgePending,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  invoice.status === 'paid'
                    ? styles.statusTextPaid
                    : styles.statusTextPending,
                ]}
              >
                {invoice.status === 'paid' ? 'Pagada' : 'Pendiente'}
              </Text>
            </View>
          </View>

          {}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información del Evento</Text>
            <View style={styles.infoRow}>
              <MaterialIcons name="event" size={20} color={EventuColors.mediumGray} />
              <Text style={styles.infoText}>{invoice.eventName}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="calendar-today" size={20} color={EventuColors.mediumGray} />
              <Text style={styles.infoText}>{invoice.date}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="access-time" size={20} color={EventuColors.mediumGray} />
              <Text style={styles.infoText}>{invoice.time}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="place" size={20} color={EventuColors.mediumGray} />
              <Text style={styles.infoText}>{invoice.venue}</Text>
            </View>
          </View>

          {}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Boletos</Text>
            {invoice.tickets.map((ticket, index) => (
              <View key={index} style={styles.ticketRow}>
                <View style={styles.ticketInfo}>
                  <Text style={styles.ticketType}>{ticket.type}</Text>
                  <Text style={styles.ticketQuantity}>
                    {ticket.quantity} {ticket.quantity === 1 ? 'boleto' : 'boletos'}
                  </Text>
                </View>
                <Text style={styles.ticketPrice}>
                  {formatCurrency(ticket.price * ticket.quantity)}
                </Text>
              </View>
            ))}
          </View>

          {}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información del Comprador</Text>
            <View style={styles.infoRow}>
              <MaterialIcons name="person" size={20} color={EventuColors.mediumGray} />
              <Text style={styles.infoText}>{invoice.buyerName}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="email" size={20} color={EventuColors.mediumGray} />
              <Text style={styles.infoText}>{invoice.buyerEmail}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="phone" size={20} color={EventuColors.mediumGray} />
              <Text style={styles.infoText}>{invoice.buyerPhone}</Text>
            </View>
          </View>

          {}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información de Pago</Text>
            <View style={styles.infoRow}>
              <MaterialIcons name="credit-card" size={20} color={EventuColors.mediumGray} />
              <Text style={styles.infoText}>{invoice.paymentMethod}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="calendar-today" size={20} color={EventuColors.mediumGray} />
              <Text style={styles.infoText}>Pagado el {invoice.paymentDate}</Text>
            </View>
          </View>

          {}
          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal</Text>
              <Text style={styles.priceValue}>{formatCurrency(invoice.subtotal)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tarifa de servicio</Text>
              <Text style={styles.priceValue}>{formatCurrency(invoice.serviceFee)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(invoice.amount)}</Text>
            </View>
          </View>
        </View>

        {}
        <View style={styles.actionsContainer}>
          <Pressable style={styles.downloadButton} onPress={handleDownload} disabled={loading}>
            <LinearGradient
              colors={[EventuColors.hotPink + 'CC', EventuColors.magenta + 'CC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradient}
            >
              <MaterialIcons name="download" size={20} color={EventuColors.white} />
              <Text style={styles.buttonText}>Descargar PDF</Text>
            </LinearGradient>
          </Pressable>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: EventuColors.black,
  },
  invoiceCard: {
    backgroundColor: EventuColors.white,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    ...Shadows.md,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: EventuColors.lightGray,
  },
  invoiceNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: EventuColors.black,
    marginBottom: 4,
  },
  invoiceDate: {
    fontSize: 14,
    color: EventuColors.mediumGray,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgePaid: {
    backgroundColor: '#E8F5E9',
  },
  statusBadgePending: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextPaid: {
    color: EventuColors.success,
  },
  statusTextPending: {
    color: '#FF9800',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: EventuColors.black,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: EventuColors.black,
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: EventuColors.lightGray,
  },
  ticketInfo: {
    flex: 1,
  },
  ticketType: {
    fontSize: 15,
    fontWeight: '600',
    color: EventuColors.black,
    marginBottom: 4,
  },
  ticketQuantity: {
    fontSize: 13,
    color: EventuColors.mediumGray,
  },
  ticketPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: EventuColors.black,
  },
  priceSection: {
    marginTop: 8,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: EventuColors.lightGray,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: EventuColors.mediumGray,
  },
  priceValue: {
    fontSize: 14,
    color: EventuColors.black,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: EventuColors.lightGray,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: EventuColors.black,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: EventuColors.hotPink,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 12,
  },
  downloadButton: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Shadows.md,
    shadowColor: EventuColors.hotPink + '66',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  buttonText: {
    color: EventuColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
