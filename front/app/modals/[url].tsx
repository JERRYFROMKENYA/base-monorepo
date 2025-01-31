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
  const [players, setPlayer] = useState<any>([]);

  useEffect(() => {
    getHomeRunByPlayId(url).then((data)=>{
      setHrData(data)
      getTeamPlayers(data[0].video,data[0].season).then((data)=>{
        setTeamData(data);
        let i=0
        for (const datum of data) {
          setPlayer([...players, ...datum.players])
          i++;
        }

      })

    })
  }, [])

  return(
    <Surface style={styles.screen}>
      <ScreenInfo title={url} path="app/modal.tsx" />

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      {teamData&&<><Text>Players</Text>
        {players.map((player: any) => (
          <Text>{player?.name}</Text>
        ))}
</>}


    </Surface>
  )
}
export default Url
