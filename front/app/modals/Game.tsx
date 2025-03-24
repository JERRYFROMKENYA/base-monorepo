import React, { memo, useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Surface, Text, Divider, Appbar, Avatar } from 'react-native-paper';
import { Locales } from '@/lib';
import { View } from '@/lib/presentation/Themed';
import { SvgUri } from 'react-native-svg';
import { getPlayerHeadShotUrl } from '@/lib/data/mlb_data/players';
import { fetchGameContent } from '@/lib/data/mlb_data/games';
import { getTeamLogo } from '@/lib/data/mlb_data/teams';

const Game = ({ item, content, onClose, summaryData, explanation }: { onClose: any, item: any, content: any, summaryData: any, explanation: any }) => {
  const [moreDescription, setMoreDescription] = useState<boolean>(false);
  const [moreExplanation, setMoreExplanation] = useState<boolean>(false);
  const [explanation1, setExplanation] = useState<string>(explanation.length > 200 ? explanation.substring(0, 200) : explanation);
  const [description, setDescription] = useState<string>(summaryData.length > 200 ? summaryData.substring(0, 200) : summaryData);
  const [summary, setSummary] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);

  useEffect(() => {
    setExplanation(!moreExplanation ? explanation.substring(0, 200) : explanation);
    setDescription(!moreDescription ? summaryData.substring(0, 200) : summaryData);
  }, [moreExplanation, moreDescription, explanation, summaryData]);

  useEffect(() => {
    setSummary(content?.summary[0]);
    if (content?.highlights?.[0]?.highlights_items) {
      const vids = content.highlights[0].highlights_items.filter((item: any) => item.type === 'video');
      setVideos(vids);
    }
    console.log("ovo", videos);
  }, [item, content]);

  return (
    <View>
      <Appbar.Header statusBarHeight={0}>
        <Appbar.BackAction onPress={onClose} />
        <Appbar.Content title={`${item.games[0].teams.home.team.name} vs ${item.games[0].teams.away.team.name}`} />
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
        {(content && (!summary?.hasHighlightsVideo && !summary?.hasPreviewArticle && !summary?.hasRecapArticle && !summary?.hasWrapArticle)) && (
          <Surface style={styles.surface}>
            <Text variant={'titleLarge'}>{`No Content Available Yet`}</Text>
          </Surface>
        )}
        {(content && summary?.hasHighlightsVideo) && (
          <Surface style={{ ...styles.surface, flexDirection: 'column' }}>
            <Text variant={'titleLarge'}>Video Highlights</Text>
            <ScrollView horizontal>
              {content.highlights[0].highlights_items.filter((item: any) => item.type === 'video').map((video: any, index: number) => (
                <Surface key={index} style={{ ...styles.gameItem, margin: 5, height: 100 }}>
                  <Text>{video.title}</Text>
                </Surface>
              ))}
            </ScrollView>
          </Surface>
        )}
        {description && (
          <Surface style={styles.textCard}>
            <Text variant={'titleSmall'} style={{ fontWeight: 'bold', marginBottom: 5 }}>Description</Text>
            <Text variant={'bodyMedium'}>{description}</Text>
            {summaryData.length > 200 && (
              <Text onPress={() => setMoreDescription(!moreDescription)} variant={'bodyMedium'} style={{ fontWeight: 'bold' }}>
                {moreDescription ? '...less' : '...more'}
              </Text>
            )}
          </Surface>
        )}
        {explanation1 && (
          <Surface style={styles.textCard}>
            <Text variant={'titleSmall'} style={{ fontWeight: 'bold', marginBottom: 5 }}>✨Play Explanation</Text>
            <Text variant={'bodyMedium'}>{explanation1}</Text>
            {explanation.length > 200 && (
              <Text onPress={() => setMoreExplanation(!moreExplanation)} variant={'bodyMedium'} style={{ fontWeight: 'bold' }}>
                {moreExplanation ? '...less' : '...more'}
              </Text>
            )}
          </Surface>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: { padding: 20, overscrollBehaviorX: 'auto' },
  surface: { padding: 20, borderRadius: 15, margin: 5, flexDirection: 'row' },
  view: { width: '95%', alignSelf: 'center', flexDirection: 'row', flexWrap: 'wrap', margin: 5, backgroundColor: 'none' },
  statCard: { padding: 20, borderRadius: 15, margin: 5, width: '45%', height: 160 },
  fullWidthStatCard: { width: '95%', padding: 20, borderRadius: 15, margin: 5, height: 160 },
  textCard: { padding: 20, borderRadius: 15, margin: 5 },
  container: { flex: 1, padding: 10 },
  categoryContainer: { alignSelf: 'flex-start', flexDirection: 'row', gap: 10, overflow: 'scroll', overscrollBehaviorX: 'auto', paddingBottom: 10 },
  listContent: { paddingBottom: 20 },
  gameItem: { padding: 10, margin: 5, borderRadius: 15, height: 150, justifyContent: 'center', alignItems: 'center', flexDirection: "column" },
  teamContainer: { flexDirection: 'column', alignItems: 'center', marginBottom: 5, flex: 1 },
});

export default memo(Game);
