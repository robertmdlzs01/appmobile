import { ThemedText } from '@/components/themed-text';
import { ErrorBanner, createError, handleApiError } from '@/components/error-handler';
import { EventuColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/services/auth.api';
import { apiService } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Path } from 'react-native-svg';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { Image, Modal } from 'react-native';

export default function RegisterScreen() {
  const { autoLogin, login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<any>(null);
  
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const buttonScale = useSharedValue(1);
  const fadeIn = useSharedValue(0);
  const logoRotation = useSharedValue(0);
  const logoScale = useSharedValue(1);

  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 600 });
  }, []);

  useEffect(() => {
    if (loading) {
      logoRotation.value = withRepeat(
        withTiming(360, { duration: 2000, easing: Easing.linear }),
        -1,
        false
      );
      logoScale.value = withRepeat(
        withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      logoRotation.value = withTiming(0, { duration: 300 });
      logoScale.value = withTiming(1, { duration: 300 });
    }
  }, [loading]);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: (1 - fadeIn.value) * 30 }],
  }));

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${logoRotation.value}deg` },
      { scale: logoScale.value },
    ],
  }));

  const validateName = (value: string) => {
    if (!value.trim()) {
      setNameError('El nombre es requerido');
      return false;
    }
    if (value.trim().length < 2) {
      setNameError('El nombre debe tener al menos 2 caracteres');
      return false;
    }
    setNameError(null);
    return true;
  };

  const validateEmail = (value: string) => {
    if (!value.trim()) {
      setEmailError('El correo electrónico es requerido');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.trim())) {
      setEmailError('Por favor ingresa un correo electrónico válido');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const validatePassword = (value: string) => {
    if (!value.trim()) {
      setPasswordError('La contraseña es requerida');
      return false;
    }
    if (value.length < 5) {
      setPasswordError('La contraseña debe tener al menos 5 caracteres');
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const validateConfirmPassword = (value: string) => {
    if (!value.trim()) {
      setConfirmPasswordError('Por favor confirma tu contraseña');
      return false;
    }
    if (value !== password) {
      setConfirmPasswordError('Las contraseñas no coinciden');
      return false;
    }
    setConfirmPasswordError(null);
    return true;
  };

  const handleRegister = async () => {
    setError(null);
    
    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    if (!isNameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      setError(createError('validation', 'Por favor corrige los errores en el formulario'));
      return;
    }

    if (!acceptTerms) {
      setError(createError('validation', 'Debes aceptar los términos y condiciones'));
      return;
    }

    setError(null);
    setLoading(true);
    
    try {
      // Intentar registrar en el servidor (si está disponible)
      let registerSuccess = false;
      
      try {
        const registerResponse = await authApi.register({
          email: email.trim().toLowerCase(),
          name: name.trim(),
          password: password,
        });

        if (registerResponse.success && registerResponse.data) {
          // Si el registro en el servidor es exitoso, usar los datos directamente
          const { user, token } = registerResponse.data;
          
          // Guardar usuario y token en AsyncStorage
          await Promise.all([
            AsyncStorage.setItem('@eventu_user', JSON.stringify(user)),
            AsyncStorage.setItem('@eventu_token', token),
          ]);
          
          // Configurar el token en el servicio API
          apiService.setToken(token);
          
          // Actualizar el estado del usuario en el contexto
          await autoLogin(user);
          
          registerSuccess = true;
        }
      } catch (serverError: any) {
        // Si falla la conexión al servidor, continuar con modo local
        console.warn('Servidor no disponible, usando modo local:', serverError?.message || 'Error desconocido');
      }
      
      // Si el servidor no respondió exitosamente, usar modo local
      if (!registerSuccess) {
        // Modo local como fallback
      const newUser = {
        id: `user-${Date.now()}`,
        email: email.trim().toLowerCase(),
        name: name.trim(),
        role: 'user' as const,
        isStaff: false,
      };
      
      await autoLogin(newUser);
      }
      
      // Marcar que el usuario necesita completar el onboarding
      await AsyncStorage.setItem('@eventu_needs_onboarding', 'true');
      
      // Pequeño delay para suavizar la transición
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setLoading(false);
        router.replace('/auth/onboarding');
    } catch (err: any) {
      console.error('Error en registro:', err);
      
      // En caso de cualquier error, intentar usar modo local
      try {
        const newUser = {
          id: `user-${Date.now()}`,
          email: email.trim().toLowerCase(),
          name: name.trim(),
          role: 'user' as const,
          isStaff: false,
        };
        
        await autoLogin(newUser);
        
        // Marcar que el usuario necesita completar el onboarding
        await AsyncStorage.setItem('@eventu_needs_onboarding', 'true');
        
        await new Promise(resolve => setTimeout(resolve, 300));
        setLoading(false);
        router.replace('/auth/onboarding');
      } catch (fallbackError) {
        // Solo mostrar error si también falla el modo local
        const appError = handleApiError(err);
        setError(appError);
      setLoading(false);
      }
    }
  };

  const handleButtonPress = () => {
    buttonScale.value = withTiming(0.95, { duration: 100 });
    
    setTimeout(() => {
      buttonScale.value = withTiming(1, { duration: 100 });
      handleRegister();
    }, 150);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <LinearGradient
        colors={[EventuColors.magenta, EventuColors.hotPink, EventuColors.violet]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <View style={styles.wavyContainer}>
          <Svg width="100%" height={180} style={styles.wavySvg}>
            <Path
              d="M0,80 Q200,40 400,80 T800,80"
              fill="none"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="2"
            />
            <Path
              d="M0,110 Q200,70 400,110 T800,110"
              fill="none"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="2"
            />
          </Svg>
        </View>

        <View style={styles.curvedBackground}>
          <Svg width="100%" height={220} style={styles.curvedSvg}>
            <Path
              d="M0,0 Q200,120 400,0 L400,220 L0,220 Z"
              fill={EventuColors.white}
            />
          </Svg>
        </View>

        <ErrorBanner error={error} onDismiss={() => setError(null)} autoDismiss />
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoiding}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {}
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={24} color={EventuColors.white} />
            </Pressable>

            {}
            <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
              <ThemedText type="title" style={styles.formTitle}>
                Crear Cuenta
              </ThemedText>
              <ThemedText style={styles.formSubtitle}>
                Únete a Eventu.co y almacena tus entradas
              </ThemedText>

              {}
              <View style={styles.inputContainer}>
                <ThemedText style={styles.inputLabel}>Nombre completo</ThemedText>
                <View style={[styles.inputWrapper, nameError && styles.inputWrapperError]}>
                  <MaterialIcons 
                    name="person" 
                    size={20} 
                    color={nameError ? EventuColors.error : EventuColors.mediumGray} 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={(value) => {
                      setName(value);
                      if (value.trim()) validateName(value);
                    }}
                    onBlur={() => validateName(name)}
                    placeholder="Juan Pérez"
                    placeholderTextColor={EventuColors.mediumGray}
                    autoCapitalize="words"
                  />
                </View>
                {nameError && (
                  <ThemedText style={styles.errorText}>{nameError}</ThemedText>
                )}
              </View>

              {}
              <View style={styles.inputContainer}>
                <ThemedText style={styles.inputLabel}>Correo electrónico</ThemedText>
                <View style={[styles.inputWrapper, emailError && styles.inputWrapperError]}>
                  <MaterialIcons 
                    name="email" 
                    size={20} 
                    color={emailError ? EventuColors.error : EventuColors.mediumGray} 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={(value) => {
                      setEmail(value);
                      if (value.trim()) validateEmail(value);
                    }}
                    onBlur={() => validateEmail(email)}
                    placeholder="tu@correo.com"
                    placeholderTextColor={EventuColors.mediumGray}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>
                {emailError && (
                  <ThemedText style={styles.errorText}>{emailError}</ThemedText>
                )}
              </View>

              <View style={styles.inputContainer}>
                <ThemedText style={styles.inputLabel}>Contraseña</ThemedText>
                <View style={[styles.inputWrapper, passwordError && styles.inputWrapperError]}>
                  <MaterialIcons 
                    name="lock" 
                    size={20} 
                    color={passwordError ? EventuColors.error : EventuColors.mediumGray} 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={(value) => {
                      setPassword(value);
                      if (value.trim()) validatePassword(value);
                      if (confirmPassword) validateConfirmPassword(confirmPassword);
                    }}
                    onBlur={() => validatePassword(password)}
                    placeholder="Ingresa tu contraseña"
                    placeholderTextColor={EventuColors.mediumGray}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password"
                  />
                  <Pressable 
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <MaterialIcons
                      name={showPassword ? 'visibility-off' : 'visibility'}
                      size={20}
                      color={passwordError ? EventuColors.error : EventuColors.mediumGray}
                    />
                  </Pressable>
                </View>
                {passwordError && (
                  <ThemedText style={styles.errorText}>{passwordError}</ThemedText>
                )}
              </View>

              <View style={styles.inputContainer}>
                <ThemedText style={styles.inputLabel}>Confirmar contraseña</ThemedText>
                <View style={[styles.inputWrapper, confirmPasswordError && styles.inputWrapperError]}>
                  <MaterialIcons 
                    name="lock" 
                    size={20} 
                    color={confirmPasswordError ? EventuColors.error : EventuColors.mediumGray} 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={(value) => {
                      setConfirmPassword(value);
                      if (value.trim()) validateConfirmPassword(value);
                    }}
                    onBlur={() => validateConfirmPassword(confirmPassword)}
                    placeholder="Confirma tu contraseña"
                    placeholderTextColor={EventuColors.mediumGray}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoComplete="password"
                  />
                  <Pressable 
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <MaterialIcons
                      name={showConfirmPassword ? 'visibility-off' : 'visibility'}
                      size={20}
                      color={confirmPasswordError ? EventuColors.error : EventuColors.mediumGray}
                    />
                  </Pressable>
                </View>
                {confirmPasswordError && (
                  <ThemedText style={styles.errorText}>{confirmPasswordError}</ThemedText>
                )}
              </View>

              <Pressable
                onPress={() => setAcceptTerms(!acceptTerms)}
                style={styles.termsRow}
              >
                <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                  {acceptTerms && (
                    <MaterialIcons name="check" size={14} color={EventuColors.white} />
                  )}
                </View>
                <View style={styles.termsTextContainer}>
                  <ThemedText style={styles.termsText}>
                    Acepto los{' '}
                    <ThemedText style={styles.termsLink}>Términos y Condiciones</ThemedText>
                    {' '}y la{' '}
                    <ThemedText style={styles.termsLink}>Política de Privacidad</ThemedText>
                  </ThemedText>
                </View>
              </Pressable>

              <Animated.View style={buttonAnimatedStyle}>
                <Pressable
                  onPress={handleButtonPress}
                  disabled={loading || !acceptTerms}
                  style={({ pressed }) => [
                    styles.registerButton,
                    (!acceptTerms) && styles.registerButtonDisabled,
                    (pressed && acceptTerms && !loading) && styles.registerButtonPressed,
                  ]}
                >
                  <ThemedText 
                    type="defaultSemiBold" 
                    style={[
                      styles.registerButtonText,
                      !acceptTerms && styles.registerButtonTextDisabled,
                    ]}
                  >
                    {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                  </ThemedText>
                </Pressable>
              </Animated.View>

              <View style={styles.loginRow}>
                <ThemedText style={styles.loginText}>¿Ya tienes cuenta? </ThemedText>
                <Pressable onPress={() => router.push('/login')}>
                  <ThemedText style={styles.loginLink}>Inicia sesión</ThemedText>
                </Pressable>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Loading Modal with App Icon */}
        <Modal
          visible={loading}
          transparent
          animationType="fade"
        >
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContainer}>
              <Animated.View style={[styles.loadingLogoContainer, logoAnimatedStyle]}>
                <Image
                  source={require('@/assets/images/icon.png')}
                  style={styles.loadingLogo}
                  resizeMode="contain"
                />
              </Animated.View>
              <ThemedText style={styles.loadingText}>
                Creando tu cuenta...
              </ThemedText>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    paddingTop: 60,
  },
  wavyContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    opacity: 0.3,
  },
  wavySvg: {
    position: 'absolute',
  },
  curvedBackground: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    height: 220,
  },
  curvedSvg: {
    position: 'absolute',
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 100,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  formContainer: {
    backgroundColor: EventuColors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 28,
    marginTop: 20,
    minHeight: 700,
    shadowColor: EventuColors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  formTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: EventuColors.black,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  formSubtitle: {
    fontSize: 15,
    color: EventuColors.mediumGray,
    marginBottom: 32,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: EventuColors.black,
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: EventuColors.lightGray,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    backgroundColor: EventuColors.white,
  },
  inputWrapperError: {
    borderColor: EventuColors.error,
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
    color: EventuColors.error,
    marginTop: 6,
    marginLeft: 4,
  },
  inputIcon: {
    marginRight: 0,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: EventuColors.black,
    padding: 0,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 28,
    marginTop: 8,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: EventuColors.lightGray,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: EventuColors.white,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: EventuColors.magenta,
    borderColor: EventuColors.magenta,
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    fontSize: 14,
    color: EventuColors.black,
    lineHeight: 20,
  },
  termsLink: {
    fontSize: 14,
    color: EventuColors.magenta,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: EventuColors.magenta,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: EventuColors.magenta,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  registerButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  registerButtonDisabled: {
    backgroundColor: EventuColors.lightGray,
    shadowOpacity: 0,
    elevation: 0,
  },
  registerButtonText: {
    color: EventuColors.white,
    fontSize: 17,
    fontWeight: '700',
  },
  registerButtonTextDisabled: {
    color: EventuColors.mediumGray,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginText: {
    fontSize: 15,
    color: EventuColors.mediumGray,
  },
  loginLink: {
    fontSize: 15,
    color: EventuColors.magenta,
    fontWeight: '700',
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  loadingLogoContainer: {
    width: 100,
    height: 100,
    borderRadius: 25,
    backgroundColor: EventuColors.white,
    padding: 20,
    shadowColor: EventuColors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  loadingLogo: {
    width: '100%',
    height: '100%',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: EventuColors.white,
    letterSpacing: 0.5,
  },
});
