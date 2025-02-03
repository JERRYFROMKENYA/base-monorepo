import React, { Dispatch, SetStateAction, useEffect } from 'react';
import { Avatar, Chip, Surface } from 'react-native-paper';
import { ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SvgUri } from 'react-native-svg';
import { Locales } from '@/lib';
import { getInterestedTeams } from '@/lib/data/pocketbase/teams';
import { usePocketBase } from '@/lib/data/pocketbase';
import { useAuth } from '@/lib/data/pocketbase/auth';
import { getTeamById } from '@/lib/data/mlb_data/teams';
import { getInterestedPlayers } from '@/lib/data/pocketbase/players'
import { getPlayerById, getPlayerHeadShotUrl } from '@/lib/data/mlb_data/players'
import { getLeagueById } from '@/lib/data/mlb_data/leagues'
import { getInterestedLeagues } from '@/lib/data/pocketbase/leagues'

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

  const { pb } = usePocketBase();
  const { user } = useAuth();
  const router = useRouter();

  const categories = [
    { label: 'all' },
    { label: 'upcoming', icon: 'calendar' },
  ];

  useEffect(() => {
    const fetchTeams = async () => {
      const teams = await getInterestedTeams(pb, user);
      const interestedTeams = await Promise.all(
        teams.map(async (team) => {
          const teamData = await getTeamById(team.teamId);
          return teamData
        })
      );
      setMyTeams(interestedTeams);
    };
    const fetchLeagues = async () => {
      const leagues = await getInterestedLeagues(pb, user);
      const interestedLeagues = await Promise.all(
        leagues.map(async (league) => {
          const leagueData = await getLeagueById(league.leagueId);
          return leagueData[0]
        })
      );
      setMyLeagues(interestedLeagues);
    }
    const fetchPlayers = async () => {
      const players = await getInterestedPlayers(pb, user);
      const interestedPlayers = await Promise.all(
        players.map(async (player) => {
          const playerData = await getPlayerById(player.playerId);
          return playerData[0]
        })
      );
      setMyPlayers(interestedPlayers);
    }



      fetchTeams()
      fetchLeagues()
      fetchPlayers()

  }, [router]);

  useEffect(() => {
    const fetchGames = async () => {
      // Fetch games based on filters
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
  };

  const handleRemoveFilterTeams = (filter: string) => {
    setFilterTeams((prev) => prev.filter((f) => f !== filter));
    if (filter === 'all') {
      setFilterTeams(['all']);
    }
  };

  const GameCategories = ({ categories }: CategoryProps) => {


    return (
      <ScrollView horizontal>
        <Surface
          elevation={0}
          style={{
            alignSelf: 'flex-start',
            display: 'flex',
            flexDirection: 'row',
            gap: 10,
            overflow: 'scroll',
            overscrollBehaviorX: 'auto',
          }}
        >
          {categories.map((category: Category, index: number) => (
            <Chip
              key={index}
              mode={selectedCategory !== index ? 'outlined' : undefined}
              icon={selectedCategory !== index ? category.icon : undefined}
              selected={selectedCategory === index}
              onPress={() => {
                console.log(index)
                setSelectedCategory(index);
                handleAddFilter(category.label);
              }}
            >
              {Locales.t(category.label)}
            </Chip>
          ))}
          {myTeams.map((team, index) => (
            <Chip
              key={team.id}
              mode={selectedTeam !== index ? 'outlined' : undefined}
              icon={selectedTeam !== index ? () => <Avatar.Image size={24} source={() => <SvgUri uri={team.logo} />} /> : undefined }
              selected={selectedTeam === index}
              onPress={() => {
                setSelectedTeam(index)
                if(selectedTeam==index) {
                  setSelectedTeam(-1)
                }
                handleAddFilterTeams(team.id);
              }}
            >
              {team.name}
            </Chip>
          ))}

          {
            myLeagues.map((league, index) => (
              <Chip
                key={league.id}
                mode={selectedLeague !== index ? 'outlined' : undefined}
                icon={selectedLeague !== index ? () => <Avatar.Image size={24} source={() => <SvgUri uri={league.logo} />} /> : undefined }
                selected={selectedLeague === index}
                onPress={() => {
                  setSelectedLeague(index)
                  if(selectedLeague==index) {
                    setSelectedLeague(-1)
                  }
                  handleAddFilterTeams(league.id);
                }}
              >
                {league.name}
              </Chip>
            ))
          }

          {
            myPlayers.map((player, index) => (
              <Chip
                key={player.id}
                mode={selectedPlayer !== index ? 'outlined' : undefined}
                icon={selectedPlayer !== index ? () => <Avatar.Image size={24} source={{uri: getPlayerHeadShotUrl(player.id)}} /> : undefined }
                selected={selectedPlayer === index}
                onPress={() => {
                  setSelectedPlayer(index)
                  if(selectedPlayer==index) {
                    setSelectedPlayer(-1)
                  }
                  handleAddFilterTeams(player.id);
                }}
              >
                {player.name}
              </Chip>
            ))
          }

        </Surface>
      </ScrollView>
    );
  };

  return (
    <Surface style={{ flex: 1, padding: 10 }}>
      <GameCategories categories={categories} />
    </Surface>
  );
};

export default Games;
