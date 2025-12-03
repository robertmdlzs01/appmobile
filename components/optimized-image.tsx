import { Image } from 'expo-image';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View, ViewStyle, ImageStyle } from 'react-native';
import { EventuColors } from '@/constants/theme';

interface OptimizedImageProps {
  source: string | number | { uri: string };
  style?: ViewStyle | ImageStyle | (ViewStyle | ImageStyle)[];
  placeholder?: string;
  contentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scaleDown';
  transition?: number;
  cachePolicy?: 'none' | 'disk' | 'memory' | 'memory-disk';
  priority?: 'low' | 'normal' | 'high';
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: any) => void;
  blurhash?: string;
  recyclingKey?: string;
}

export function OptimizedImage({
  source,
  style,
  placeholder,
  contentFit = 'cover',
  transition = 300,
  cachePolicy = 'memory-disk',
  priority = 'normal',
  onLoadStart,
  onLoadEnd,
  onError,
  blurhash,
  recyclingKey,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
    onLoadStart?.();
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
    onLoadEnd?.();
  };

  const handleError = (error: any) => {
    setIsLoading(false);
    setHasError(true);
    onError?.(error);
  };

  if (typeof source === 'number') {
    return (
      <Image
        source={source}
        style={style}
        contentFit={contentFit}
        transition={transition}
        cachePolicy={cachePolicy}
        priority={priority}
        recyclingKey={recyclingKey}
      />
    );
  }

  if (hasError) {
    return (
      <View style={[style, styles.errorContainer]}>
        <Image
          source={require('@/assets/images/react-logo.png')}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
      </View>
    );
  }

  return (
    <View style={style}>
      <Image
        source={typeof source === 'string' ? { uri: source } : source}
        style={StyleSheet.absoluteFill}
        contentFit={contentFit}
        transition={transition}
        cachePolicy={cachePolicy}
        priority={priority}
        recyclingKey={recyclingKey}
        placeholder={placeholder || blurhash}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        placeholderContentFit="cover"
      />
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={EventuColors.hotPink} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: EventuColors.lightGray + '50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: EventuColors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
