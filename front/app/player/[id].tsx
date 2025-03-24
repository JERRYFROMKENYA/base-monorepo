import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ImageBackground } from 'react-native';
import { Text, Card, Title, Paragraph, ActivityIndicator, Avatar } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { getPlayerById, getPlayerHeadShotUrl } from '@/lib/data/mlb_data/players';
import { getTeamById } from '@/lib/data/mlb_data/teams';
import { SvgUri } from 'react-native-svg';

interface Player {
  fullName: string;
  primaryNumber: string;
  primaryPosition_name: string;
  birthDate: string;
  birthCity: string;
  birthStateProvince: string;
  birthCountry: string;
  height: string;
  weight: number;
  currentAge: number;
  mlbDebutDate: string;
  batSide_description: string;
  pitchHand_description: string;
  currentTeam_id: number;
}

interface Team {
  logo: string;
  name: string;
}

const PlayerPage = () => {
  const [playerData, setPlayerData] = useState<Player | null>(null);
  const [teamData, setTeamData] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useLocalSearchParams();

  useEffect(() => {
    const loadData = async () => {
      try {
        const player = await getPlayerById(id as string);
        setPlayerData(player);
        const team = await getTeamById(player.currentTeam_id.toString());
        setTeamData(team);
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
    <ScrollView contentContainerStyle={styles.container}>
      {playerData && (
        <Card style={styles.card}>
          {teamData && (
            <ImageBackground style={styles.teamLogo}>
              <SvgUri uri={teamData.logo} style={styles.teamLogoSvg} />
              <Avatar.Image size={150} source={{ uri: getPlayerHeadShotUrl(playerData.id) }} style={styles.playerImage} />
            </ImageBackground>
          )}
          <Card.Content>
            <Title>{playerData.fullName}</Title>
            <Paragraph>Number: {playerData.primaryNumber}</Paragraph>
            <Paragraph>Position: {playerData.primaryPosition_name}</Paragraph>
            <Paragraph>Birth Date: {playerData.birthDate}</Paragraph>
            <Paragraph>Birth Place: {playerData.birthCity}, {playerData.birthStateProvince}, {playerData.birthCountry}</Paragraph>
            <Paragraph>Height: {playerData.height}</Paragraph>
            <Paragraph>Weight: {playerData.weight} lbs</Paragraph>
            <Paragraph>Age: {playerData.currentAge}</Paragraph>
            <Paragraph>MLB Debut: {playerData.mlbDebutDate}</Paragraph>
            <Paragraph>Bat Side: {playerData.batSide_description}</Paragraph>
            <Paragraph>Pitch Hand: {playerData.pitchHand_description}</Paragraph>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    marginBottom: 20,
  },
  playerImage: {
    alignSelf: 'center',
    marginTop: 20,
  },
  teamLogo: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamLogoSvg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
});

export default PlayerPage;