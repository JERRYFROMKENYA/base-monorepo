import { DATA_URL_1 } from '@/lib/constants'

export async function getAllPlayers() {
  try {
    const response = await fetch(`${DATA_URL_1}/players`);
    const text = await response.text();
    console.log('Raw response:', text);
    const sanitizedText = text.replace(/NaN/g, 'null');
    const data = JSON.parse(sanitizedText);
    return data;
  } catch (error) {
    console.error('Error fetching all players:', error);
    throw error;
  }
}

export async function getPlayerById(Id: string) {
  try {
    const response = await fetch(`${DATA_URL_1}/players?playerId=${Id}`);
    const text = await response.text();
    // console.log('Raw response:', text);
    const sanitizedText = text.replace(/NaN/g, 'null');
    const data = JSON.parse(sanitizedText);
    return data;
  } catch (error) {
    console.error(`Error fetching player by Id ${Id}:`, error);
    throw error;
  }
}

export async function getPlayersById(Id: string[]) {
  let players = [];
  for (let playerId of Id) {
    try {
      const response = await fetch(`${DATA_URL_1}/players?playerId=${playerId}`);
      const text = await response.text();
      console.log('Raw response:', text);
      const sanitizedText = text.replace(/NaN/g, 'null');
      const data = JSON.parse(sanitizedText);
      players.push(data);
    } catch (error) {
      console.error(`Error fetching player by Id ${playerId}:`, error);
    }
  }
  return players;
}

export async function searchPlayers(search: string) {
  try {
    const response = await fetch(`${DATA_URL_1}/players?q=${search}`);
    const text = await response.text();
    console.log('Raw response:', text);
    const sanitizedText = text.replace(/NaN/g, 'null');
    const data = JSON.parse(sanitizedText);
    return data;
  } catch (error) {
    console.error(`Error searching players with query ${search}:`, error);
    throw error;
  }
}

export async function getPlayersByTeamId(Id: string) {
  try {
    const response = await fetch(`${DATA_URL_1}/players?teamId=${Id}`);
    const text = await response.text();
    console.log('Raw response:', text);
    const sanitizedText = text.replace(/NaN/g, 'null');
    const data = JSON.parse(sanitizedText);
    return data;
  } catch (error) {
    console.error(`Error fetching players for teamId ${Id}:`, error);
    throw error;
  }
}

export async function getPlayersByTeamIds(Id: string[]) {
  let players = [];
  for (let teamId of Id) {
    try {
      const response = await fetch(`${DATA_URL_1}/team_roster?teamId=${teamId}`);
      const text = await response.text();
      console.log('Raw response:', text);
      const sanitizedText = text.replace(/NaN/g, 'null');
      const data = JSON.parse(sanitizedText);
      for(let player of data) {
        players.push(player);
      }
    } catch (error) {
      console.error(`Error fetching players for teamId ${teamId}:`, error);
    }
  }
  return players;
}


export function getPlayerHeadShotUrl(playerId: string) {
  return `https://securea.mlb.com/mlb/images/players/head_shot/${playerId}.jpg`;
}