import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Dimensions } from 'react-native';
import { Text, Card, Title, Paragraph, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router'
import { getTeamById, getRosterByTeamId } from '@/lib/data/mlb_data/teams';
import { SvgUri } from 'react-native-svg';
import { getPlayerHeadShotUrl } from '@/lib/data/mlb_data/players';

const { width } = Dimensions.get('window');
const numColumns = 2;
const cardWidth = (width - 40) / numColumns;

interface Team {
  logo: string;
  name: string;
  locationName: string;
  division_name: string;
  venue_name: string;
  season: number;
}

interface Player {
  person_id: number;
  person_fullName: string;
  position_name: string;
  jerseyNumber: string;
  status_description: string;
}

const TeamPage = () => {
  const [teamData, setTeamData] = useState<Team | null>(null);
  const [roster, setRoster] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const { id } = useLocalSearchParams();
  const router =useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        const team = await getTeamById(id as string);
        const rosterData = await getRosterByTeamId(id as string);
        setTeamData(team);
        setRoster(rosterData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) {
    return <ActivityIndicator animating={true} size="large" />;
  }

  return (
    <FlatList
      data={roster}
      keyExtractor={(item) => item.person_id.toString()}
      numColumns={numColumns}
      ListHeaderComponent={() => (
        <Card style={styles.card}>
          <Card.Content>
            <SvgUri uri={teamData?.logo} style={styles.logo} />
            <Title>{teamData?.name}</Title>
            <Paragraph>{teamData?.locationName}</Paragraph>
            <Paragraph>{teamData?.division_name}</Paragraph>
            <Paragraph>{teamData?.venue_name}</Paragraph>
            <Paragraph>Season: {teamData?.season}</Paragraph>
          </Card.Content>
        </Card>
      )}
      renderItem={({ item }) => (
        <Card style={styles.playerCard} onPress={()=>router.push(`/player/${item.person_id}`)}>
          <Card.Cover source={{ uri: getPlayerHeadShotUrl(item.person_id) }} />
          <Card.Content>
            <Title>{item.person_fullName}</Title>
            <Paragraph>{item.position_name}</Paragraph>
            <Paragraph>#{item.jerseyNumber}</Paragraph>
            <Paragraph>{item.status_description}</Paragraph>
          </Card.Content>
        </Card>
      )}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginBottom: 20,
    width: '100%',
  },
  logo: {
    height: 150,
  },
  playerCard: {
    width: cardWidth,
    margin: 5,
  },
});

export default TeamPage;