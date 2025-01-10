import React, { useRef } from 'react'
import { Surface } from 'react-native-paper'
// import VideoPlayer from 'react-native-video-player';
import { Locales, ScreenInfo, styles } from '@/lib'
import FantasyTeamViewer from '@/lib/ui/components/FantasyTeamViewer'
import Video, {VideoRef} from 'react-native-video';
import { StyleSheet } from 'react-native'
const ForYou = () => {
  const videoRef = useRef<VideoRef>(null);


  return(
    <Surface style={styles.screen}>
      {/*<Video*/}
      {/*  // Can be a URL or a local file.*/}
      {/*  source={background}*/}
      {/*  // Store reference*/}
      {/*  ref={videoRef}*/}
      {/*  // Callback when remote video is buffering*/}
      {/*  onBuffer={onBuffer}*/}
      {/*  // Callback when video cannot be loaded*/}
      {/*  onError={onError}*/}
      {/*  style={styles.backgroundVideo}*/}
      {/*/>*/}

    </Surface>
  )
}

const style = StyleSheet.create({
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});

export default ForYou