import React, { useEffect, useRef } from 'react'
import { Dimensions, StyleSheet } from 'react-native'
import {Video, ResizeMode} from "expo-av";
import { View } from '@/lib/presentation/Themed'
import { Text, Chip, Icon } from 'react-native-paper'
import { useRouter } from 'expo-router'

const VideoPlayer = ({ item, index ,isViewable, isLiked,isBookmarked }: any) => {
  const videoRef = useRef<Video>(null);
 const router = useRouter()
  useEffect(() => {
    if (isViewable) {
      videoRef.current?.playAsync();
    } else {
      videoRef.current?.pauseAsync();
    }
  }, [index,isViewable, router]);

  return (
    <View>
      <Video
        ref={videoRef}
        style={styles.video}
        source={{ uri: item.video }}
        resizeMode={ResizeMode.COVER}
        isLooping

        shouldPlay={isViewable} // Ensures only visible videos play
      />
      {item.title&&<View style={styles.videoOverlay}>
        <Text>{item.title}</Text>
        <View style={{display:"flex", flexDirection:"row", backgroundColor:"none",paddingTop:10,alignSelf:"flex-end", alignContent:"space-between", flexWrap:"wrap",paddingHorizontal:10}}>
          <Chip icon={"baseball-bat"} style={{marginRight:3, opacity:0.7}}>{`Exit Velocity: ${item.ExitVelocity} mph`||0}</Chip>
          <Chip icon={"angle-acute"} style={{marginRight:3, opacity: 0.7}}>{`Launch Angle: ${item.LaunchAngle}°`||0}</Chip>
          <Chip style={{marginRight:5,marginTop:5, opacity:0.8}}>{`More...`}</Chip>
          </View>
      </View>}
      <View style={{position:"absolute",top:"45%", right:0, backgroundColor:"none",margin:5, justifyContent:"space-around"}}>
        <Icon source={"heart"} size={50} color={isLiked&&"red"}/>
        <Icon source={"bookmark"} size={50} color={isBookmarked&&"yellow"}/>
        <Icon source={"table-eye"} size={50} />
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
    position:'absolute',
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
    width: '100%',
    right: 0,
    bottom:0,
    backgroundColor: 'rgba(0,0,0,0.18)',
    paddingBottom: 40,
    paddingTop:5,
    paddingLeft:5,
    borderRadius:15
  },
});


export default VideoPlayer