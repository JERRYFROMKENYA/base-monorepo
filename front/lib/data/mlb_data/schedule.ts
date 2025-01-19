import { DATA_URL_1 } from '@/lib/constants'

interface Game {
  calendarEventID: string;
  content: {
    link: string;
  };
  dayNight: string;
  doubleHeader: string;
  gameDate: string;
  gameGuid: string;
  gameNumber: number;
  gamePk: number;
  gameType: string;
  gamedayType: string;
  ifNecessary: string;
  ifNecessaryDescription: string;
  inningBreakLength: number;
  isTie: boolean;
  link: string;
  officialDate: string;
  publicFacing: boolean;
  recordSource: string;
  reverseHomeAwayStatus: boolean;
  scheduledInnings: number;
  season: string;
  seasonDisplay: string;
  seriesDescription: string;
  status: {
    abstractGameCode: string;
    abstractGameState: string;
    codedGameState: string;
    detailedState: string;
    startTimeTBD: boolean;
    statusCode: string;
  };
  teams: {
    away: {
      isWinner: boolean;
      leagueRecord: {
        losses: number;
        pct: string;
        wins: number;
      };
      score: number;
      splitSquad: boolean;
      team: {
        id: number;
        link: string;
        name: string;
      };
    };
    home: {
      isWinner: boolean;
      leagueRecord: {
        losses: number;
        pct: string;
        wins: number;
      };
      score: number;
      splitSquad: boolean;
      team: {
        id: number;
        link: string;
        name: string;
      };
    };
  };
  tiebreaker: string;
  venue: {
    id: number;
    link: string;
    name: string;
  };
}





export async function getGames(): Promise<Game[]> {
  const response = await fetch(`${DATA_URL_1}/schedule`);
  return await response.json()
}

export async function getSchedule(teamName_: string|undefined, season_: number|undefined): Promise<Game[]> {
  const season = season_ || new Date().getFullYear();
  const teamName = teamName_ || '';
  const response = await fetch(`${DATA_URL_1}/schedule?season=${season}`+teamName&&`&q=${teamName}`);
  return await response.json()
}

export async function getGameById(gameId: string): Promise<Game> {
  const response = await fetch(`${DATA_URL_1}/game?gameId=${gameId}`);
  const game: any = await response.json();
  return game.gameData
}

export function searchGames(search: string):Game[] {

  return []
}

export function getGamesByDate(date: Date):Game[] {
  return []
}

