import React, { useEffect, useState } from 'react'
import { Avatar, Chip, Surface, Text, ActivityIndicator } from 'react-native-paper';
import { FlatList, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useRouter } from 'expo-router';
import { SvgUri } from 'react-native-svg';
import { Locales } from '@/lib';
import { getInterestedTeams } from '@/lib/data/pocketbase/teams';
import { usePocketBase } from '@/lib/data/pocketbase';
import { useAuth } from '@/lib/data/pocketbase/auth';
import { getScheduleByTeamId, getTeamById, getTeamLogo } from '@/lib/data/mlb_data/teams';
import { getInterestedPlayers } from '@/lib/data/pocketbase/players';
import { getPlayerById, getPlayerHeadShotUrl } from '@/lib/data/mlb_data/players';
import { getLeagueById } from '@/lib/data/mlb_data/leagues';
import { getInterestedLeagues } from '@/lib/data/pocketbase/leagues';
import Game from '@/app/modals/Game'
import { fetchGameContent, fetchGameExplanation, fetchGameSummary } from '@/lib/data/mlb_data/games'
import { getPlayExplanation } from '@/lib/data/mlb_data/videos'

interface Category {
  label: string;
  icon?: string;
}

interface CategoryProps {
  categories: Category[];
}

const Games = () => {
  const [games, setGames] = React.useState([]);
  const [filter, setFilter] = React.useState(['all']);
  const [filterTeams, setFilterTeams] = React.useState(['all']);
  const [loading, setLoading] = React.useState(true);
  const [myTeams, setMyTeams] = React.useState<any[]>([]);
  const [myLeagues, setMyLeagues] = React.useState<any[]>([]);
  const [myPlayers, setMyPlayers] = React.useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState(0);
  const [selectedTeam, setSelectedTeam] = React.useState(-1);
  const [selectedLeague, setSelectedLeague] = React.useState(-1);
  const [selectedPlayer, setSelectedPlayer] = React.useState(-1);
  const [scheduleData, setScheduleData] = React.useState<any[]>([]);
  const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [summary, setSummary] = React.useState('');
  const [explanation, setExplanation] = React.useState('');

  const [endDate, setEndDate] = React.useState(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().slice(0, 10);
  });
  const [currentPage, setCurrentPage] = React.useState(1);
  const [season, setSeason] = React.useState(2025);

  const [item, setItem]= useState()
  const [modalVisible, setModalVisible] = useState(false);

  const pageSize = 30;

  const { pb } = usePocketBase();
  const { user } = useAuth();
  const router = useRouter();

  const categories = [
    { label: 'all' },
    { label: 'upcoming', icon: 'calendar' },
    { label: 'highlights', icon: 'clock' },
  ];

  useEffect(() => {
    const fetchTeams = async () => {
      const teams = await getInterestedTeams(pb, user);
      const interestedTeams = await Promise.all(
        teams.map(async (team: any) => {
          const teamData = await getTeamById(team.teamId);
          return teamData;
        })
      );
      setMyTeams(interestedTeams);
    };
    const fetchLeagues = async () => {
      const leagues = await getInterestedLeagues(pb, user);
      const interestedLeagues = await Promise.all(
        leagues.map(async (league: any) => {
          const leagueData = await getLeagueById(league.leagueId);
          return leagueData;
        })
      );
      setMyLeagues(interestedLeagues);
    };
    const fetchPlayers = async () => {
      const players = await getInterestedPlayers(pb, user);
      const interestedPlayers = await Promise.all(
        players.map(async (player: any) => {
          const playerData = await getPlayerById(player.playerId);
          const teamData = await getTeamById(playerData.currentTeam_id);
          setMyTeams((prev) => [...prev.filter((f) => teamData.id !== f.id), teamData]);
          return playerData;
        })
      );
      setMyPlayers(interestedPlayers);
    };

    fetchTeams();
    fetchLeagues();
    fetchPlayers();
  }, [router]);

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(false);
    };
    fetchGames();
  }, [filter, filterTeams]);

  const handleAddFilter = (filter: string) => {
    setFilter((prev) => [...prev.filter((f) => f !== 'all'), filter]);
  };

  const handleRemoveFilter = (filter: string) => {
    setFilter((prev) => prev.filter((f) => f !== filter));
    if (filter === 'all') {
      setFilter(['all']);
    }
  };

  const handleAddFilterTeams = (filter: string) => {
    setFilterTeams((prev) => [...prev.filter((f) => f !== 'all'), filter]);
    setScheduleData((prev) => prev.filter((team) =>
      team.games[0].teams.home.team.id === filter || team.games[0].teams.away.team.id === filter
    ));
  };

  const handleRemoveFilterTeams = (filter: string) => {
    setFilterTeams((prev) => prev.filter((f) => f !== filter));
    if (filter === 'all') {
      setFilterTeams(['all']);
    }
    getScheduleData();
  };

  const getScheduleData = async () => {
    let teams = new Set<number>();
    for (let team of myTeams) {
      teams.add(team.id);
    }
    for (let player of myPlayers) {
      teams.add(player.currentTeam_id);
    }

    // Apply team filter
    if (selectedTeam !== -1) {
      teams = new Set([myTeams[selectedTeam].id]);
    }

    let dataS: any[] = [];
    for (let id of teams.values()) {
      let games;
      if (selectedCategory === 1) { // upcoming
        games = await getScheduleByTeamId(id.toString(), season.toString(), selectedDate, endDate, currentPage, pageSize);
      } else if (selectedCategory === 2) { // highlights (old games)
        const pastDate = new Date();
        pastDate.setFullYear(pastDate.getFullYear() - 1);
        games = await getScheduleByTeamId(id.toString(), season.toString(), pastDate.toISOString().slice(0, 10), selectedDate, currentPage, pageSize);
      } else { // all (mix)
        const upcomingGames = await getScheduleByTeamId(id.toString(), season.toString(), selectedDate, endDate, currentPage, pageSize / 2);
        const pastDate = new Date();
        pastDate.setFullYear(pastDate.getFullYear() - 1);
        const oldGames = await getScheduleByTeamId(id.toString(), season.toString(), pastDate.toISOString().slice(0, 10), selectedDate, currentPage, pageSize / 2);
        games = [...upcomingGames, ...oldGames];
      }
      dataS.push(...games);
    }

    // Apply league filter
    if (selectedLeague !== -1) {
      dataS = dataS.filter(game => game.league_id === myLeagues[selectedLeague].id);
    }

    setScheduleData(dataS);
  };

  const handleAddFilterCategory = (filter: string) => {
    setFilter((prev) => [...prev.filter((f) => f !== 'all'), filter]);
    setSelectedCategory(categories.findIndex((category) => category.label === filter));
    getScheduleData();
  };

  useEffect(() => {
    getScheduleData();
  }, [myTeams, myPlayers, selectedCategory, currentPage]);

  const loadMore = () => {
    setCurrentPage((prev) => prev + 1);
  }

  const handleShowGame=(item:any)=>{
    fetchGameExplanation(item.games[0].gamePk).then((response) => {
      setExplanation(response.summary);
    })
    fetchGameSummary(item.games[0].gamePk).then((response) => {
      setSummary(response.summary);
    })


    setItem(item)
    setModalVisible(true)
  }

  const [content, setContent] = useState<any>(null);
  const [noContent, setNoContent] = useState<boolean>(false);
  // const [explanation, setExplanation] = useState<string>(stats.explanation.length > 200 ? stats.explanation.substring(0, 200) : stats.explanation);
  // const [description, setDescription] = useState<string>(stats.description.length > 200 ? stats.description.substring(0, 200) : stats.description);

  useEffect(() => {
    async function fetchGame() {
      console.log(item);
      const response = await fetchGameContent(item.games[0].gamePk);
      console.log(response);
      setContent(response);
      setNoContent(response && (!response.summary?.hasVideoHighlights
        && !response.summary?.hasPreviewArticle
        && !response.summary?.hasRecapArticle
        && !response.summary?.hasWrapArticle));
      console.log(noContent);
    }
    fetchGame();
    console.log(content);
  }, [item]);

  const GameCategories = ({ categories }: CategoryProps) => {
    return (
      <ScrollView showsHorizontalScrollIndicator={false} horizontal>
        <Surface style={styles.categoryContainer}>
          {categories.map((category: Category, index: number) => (
            <Chip
              key={index}
              mode={selectedCategory !== index ? 'outlined' : undefined}
              icon={selectedCategory !== index ? category.icon : undefined}
              selected={selectedCategory === index}
              onPress={() => {
                setSelectedCategory(index);
                if (selectedCategory === index) {
                  setSelectedCategory(0);
                }
                handleAddFilterCategory(category.label);
              }}
            >
              {Locales.t(category.label)}
            </Chip>
          ))}
          {myTeams.map((team: any, index: number) => (
            <Chip
              key={team.id}
              mode={selectedTeam !== index ? 'outlined' : undefined}
              icon={selectedTeam !== index ? () => <Avatar.Image style={{backgroundColor:"none"}} size={24} source={() => <SvgUri uri={team.logo} />} /> : undefined}
              selected={selectedTeam === index}
              onPress={() => {
                setSelectedTeam(index);
                if (selectedTeam === index) {
                  setSelectedTeam(-1);
                  handleRemoveFilterTeams(team.id.toString());
                }
                handleAddFilterTeams(team.id.toString());
              }}
            >
              {team.name}
            </Chip>
          ))}
        </Surface>
      </ScrollView>
    );
  };

const renderGameItem = ({ item }: { item: any }) => (
  <TouchableOpacity onPress={()=>{
    handleShowGame(item)
    console.log(item.games[0].gamePk)}}>
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
  </TouchableOpacity>
);

  return (
    <Surface style={styles.container}>
      <GameCategories categories={categories} />
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={scheduleData}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderGameItem}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMore}
        />
      )}
      <Modal
        presentationStyle="pageSheet"
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Game item={item} summaryData={summary} explanation={explanation} content={content?.content} onClose={() => setModalVisible(false)} />
      </Modal>
    </Surface>
  );
};

const styles = StyleSheet.create({
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

export default Games;
