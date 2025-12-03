import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Colors from '@/constants/theme';
import { Radius } from '@/constants/theme-extended';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

export default function AddCardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [exp, setExp] = useState('');
  const [cvv, setCvv] = useState('');

  const bg = colorScheme === 'dark' ? '#1f1f1f' : '#f5f5f5';
  const border = colorScheme === 'dark' ? '#2a2a2a' : '#e0e0e0';

  const save = () => {
    if (!name || !number || !exp || !cvv) {
      Alert.alert('Faltan datos', 'Completa todos los campos.');
      return;
    }
    Alert.alert('Guardado', 'Tarjeta agregada (demo).');
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </Pressable>
        <ThemedText type="title" style={styles.headerTitle}>Agregar tarjeta</ThemedText>
        <ThemedView style={styles.iconBtn} />
      </ThemedView>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.form}>
          <ThemedText style={styles.label}>Nombre en la tarjeta</ThemedText>
          <ThemedView style={[styles.inputWrap, { backgroundColor: bg, borderColor: border }]}> 
            <TextInput style={[styles.input, { color: colors.text }]} value={name} onChangeText={setName} placeholder="Nombre" placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'} />
          </ThemedView>

          <ThemedText style={styles.label}>Número</ThemedText>
          <ThemedView style={[styles.inputWrap, { backgroundColor: bg, borderColor: border }]}> 
            <TextInput style={[styles.input, { color: colors.text }]} value={number} onChangeText={setNumber} placeholder="0000 0000 0000 0000" keyboardType="number-pad" placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'} />
          </ThemedView>

          <ThemedView style={{ flexDirection: 'row', gap: 12 }}>
            <ThemedView style={[styles.inputWrap, { backgroundColor: bg, borderColor: border, flex: 1 }]}> 
              <TextInput style={[styles.input, { color: colors.text }]} value={exp} onChangeText={setExp} placeholder="MM/AA" keyboardType="number-pad" placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'} />
            </ThemedView>
            <ThemedView style={[styles.inputWrap, { backgroundColor: bg, borderColor: border, flex: 1 }]}> 
              <TextInput style={[styles.input, { color: colors.text }]} value={cvv} onChangeText={setCvv} placeholder="CVV" keyboardType="number-pad" placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'} />
            </ThemedView>
          </ThemedView>

          <Pressable style={({ pressed }) => [styles.saveBtn, { backgroundColor: colors.tint, opacity: pressed ? 0.8 : 1 }]} onPress={save}>
            <ThemedText style={styles.saveText}>Guardar</ThemedText>
          </Pressable>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  headerTitle: { fontSize: 20 },
  iconBtn: { padding: 6 },
  form: { paddingHorizontal: 20, gap: 10, marginTop: 8 },
  label: { fontSize: 14, fontWeight: '600' },
  inputWrap: { borderWidth: 1, borderRadius: Radius.lg, paddingHorizontal: 14, paddingVertical: 12 },
  input: { fontSize: 16 },
  saveBtn: { marginTop: 8, paddingVertical: 14, borderRadius: Radius.lg, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '600' },
});
