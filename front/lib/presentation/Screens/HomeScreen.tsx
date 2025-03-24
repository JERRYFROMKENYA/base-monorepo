import React, { useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Surface, Text, Avatar, Button, ActivityIndicator } from 'react-native-paper';
import { SvgUri } from 'react-native-svg';
import { getScheduleByTeamId, getTeamLogo } from '@/lib/data/mlb_data/teams';
import { usePocketBase } from '@/lib/data/pocketbase';
import { useAuth } from '@/lib/data/pocketbase/auth';
import { getInterestedTeams } from '@/lib/data/pocketbase/teams';

const HomeScreen = () => {
  const [upcomingGames, setUpcomingGames] = useState<any[]>([]);
  const [oldGameHighlights, setOldGameHighlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { pb } = usePocketBase();
  const { user } = useAuth();
  const season = 2025;
  const pageSize = 5;

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      const teams = await getInterestedTeams(pb, user);
      const teamIds = teams.map((team: any) => team.teamId);

      const fetchUpcomingGames = async () => {
        const games = await Promise.all(
          teamIds.map((id: string) =>
            getScheduleByTeamId(id, season.toString(), new Date().toISOString().slice(0, 10), new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10), 1, pageSize)
          )
        );
        setUpcomingGames(games.flat());
      };

      const fetchOldGameHighlights = async () => {
        const pastDate = new Date();
        pastDate.setFullYear(pastDate.getFullYear() - 1);
        const games = await Promise.all(
          teamIds.map((id: string) =>
            getScheduleByTeamId(id, season.toString(), pastDate.toISOString().slice(0, 10), new Date().toISOString().slice(0, 10), 1, pageSize)
          )
        );
        setOldGameHighlights(games.flat());
      };

      await Promise.all([fetchUpcomingGames(), fetchOldGameHighlights()]);
      setLoading(false);
    };

    fetchGames();
  }, [pb, user]);

  const renderGameItem = (item: any) => (
    <Surface elevation={1} style={styles.gameItem}>
      <Surface elevation={0} style={{ flexDirection: 'row', marginBottom: 5 }}>
        <Surface elevation={0} style={styles.teamContainer}>
          <Avatar.Image style={{ backgroundColor: 'none' }} source={() => <SvgUri uri={getTeamLogo(item.games[0].teams.home.team.id)} />} />
          <Text>{item.games[0].teams.home.team.name}</Text>
          <Text>{item.games[0].teams.home.leagueRecord.wins} - {item.games[0].teams.home.leagueRecord.losses}</Text>
        </Surface>
        <Surface elevation={0} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          {item.games[0].teams?.home?.score && <Text style={{ marginRight: 10 }} variant={'displaySmall'}>{item.games[0].teams?.home?.score || 0}</Text>}
          <Text>{item.games[0].status.detailedState}</Text>
          {item.games[0].teams?.home?.score && <Text style={{ marginLeft: 10 }} variant={'displaySmall'}>{item.games[0].teams?.away?.score || 0}</Text>}
        </Surface>
        <Surface elevation={0} style={styles.teamContainer}>
          <Avatar.Image style={{ backgroundColor: 'none' }} source={() => <SvgUri uri={getTeamLogo(item.games[0].teams.away.team.id)} />} />
          <Text>{item.games[0].teams.away.team.name}</Text>
          <Text>{item.games[0].teams.away.leagueRecord.wins} - {item.games[0].teams.away.leagueRecord.losses}</Text>
        </Surface>
      </Surface>
      <Text>{item.date} · {item.games[0].venue.name}</Text>
    </Surface>
  );

  return (
    <Surface style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <ScrollView style={styles.mainScrollView}>
          <Surface style={styles.welcomeCard}>
            <Avatar.Icon size={64} icon="baseball" />
            <Text variant="headlineMedium" style={styles.welcomeText}>Welcome to the Base!</Text>
          </Surface>
          <Surface style={styles.contentCard}>
            <Text variant="titleLarge">Upcoming Games</Text>
            {upcomingGames.map((game, index) => (
              <View key={index}>{renderGameItem(game)}</View>
            ))}
          </Surface>
          <Surface style={styles.contentCard}>
            <Text variant="titleLarge">Old Game Highlights</Text>
            {oldGameHighlights.map((game, index) => (
              <View key={index}>{renderGameItem(game)}</View>
            ))}
          </Surface>
        </ScrollView>
      )}
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  mainScrollView: {
    width: '100%',
  },
  welcomeCard: {
    padding: 20,
    borderRadius: 15,
    margin: 5,
    alignItems: 'center',
  },
  welcomeText: {
    marginVertical: 10,
  },
  contentCard: {
    padding: 20,
    borderRadius: 15,
    margin: 5,
  },
  gameItem: {
    padding: 10,
    margin: 5,
    borderRadius: 15,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  teamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    flexDirection: 'column',
    flex: 1,
  },
});

export default HomeScreen;