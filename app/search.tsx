import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Colors from '@/constants/theme';
import { Radius } from '@/constants/theme-extended';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

export default function SearchScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const params = useLocalSearchParams();
  const [query, setQuery] = useState('');
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const openFiltersInitially = params.openFilters === 'true';
  const [showFilters, setShowFilters] = useState(!!openFiltersInitially);


  const allEvents = [
    { id: '1', name: 'PECADORAS', date: '13 Nov 2025', time: '20:00', location: 'Barranquilla', price: 50000, category: 'Música' },
    { id: '2', name: 'EL COSTEÑO Y EL CACHACO', date: '27 Nov 2025', time: '20:00', location: 'Barranquilla', price: 45000, category: 'Comedia' },
    { id: '3', name: 'FESTIVAL NACIONAL DE COMPOSITORES 2025', date: '12-14 Dic 2025', time: '18:00', location: 'San Juan del Cesar – La Guajira', price: 60000, category: 'Música' },
    { id: '4', name: 'QUIÉN SE LLEVÓ LA NAVIDAD?', date: '29 Nov 2025', time: '19:30', location: 'Barranquilla', price: 55000, category: 'Música' },
  ];

  const results = useMemo(() => {
    return allEvents.filter((e) => {
      const matchesQuery = query.trim().length === 0 || `${e.name} ${e.location}`.toLowerCase().includes(query.toLowerCase());
      const matchesPrice = priceMax == null || e.price <= priceMax;
      return matchesQuery && matchesPrice;
    });
  }, [query, priceMax]);


  return (
    <ThemedView style={styles.container}>
      {}
      <ThemedView style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </Pressable>
        <ThemedText type="title" style={styles.headerTitle}>Buscar</ThemedText>
        <Pressable onPress={() => setShowFilters((s) => !s)} style={styles.iconBtn}>
          <IconSymbol name="slider.horizontal.3" size={22} color={colors.text} />
        </Pressable>
      </ThemedView>

      {}
      <ThemedView style={[styles.searchRow, { backgroundColor: colorScheme === 'dark' ? '#1f1f1f' : colors.searchBarBg }]}> 
        <IconSymbol name="magnifyingglass" size={20} color={colors.icon} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Buscar eventos, lugares..."
          placeholderTextColor={colorScheme === 'dark' ? '#6b7280' : '#9ca3af'}
          value={query}
          onChangeText={setQuery}
          autoFocus
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} style={styles.iconBtn}>
            <IconSymbol name="xmark.circle.fill" size={20} color={colors.icon} />
          </Pressable>
        )}
      </ThemedView>

      {}
      {showFilters && (
        <ThemedView style={styles.filtersBox}>
          <ThemedText type="defaultSemiBold" style={styles.filtersTitle}>Filtros</ThemedText>
          <ThemedView style={styles.priceRow}>
            <ThemedText style={styles.priceLabel}>Precio máximo:</ThemedText>
            <View style={styles.priceOptions}>
              {[20, 30, 40, 50].map((p) => (
                <Pressable
                  key={p}
                  onPress={() => setPriceMax(p === priceMax ? null : p)}
                  style={[styles.priceChip, { borderColor: p === priceMax ? colors.tint : colors.cardBorder, backgroundColor: p === priceMax ? colors.tint + '20' : 'transparent' }]}
                >
                  <ThemedText style={{ color: p === priceMax ? colors.tint : colors.text }}>{`$${p}`}</ThemedText>
                </Pressable>
              ))}
            </View>
          </ThemedView>
        </ThemedView>
      )}

      {}
      <ScrollView style={styles.results} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {results.length === 0 ? (
          <ThemedView style={styles.emptyBox}>
            <ThemedText style={{ opacity: 0.7 }}>Sin resultados</ThemedText>
          </ThemedView>
        ) : (
          results.map((e) => (
            <Pressable key={e.id} style={[styles.resultRow, { backgroundColor: colors.cardBackground }]}
              onPress={() => router.push(`/event/${e.id}`)}>
              <ThemedView style={styles.resultIcon}>
                <IconSymbol name="calendar" size={20} color={colors.tint} />
              </ThemedView>
              <ThemedView style={{ flex: 1 }}>
                <ThemedText type="defaultSemiBold" numberOfLines={1}>{e.name}</ThemedText>
                <ThemedText style={{ opacity: 0.7 }} numberOfLines={1}>{`${e.location} • ${e.date} ${e.time}`}</ThemedText>
              </ThemedView>
              <ThemedText type="defaultSemiBold" style={{ color: colors.tint }}>{`$${e.price.toLocaleString()}`}</ThemedText>
            </Pressable>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
  },
  headerTitle: { fontSize: 20 },
  iconBtn: { padding: 6 },
  searchRow: {
    marginHorizontal: 20, borderRadius: Radius.xl, paddingHorizontal: 12, paddingVertical: 10,
    flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 0,
  },
  input: { flex: 1, fontSize: 16 },
  filtersBox: { marginTop: 8, paddingHorizontal: 20, gap: 8 },
  filtersTitle: { fontSize: 16 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceLabel: { opacity: 0.8 },
  priceOptions: { flexDirection: 'row', gap: 8 },
  priceChip: { borderWidth: 1, borderRadius: Radius.lg, paddingVertical: 6, paddingHorizontal: 10 },
  results: { paddingHorizontal: 20, marginTop: 12 },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: Radius.lg, marginBottom: 10 },
  resultIcon: { width: 40, height: 40, borderRadius: Radius.xl, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e5e7eb' },
  emptyBox: { alignItems: 'center', justifyContent: 'center', padding: 40 },
});
