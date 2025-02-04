import React, { memo, useEffect, useState } from 'react'
import { ScrollView, StyleSheet } from 'react-native';
import { Surface, Text, Divider, Appbar, Avatar } from 'react-native-paper'
import { Locales } from '@/lib';
import { View } from '@/lib/presentation/Themed';
import { SvgUri } from 'react-native-svg'
import { getPlayerHeadShotUrl } from '@/lib/data/mlb_data/players'
import { fetchGameContent } from '@/lib/data/mlb_data/games'
import { getTeamLogo } from '@/lib/data/mlb_data/teams'

const Game =  ({ item, content ,onClose}: { onClose: any,item:any , content:any}) => {
  const [moreDescription, setMoreDescription] = useState<boolean>(false);
  const [moreExplanation, setMoreExplanation] = useState<boolean>(false);
  const [summary, setSummary] = useState<any>(null);
  const [videos, setVideos]=useState([])

useEffect(() => {
  setSummary(content?.summary[0]);

    let vids = content.highlights[0].highlights_items.filter((item: any) => item.type === 'video');
    setVideos(vids);
  console.log("ovo",videos);
}, [item, content, summary]);



  return (
    <Surface>
      <Appbar.Header statusBarHeight={0}>
        <Appbar.BackAction onPress={onClose} />
        <Appbar.Content title={
          `${item.games[0].teams.home.team.name} vs ${item.games[0].teams.away.team.name}`
          } />
      </Appbar.Header>
      <ScrollView style={styles.scrollView}>
        <Surface elevation={1} style={styles.gameItem}>
          <Surface elevation={0} style={{ flexDirection: "row", marginBottom: 5 }}>
            <Surface elevation={0} style={styles.teamContainer}>
              <Avatar.Image style={{ backgroundColor: "none" }} source={() => <SvgUri uri={getTeamLogo(item.games[0].teams.home.team.id)} />} />
              <Text>{item.games[0].teams.home.team.name}</Text>
              <Text>{item.games[0].teams.home.leagueRecord.wins} - {item.games[0].teams.home.leagueRecord.losses}</Text>

            </Surface>
            <Surface elevation={0} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              {item.games[0].teams?.home?.score && <Text style={{ marginRight: 10 }} variant={"displaySmall"}>{item.games[0].teams?.home?.score || 0}</Text>}
              <Text>{item.games[0].status.detailedState}</Text>
              {item.games[0].teams?.home?.score && <Text style={{ marginLeft: 10 }} variant={"displaySmall"}>{item.games[0].teams?.away?.score || 0}</Text>}
            </Surface>
            <Surface elevation={0} style={styles.teamContainer}>
              <Avatar.Image style={{ backgroundColor: "none" }} source={() => <SvgUri uri={getTeamLogo(item.games[0].teams.away.team.id)} />} />
              <Text>{item.games[0].teams.away.team.name}</Text>
              <Text>{item.games[0].teams.away.leagueRecord.wins} - {item.games[0].teams.away.leagueRecord.losses}</Text>
            </Surface>
          </Surface>
          <Text>{item.date} · {item.games[0].venue.name}</Text>
        </Surface>
      {
        (content&&(!summary?.hasHighlightsVideo
          &&!summary?.hasPreviewArticle
          &&!summary?.hasRecapArticle
          &&!summary?.hasWrapArticle))&& <Surface style={styles.surface}>
                 <Text variant={'titleLarge'}>{`No Content Available Yet`}</Text>
                </Surface>
      }

        {
          (content&&summary?.hasHighlightsVideo)&&
            <Surface style={{ ...styles.surface, flexDirection: 'column' }}>
              <Text variant={'titleLarge'}>
                Video Highlights
              </Text>

              <ScrollView horizontal>
                {content.highlights[0].highlights_items.filter((item: any) => item.type === 'video').map((video: any, index: number) => (
                  <Surface key={index} style={{ ...styles.gameItem, margin: 5, height: 100 }}>
                    <Text>{video.title}</Text>
                    {/*<Text>{video.description}</Text>*/}
                  </Surface>
                ))}
              </ScrollView>
          </Surface>

        }

{/*      <ScrollView style={styles.scrollView}>*/}
{/*        {hrData && (*/}
{/*          <Surface style={styles.surface}>*/}
{/*            <Text variant={'titleLarge'}>{stats.title}</Text>*/}
{/*          </Surface>*/}
{/*        )}*/}



{/*        {stats.description && (*/}
{/*          <Surface style={styles.textCard}>*/}
{/*            <Text variant={'titleSmall'} style={{ fontWeight: 'bold', marginBottom:5 }}>Description</Text>*/}
{/*            <Text variant={'bodyMedium'}>{description}</Text>*/}
{/*            {stats.description.length>200&&<Text onPress={()=>{setMoreDescription(!moreDescription)}} variant={'bodyMedium'}*/}
{/*                   style={{ fontWeight: 'bold' }}>{!moreDescription?'...more':'...less'}</Text>}*/}
{/*          </Surface>*/}
{/*        )}*/}


{/*        {stats.explanation && (*/}
{/*          <Surface style={styles.textCard}>*/}
{/*            <Text variant={'titleSmall'} style={{ fontWeight: 'bold', marginBottom:5 }}>✨Play Explanation</Text>*/}
{/*            <Text variant={'bodyMedium'}>{explanation}</Text>*/}
{/*            {stats.explanation.length>200&&<Text onPress={()=>{setMoreExplanation(!moreExplanation)}} variant={'bodyMedium'}*/}
{/*                   style={{ fontWeight: 'bold' }}>{!moreExplanation?'...more':'...less'}</Text>}*/}
{/*          </Surface>*/}
{/*        )}*/}

{/*        {*/}
{/*         (teamData &&teamData.length>0)&& (*/}
{/*            <Surface elevation={0} style={{...styles.textCard}}>*/}
{/*              <Text variant={'titleSmall'} style={{ fontWeight: 'bold', marginBottom:5 }}>Teams</Text>*/}
{/*              <ScrollView horizontal>*/}
{/*                {teamData.map((team: any, index: number) => (*/}
{/*                  <Surface key={index} style={{ ...styles.textCard, margin:5,*/}
{/*                    justifyContent:"center", alignContent:"center"}}>*/}
{/*                    <Avatar.Image  source={() => <SvgUri uri={team.logo} />}/>*/}
{/*                    <Text variant={'bodyMedium'}>{team.name}</Text>*/}
{/*                    <Text variant={'bodySmall'}>{team.abbreviation}</Text>*/}
{/*                  </Surface>*/}
{/*                ))}*/}
{/*              </ScrollView>*/}
{/*            </Surface>*/}
{/*          )*/}
{/*        }{*/}
{/*  (teamData && teamData.length>0)&&(*/}
{/*    <Surface elevation={0} style={{...styles.textCard}}>*/}
{/*      <ScrollView horizontal>*/}
{/*        {teamData.map((team: any, index: number) => (*/}
{/*          team.players.map((player: any, playerIndex: number) => {*/}
{/*            return(*/}
{/*              <Surface key={playerIndex}*/}
{/*                       style={{ ...styles.textCard, margin: 5, justifyContent: 'center', alignContent: 'center' }}>*/}
{/*                <Avatar.Image style={{ backgroundColor: 'none' }} source={{uri: getPlayerHeadShotUrl(player.id)}} />*/}
{/*                <Text variant={'bodyMedium'}>{player.name}</Text>*/}
{/*                <Text variant={'bodySmall'}>{team.abbreviation}</Text>*/}
{/*              </Surface>*/}
{/*            )*/}
{/*          })*/}
{/*        ))}*/}
{/*      </ScrollView>*/}
{/*    </Surface>*/}
{/*  )*/}
{/*}*/}



{/*        <Text variant={'titleSmall'} style={{ fontWeight: 'bold', marginVertical:7, marginLeft:20 }}>✨Play Statistics</Text>*/}
{/*        <View style={styles.view}>*/}
{/*          {[*/}
{/*            { value: `${stats.exitVelocity} mph`, label: 'exitVelocity', style: {  height:"90%" }  },*/}
{/*            { value: `${stats.launchAngle}°`, label: 'launchAngle', style: { fontSize: 48,  height:"90%", alignSelf: "center", paddingTop:7 }  },*/}
{/*            { value: `${stats.batSpeed} mph`, label: 'batSpeed', style: {  height:"90%" } },*/}
{/*            { value: stats.ballType, label: 'ballType', style: { fontSize: 24, height:"90%", } },*/}
{/*          ].map((stat, index) => (*/}
{/*            <Surface key={index} style={styles.statCard}>*/}
{/*              <Text variant={'displaySmall'} style={stat.style}>{stat.value}</Text>*/}
{/*              <Text variant={'titleMedium'}>{Locales.t(stat.label)}</Text>*/}
{/*            </Surface>*/}
{/*          ))}*/}

{/*          <Surface style={styles.fullWidthStatCard}>*/}
{/*            <Text variant={'displayMedium'}>{stats.hitDistance}</Text>*/}
{/*            <Text variant={'titleMedium'}>{Locales.t('hitDistance')}</Text>*/}
{/*          </Surface>*/}
{/*        </View>*/}





{/*        <Divider style={{ marginBottom: 50, marginTop: 50 }} />*/}
{/*        <Text variant={'bodySmall'}>Be sure to verify the data, AI can make mistakes too.</Text>*/}
{/*        <Text variant={'bodySmall'}>✨ Powered by Gemini</Text>*/}
{/*        <Divider style={{ marginBottom: 100, marginTop: 100 }} />*/}
{/*      </ScrollView>*/}
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
  container: {
    flex: 1,
    padding: 10,
  },
  categoryContainer: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    overflow: 'scroll',
    overscrollBehaviorX: 'auto',
    paddingBottom: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
  gameItem: {
    padding: 10,
    margin: 5,
    borderRadius: 15,
    // backgroundColor: 'rgba(57,81,101,0.51)',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: "column",
  },
  teamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    flexDirection: "column",
    flex: 1,
  },
});

export default memo(Game);
