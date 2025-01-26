import { View, ScrollView, Animated, Easing, Platform } from 'react-native'
import {getTeamsByLeagueId } from '@/lib/data/mlb_data/teams'
import React, { useEffect, useState, useRef } from 'react'
import { ActivityIndicator, Avatar, Button, Chip, Divider, List, Snackbar, Surface, Text } from 'react-native-paper'
import { getAllSports } from '@/lib/data/mlb_data/sports'
import { getLeaguesBySportsIds } from '@/lib/data/mlb_data/leagues'
import { SvgUri } from 'react-native-svg'
import { getPlayerHeadShotUrl, getPlayersByTeamId, getPlayersByTeamIds } from '@/lib/data/mlb_data/players'
import { Language, Locales } from '@/lib'
import { Image } from 'expo-image'
import * as SecureStore from 'expo-secure-store'
import { useAuth } from '@/lib/data/pocketbase/auth'
import {
  addInterestedPlayers,
  addInterestedSports,
  addInterestedTeams,
  addInterestLeagues,
  usePocketBase,
} from '@/lib/data/pocketbase'
import { useRouter } from 'expo-router'
import { UpdateUser } from '@/lib/data/pocketbase/user'

const MAX_INTERESTED_SPORTS = 3
const MAX_INTERESTED_LEAGUES = 3
const MAX_INTERESTED_TEAMS = 10
const MAX_INTERESTED_PLAYERS = 10

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
]

function Onboarding() {
  const { user } = useAuth()
  const {pb}= usePocketBase()
  const router =useRouter()
  const [showMessage, setShowMessage] = useState<boolean>(false)
  const [message, setMessage] = useState<string>("")
  const [step, setStep] = useState<number>(0)
  const [selectedLanguage, setSelectedLanguage] = useState<string>("")
  const [leagues, setLeagues] = useState<any>()
  const [sports, setSports] = useState<any>()
  const [teams, setTeams] = useState<any>()
  const [players, setPlayers] = useState<any>()
  const [interestedSports, setInterestedSports] = useState<any>([])
  const [interestedLeagues, setInterestedLeagues] = useState<any>([])
  const [interestedTeams, setInterestedTeams] = useState<any>([])
  const [interestedPlayers, setInterestedPlayers] = useState<any>([])
  const [settings, setSettings] = useState<any>()

  const scrollX = useRef(new Animated.Value(0)).current

  useEffect(() => {
    getAllSports().then((data) => {
      setSports(data)
    })
    if (Platform.OS !== 'web') {
      SecureStore.getItemAsync('settings')
        .then((result) =>
          setSettings(JSON.parse(result ?? JSON.stringify(settings))),
        )
        .catch((res) =>
          setMessage(res.message),
        )
    }
  }, [])

  useEffect(() => {
    if (step === 5) {
      Animated.loop(
        Animated.timing(scrollX, {
          toValue: 1,
          duration: 10000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start()
    }
  }, [step])

  const translateX = scrollX.interpolate({
    inputRange: [0, 2],
    outputRange: [0, -1000], // Adjust the output range based on the content width
  })

  async function handleNext() {
    if (step === 0 && !selectedLanguage) {
      setMessage('Pick a language!')
      setShowMessage(true)
      return
    }
    if (step === 1 && interestedSports.length === 0) {
      setMessage(Locales.t("pickSportError"))
      setShowMessage(true)
      return
    }
    setStep(step + 1)
    if (step === 1) {
      const ids = interestedSports.map((sport: any) => sport.id)
      getLeaguesBySportsIds(ids).then((data) => {
        setLeagues(data)
      }).catch((error) => {
        console.error('Error fetching leagues:', error)
        setMessage(Locales.t("failedToFetchLeague"))
        setShowMessage(true)
      })
    } else if (step === 2) {
      const ids = interestedLeagues.map((league: any) => league.id)
      getTeamsByLeagueId(ids).then((data) => {
        setTeams(data)
      }).catch((error) => {
        console.error('Error fetching teams:', error)
        setMessage(Locales.t("failedToFetchTeams"))
        setShowMessage(true)
      })
    } else if (step === 3) {
      const ids = interestedTeams.map((team: any) => team.id)
      getPlayersByTeamIds(ids).then((data) => {
        setPlayers(data)
      }).catch((error) => {
        console.error('Error fetching players:', error)
        setMessage(Locales.t("failedToFetchPlayers"))
        setShowMessage(true)
      })
    } else if (step === 4) {
      if (user && pb) {
        await UpdateUser(user, pb, { language: selectedLanguage, isOnboarded: true })
        await addInterestedSports(pb, user, interestedSports)
        await addInterestLeagues(pb, user, interestedLeagues)
        await addInterestedTeams(pb, user, interestedTeams)
        await addInterestedPlayers(pb, user, interestedPlayers)
      }
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

  function handleLanguageChange(code: string) {
    setSelectedLanguage(code)
    const newSettings = {
      ...settings,
      language: code as Language,
    }
    setSettings(newSettings)
    Locales.locale = code as Language
    SecureStore.setItemAsync('settings', JSON.stringify(newSettings))
  }

  return (
    <View style={{ backgroundColor: "none" }}>
      <Surface elevation={0} style={{ marginHorizontal: 10 }}>
        {step == 0 && <>
          <Text style={{ fontWeight: "bold", marginBottom: 5 }} variant={"titleLarge"}>{Locales.t("pickYourLanguage")}</Text>
          <Text>{Locales.t('changeLanguage')}</Text>
          <ScrollView style={{ height: "75%" }}>
            {LANGUAGES.map((language) => {
              return (
                <List.Item
                  key={language.code}
                  title={language.name}
                  description={language.nativeName}
                  left={props => <List.Icon  {...props} icon={() => selectedLanguage !== language.code ? <Avatar.Text label={language.code.toUpperCase()} size={50} /> : <Avatar.Icon icon={"check"} size={50} />} />}
                  onPress={() => handleLanguageChange(language.code)}
                />
              )
            })}
          </ScrollView>
        </>}
        {step == 1 && <>
          <Text style={{ fontWeight: "bold", marginBottom: 5 }} variant={"titleLarge"}>{Locales.t("pickYourSports")}</Text>
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
        {step == 2 && <>
          <Text style={{ fontWeight: "bold", marginBottom: 5 }} variant={"titleLarge"}>{Locales.t("pickYourLeagues")}</Text>
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
        {step == 3 && <>
          <Text style={{ fontWeight: "bold", marginBottom: 5 }} variant={"titleLarge"}>{Locales.t("pickYourTeams")}</Text>
          <ScrollView style={{ height: "75%" }}>
            {teams && teams.map((team: any) => {
              return (
                <List.Item
                  key={team.id}
                  title={`${team.name} - ${team.clubName}`}
                  description={team.abbreviation}
                  left={props => <List.Icon  {...props} icon={() => !interestedTeams.includes(team) ? <Avatar.Image source={() => <SvgUri uri={team.logo} />}/> : <Avatar.Icon icon={"check"} size={50} />} />}
                  onPress={() => handleAddTeam(team)}
                />
              )
            })}
          </ScrollView>
        </>}
        {step == 4 && <>
          <Text style={{ fontWeight: "bold", marginBottom: 5 }} variant={"titleLarge"}>{Locales.t("pickYourPlayers")}</Text>
          <ScrollView style={{ height: "75%" }}>
            {players && players.map((player: any) => {
              return (
                <List.Item
                  key={player.person_id}
                  title={`${player.person_fullName} (${player.position_code})`}
                  description={`${player.position_name} · ${player.status_description}`}
                  left={props => <List.Icon  {...props} icon={() => !interestedPlayers.includes(player) ? <Avatar.Image source={{uri: getPlayerHeadShotUrl(player.person_id)}} size={50} /> : <Avatar.Icon icon={"check"} size={50} />} />}
                  onPress={() => handleAddPlayer(player)}
                />
              )
            })}
          </ScrollView>
        </>}
        {step == 5 && <>
          <Surface elevation={0} style={{ justifyContent: "center", alignItems: "center", padding: 10 }}>
            <Image
              source={require('@/assets/images/welcome_design.png')}
              style={{ width: 250, marginBottom: 20, height: 200, marginTop: 80 }}
            />
            <ActivityIndicator />
            <Text variant={"headlineMedium"} style={{ alignSelf: "flex-start", marginLeft: 0, marginBottom: 20 }}>{Locales.t("settingUpSubText")}</Text>
          </Surface>
        </>}
        {step !== 5 && <Surface elevation={0} style={{ flexDirection: 'row', gap: 1, paddingHorizontal: 20, width: '100%' }}>
          <Button mode="contained" style={{ alignSelf: 'flex-start', flex: 1, margin: 5 }}
            onPress={() => setStep(step - 1)} disabled={step == 0}>{Locales.t("back")}</Button>
          {step >= 4 ?
            <Button mode="contained" style={{ alignSelf: 'flex-start', flex: 1, margin: 5 }} onPress={async ()=>handleNext().then(()=>{router.replace("/drawer");console.log("done")})}
            >{Locales.t("finish")}</Button> :
            <Button mode="contained" style={{ alignSelf: 'flex-start', flex: 1, margin: 5 }} onPress={handleNext}
              disabled={step == 4}>{Locales.t("next")}</Button>}
        </Surface>}
      </Surface>
      <Divider style={{ width: "85%", length: 5, alignSelf: "center", marginVertical: 10 }} />
      <Animated.ScrollView horizontal contentContainerStyle={{ flexGrow: 1, flexDirection: 'row' }} style={{ transform: [{ translateX }] }}>
        <Surface
          key={"thisisaduckingsurface"}
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
          {interestedPlayers.map((player: any) => {
            return (<Chip disabled={(step == 5)} key={player.id} style={{ marginRight: 5, marginBottom: 3, backgroundColor: "#515f78" }} icon={() => <Avatar.Image source={{ uri: getPlayerHeadShotUrl(player.person_id) }} size={20} />}
              onClose={() => setInterestedPlayers(interestedPlayers.filter((item: any) => item != player))}>{player.person_fullName}</Chip>)
          })}
          {interestedTeams.map((team: any) => {
            return (<Chip disabled={(step == 5)} key={team.id} style={{ marginRight: 5, marginBottom: 3, backgroundColor: "#515f78" }} icon={() => <Avatar.Image source={() => <SvgUri uri={team.logo} />} size={20} />}
              onClose={() => setInterestedTeams(interestedTeams.filter((item: any) => item != team))}>{team.abbreviation}</Chip>)
          })}
          {interestedLeagues.map((league: any) => {
            return (<Chip disabled={(step == 5)} key={league.id} style={{ marginRight: 5, marginBottom: 3, backgroundColor: "#515f78" }} icon={() => <Avatar.Text label={league.abbreviation.substring(0, 2)} size={20} />}
              onClose={() => setInterestedLeagues(interestedLeagues.filter((item: any) => item != league))}>{league.abbreviation}</Chip>)
          })}
          {interestedSports.map((sport: any) => {
            return (<Chip disabled={(step == 5)} key={sport.id} style={{ marginRight: 5, marginBottom: 3 }} icon={() => <Avatar.Text label={sport.abbreviation.substring(0, 2)} size={20} />}
              onClose={() => setInterestedSports(interestedSports.filter((item: any) => item != sport))}>{sport.abbreviation}</Chip>)
          })}
        </Surface>
      </Animated.ScrollView>
      <Snackbar style={{ position: "absolute", bottom: 40 }} visible={showMessage} onDismiss={() => setShowMessage(false)}>{message}</Snackbar>
    </View>
  )
}

export default Onboarding