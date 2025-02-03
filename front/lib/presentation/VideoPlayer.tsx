import React, { useEffect, useState, useCallback, useRef, memo } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { View } from '@/lib/presentation/Themed';
import { Text, Chip, Icon } from 'react-native-paper';
import { useRouter, useSegments } from 'expo-router';
import { Locales } from '@/lib';
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import {
  getBatSpeed, getDetails,
  getHomeRunByPlayId,
  getPlayExplanation,
  getSummary,
  getTeamPlayers, getTranslation,
} from '@/lib/data/mlb_data/videos';
import Url from '@/app/modals/Url';
import * as Localization from 'expo-localization';
import {
  bookmarkHomeRunVideo,
  getIsBookmark,
  getIsLiked,
  likeHomeRunVideo,
  unbookmarkHomeRunVideo,
  unlikeHomeRunVideo,
} from '@/lib/data/pocketbase/video'
import { useAuth } from '@/lib/data/pocketbase/auth';
import { usePocketBase } from '@/lib/data/pocketbase';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;
const DOUBLE_PRESS_DELAY = 500;

const VideoPlayer = ({ item, index, isViewable }: any) => {
  const segments = useSegments();
  const inPlayableZone = segments[1] === 'for_you';
  const [liked, setLiked] = useState(false);
  const [teamData, setTeamData] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { user } = useAuth();
  const { pb } = usePocketBase();

  const player = useVideoPlayer(item.video, (player) => {
    player.loop = true;
    if (isViewable) player.play();
  });

  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

  useEffect(() => {
    isViewable ? player.play() : player.pause();
    if (!inPlayableZone) player.pause();
  }, [isViewable, segments]);
  useEffect(() => {
    getIsBookmark(item.play_id, user, pb).then((isBookmarked) => isBookmarked);
    getIsLiked(item.play_id, user, pb).then((isLiked) => setLiked(isLiked));
  }, [isViewable]);
  const toggleLike = useCallback(() => {
    setLiked((prevLiked) => !prevLiked);
    if (!liked) {
      likeHomeRunVideo(user, pb, item.play_id).catch(() => setLiked(false));
    } else {
      unlikeHomeRunVideo(user, pb, item.play_id).catch(() => setLiked(true));
    }
  }, [liked, user, pb, item.play_id]);

  const toggleBookmark = useCallback(() => {
    setIsBookmarked((prevBookmarked) => !prevBookmarked);
    if (!isBookmarked) {
      bookmarkHomeRunVideo(user, pb, item.play_id).catch(() => setIsBookmarked(false));
    } else {
      unbookmarkHomeRunVideo(user, pb, item.play_id).catch(() => setIsBookmarked(true));
    }
  }, [isBookmarked, user, pb, item.play_id]);

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
    if (!inPlayableZone) return;
    const fetchData = async () => {
      try {
        const [hr_data] = await getHomeRunByPlayId(item.play_id);
        if (!hr_data) return console.error('No home run data found.');

        setHrData(hr_data);

        const allData = await getDetails(hr_data.video);
        const bat_data = allData.bat_speed;
        const summary = allData.summary;
        const explanationData = allData.explanation;

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
        <VideoView style={styles.video} player={player} contentFit="cover" nativeControls={false} />
      </TouchableOpacity>

      {item.title && (
        <View style={styles.videoOverlay}>
          <Text variant="bodyLarge" style={{ color: "white" }}>{item.title}</Text>
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
          {liked ? <Icon source="heart" size={50} color={"white"} /> :
            <Icon size={50} source={'heart-outline'} color={"white"} />}
          <Text style={{ color: "white" }}>{liked?"Liked":"Like"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.icon} onPress={toggleBookmark}>
          {isBookmarked ? <Icon source="bookmark" size={50} color={"white"} /> :
            <Icon source="bookmark-outline" size={50} color={"white"} />}
          <Text style={{ color: "white" }}>{isBookmarked?"Bookmarked":"Bookmark"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.icon} onPress={() => setModalVisible(true)}>
          <Icon source="baseball" size={50} color={"white"} />
          <Text style={{ color: "white" }}>Analyze</Text>
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
    backgroundColor: "none"
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 10,
    alignSelf: 'flex-end',
    paddingHorizontal: 10,
    backgroundColor: "none"
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
    backgroundColor: "none"
  },
  icon: {
    marginBottom: 15,
    alignContent: "center",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
    alignSelf: 'center'
  },
});

export default memo(VideoPlayer);
