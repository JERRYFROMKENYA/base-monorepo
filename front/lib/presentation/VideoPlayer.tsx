import React, { useEffect, useState, useCallback, useRef, memo } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { View } from '@/lib/presentation/Themed';
import { Text, Chip, Icon } from 'react-native-paper';
import { useRouter, useSegments } from 'expo-router'
import { Locales } from '@/lib';
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import {
  getBatSpeed, getDetails,
  getHomeRunByPlayId,
  getPlayExplanation,
  getSummary,
  getTeamPlayers, getTranslation,
} from '@/lib/data/mlb_data/videos'
import Url from '@/app/modals/Url';
import * as Localization from 'expo-localization'

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;
const DOUBLE_PRESS_DELAY = 500;

const VideoPlayer = ({ item, index, isViewable, isLiked, isBookmarked }: any) => {
  // const router = useRouter();
  const segments = useSegments();
  const inPlayableZone = segments[1] === 'for_you';
  const [liked, setLiked] = useState(isLiked);
  const [teamData, setTeamData] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const player = useVideoPlayer(item.video, (player) => {
    player.loop = true;
    if (isViewable) player.play();
    // player.bufferOptions = { preferredForwardBufferDuration: 1 };
  });

  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

  useEffect(() => {
    isViewable ? player.play() : player.pause();

    if (!inPlayableZone) player.pause();
  }, [isViewable, segments]);

  const toggleLike = useCallback(() => setLiked((prev) => !prev), []);

  const togglePlayPause = useCallback(() => {
    isPlaying ? player.pause() : player.play();
  }, [isPlaying, player]);
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
    debounce(togglePlayPause, toggleLike);
  };


  //data fetching
  const [hrData, setHrData] = useState<any>(null);
  const [stats, setStats] = useState({
    title: 'Loading...',
    description: 'Loading...',
    explanation: 'Loading...',
    exitVelocity: 0,
    launchAngle: 0,
    batSpeed: 0,
    ballType: '',
    hitDistance: '',
  });
  const languageCode = Localization.getLocales()[0].languageCode ?? 'en';
  useEffect(() => {
    // if (!url) return console.error('URL parameter is missing.');
    if (!inPlayableZone) return
    const fetchData = async () => {
      try {
        const [hr_data] = await getHomeRunByPlayId(item.play_id);
        if (!hr_data) return console.error('No home run data found.');

        setHrData(hr_data);

        // const [bat_data, summary, explanationData] = await Promise.all([
        //   getBatSpeed(hr_data.video),
        //   getSummary(hr_data.video),
        //   getPlayExplanation(hr_data.video),
        // ]);
        const allData= await getDetails(hr_data.video);
        console.log(allData);
        const bat_data= allData.bat_speed;
        const summary= allData.summary;
        const explanationData= allData.explanation;




        // const bat_data = await getBatSpeed(hr_data.video);
        // const summary = await getSummary(hr_data.video);
        // const explanationData = await getPlayExplanation(hr_data.video);

        let newStats = {
          title: hr_data.title || 'No Title Available',
          description: summary?.summary || 'No Description Available',
          explanation: explanationData?.explanation || 'No Explanation Available',
          exitVelocity: hr_data.ExitVelocity || 0,
          launchAngle: hr_data.LaunchAngle || 0,
          batSpeed: bat_data?.batSpeed || 0,
          ballType: bat_data?.ballType || 'Unknown',
          hitDistance: hr_data.HitDistance || 'Unknown',
        };

        if (languageCode !== 'en') {
          newStats = await translateContent(newStats);
        }

        const teams = await getTeamPlayers(hr_data.video, hr_data.season, hr_data.title);
        setTeamData(teams);

        setStats(newStats);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [item, isViewable]);

  const translateContent = async (data: any) => {
    try {
      const [titleTranslation, descriptionTranslation, explanationTranslation] = await Promise.all([
        getTranslation(data.title, languageCode),
        getTranslation(data.description, languageCode),
        data.explanation ? getTranslation(data.explanation, languageCode) : { translation: '' },
      ]);

      return {
        ...data,
        title: titleTranslation?.translation || data.title,
        description: descriptionTranslation?.translation || data.description,
        explanation: explanationTranslation?.translation || data.explanation,
      };
    } catch (error) {
      console.error('Error fetching translations:', error);
      return data;
    }
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.touchableContainer}
        onPress={handleOnPress}
      >
        <VideoView  style={styles.video} player={player} contentFit="cover" nativeControls={false} />
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
        <Url item={item} hrData={hrData} stats={stats} url={item.play_id} teamData={teamData} onClose={() => setModalVisible(false)} />
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
