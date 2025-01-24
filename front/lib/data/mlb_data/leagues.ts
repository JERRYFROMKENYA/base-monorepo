import { DATA_URL_1 } from '@/lib/constants'

export async function getAllLeagues() {
  try {
    const response = await fetch(`${DATA_URL_1}/leagues`);
    const text = await response.text();
    console.log('Raw response:', text);
    const sanitizedText = text.replace(/NaN/g, 'null');
    const data = JSON.parse(sanitizedText);
    return data;
  } catch (error) {
    console.error('Error fetching all leagues:', error);
    throw error;
  }
}

export async function getLeagueById(Id: string) {
  try {
    const response = await fetch(`${DATA_URL_1}/leagues?leagueId=${Id}`);
    const text = await response.text();
    console.log('Raw response:', text);
    const sanitizedText = text.replace(/NaN/g, 'null');
    const data = JSON.parse(sanitizedText);
    return data;
  } catch (error) {
    console.error(`Error fetching league by Id ${Id}:`, error);
    throw error;
  }
}

export async function getLeaguesById(Id: string[]) {
  let leagues = [];
  for (let leagueId of Id) {
    try {
      const response = await fetch(`${DATA_URL_1}/leagues?leagueId=${leagueId}`);
      const text = await response.text();
      console.log('Raw response:', text);
      const sanitizedText = text.replace(/NaN/g, 'null');
      const data = JSON.parse(sanitizedText);
      leagues.push(data);
    } catch (error) {
      console.error(`Error fetching league by Id ${leagueId}:`, error);
    }
  }
  return leagues;
}

export async function searchLeagues(search: string) {
  try {
    const response = await fetch(`${DATA_URL_1}/leagues?q=${search}`);
    const text = await response.text();
    console.log('Raw response:', text);
    const sanitizedText = text.replace(/NaN/g, 'null');
    const data = JSON.parse(sanitizedText);
    return data;
  } catch (error) {
    console.error(`Error searching leagues with query ${search}:`, error);
    throw error;
  }
}

export async function getLeaguesBySportId(Id: string) {
  try {
    const response = await fetch(`${DATA_URL_1}/leagues?sportId=${Id}`);
    const text = await response.text();
    console.log('Raw response:', text);
    const sanitizedText = text.replace(/NaN/g, 'null');
    const data = JSON.parse(sanitizedText);
    return data;
  } catch (error) {
    console.error(`Error fetching leagues for sportId ${Id}:`, error);
    throw error;
  }
}

export async function getLeaguesBySportsIds(Id: string[]) {
  let leagues: any[] = [];
  for (let i = 0; i < Id.length; i++) {
    try {
      console.log("Here", i);
      const response = await fetch(`${DATA_URL_1}/leagues?sportId=${Id[i]}`, { method: 'GET' });
      const text = await response.text();
      console.log('Raw response:', text);
      const sanitizedText = text.replace(/NaN/g, 'null');
      const leaguesData = JSON.parse(sanitizedText);
      console.log(leaguesData);
      leagues.push(...leaguesData); // Use spread operator to flatten the array
      console.log("here", leaguesData);
    } catch (error) {
      console.error(`Error fetching leagues for sportId ${Id[i]}:`, error);
    }
  }
  return leagues;
}


