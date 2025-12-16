import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { EventuColors } from '@/constants/theme';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/(tabs)');
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={EventuColors.hotPink} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: EventuColors.white,
  },
});
