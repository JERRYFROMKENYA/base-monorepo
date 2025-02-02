import React, { memo, useEffect, useState } from 'react'
import { ScrollView, StyleSheet } from 'react-native';
import { Surface, Text, Divider, Appbar, Avatar } from 'react-native-paper'
import { Locales } from '@/lib';
import { View } from '@/lib/presentation/Themed';
import { SvgUri } from 'react-native-svg'
import { getPlayerHeadShotUrl } from '@/lib/data/mlb_data/players'

const Url = ({ onClose, hrData, stats, teamData }: { onClose: any, hrData: any, stats: any, teamData:any }) => {
  const [moreDescription, setMoreDescription] = useState<boolean>(false);
  const [moreExplanation, setMoreExplanation] = useState<boolean>(false);
  const [explanation, setExplanation] = useState<string>(stats.explanation.length > 200 ? stats.explanation.substring(0, 200) : stats.explanation);
  const [description, setDescription] = useState<string>(stats.description.length > 200 ? stats.description.substring(0, 200) : stats.description);

  useEffect(() => {
    setExplanation(!moreExplanation ? stats.explanation.substring(0, 200) : stats.explanation)
    setDescription(!moreDescription ? stats.description.substring(0, 200) : stats.description)
  }, [moreExplanation, moreDescription, stats, teamData]);


  return (
    <Surface>
      <Appbar.Header statusBarHeight={0}>
        <Appbar.BackAction onPress={onClose} />
        <Appbar.Content title={Locales.t('more_info')} />
      </Appbar.Header>
      <ScrollView style={styles.scrollView}>
        {hrData && (
          <Surface style={styles.surface}>
            <Text variant={'titleLarge'}>{stats.title}</Text>
          </Surface>
        )}



        {stats.description && (
          <Surface style={styles.textCard}>
            <Text variant={'titleSmall'} style={{ fontWeight: 'bold', marginBottom:5 }}>Description</Text>
            <Text variant={'bodyMedium'}>{description}</Text>
            {<Text onPress={()=>{setMoreDescription(!moreDescription)}} variant={'bodyMedium'}
                   style={{ fontWeight: 'bold' }}>{!moreDescription?'...more':'...less'}</Text>}
          </Surface>
        )}


        {stats.explanation && (
          <Surface style={styles.textCard}>
            <Text variant={'titleSmall'} style={{ fontWeight: 'bold', marginBottom:5 }}>✨Play Explanation</Text>
            <Text variant={'bodyMedium'}>{explanation}</Text>
            {<Text onPress={()=>{setMoreExplanation(!moreExplanation)}} variant={'bodyMedium'}
                   style={{ fontWeight: 'bold' }}>{!moreExplanation?'...more':'...less'}</Text>}
          </Surface>
        )}

        {
         (teamData &&teamData.length>0)&& (
            <Surface elevation={0} style={{...styles.textCard}}>
              <Text variant={'titleSmall'} style={{ fontWeight: 'bold', marginBottom:5 }}>Teams</Text>
              <ScrollView horizontal>
                {teamData.map((team: any, index: number) => (
                  <Surface key={index} style={{ ...styles.textCard, margin:5,
                    justifyContent:"center", alignContent:"center"}}>
                    <Avatar.Image  source={() => <SvgUri uri={team.logo} />}/>
                    <Text variant={'bodyMedium'}>{team.name}</Text>
                    <Text variant={'bodySmall'}>{team.abbreviation}</Text>
                  </Surface>
                ))}
              </ScrollView>
            </Surface>
          )
        }{
  (teamData && teamData.length>0)&&(
    <Surface elevation={0} style={{...styles.textCard}}>
      <ScrollView horizontal>
        {teamData.map((team: any, index: number) => (
          team.players.map((player: any, playerIndex: number) => {
            return(
              <Surface key={playerIndex}
                       style={{ ...styles.textCard, margin: 5, justifyContent: 'center', alignContent: 'center' }}>
                <Avatar.Image style={{ backgroundColor: 'none' }} source={{uri: getPlayerHeadShotUrl(player.id)}} />
                <Text variant={'bodyMedium'}>{player.name}</Text>
                <Text variant={'bodySmall'}>{team.abbreviation}</Text>
              </Surface>
            )
          })
        ))}
      </ScrollView>
    </Surface>
  )
}



        <Text variant={'titleSmall'} style={{ fontWeight: 'bold', marginVertical:7, marginLeft:20 }}>✨Play Statistics</Text>
        <View style={styles.view}>
          {[
            { value: `${stats.exitVelocity} mph`, label: 'exitVelocity', style: {  height:"90%" }  },
            { value: `${stats.launchAngle}°`, label: 'launchAngle', style: { fontSize: 48,  height:"90%", alignSelf: "center", paddingTop:7 }  },
            { value: `${stats.batSpeed} mph`, label: 'batSpeed', style: {  height:"90%" } },
            { value: stats.ballType, label: 'ballType', style: { fontSize: 24, height:"90%", } },
          ].map((stat, index) => (
            <Surface key={index} style={styles.statCard}>
              <Text variant={'displaySmall'} style={stat.style}>{stat.value}</Text>
              <Text variant={'titleMedium'}>{Locales.t(stat.label)}</Text>
            </Surface>
          ))}

          <Surface style={styles.fullWidthStatCard}>
            <Text variant={'displayMedium'}>{stats.hitDistance}</Text>
            <Text variant={'titleMedium'}>{Locales.t('hitDistance')}</Text>
          </Surface>
        </View>





        <Divider style={{ marginBottom: 50, marginTop: 50 }} />
        <Text variant={'bodySmall'}>Be sure to verify the data, AI can make mistakes too.</Text>
        <Text variant={'bodySmall'}>✨ Powered by Gemini</Text>
        <Divider style={{ marginBottom: 100, marginTop: 100 }} />
      </ScrollView>
    </Surface>
  );
};

const styles = StyleSheet.create({
  scrollView: { height: '100%', padding: 20 },
  surface: { padding: 20, borderRadius: 15, margin: 5, flexDirection: 'row' },
  view: { width: '95%', alignSelf: 'center', flexDirection: 'row', flexWrap: 'wrap', margin: 5, backgroundColor: 'none' },
  statCard: { padding: 20, borderRadius: 15, margin: 5, width: '45%', height: 160 },
  fullWidthStatCard: { width: '95%', padding: 20, borderRadius: 15, margin: 5, height: 160 },
  textCard: { padding: 20, borderRadius: 15, margin: 5 },
});

export default memo(Url);
