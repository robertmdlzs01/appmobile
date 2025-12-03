import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Colors, { EventuColors } from '@/constants/theme';
import { Radius, Shadows } from '@/constants/theme-extended';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

export default function VerifyCodeScreen() {
  const [code, setCode] = useState(['', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const inputs = useRef<(TextInput | null)[]>([]);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const params = useLocalSearchParams();
  const email = params.email || 'usuario@ejemplo.com';

  const bg = colorScheme === 'dark' ? '#1f1f1f' : '#f5f5f5';
  const border = colorScheme === 'dark' ? '#2a2a2a' : '#e0e0e0';

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 3) {
      inputs.current[index + 1]?.focus();
    }

    if (newCode.every((digit) => digit !== '') && index === 3) {
      handleVerify();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const verificationCode = code.join('');
    console.log('Verifying code:', verificationCode);
    router.push('/auth/new-password');
  };

  const handleResend = () => {
    setResendTimer(60);
    console.log('Resending code...');
  };

  const isCodeComplete = code.every((digit) => digit !== '');

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
          <View style={styles.content}>
            {}
            <View style={styles.header}>
              <Pressable onPress={() => router.back()} style={styles.backButton}>
                <IconSymbol name="chevron.left" size={24} color={colors.text} />
              </Pressable>
            </View>

            {}
            <View style={styles.titleSection}>
              <ThemedText type="title" style={styles.title}>
                Verificación
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                Hemos enviado un código a{'\n'}
                <ThemedText style={styles.emailText}>{email}</ThemedText>
              </ThemedText>
            </View>

            {}
            <View style={styles.codeContainer}>
              {code.map((digit, index) => {
                const isFilled = digit !== '';
                return (
                  <View
                    key={index}
                    style={[
                      styles.codeInputWrapper,
                      isFilled && styles.codeInputWrapperFilled,
                      {
                        backgroundColor: isFilled
                          ? EventuColors.hotPink + '10' 
                          : bg,
                        borderColor: isFilled
                          ? EventuColors.hotPink
                          : border,
                      },
                    ]}
                  >
                    <TextInput
                      ref={(ref) => (inputs.current[index] = ref)}
                      style={[
                        styles.codeInput,
                        { color: colors.text },
                        isFilled && styles.codeInputFilled,
                      ]}
                      value={digit}
                      onChangeText={(text) => handleCodeChange(text, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                    />
                    {isFilled && (
                      <View style={styles.checkmark}>
                        <IconSymbol
                          name="checkmark"
                          size={16}
                          color={EventuColors.hotPink}
                        />
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            {}
            <Pressable
              style={({ pressed }) => [
                styles.button,
                !isCodeComplete && styles.buttonDisabled,
                { opacity: pressed || !isCodeComplete ? 0.7 : 1 },
              ]}
              onPress={handleVerify}
              disabled={!isCodeComplete}
            >
              <LinearGradient
                colors={[EventuColors.hotPink + 'CC', EventuColors.magenta + 'CC']} 
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <ThemedText style={styles.buttonText}>Verificar</ThemedText>
              </LinearGradient>
            </Pressable>

            {}
            <View style={styles.resendContainer}>
              <ThemedText style={styles.resendText}>
                ¿No recibiste el código?{' '}
              </ThemedText>
              <Pressable
                onPress={handleResend}
                disabled={resendTimer > 0}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <ThemedText
                  style={[
                    styles.resendLink,
                    resendTimer > 0 && styles.resendLinkDisabled,
                  ]}
                >
                  Reenviar {resendTimer > 0 ? `(${resendTimer}s)` : ''}
                </ThemedText>
              </Pressable>
            </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
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
    marginBottom: 48,
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
    textAlign: 'center',
  },
  emailText: {
    fontWeight: '600',
    color: EventuColors.hotPink,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    gap: 12,
  },
  codeInputWrapper: {
    flex: 1,
    height: 70,
    borderWidth: 1.5,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...Shadows.sm,
  },
  codeInputWrapperFilled: {
    ...Shadows.md,
    shadowColor: EventuColors.hotPink + '66', 
  },
  codeInput: {
    width: '100%',
    height: '100%',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    padding: 0,
  },
  codeInputFilled: {
    
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  button: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    marginBottom: 24,
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
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  resendText: {
    fontSize: 14,
    opacity: 0.7,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '600',
    color: EventuColors.hotPink,
  },
  resendLinkDisabled: {
    color: EventuColors.mediumGray,
    opacity: 0.5,
  },
});
