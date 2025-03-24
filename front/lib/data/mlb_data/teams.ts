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

export function getTeamById(Id: string) {
  return fetch(`${DATA_URL_1}/team?teamId=${Id}`)
    .then(response => response.text())
    .then(text => {
      console.log('Raw response:', text);
      const sanitizedText = text.replace(/NaN/g, 'null');
      const team: Team = JSON.parse(sanitizedText);
      return team[0];
    })
    .catch(error => {
      console.error(`Error fetching team by Id ${Id}:`, error);
      throw error;
    });
}

export async function getTeamsByLeagueId(Id: string[]) {
  let teams: Team[] = [];
  for (let leagueId of Id) {
    try {
      const response = await fetch(`${DATA_URL_1}/teams?leagueId=${leagueId}`);
      const text = await response.text();
      console.log('Raw response:', text);
      const sanitizedText = text.replace(/NaN/g, 'null');
      const team: Team[] = JSON.parse(sanitizedText);
      for (let t of team) {
        teams.push(t);
      }
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

export async function getScheduleByTeamId(Id: string,season:string, startDate:string, endDate:string, page:number, per_page:number) {
  try {
    if (!season) {
      season = new Date().getFullYear().toString();
    }
    const response = await fetch(`${DATA_URL_1}/schedule?teamId=${Id}&season=${season}&per_page=${per_page}&page=${page}&startDate=${startDate}&endDate=${endDate}`);
    console.log("URL: ",`${DATA_URL_1}/schedule?teamId=${Id}&season=${season}&per_page=${per_page}&page=${page}&startDate=${startDate}&endDate=${endDate}`)
    const text = await response.text();
    // console.log('Raw response:', text);
    const sanitizedText = text.replace(/NaN/g, 'null');
    const schedule = JSON.parse(sanitizedText);
    console.log("Schedule Len: ",schedule.length)
    return schedule;
  } catch (error) {
    console.error(`Error fetching schedule for teamId ${Id}:`, error);
    throw error;
  }
}

export async function getRosterByTeamId(Id: string) {
  try {
    const response = await fetch(`${DATA_URL_1}/team_roster?teamId=${Id}`);
    const text = await response.text();
    console.log('Raw response:', text);
    const sanitizedText = text.replace(/NaN/g, 'null');
    const roster = JSON.parse(sanitizedText);
    return roster;
  } catch (error) {
    console.error(`Error fetching roster for teamId ${Id}:`, error);
    throw error;
  }
}

export function getTeamLogo(id:string){
  return `https://www.mlbstatic.com/team-logos/${id}.svg`
}
