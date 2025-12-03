import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Colors from '@/constants/theme';
import { Radius } from '@/constants/theme-extended';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

export default function WalletScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [selectedCard, setSelectedCard] = useState('visa');

  const paymentCards = [
    { id: 'visa', type: 'VISA', name: 'Alex Parkinson', lastDigits: '8756', isPrimary: true },
    { id: 'mastercard', type: 'Mastercard', name: 'Alex Parkinson', lastDigits: '8756', isPrimary: false },
  ];

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </Pressable>
        <ThemedText type="title" style={styles.headerTitle}>Métodos de Pago</ThemedText>
        <Pressable onPress={() => router.push('/wallet/add')} style={styles.iconBtn}>
          <IconSymbol name="plus.circle.fill" size={24} color={colors.tint} />
        </Pressable>
      </ThemedView>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.cardsList}>
          {paymentCards.map((card) => {
            const isSelected = selectedCard === card.id;
            return (
              <Pressable
                key={card.id}
                onPress={() => setSelectedCard(card.id)}
                style={({ pressed }) => [
                  styles.cardOption,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: isSelected ? colors.tint : colors.cardBorder,
                    borderWidth: isSelected ? 2 : 1,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}>
                <ThemedView style={styles.cardInfo}>
                  <ThemedView style={styles.cardHeader}>
                    <ThemedText type="defaultSemiBold" style={styles.cardType}>
                      {card.type}
                    </ThemedText>
                    {card.isPrimary && (
                      <ThemedView style={[styles.primaryBadge, { backgroundColor: colors.secondary + '20' }]}>
                        <ThemedText style={[styles.primaryText, { color: colors.secondary }]}>Principal</ThemedText>
                      </ThemedView>
                    )}
                  </ThemedView>
                  <ThemedText style={styles.cardName}>{card.name}</ThemedText>
                  <ThemedText style={styles.cardDigits}>****{card.lastDigits}</ThemedText>
                </ThemedView>
                {isSelected ? (
                  <IconSymbol name="checkmark" size={18} color={colors.tint} />
                ) : (
                  <IconSymbol name="chevron.right" size={18} color={colors.icon} />
                )}
              </Pressable>
            );
          })}
        </ThemedView>

        <Pressable style={({ pressed }) => [styles.addButton, { backgroundColor: colors.tint, opacity: pressed ? 0.8 : 1 }]} onPress={() => router.push('/wallet/add')}>
          <IconSymbol name="plus" size={18} color="#ffffff" />
          <ThemedText style={styles.addButtonText}>Agregar tarjeta</ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  headerTitle: { fontSize: 20 },
  iconBtn: { padding: 6 },
  cardsList: { paddingHorizontal: 20, gap: 12 },
  cardOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: Radius.lg, marginBottom: 8 },
  cardInfo: { flex: 1, gap: 6 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardType: { fontSize: 16 },
  primaryBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.sm },
  primaryText: { fontSize: 11, fontWeight: '600' },
  cardName: { fontSize: 14, opacity: 0.7 },
  cardDigits: { fontSize: 14, opacity: 0.7 },
  addButton: { marginHorizontal: 20, marginTop: 12, paddingVertical: 14, borderRadius: Radius.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  addButtonText: { color: '#ffffff', fontWeight: '600' },
});
