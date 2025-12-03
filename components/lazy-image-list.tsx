import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { OptimizedImage } from './optimized-image';

interface LazyImageListProps {
  images: Array<{ id: string; uri: string; priority?: 'low' | 'normal' | 'high' }>;
  renderItem: (item: { id: string; uri: string }, index: number) => React.ReactNode;
  containerStyle?: ViewStyle;
  threshold?: number; 
  initialNumToRender?: number; 
}

export function LazyImageList({
  images,
  renderItem,
  containerStyle,
  threshold = 200,
  initialNumToRender = 5,
}: LazyImageListProps) {
  const [visibleRange, setVisibleRange] = useState({
    start: 0,
    end: Math.min(initialNumToRender, images.length),
  });

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length === 0) return;

    const firstIndex = viewableItems[0]?.index ?? 0;
    const lastIndex = viewableItems[viewableItems.length - 1]?.index ?? images.length - 1;

    setVisibleRange({
      start: Math.max(0, firstIndex - 2), 
      end: Math.min(images.length - 1, lastIndex + 2), 
    });
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 100,
  }).current;

  return (
    <View style={[styles.container, containerStyle]}>
      {images.map((image, index) => {
        const isVisible = index >= visibleRange.start && index <= visibleRange.end;
        
        return (
          <View key={image.id} style={styles.itemContainer}>
            {isVisible ? (
              renderItem(image, index)
            ) : (
              <View style={styles.placeholder} />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  itemContainer: {
    width: '100%',
  },
  placeholder: {
    aspectRatio: 16 / 9,
    backgroundColor: '#f0f0f0',
  },
});
