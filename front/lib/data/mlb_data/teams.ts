import { DATA_URL_1 } from '@/lib/constants'

interface Team {
  abbreviation: string;
  active: boolean;
  allStarStatus: string;
  clubName: string;
  division_id: number | null;
  division_link: string | null;
  division_name: string | null;
  fileCode: string;
  firstYearOfPlay: string;
  franchiseName: string;
  id: number;
  league_id: number;
  league_link: string;
  league_name: string;
  link: string;
  locationName: string;
  logo: string;
  name: string;
  parentOrgId: number;
  parentOrgName: string;
  season: number;
  shortName: string;
  sport_id: number;
  sport_link: string;
  sport_name: string;
  springLeague_abbreviation: string | null;
  springLeague_id: number | null;
  springLeague_link: string | null;
  springLeague_name: string | null;
  springVenue_id: number | null;
  springVenue_link: string | null;
  teamCode: string;
  teamName: string;
  venue_id: number;
  venue_link: string;
  venue_name: string;
}

export async function getAllTeams() {
  try {
    const response = await fetch(`${DATA_URL_1}/teams`);
    const text = await response.text();
    console.log('Raw response:', text);
    const sanitizedText = text.replace(/NaN/g, 'null');
    const teams: Team[] = JSON.parse(sanitizedText);
    return teams;
  } catch (error) {
    console.error('Error fetching all teams:', error);
    throw error;
  }
}

export async function getTeamById(Id: string) {
  try {
    const response = await fetch(`${DATA_URL_1}/teams?teamId=${Id}`);
    const text = await response.text();
    console.log('Raw response:', text);
    const sanitizedText = text.replace(/NaN/g, 'null');
    const team: Team = JSON.parse(sanitizedText);
    return team;
  } catch (error) {
    console.error(`Error fetching team by Id ${Id}:`, error);
    throw error;
  }
}

export async function getTeamsByLeagueId(Id: string[]) {
  let teams: Team[] = [];
  for (let leagueId of Id) {
    try {
      const response = await fetch(`${DATA_URL_1}/teams?leagueId=${leagueId}`);
      const text = await response.text();
      console.log('Raw response:', text);
      const sanitizedText = text.replace(/NaN/g, 'null');
      const team: Team = JSON.parse(sanitizedText);
      teams.push(team);
    } catch (error) {
      console.error(`Error fetching teams for leagueId ${leagueId}:`, error);
    }
  }
  return teams;
}

export async function searchTeams(search: string) {
  try {
    const response = await fetch(`${DATA_URL_1}/teams?q=${search}`);
    const text = await response.text();
    console.log('Raw response:', text);
    const sanitizedText = text.replace(/NaN/g, 'null');
    const teams: Team[] = JSON.parse(sanitizedText);
    return teams;
  } catch (error) {
    console.error(`Error searching teams with query ${search}:`, error);
    throw error;
  }
}