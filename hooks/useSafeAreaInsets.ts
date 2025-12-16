import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

/**
 * Hook para obtener el padding top seguro para headers
 * En iOS respeta la isla dinámica/Dynamic Island
 * En Android respeta la barra de estado
 */
export function useSafeAreaHeaderPadding() {
  const insets = useSafeAreaInsets();
  
  // En iOS, usar el top inset directamente (incluye Dynamic Island)
  // En Android, usar el top inset para respetar la status bar
  return {
    paddingTop: insets.top,
    safeAreaTop: insets.top,
    safeAreaBottom: insets.bottom,
    safeAreaLeft: insets.left,
    safeAreaRight: insets.right,
  };
}

