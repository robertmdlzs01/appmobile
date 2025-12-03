import { PressableCard } from '@/components/pressable-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Colors, { EventuColors } from '@/constants/theme';
import { Radius, Shadows } from '@/constants/theme-extended';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

export default function EnterLocationScreen() {
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { autoLogin } = useAuth();

  const bg = colorScheme === 'dark' ? '#1f1f1f' : '#f5f5f5';
  const border = colorScheme === 'dark' ? '#2a2a2a' : '#e0e0e0';

  const handleContinue = async () => {
    if (location.trim()) {
      setLoading(true);
      try {
        
        await autoLogin({
          id: Date.now().toString(),
          email: 'usuario@eventu.com',
          name: 'Usuario Eventu',
        });

        console.log('Location entered:', location);
        router.replace('/(tabs)');
      } catch (error) {
        console.error('Error during auto login:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const popularLocations = [
    'Barranquilla, Colombia',
    'Bogotá, Colombia',
    'Medellín, Colombia',
    'Cali, Colombia',
    'Cartagena, Colombia',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#FFF5FB', '#F5F0FF', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {}
            <View style={styles.header}>
              <Pressable onPress={() => router.back()} style={styles.backButton}>
                <IconSymbol name="chevron.left" size={24} color={colors.text} />
              </Pressable>
            </View>

            {}
            <View style={styles.titleSection}>
              <ThemedText type="title" style={styles.title}>
                Ingresa tu Ubicación
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                Ingresa manualmente tu ubicación para encontrar eventos cerca de ti
              </ThemedText>
            </View>

            {}
            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.label}>Ciudad o Ubicación</ThemedText>
              <ThemedView
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: bg,
                    borderColor: border,
                  },
                ]}
              >
                <IconSymbol name="location.fill" size={18} color={colors.icon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Ej: Barranquilla, Colombia"
                  placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
                  autoCapitalize="words"
                />
              </ThemedView>
            </ThemedView>

            {}
            <View style={styles.popularSection}>
              <ThemedText style={styles.popularTitle}>Ubicaciones Populares</ThemedText>
              <View style={styles.popularList}>
                {popularLocations.map((loc, index) => (
                  <PressableCard
                    key={index}
                    style={[
                      styles.popularItem,
                      {
                        backgroundColor: bg,
                        borderColor: border,
                      },
                    ]}
                    onPress={() => setLocation(loc)}
                    hapticFeedback={true}
                  >
                    <IconSymbol
                      name="location.fill"
                      size={16}
                      color={EventuColors.hotPink}
                    />
                    <ThemedText style={styles.popularItemText}>{loc}</ThemedText>
                    <IconSymbol
                      name="chevron.right"
                      size={16}
                      color={colors.icon}
                    />
                  </PressableCard>
                ))}
              </View>
            </View>
          </ScrollView>

          {}
          <View style={styles.bottomContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                (!location.trim() || loading) && styles.buttonDisabled,
                { opacity: pressed || !location.trim() || loading ? 0.7 : 1 },
              ]}
              onPress={handleContinue}
              disabled={!location.trim() || loading}
            >
              <LinearGradient
                colors={[EventuColors.hotPink + 'CC', EventuColors.magenta + 'CC']} 
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={EventuColors.white} />
                ) : (
                  <ThemedText style={styles.buttonText}>Continuar</ThemedText>
                )}
              </LinearGradient>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: EventuColors.white,
  },
  backgroundGradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    marginBottom: 32,
  },
  title: {
    marginBottom: 12,
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 32,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  popularSection: {
    marginBottom: 20,
  },
  popularTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  popularList: {
    gap: 12,
  },
  popularItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 12,
    ...Shadows.sm,
  },
  popularItemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  bottomContainer: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: 'transparent',
  },
  button: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadows.md,
    shadowColor: EventuColors.hotPink + '66', 
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: EventuColors.white,
    fontSize: 17,
    fontWeight: '600',
  },
});
