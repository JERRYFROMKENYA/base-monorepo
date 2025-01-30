import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { Surface, Text } from 'react-native-paper'
import {useLocalSearchParams} from 'expo-router'
import { Locales, ScreenInfo, styles } from '@/lib'
import { getHomeRunByPlayId, getTeamPlayers } from '@/lib/data/mlb_data/videos'

const Url = () => {
  const {url} = useLocalSearchParams()
  const [teamData, setTeamData] = useState<any>(null);
  const [hrData, setHrData] = useState<any>(null);

  useEffect(() => {
    getHomeRunByPlayId(url).then((data)=>{
      setHrData(data)
      getTeamPlayers(data[0].video,data[0].season).then((data)=>{
        setTeamData(data);
      })

    })
  }, [])

  return(
    <Surface style={styles.screen}>
      <ScreenInfo title={url} path="app/modal.tsx" />

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      {teamData&&<><Text>Players</Text>
        <Text>{teamData[0]?.players[0]?.name||"none"}</Text>
</>}


    </Surface>
  )
}
export default Url
