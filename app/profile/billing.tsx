import { EventuColors } from '@/constants/theme';
import { Radius, Shadows } from '@/constants/theme-extended';
import { router } from 'expo-router';
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
import * as Sharing from 'expo-sharing';
import { useSafeAreaHeaderPadding } from '@/hooks/useSafeAreaInsets';

export default function BillingScreen() {
  const { paddingTop: safeAreaPaddingTop } = useSafeAreaHeaderPadding();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'paid' | 'pending' | 'cancelled'>('all');

  const invoices = [
    {
      id: 'INV-2025-001',
      eventName: 'PECADORAS',
      date: '15 de Junio, 2025',
      amount: 120000,
      status: 'paid',
      tickets: 2,
      paymentMethod: 'VISA •••• 8756',
    },
    {
      id: 'INV-2025-002',
      eventName: 'Concierto Rock Barranquilla',
      date: '10 de Junio, 2025',
      amount: 85000,
      status: 'paid',
      tickets: 1,
      paymentMethod: 'Mastercard •••• 8756',
    },
    {
      id: 'INV-2025-003',
      eventName: 'Festival de Jazz',
      date: '5 de Junio, 2025',
      amount: 95000,
      status: 'paid',
      tickets: 1,
      paymentMethod: 'VISA •••• 8756',
    },
    {
      id: 'INV-2025-004',
      eventName: 'Concierto de Pop',
      date: '20 de Mayo, 2025',
      amount: 75000,
      status: 'cancelled',
      tickets: 1,
      paymentMethod: 'VISA •••• 8756',
    },
  ];

  const filteredInvoices = invoices.filter((invoice) => {
    if (selectedFilter === 'all') return true;
    return invoice.status === selectedFilter;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleDownloadInvoice = async (invoice: typeof invoices[0]) => {
    try {
      
      alert(`Descargando factura ${invoice.id}`);
    } catch (error) {
      console.error('Error downloading invoice:', error);
    }
  };

  const handleShareInvoice = async (invoice: typeof invoices[0]) => {
    try {
      const shareMessage = `Factura ${invoice.id}\nEvento: ${invoice.eventName}\nFecha: ${invoice.date}\nMonto: ${formatCurrency(invoice.amount)}`;
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(shareMessage);
      } else {
        alert(shareMessage);
      }
    } catch (error) {
      console.error('Error sharing invoice:', error);
    }
  };

  const handleViewInvoice = (invoice: typeof invoices[0]) => {
    router.push(`/profile/billing/${invoice.id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {}
        <View style={[styles.header, { paddingTop: safeAreaPaddingTop + 16 }]}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={EventuColors.black} />
          </Pressable>
          <Text style={styles.headerTitle}>Facturación</Text>
          <View style={styles.iconButton} />
        </View>

        {}
        <View style={styles.filtersContainer}>
          <Pressable
            style={[
              styles.filterButton,
              selectedFilter === 'all' && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === 'all' && styles.filterTextActive,
              ]}
            >
              Todas
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.filterButton,
              selectedFilter === 'paid' && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter('paid')}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === 'paid' && styles.filterTextActive,
              ]}
            >
              Pagadas
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.filterButton,
              selectedFilter === 'pending' && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter('pending')}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === 'pending' && styles.filterTextActive,
              ]}
            >
              Pendientes
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.filterButton,
              selectedFilter === 'cancelled' && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter('cancelled')}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === 'cancelled' && styles.filterTextActive,
              ]}
            >
              Canceladas
            </Text>
          </Pressable>
        </View>

        {}
        <View style={styles.invoicesSection}>
          {filteredInvoices.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="receipt-long" size={64} color={EventuColors.mediumGray} />
              <Text style={styles.emptyTitle}>No hay facturas</Text>
              <Text style={styles.emptySubtitle}>
                {selectedFilter === 'all'
                  ? 'Aún no has realizado ninguna compra'
                  : selectedFilter === 'paid'
                  ? 'No tienes facturas pagadas'
                  : selectedFilter === 'pending'
                  ? 'No tienes facturas pendientes'
                  : 'No tienes facturas canceladas'}
              </Text>
            </View>
          ) : (
            filteredInvoices.map((invoice) => (
              <Pressable
                key={invoice.id}
                style={styles.invoiceCard}
                onPress={() => handleViewInvoice(invoice)}
              >
                <View style={styles.invoiceHeader}>
                  <View style={styles.invoiceInfo}>
                    <Text style={styles.invoiceNumber}>{invoice.id}</Text>
                    <Text style={styles.invoiceDate}>{invoice.date}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      invoice.status === 'paid'
                        ? styles.statusBadgePaid
                        : invoice.status === 'pending'
                        ? styles.statusBadgePending
                        : styles.statusBadgeCancelled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        invoice.status === 'paid'
                          ? styles.statusTextPaid
                          : invoice.status === 'pending'
                          ? styles.statusTextPending
                          : styles.statusTextCancelled,
                      ]}
                    >
                      {invoice.status === 'paid'
                        ? 'Pagada'
                        : invoice.status === 'pending'
                        ? 'Pendiente'
                        : 'Cancelada'}
                    </Text>
                  </View>
                </View>

                <View style={styles.invoiceContent}>
                  <Text style={styles.eventName}>{invoice.eventName}</Text>
                  <View style={styles.invoiceDetails}>
                    <View style={styles.detailRow}>
                      <MaterialIcons
                        name="confirmation-number"
                        size={16}
                        color={EventuColors.mediumGray}
                      />
                      <Text style={styles.detailText}>
                        {invoice.tickets} {invoice.tickets === 1 ? 'boleto' : 'boletos'}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <MaterialIcons
                        name="credit-card"
                        size={16}
                        color={EventuColors.mediumGray}
                      />
                      <Text style={styles.detailText}>{invoice.paymentMethod}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.invoiceFooter}>
                  <View>
                    <Text style={styles.amountLabel}>Total</Text>
                    <Text style={styles.amountValue}>
                      {formatCurrency(invoice.amount)}
                    </Text>
                  </View>
                  <View style={styles.actionsRow}>
                    <Pressable
                      style={styles.actionButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDownloadInvoice(invoice);
                      }}
                    >
                      <MaterialIcons
                        name="download"
                        size={18}
                        color={EventuColors.hotPink}
                      />
                    </Pressable>
                    <Pressable
                      style={styles.actionButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleShareInvoice(invoice);
                      }}
                    >
                      <MaterialIcons
                        name="share"
                        size={18}
                        color={EventuColors.hotPink}
                      />
                    </Pressable>
                  </View>
                </View>
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
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 20,
    backgroundColor: EventuColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: EventuColors.lightGray,
    ...Shadows.sm,
    minHeight: 40,
  },
  filterButtonActive: {
    backgroundColor: EventuColors.hotPink,
    borderColor: EventuColors.hotPink,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
    color: EventuColors.mediumGray,
    textAlign: 'center',
  },
  filterTextActive: {
    color: EventuColors.white,
  },
  invoicesSection: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: EventuColors.black,
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: EventuColors.mediumGray,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  invoiceCard: {
    backgroundColor: EventuColors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...Shadows.sm,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: EventuColors.black,
    marginBottom: 4,
  },
  invoiceDate: {
    fontSize: 12,
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
  statusBadgeCancelled: {
    backgroundColor: '#FFEBEE',
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
  statusTextCancelled: {
    color: EventuColors.error,
  },
  invoiceContent: {
    marginBottom: 16,
  },
  eventName: {
    fontSize: 18,
    fontWeight: '600',
    color: EventuColors.black,
    marginBottom: 12,
  },
  invoiceDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: EventuColors.mediumGray,
  },
  invoiceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: EventuColors.lightGray,
  },
  amountLabel: {
    fontSize: 12,
    color: EventuColors.mediumGray,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: EventuColors.hotPink,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: EventuColors.hotPink + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
