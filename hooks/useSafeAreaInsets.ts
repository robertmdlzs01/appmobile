import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';


export function useSafeAreaHeaderPadding() {
  const insets = useSafeAreaInsets();
  
  
  
  return {
    paddingTop: insets.top,
    safeAreaTop: insets.top,
    safeAreaBottom: insets.bottom,
    safeAreaLeft: insets.left,
    safeAreaRight: insets.right,
  };
}

