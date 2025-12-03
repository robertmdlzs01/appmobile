import { EventuColors } from '@/constants/theme';
import { Radius } from '@/constants/theme-extended';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

export type BookingStep = 'details' | 'review' | 'payment' | 'confirmation';

interface BookingProgressProps {
  currentStep: BookingStep;
}

const steps: { key: BookingStep; label: string; icon: string }[] = [
  { key: 'details', label: 'Detalles', icon: 'person' },
  { key: 'review', label: 'Revisar', icon: 'check-circle' },
  { key: 'payment', label: 'Pago', icon: 'payment' },
  { key: 'confirmation', label: 'Confirmado', icon: 'done' },
];

export function BookingProgress({ currentStep }: BookingProgressProps) {
  const currentStepIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStepIndex;
        const isCurrent = index === currentStepIndex;
        const isUpcoming = index > currentStepIndex;

        return (
          <React.Fragment key={step.key}>
            <View style={styles.stepContainer}>
              <View
                style={[
                  styles.stepCircle,
                  isCompleted && styles.stepCircleCompleted,
                  isCurrent && styles.stepCircleCurrent,
                  isUpcoming && styles.stepCircleUpcoming,
                ]}>
                {isCompleted ? (
                  <MaterialIcons name="check" size={16} color={EventuColors.white} />
                ) : (
                  <MaterialIcons
                    name={step.icon as any}
                    size={16}
                    color={
                      isCurrent
                        ? EventuColors.white
                        : isUpcoming
                        ? EventuColors.mediumGray
                        : EventuColors.white
                    }
                  />
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  isCurrent && styles.stepLabelCurrent,
                  isUpcoming && styles.stepLabelUpcoming,
                ]}>
                {step.label}
              </Text>
            </View>
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.connector,
                  index < currentStepIndex && styles.connectorCompleted,
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: EventuColors.white,
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCircleCompleted: {
    backgroundColor: EventuColors.success,
  },
  stepCircleCurrent: {
    backgroundColor: EventuColors.hotPink,
    transform: [{ scale: 1.1 }],
  },
  stepCircleUpcoming: {
    backgroundColor: EventuColors.lightGray,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: EventuColors.black,
    textAlign: 'center',
  },
  stepLabelCurrent: {
    color: EventuColors.hotPink,
  },
  stepLabelUpcoming: {
    color: EventuColors.mediumGray,
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: EventuColors.lightGray,
    marginHorizontal: 8,
    marginBottom: 26,
  },
  connectorCompleted: {
    backgroundColor: EventuColors.success,
  },
});
