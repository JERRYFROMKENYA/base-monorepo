import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { View } from '@/lib/presentation/Themed';
import { Text, Chip, Icon, Surface, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Locales } from '@/lib';
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { getTeamPlayers } from '@/lib/data/mlb_data/videos';
import Url from '@/app/modals/Url';

const VideoPlayer = ({ item, index, isViewable, isLiked, isBookmarked, hasMetadata }: any) => {
  const router = useRouter();
  const [liked, setLiked] = useState(isLiked);
  const [teamData, setTeamData] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const getTeamData = () => {
    getTeamPlayers(item.video, item.season).then((data) => {
      console.log(data);
      setTeamData(data);
    });
  };

  const player = useVideoPlayer(item.video, (player) => {
    player.loop = true;
    isViewable && player.play();
    player.bufferOptions = { preferredForwardBufferDuration: 1 };
  });
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

  useEffect(() => {
    if (isViewable) {
      player.play();
    } else {
      player.pause();
    }
  }, [index, isViewable, router]);

  const handleDoublePress = () => {
    setLiked(!liked);
  };

  const handlePress = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  let timer: NodeJS.Timeout | null = null;
  const TIMEOUT = 500;

  const debounce = (onSingle: () => void, onDouble: () => void) => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
      onDouble();
    } else {
      timer = setTimeout(() => {
        timer = null;
        onSingle();
      }, TIMEOUT);
    }
  };

  const handleOnPress = () => {
    debounce(handlePress, handleDoublePress);
  };

  return (
    <View>
      <TouchableOpacity
        style={{ height: Dimensions.get('window').height, width: Dimensions.get('window').width }}
        onPress={handleOnPress}
        delayLongPress={300}
      >
        <VideoView style={styles.video} player={player} contentFit={'cover'} nativeControls={false} />
      </TouchableOpacity>
      {item.title && (
        <View style={styles.videoOverlay}>
          <Text variant={"bodyLarge"}>{item.title}</Text>
          <View style={styles.chipContainer}>
            <Chip icon={'baseball-bat'} style={styles.chip}>{`${Locales.t("exitVelocity")}: ${item.ExitVelocity} mph` || 0}</Chip>
            <Chip icon={'angle-acute'} style={styles.chip}>{`${Locales.t("launchAngle")} ${item.LaunchAngle}°` || 0}</Chip>
            <Chip icon={'clock'} style={styles.chip}>{`${item.season}` || 0}</Chip>
            <Chip style={styles.chip} onPress={() => setModalVisible(true)}>{`More...`}</Chip>
          </View>
        </View>
      )}
      <View style={styles.iconContainer}>
        <TouchableOpacity style={styles.icon} onPress={() => { }}>
          <Icon source={'heart'} size={50} color={liked ? '#e86d6d' : undefined} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.icon} onPress={() => { }}>
          <Icon source={'bookmark'} size={50} color={isBookmarked ? '#e4c92a' : undefined} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.icon} onPress={() => setModalVisible(true)}>
          <Icon source={'baseball'} size={50} />
        </TouchableOpacity>
      </View>

      <Modal
        presentationStyle={"pageSheet"}
        animationType="slide"
        // transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Url url={item.play_id} onClose={()=>{setModalVisible(false)}} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  video: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  videoOverlay: {
    flexGrow: 1,
    position: 'absolute',
    alignSelf: 'center',
    justifyContent: 'center',
    width: '100%',
    right: 0,
    bottom: 0,
    backgroundColor: 'none',
    paddingBottom: 40,
    padding: 5,
    borderRadius: 15,
  },
  chipContainer: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: 'none',
    paddingTop: 10,
    alignSelf: 'flex-end',
    alignContent: 'space-between',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  chip: {
    margin: 3,
  },
  iconContainer: {
    position: 'absolute',
    top: '45%',
    right: 0,
    backgroundColor: 'none',
    margin: 5,
    justifyContent: 'space-around',
  },
  icon: {
    marginBottom: 15,
  },
});

export default VideoPlayer;