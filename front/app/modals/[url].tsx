import { StatusBar } from 'expo-status-bar'
import React, { useEffect } from 'react'
import { Platform } from 'react-native'
import { Surface } from 'react-native-paper'
import {useLocalSearchParams} from 'expo-router'
import { Locales, ScreenInfo, styles } from '@/lib'
import { getHomeRunByPlayId } from '@/lib/data/mlb_data/videos'

const Url = () => {
  const {url} = useLocalSearchParams()

  useEffect(() => {
    getHomeRunByPlayId(url).then((data)=>{
      console.log(data)
    })
  }, [])

  return(
    <Surface style={styles.screen}>
      <ScreenInfo title={url} path="app/modal.tsx" />

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </Surface>
  )
}
export default Url
