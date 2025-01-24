import { View } from '@/lib/presentation/Themed'
import { getAllTeams, getTeamsByLeagueId } from '@/lib/data/mlb_data/teams'
import React, { useEffect, useState } from 'react'
import { Avatar, Divider, List, Snackbar, Surface, Text, Button, Chip } from 'react-native-paper'
import { getAllSports } from '@/lib/data/mlb_data/sports'
import { getAllLeagues, getLeaguesBySportsIds } from '@/lib/data/mlb_data/leagues'
import { ScrollView } from 'react-native'

const MAX_INTERESTED_SPORTS = 3
const MAX_INTERESTED_LEAGUES = 3
const MAX_INTERESTED_TEAMS = 10
const MAX_INTERESTED_PLAYERS = 10

function Onboarding() {
  const [showMessage, setShowMessage] = useState<boolean>(false)
  const [message, setMessage] = useState<string>("")
  const [step, setStep] = useState<number>(0)
  const [leagues, setLeagues] = useState<any>()
  const [sports, setSports] = useState<any>()
  const [teams, setTeams] = useState<any>()
  const [players, setPlayers] = useState<any>()
  const [interestedSports, setInterestedSports] = useState<any>([])
  const [interestedLeagues, setInterestedLeagues] = useState<any>([])
  const [interestedTeams, setInterestedTeams] = useState<any>([])
  const [interestedPlayers, setInterestedPlayers] = useState<any>([])

  useEffect(() => {
    getAllSports().then((data) => {
      setSports(data)
    })
  }, [])

  function handleNext() {
    if (step === 0 && interestedSports.length === 0) {
      setMessage('Pick at least one sport!')
      setShowMessage(true)
      return
    }
    setStep(step + 1)
    if (step === 0) {
      const ids = interestedSports.map((sport: any) => sport.id)
      getLeaguesBySportsIds(ids).then((data) => {
        setLeagues(data)
      }).catch((error) => {
        console.error('Error fetching leagues:', error)
        setMessage('Failed to fetch leagues')
        setShowMessage(true)
      })
    } else if (step === 1) {
      const ids = interestedLeagues.map((league: any) => league.id)
      getTeamsByLeagueId(ids).then((data) => {
        setTeams(data)
      }).catch((error) => {
        console.error('Error fetching teams:', error)
        setMessage('Failed to fetch teams')
        setShowMessage(true)
      })
    }
  }

  function handleAddSport(sport: any) {
    if (interestedSports.includes(sport)) {
      setInterestedSports(interestedSports.filter((item: any) => item != sport))
    } else if (interestedSports.length < MAX_INTERESTED_SPORTS) {
      setInterestedSports([...interestedSports, sport])
    } else {
      setMessage(`You can only select up to ${MAX_INTERESTED_SPORTS} sports`)
      setShowMessage(true)
    }
  }

  function handleAddLeague(league: any) {
    if (interestedLeagues.includes(league)) {
      setInterestedLeagues(interestedLeagues.filter((item: any) => item != league))
    } else if (interestedLeagues.length < MAX_INTERESTED_LEAGUES) {
      setInterestedLeagues([...interestedLeagues, league])
    } else {
      setMessage(`You can only select up to ${MAX_INTERESTED_LEAGUES} leagues`)
      setShowMessage(true)
    }
  }

  function handleAddTeam(team: any) {
    if (interestedTeams.includes(team)) {
      setInterestedTeams(interestedTeams.filter((item: any) => item != team))
    } else if (interestedTeams.length < MAX_INTERESTED_TEAMS) {
      setInterestedTeams([...interestedTeams, team])
    } else {
      setMessage(`You can only select up to ${MAX_INTERESTED_TEAMS} teams`)
      setShowMessage(true)
    }
  }

  function handleAddPlayer(player: any) {
    if (interestedPlayers.includes(player)) {
      setInterestedPlayers(interestedPlayers.filter((item: any) => item != player))
    } else if (interestedPlayers.length < MAX_INTERESTED_PLAYERS) {
      setInterestedPlayers([...interestedPlayers, player])
    } else {
      setMessage(`You can only select up to ${MAX_INTERESTED_PLAYERS} players`)
      setShowMessage(true)
    }
  }

  return (
    <View style={{ backgroundColor: "none" }}>
      <Surface elevation={0} style={{ marginHorizontal: 10 }}>
        {step == 0 && <>
          <Text style={{ fontWeight: "bold", marginBottom: 5 }} variant={"titleLarge"}>Pick your sports</Text>
          <ScrollView style={{ height: "75%" }}>
            {sports && sports.map((sport: any) => {
              return (
                <List.Item
                  key={sport.id}
                  title={sport.abbreviation}
                  description={sport.name}
                  left={props => <List.Icon  {...props} icon={() => !interestedSports.includes(sport) ? <Avatar.Text label={sport.abbreviation.substring(0, 2)} size={50} /> : <Avatar.Icon icon={"check"} size={50} />} />}
                  onPress={() => handleAddSport(sport)}
                />
              )
            })}
          </ScrollView>
        </>}
        {step == 1 && <>
          <Text style={{ fontWeight: "bold", marginBottom: 5 }} variant={"titleLarge"}>Pick your leagues</Text>
          <ScrollView style={{ height: "75%" }}>
            {leagues && leagues.map((league: any) => {
              return (
                <List.Item
                  key={league.id}
                  title={league.abbreviation}
                  description={league.name}
                  left={props => <List.Icon  {...props} icon={() => !interestedLeagues.includes(league) ? <Avatar.Text label={league.abbreviation.substring(0, 2)} size={50} /> : <Avatar.Icon icon={"check"} size={50} />} />}
                  onPress={() => handleAddLeague(league)}
                />
              )
            })}
          </ScrollView>
        </>}
        {step == 2 && <>
          <Text style={{ fontWeight: "bold", marginBottom: 5 }} variant={"titleLarge"}>Pick your teams</Text>
          <ScrollView style={{ height: "75%" }}>
            {teams && teams.map((team: any) => {
              return (
                <List.Item
                  key={team.id}
                  title={team.abbreviation}
                  description={team.name}
                  left={props => <List.Icon  {...props} icon={() => !interestedTeams.includes(team) ? <Avatar.Text label={team.abbreviation} size={50} /> : <Avatar.Icon icon={"check"} size={50} />} />}
                  onPress={() => handleAddTeam(team)}
                />
              )
            })}
          </ScrollView>
        </>}
        {step == 3 && <>
          <Text style={{ fontWeight: "bold", marginBottom: 5 }} variant={"titleLarge"}>Pick your players</Text>
          <ScrollView style={{ height: "75%" }}>
            {players && players.map((player: any) => {
              return (
                <List.Item
                  key={player.id}
                  title={player.name}
                  description={player.position}
                  left={props => <List.Icon  {...props} icon={() => !interestedPlayers.includes(player) ? <Avatar.Text label={player.name.substring(0, 2)} size={50} /> : <Avatar.Icon icon={"check"} size={50} />} />}
                  onPress={() => handleAddPlayer(player)}
                />
              )
            })}
          </ScrollView>
        </>}
        <Surface elevation={0} style={{ flexDirection: "row", gap: 1, paddingHorizontal: 20, width: "100%", }}>
          <Button mode="contained" style={{ alignSelf: "flex-start", flex: 1, margin: 5 }} onPress={() => setStep(step - 1)} disabled={step == 0}>Back</Button>
          <Button mode="contained" style={{ alignSelf: "flex-start", flex: 1, margin: 5 }} onPress={handleNext} disabled={step == 3}>Next</Button>
        </Surface>
      </Surface>
      <Divider style={{ width: "85%", length: 5, alignSelf: "center", marginVertical: 10 }} />
      <ScrollView horizontal>
        <Surface
          elevation={0}
          style={{
            alignSelf: "flex-start",
            display: "flex",
            flexDirection: "row",
            gap: 10,
            overflow: "scroll",
            overscrollBehaviorX: "auto"
          }}
        >
          {interestedSports.map((sport: any) => {
            return (<Chip key={sport.id} style={{ marginRight: 5, marginBottom: 3 }} icon={() => <Avatar.Text label={sport.abbreviation.substring(0, 2)} size={20} />}
              onClose={() => setInterestedSports(interestedSports.filter((item: any) => item != sport))}>{sport.abbreviation}</Chip>)
          })}
          {interestedLeagues.map((league: any) => {
            return (<Chip key={league.id} style={{ marginRight: 5, marginBottom: 3, backgroundColor: "#515f78" }} icon={() => <Avatar.Text label={league.abbreviation.substring(0, 2)} size={20} />}
              onClose={() => setInterestedLeagues(interestedLeagues.filter((item: any) => item != league))}>{league.abbreviation}</Chip>)
          })}
          {interestedTeams.map((team: any) => {
            return (<Chip key={team.id} style={{ marginRight: 5, marginBottom: 3, backgroundColor: "#515f78" }} icon={() => <Avatar.Text label={team.abbreviation.substring(0, 2)} size={20} />}
              onClose={() => setInterestedTeams(interestedTeams.filter((item: any) => item != team))}>{team.abbreviation}</Chip>)
          })}
          {interestedPlayers.map((player: any) => {
            return (<Chip key={player.id} style={{ marginRight: 5, marginBottom: 3, backgroundColor: "#515f78" }} icon={() => <Avatar.Text label={player.name.substring(0, 2)} size={20} />}
              onClose={() => setInterestedPlayers(interestedPlayers.filter((item: any) => item != player))}>{player.name}</Chip>)
          })}
        </Surface>
      </ScrollView>
      <Snackbar style={{ position: "absolute", bottom: 40 }} visible={showMessage} onDismiss={() => setShowMessage(false)}>{message}</Snackbar>
    </View>
  )
}

export default Onboarding