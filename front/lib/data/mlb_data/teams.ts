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
  const response = await fetch(`${DATA_URL_1}/teams`);
  const teams: Team[] = await response.json();

  return teams;
}

export async function getTeamById(Id: string) {
  const response = await fetch(`${DATA_URL_1}/teams?teamId=${Id}`);
  const team: Team = await response.json();
  return team;
}

export async function searchTeams(search: string) {
  const response = await fetch(`${DATA_URL_1}/teams?q=${search}`);
  const teams: Team[] = await response.json();
  return teams;
}