import { useEffect, useRef } from 'react';
import * as ScreenCapture from 'expo-screen-capture';
import { Platform } from 'react-native';
import { usePathname } from 'expo-router';

const ALLOWED_ROUTES: string[] = []; 

const BLOCKED_ROUTES: string[] = [];

export function useScreenCapture(enabled: boolean = true, route?: string) {
  const pathname = usePathname();
  const currentRoute = route || pathname || '';
  const isBlockedRef = useRef(false);

  useEffect(() => {
    
    const shouldBlock = enabled;

    
    if (Platform.OS === 'web') {
      return; 
    }

    if (shouldBlock && !isBlockedRef.current) {
      isBlockedRef.current = true;
      ScreenCapture.preventScreenCaptureAsync().catch(() => {
        
      });
    } else if (!shouldBlock && isBlockedRef.current) {
      isBlockedRef.current = false;
      ScreenCapture.allowScreenCaptureAsync().catch(() => {
        
      });
    }

    
    return () => {
      
      
    };
  }, [enabled, currentRoute]);
}

export function useGlobalScreenCaptureBlock(enabled: boolean = true) {
  const pathname = usePathname();
  const currentRoute = pathname || '';
  const isBlockedRef = useRef(false);
  const intervalRef = useRef<number | null>(null);

  
  const applyBlock = () => {
    if (Platform.OS === 'web') return;
    
    ScreenCapture.preventScreenCaptureAsync()
      .then(() => {
        isBlockedRef.current = true;
      })
      .catch(() => {
        
      });
  };

  useEffect(() => {
    
    const shouldBlock = enabled;

    
    if (Platform.OS === 'web') {
      return; 
    }

    if (shouldBlock) {
      
      applyBlock();
      
      
      intervalRef.current = setInterval(() => {
        applyBlock();
      }, 2000) as unknown as number;
      
    } else if (!shouldBlock && isBlockedRef.current) {
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      isBlockedRef.current = false;
      ScreenCapture.allowScreenCaptureAsync().catch(() => {
        
      });
    }

    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
    };
  }, [enabled, currentRoute]);

  
  useEffect(() => {
    if (Platform.OS !== 'web' && enabled) {
      applyBlock();
    }
  }, [pathname, enabled]);
}

