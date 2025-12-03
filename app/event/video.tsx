import { EventuColors } from '@/constants/theme';
import { router, useLocalSearchParams } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import {
  Dimensions,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

export default function TeaserVideoScreen() {
  const { id, videoUrl, eventName } = useLocalSearchParams<{
    id: string;
    videoUrl: string;
    eventName: string;
  }>();
  const [isFullscreen, setIsFullscreen] = useState(true);

  const videoUrlToPlay = videoUrl || 'https://example.com/video.mp4';
  const eventTitle = eventName || 'Evento';

  const player = useVideoPlayer(videoUrlToPlay, (player) => {
    player.loop = false;
    player.muted = false;
    player.play();
  });

  return (
    <View style={styles.container}>
      <StatusBar hidden={isFullscreen} />
      
      {!isFullscreen && (
        <SafeAreaView style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={EventuColors.white} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {eventTitle}
            </Text>
          </View>
          <View style={styles.backButton} />
        </SafeAreaView>
      )}

      <View style={styles.videoContainer}>
        <VideoView
          player={player}
          style={styles.video}
          nativeControls
          contentFit="contain"
          allowsFullscreen
          allowsPictureInPicture
        />
      </View>

      {!isFullscreen && (
        <View style={styles.infoOverlay}>
          <View style={styles.infoCard}>
            <Text style={styles.eventName}>{eventTitle}</Text>
            <Text style={styles.eventSubtitle}>Video promocional</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: EventuColors.white,
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: width,
    height: height,
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    backdropFilter: 'blur(10px)',
  },
  eventName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: EventuColors.white,
    marginBottom: 4,
  },
  eventSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
