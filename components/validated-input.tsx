import { IconSymbol } from '@/components/ui/icon-symbol';
import { EventuColors } from '@/constants/theme';
import { Radius } from '@/constants/theme-extended';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View, Animated, Pressable } from 'react-native';

export type ValidationRule = {
  test: (value: string) => boolean;
  message: string;
};

export type ValidatedInputProps = TextInputProps & {
  label?: string;
  icon?: string;
  error?: string;
  validationRules?: ValidationRule[];
  showValidation?: boolean;
  containerStyle?: any;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  required?: boolean;
};

export const validations = {
  required: (message = 'Este campo es requerido'): ValidationRule => ({
    test: (value) => value.trim().length > 0,
    message,
  }),
  email: (message = 'Correo electrónico inválido'): ValidationRule => ({
    test: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message,
  }),
  minLength: (length: number, message?: string): ValidationRule => ({
    test: (value) => value.length >= length,
    message: message || `Mínimo ${length} caracteres`,
  }),
  password: (message = 'La contraseña debe tener al menos 8 caracteres'): ValidationRule => ({
    test: (value) => value.length >= 8,
    message,
  }),
  phone: (message = 'Teléfono inválido'): ValidationRule => ({
    test: (value) => {
      const phoneRegex = /^[0-9]{10,15}$/;
      return phoneRegex.test(value.replace(/\s/g, ''));
    },
    message,
  }),
  match: (matchValue: string, message = 'Los valores no coinciden'): ValidationRule => ({
    test: (value) => value === matchValue,
    message,
  }),
};

export function ValidatedInput({
  label,
  icon,
  error: externalError,
  validationRules = [],
  showValidation = true,
  containerStyle,
  leftIcon,
  rightIcon,
  onRightIconPress,
  required = false,
  value = '',
  onChangeText,
  style,
  ...props
}: ValidatedInputProps) {
  const colorScheme = useColorScheme();
  const [internalError, setInternalError] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [shakeAnimation] = useState(new Animated.Value(0));

  const error = externalError || internalError;
  const showError = showValidation && hasInteracted && error;
  const isValid = !error && hasInteracted;

  useEffect(() => {
    if (hasInteracted && validationRules.length > 0 && value) {
      for (const rule of validationRules) {
        if (!rule.test(value)) {
          setInternalError(rule.message);
          return;
        }
      }
      setInternalError('');
    } else if (hasInteracted && required && !value) {
      setInternalError('Este campo es requerido');
    } else if (hasInteracted && !value && !required) {
      setInternalError('');
    }
  }, [value, validationRules, hasInteracted, required]);

  const handleChangeText = (text: string) => {
    setHasInteracted(true);
    onChangeText?.(text);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setHasInteracted(true);
    props.onFocus?.(undefined as any);
  };

  const handleBlur = () => {
    setIsFocused(false);
    
    if (validationRules.length > 0 && value) {
      for (const rule of validationRules) {
        if (!rule.test(value)) {
          setInternalError(rule.message);
          triggerShake();
          return;
        }
      }
    }
    if (required && !value) {
      setInternalError('Este campo es requerido');
      triggerShake();
    }
    props.onBlur?.(undefined as any);
  };

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const inputBorderColor = showError
    ? EventuColors.error
    : isFocused
    ? EventuColors.hotPink
    : EventuColors.lightGray;

  const inputBackgroundColor =
    colorScheme === 'dark' ? 'rgba(21,23,35,0.85)' : '#f7f8ff';

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>
      )}
      <Animated.View
        style={[
          styles.inputWrapper,
          {
            borderColor: inputBorderColor,
            backgroundColor: inputBackgroundColor,
            borderWidth: isFocused ? 1.5 : 1,
          },
          { transform: [{ translateX: shakeAnimation }] },
        ]}>
        {(leftIcon || icon) && (
          <IconSymbol
            name={(leftIcon || icon) as any}
            size={16}
            color={showError ? EventuColors.error : EventuColors.mediumGray}
          />
        )}
        <TextInput
          {...props}
          value={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[
            styles.input,
            { color: colorScheme === 'dark' ? '#ffffff' : EventuColors.black },
            style,
          ]}
          placeholderTextColor={
            colorScheme === 'dark' ? 'rgba(148,163,184,0.5)' : 'rgba(148,163,184,0.7)'
          }
        />
        {isValid && !rightIcon && (
          <MaterialIcons name="check-circle" size={18} color={EventuColors.hotPink} />
        )}
        {rightIcon && (
          <Pressable onPress={onRightIconPress} style={styles.rightIcon}>
            <MaterialIcons
              name={rightIcon as any}
              size={18}
              color={EventuColors.mediumGray}
            />
          </Pressable>
        )}
      </Animated.View>
      {showError && (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={14} color={EventuColors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: EventuColors.black,
  },
  required: {
    color: EventuColors.error,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: Radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  rightIcon: {
    padding: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: EventuColors.error,
    flex: 1,
  },
});
