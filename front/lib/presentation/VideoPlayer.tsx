import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { View } from '@/lib/presentation/Themed';
import { Text, Chip, Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Locales } from '@/lib';
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';

const VideoPlayer = ({ item, index, isViewable, isLiked, isBookmarked }: any) => {
  const router = useRouter();
  const [liked, setLiked] = useState(isLiked);

  const player = useVideoPlayer(item.video, (player) => {
    player.loop = true;
    isViewable && player.play();
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
  const handlePress=()=>{
    if(isPlaying){
      player.pause();
  }
  else{
    player.play();
  }
  }
  return (
    <View>
      <TouchableOpacity style={{height:Dimensions.get("window").height,width:Dimensions.get("window").width}} onPress={handlePress} onLongPress={handleDoublePress} delayLongPress={300}>
        <VideoView style={styles.video} player={player} contentFit={'cover'} nativeControls={false} />
      </TouchableOpacity>
      {item.title && (
        <View style={styles.videoOverlay}>
          <Text variant={"bodyLarge"}>{item.title}</Text>
          <View style={{ display: 'flex', flexDirection: 'row', backgroundColor: 'none', paddingTop: 10, alignSelf: 'flex-end', alignContent: 'space-between', flexWrap: 'wrap', paddingHorizontal: 10 }}>
            <Chip icon={'baseball-bat'} style={{ marginRight: 3 }}>{`${Locales.t("exitVelocity")}: ${item.ExitVelocity} mph` || 0}</Chip>
            <Chip icon={'angle-acute'} style={{ marginRight: 3 }}>{`${Locales.t("launchAngle")} ${item.LaunchAngle}°` || 0}</Chip>
            <Chip style={{ marginRight: 5, marginTop: 5 }}>{`More...`}</Chip>
          </View>
        </View>
      )}
      <View style={{ position: 'absolute', top: '45%', right: 0, backgroundColor: 'none', margin: 5, justifyContent: 'space-around' }}>
        <TouchableOpacity style={{ marginBottom: 15 }} onPress={() => { }}>
          <Icon source={'heart'} size={50} color={liked ? '#e86d6d' : undefined} />
        </TouchableOpacity>
        <TouchableOpacity style={{ marginBottom: 15 }} onPress={() => { }}>
          <Icon source={'bookmark'} size={50} color={isBookmarked ? '#e4c92a' : undefined} />
        </TouchableOpacity>
        <TouchableOpacity style={{ marginBottom: 15 }} onPress={() => { }}>
          <Icon source={'baseball'} size={50} />
        </TouchableOpacity>
      </View>
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
});

export default VideoPlayer;