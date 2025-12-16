import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ValidatedInput, validations } from '@/components/validated-input';
import { ErrorBanner, createError } from '@/components/error-handler';
import Colors from '@/constants/theme';
import { Radius } from '@/constants/theme-extended';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet } from 'react-native';

export default function RegisterScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<any>(null);

  const handleRegister = async () => {
    
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError(createError('validation', 'Por favor completa todos los campos'));
      return;
    }

    if (password !== confirmPassword) {
      setError(createError('validation', 'Las contraseñas no coinciden'));
      return;
    }

    if (password.length < 5) {
      setError(createError('validation', 'La contraseña debe tener al menos 5 caracteres'));
      return;
    }

    if (!acceptTerms) {
      setError(createError('validation', 'Debes aceptar los términos y condiciones'));
      return;
    }

    setError(null);
    setLoading(true);
    try {
      
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      router.replace('/auth/onboarding');
    } catch (err: any) {
      setError(createError('server', err.message || 'Error al crear la cuenta. Intenta nuevamente.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ErrorBanner error={error} onDismiss={() => setError(null)} autoDismiss />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {}
          <ThemedView style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <IconSymbol name="chevron.left" size={24} color={colors.text} />
            </Pressable>
            <ThemedText type="title" style={styles.title}>
              Crear Cuenta
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Únete a Eventu.co y almacena tus entradas. Si ya compraste en nuestros canales autorizados, confirma tus datos para ver tus entradas al instante.
            </ThemedText>
          </ThemedView>

          {}
          <ThemedView style={styles.form}>
            <ValidatedInput
              label="Nombre completo"
              icon="person.fill"
              value={name}
              onChangeText={setName}
              placeholder="Juan Pérez"
              autoCapitalize="words"
              validationRules={[validations.required(), validations.minLength(2, 'El nombre debe tener al menos 2 caracteres')]}
              required
              containerStyle={styles.inputContainer}
            />

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
              containerStyle={styles.inputContainer}
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
              containerStyle={styles.inputContainer}
            />

            <ValidatedInput
              label="Confirmar contraseña"
              icon="lock.fill"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoComplete="password"
              validationRules={[
                validations.required(),
                validations.match(password, 'Las contraseñas no coinciden'),
              ]}
              required
              rightIcon={showConfirmPassword ? 'visibility-off' : 'visibility'}
              onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
              containerStyle={styles.inputContainer}
            />

            <Pressable
              style={({ pressed }) => [
                styles.checkboxContainer,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={() => setAcceptTerms(!acceptTerms)}>
              <ThemedView
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: acceptTerms ? colors.tint : 'transparent',
                    borderColor: acceptTerms ? colors.tint : colors.border,
                  },
                ]}>
                {acceptTerms && <IconSymbol name="checkmark" size={14} color="#ffffff" />}
              </ThemedView>
              <ThemedView style={styles.checkboxText}>
                <ThemedText style={styles.checkboxTextMain}>
                  Acepto los{' '}
                  <ThemedText style={[styles.checkboxLink, { color: colors.tint }]}>
                    Términos y Condiciones
                  </ThemedText>{' '}
                  y la{' '}
                  <ThemedText style={[styles.checkboxLink, { color: colors.tint }]}>
                    Política de Privacidad
                  </ThemedText>
                </ThemedText>
              </ThemedView>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.registerButton,
                {
                  backgroundColor: colors.tint,
                  opacity: pressed || loading ? 0.8 : 1,
                },
              ]}
              onPress={handleRegister}
              disabled={loading}>
              <ThemedText style={styles.registerButtonText}>
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </ThemedText>
            </Pressable>

            <ThemedView style={styles.loginLink}>
              <ThemedText style={styles.loginText}>¿Ya tienes cuenta? </ThemedText>
              <Pressable onPress={() => router.push('/login')}>
                <ThemedText style={[styles.loginLinkText, { color: colors.tint }]}>
                  Inicia sesión
                </ThemedText>
              </Pressable>
            </ThemedView>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  form: {
    paddingHorizontal: 20,
    gap: 20,
  },
  inputContainer: {
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
    borderWidth: 1,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: Radius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxText: {
    flex: 1,
  },
  checkboxTextMain: {
    fontSize: 13,
    lineHeight: 20,
  },
  checkboxLink: {
    fontWeight: '600',
  },
  registerButton: {
    paddingVertical: 16,
    borderRadius: Radius.lg,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  loginText: {
    fontSize: 14,
  },
  loginLinkText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
