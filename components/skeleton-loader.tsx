import { EventuColors } from '@/constants/theme';
import { Radius } from '@/constants/theme-extended';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
}

export function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = Radius.md,
  style,
  variant = 'rectangular',
}: SkeletonLoaderProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const getVariantStyles = () => {
    switch (variant) {
      case 'circular':
        return { borderRadius: height / 2, width: height, height };
      case 'text':
        return { height: 16, borderRadius: Radius.sm };
      case 'card':
        return { borderRadius: Radius.xl, padding: 16 };
      default:
        return { borderRadius };
    }
  };

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height: variant === 'circular' ? height : height,
          opacity,
          ...getVariantStyles(),
        },
        style,
      ]}
    />
  );
}

export function SkeletonCard({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.cardContainer, style]}>
      <SkeletonLoader variant="rectangular" height={200} borderRadius={Radius.xl} />
      <View style={styles.cardContent}>
        <SkeletonLoader variant="text" width="70%" height={20} />
        <SkeletonLoader variant="text" width="50%" height={16} style={{ marginTop: 8 }} />
        <SkeletonLoader variant="text" width="40%" height={16} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

export function SkeletonEventCard({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.eventCardContainer, style]}>
      <SkeletonLoader variant="rectangular" height={180} borderRadius={Radius.xl} />
      <View style={styles.eventCardContent}>
        <SkeletonLoader variant="text" width="80%" height={18} />
        <SkeletonLoader variant="text" width="60%" height={14} style={{ marginTop: 8 }} />
        <View style={styles.eventCardMeta}>
          <SkeletonLoader variant="text" width={60} height={14} />
          <SkeletonLoader variant="text" width={80} height={14} />
        </View>
      </View>
    </View>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonLoader
          key={index}
          variant="rectangular"
          height={60}
          style={{ marginBottom: 12 }}
        />
      ))}
    </View>
  );
}

export function SkeletonProfile({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.profileContainer, style]}>
      <SkeletonLoader variant="circular" height={100} />
      <SkeletonLoader variant="text" width="60%" height={24} style={{ marginTop: 16 }} />
      <SkeletonLoader variant="text" width="40%" height={16} style={{ marginTop: 8 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: EventuColors.lightGray,
  },
  cardContainer: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: EventuColors.white,
    marginBottom: 16,
  },
  cardContent: {
    padding: 16,
  },
  eventCardContainer: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: EventuColors.white,
    marginBottom: 20,
  },
  eventCardContent: {
    padding: 16,
  },
  eventCardMeta: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  listContainer: {
    padding: 16,
  },
  profileContainer: {
    alignItems: 'center',
    padding: 20,
  },
});
