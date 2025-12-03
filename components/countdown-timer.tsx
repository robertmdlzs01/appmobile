
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { Radius } from '@/constants/theme-extended';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

interface CountdownTimerProps {
  targetDate: Date;
  title?: string;
  subtitle?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer({ targetDate, title, subtitle }: CountdownTimerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <ThemedView style={styles.container}>
      {title && (
        <ThemedText style={[styles.title, { color: colors.tint }]}>{title}</ThemedText>
      )}
      {subtitle && (
        <ThemedText type="subtitle" style={styles.subtitle}>
          {subtitle}
        </ThemedText>
      )}
      
      <View style={styles.timerContainer}>
        <View style={[styles.timeBox, { backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#F5F5F5' }]}>
          <ThemedText type="title" style={[styles.timeNumber, { color: colors.tint }]}>
            {String(timeLeft.days).padStart(2, '0')}
          </ThemedText>
          <ThemedText style={styles.timeLabel}>Días</ThemedText>
        </View>
        
        <View style={[styles.timeBox, { backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#F5F5F5' }]}>
          <ThemedText type="title" style={[styles.timeNumber, { color: colors.tint }]}>
            {String(timeLeft.hours).padStart(2, '0')}
          </ThemedText>
          <ThemedText style={styles.timeLabel}>Horas</ThemedText>
        </View>
        
        <View style={[styles.timeBox, { backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#F5F5F5' }]}>
          <ThemedText type="title" style={[styles.timeNumber, { color: colors.tint }]}>
            {String(timeLeft.minutes).padStart(2, '0')}
          </ThemedText>
          <ThemedText style={styles.timeLabel}>Minutos</ThemedText>
        </View>
        
        <View style={[styles.timeBox, { backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#F5F5F5' }]}>
          <ThemedText type="title" style={[styles.timeNumber, { color: colors.tint }]}>
            {String(timeLeft.seconds).padStart(2, '0')}
          </ThemedText>
          <ThemedText style={styles.timeLabel}>Segundos</ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  timerContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  timeBox: {
    flex: 1,
    borderRadius: Radius.default,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timeNumber: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  timeLabel: {
    fontSize: 11,
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
