import React, { useEffect, useState, useCallback, useRef, memo } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { View } from '@/lib/presentation/Themed';
import { Text, Chip, Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Locales } from '@/lib';
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { getTeamPlayers } from '@/lib/data/mlb_data/videos';
import Url from '@/app/modals/Url';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;
const DOUBLE_PRESS_DELAY = 500;

const VideoPlayer = ({ item, index, isViewable, isLiked, isBookmarked }: any) => {
  const router = useRouter();
  const [liked, setLiked] = useState(isLiked);
  const [teamData, setTeamData] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const player = useVideoPlayer(item.video, (player) => {
    player.loop = true;
    if (isViewable) player.play();
    player.bufferOptions = { preferredForwardBufferDuration: 1 };
  });

  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

  useEffect(() => {
    isViewable ? player.play() : player.pause();
  }, [isViewable]);

  const toggleLike = useCallback(() => setLiked((prev) => !prev), []);

  const togglePlayPause = useCallback(() => {
    isPlaying ? player.pause() : player.play();
  }, [isPlaying]);

  const debouncePress = useCallback((singlePress: () => void, doublePress: () => void) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      doublePress();
    } else {
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        singlePress();
      }, DOUBLE_PRESS_DELAY);
    }
  }, []);

  return (
    <View>
      <TouchableOpacity
        style={styles.touchableContainer}
        onPress={() => debouncePress(togglePlayPause, toggleLike)}
        delayLongPress={300}
      >
        <VideoView style={styles.video} player={player} contentFit="cover" nativeControls={false} />
      </TouchableOpacity>

      {item.title && (
        <View style={styles.videoOverlay}>
          <Text variant="bodyLarge">{item.title}</Text>
          <View style={styles.chipContainer}>
            <Chip icon="baseball-bat" style={styles.chip}>
              {`${Locales.t('exitVelocity')}: ${item.ExitVelocity} mph`}
            </Chip>
            <Chip icon="angle-acute" style={styles.chip}>
              {`${Locales.t('launchAngle')}: ${item.LaunchAngle}°`}
            </Chip>
            <Chip icon="clock" style={styles.chip}>
              {`${item.season}`}
            </Chip>
            <Chip style={styles.chip} onPress={() => setModalVisible(true)}>
              More...
            </Chip>
          </View>
        </View>
      )}

      <View style={styles.iconContainer}>
        <TouchableOpacity style={styles.icon} onPress={toggleLike}>
          <Icon source="heart" size={50} color={liked ? '#e86d6d' : undefined} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.icon} onPress={() => {}}>
          <Icon source="bookmark" size={50} color={isBookmarked ? '#e4c92a' : undefined} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.icon} onPress={() => setModalVisible(true)}>
          <Icon source="baseball" size={50} />
        </TouchableOpacity>
      </View>

      <Modal
        presentationStyle="pageSheet"
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Url url={item.play_id} onClose={() => setModalVisible(false)} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  touchableContainer: {
    height: SCREEN_HEIGHT,
    width: SCREEN_WIDTH,
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  videoOverlay: {
    position: 'absolute',
    alignSelf: 'center',
    justifyContent: 'center',
    width: '100%',
    bottom: 0,
    paddingBottom: 40,
    padding: 5,
    borderRadius: 15,
    backgroundColor:"none"
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 10,
    alignSelf: 'flex-end',
    paddingHorizontal: 10,
    backgroundColor:"none"
  },
  chip: {
    margin: 3,
  },
  iconContainer: {
    position: 'absolute',
    top: '45%',
    right: 0,
    margin: 5,
    justifyContent: 'space-around',
    backgroundColor:"none"
  },
  icon: {
    marginBottom: 15,
  },
});

export default memo(VideoPlayer);
