import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ValidatedInput, validations } from '@/components/validated-input';
import { ErrorBanner, handleApiError, createError } from '@/components/error-handler';
import Colors, { EventuColors } from '@/constants/theme';
import { Radius } from '@/constants/theme-extended';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const handleLogin = async () => {
    
    if (!email.trim() || !password.trim()) {
      setError(createError('validation', 'Por favor completa todos los campos'));
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (err: any) {
      const appError = handleApiError(err);
      setError(appError);
    } finally {
      setLoading(false);
    }
  };

  const gradientBackground: [string, string, string] = [
    EventuColors.violet + 'AA', 
    EventuColors.magenta + 'AA',
    EventuColors.hotPink + 'AA',
  ];

  const cardBackground = colorScheme === 'dark' ? '#1e1f2a' : '#ffffff';
  const cardShadow = colorScheme === 'dark' ? 'rgba(0,0,0,0.45)' : 'rgba(63,69,135,0.18)';
  const inputBorder = colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(99,102,241,0.15)';
  const inputBackground = colorScheme === 'dark' ? 'rgba(21,23,35,0.85)' : '#f7f8ff';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}>
        <View style={[styles.heroBubble, styles.heroBubblePrimary, { backgroundColor: EventuColors.violet + '22' }]} />
        <View style={[styles.heroBubble, styles.heroBubbleSecondary, { backgroundColor: EventuColors.fuchsia + '22' }]} />

      <ErrorBanner error={error} onDismiss={() => setError(null)} autoDismiss />
      <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoiding}>
        <ScrollView
            showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
            <View style={styles.heroHeader}>
              <Pressable style={styles.backButton} onPress={() => router.back()}>
                <IconSymbol name="chevron.left" size={20} color="#ffffff" />
                </Pressable>
              <ThemedText type="title" style={styles.heroTitle}>
                Bienvenido de vuelta
                </ThemedText>
              <ThemedText style={styles.heroSubtitle}>
                Ingresa tus credenciales para continuar disfrutando de la experiencia.
                </ThemedText>
              </View>

            <View style={[styles.card, { backgroundColor: cardBackground, shadowColor: cardShadow }]}>
              <ValidatedInput
                label="Correo electrónico"
                icon="envelope.fill"
                value={email}
                onChangeText={setEmail}
                placeholder="tu@correo.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                validationRules={[validations.required(), validations.email()]}
                required
                containerStyle={styles.formField}
              />

              <ValidatedInput
                label="Contraseña"
                icon="lock.fill"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                validationRules={[validations.required(), validations.password()]}
                required
                rightIcon={showPassword ? 'visibility-off' : 'visibility'}
                onRightIconPress={() => setShowPassword(!showPassword)}
                containerStyle={styles.formField}
              />
                <Pressable style={styles.forgotLink}>
                  <ThemedText style={[styles.forgotLinkText, { color: colors.tint }]}>
                      ¿Olvidaste tu contraseña?
                    </ThemedText>
                  </Pressable>

              <View style={styles.rememberRow}>
                <Pressable
                  onPress={() => setRememberMe((prev) => !prev)}
                  style={({ pressed }) => [
                    styles.rememberToggle,
                    {
                      backgroundColor: rememberMe ? colors.tint : 'transparent',
                      borderColor: rememberMe ? colors.tint : inputBorder,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}>
                  {rememberMe ? <IconSymbol name="checkmark" size={12} color="#ffffff" /> : null}
                </Pressable>
                <ThemedText style={styles.rememberText}>Recordarme</ThemedText>
              </View>

              <LinearGradient
                colors={[EventuColors.magenta, EventuColors.hotPink]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.loginButtonGradient}>
                <Pressable
                  onPress={handleLogin}
                  disabled={loading}
                  style={({ pressed }) => [
                    styles.loginButton,
                    { opacity: pressed || loading ? 0.85 : 1 },
                  ]}>
                  <ThemedText type="defaultSemiBold" style={styles.loginButtonText}>
                    {loading ? 'Ingresando...' : 'Ingresar'}
                  </ThemedText>
                </Pressable>
              </LinearGradient>

              <View style={styles.signupRow}>
                <ThemedText style={styles.signupText}>¿No tienes cuenta?</ThemedText>
                <Pressable onPress={() => router.push('/register')}>
                  <ThemedText style={[styles.signupLink, { color: colors.tint }]}>Regístrate</ThemedText>
                </Pressable>
              </View>
            </View>
        </ScrollView>
      </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 32,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    gap: 32,
  },
  heroBubble: {
    position: 'absolute',
    opacity: 0.6,
    borderRadius: 400,
  },
  heroBubblePrimary: {
    width: 260,
    height: 260,
    top: -80,
    right: -40,
  },
  heroBubbleSecondary: {
    width: 180,
    height: 180,
    top: 180,
    left: -60,
  },
  heroHeader: {
    gap: 16,
    paddingTop: 12,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 30,
    lineHeight: 34,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 16,
    lineHeight: 22,
  },
  card: {
    borderRadius: 32,
    padding: 28,
    gap: 24,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.22,
    shadowRadius: 38,
    elevation: 20,
  },
  formField: {
    gap: 10,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  forgotLink: {
    alignSelf: 'flex-end',
  },
  forgotLinkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rememberToggle: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rememberText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginButtonGradient: {
    borderRadius: Radius['2xl'],
  },
  loginButton: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: Radius['2xl'],
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 17,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  signupText: {
    fontSize: 14,
    color: 'rgba(71,85,105,0.85)',
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
