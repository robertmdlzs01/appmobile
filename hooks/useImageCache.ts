import { useState, useEffect } from 'react';
import * as FileSystem from 'expo-file-system';

interface ImageCacheInfo {
  uri: string;
  cachedUri: string | null;
  isCached: boolean;
  isLoading: boolean;
}

export function useImageCache(imageUri: string | null): ImageCacheInfo {
  const [cachedUri, setCachedUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!imageUri) {
      setCachedUri(null);
      return;
    }

    if (imageUri.startsWith('file:
      setCachedUri(imageUri);
      return;
    }

    const checkCache = async () => {
      try {
        const filename = imageUri.split('/').pop() || 'image';
        const cacheDir = `${FileSystem.cacheDirectory}images/`;
        const cachedPath = `${cacheDir}${filename}`;

        const fileInfo = await FileSystem.getInfoAsync(cachedPath);
        
        if (fileInfo.exists) {
          setCachedUri(cachedPath);
        } else {
          
          setIsLoading(true);
          await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
          
          const downloadResult = await FileSystem.downloadAsync(imageUri, cachedPath);
          
          if (downloadResult.status === 200) {
            setCachedUri(downloadResult.uri);
          } else {
            
            setCachedUri(imageUri);
          }
        }
      } catch (error) {
        console.error('Error caching image:', error);
        
        setCachedUri(imageUri);
      } finally {
        setIsLoading(false);
      }
    };

    checkCache();
  }, [imageUri]);

  return {
    uri: imageUri,
    cachedUri,
    isCached: cachedUri !== null && cachedUri !== imageUri,
    isLoading,
  };
}

export async function clearImageCache(): Promise<void> {
  try {
    const cacheDir = `${FileSystem.cacheDirectory}images/`;
    const dirInfo = await FileSystem.getInfoAsync(cacheDir);
    
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(cacheDir, { idempotent: true });
    }
  } catch (error) {
    console.error('Error clearing image cache:', error);
  }
}

export async function getImageCacheSize(): Promise<number> {
  try {
    const cacheDir = `${FileSystem.cacheDirectory}images/`;
    const dirInfo = await FileSystem.getInfoAsync(cacheDir);
    
    if (!dirInfo.exists) {
      return 0;
    }

    return 0;
  } catch (error) {
    console.error('Error getting image cache size:', error);
    return 0;
  }
}
