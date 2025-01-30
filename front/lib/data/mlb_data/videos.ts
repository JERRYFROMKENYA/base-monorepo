import { VIDEOS_URL_1 } from '@/lib/constants';

export async function getHomeRunVideos(page: number, perPage: number, season: number = 2024) {
  try {
    const response = await fetch(`${VIDEOS_URL_1}/home_runs?season=${season}&page=${page}&pageSize=${perPage}`);
    if (!response.ok) {
      throw new Error(`Error fetching videos: ${response.statusText}`);
    }
    return await response.json();
  } catch (e) {
    console.error('Error getting home run videos:', e);
    return []; // Return an empty array in case of an error
  }
}


export async function getTeamPlayers(url:string){
  try {
    const response = await fetch(`${VIDEOS_URL_1}/getTeams?videoUrl=${url}`);
    // if (!response.ok) {
    //   throw new Error(`Error fetching players: ${response.statusText}`);
    // }
    return await response.text();
  } catch (e) {
    console.error('Error getting team players:', e);
    return []; // Return an empty array in case of an error
  }
}

export async function getHomeRunByPlayId(playId:string){
  try {
    console.log(playId)
    const response = await fetch(`${VIDEOS_URL_1}/home_run?playId=${playId}`);
    return await response.text();
  } catch (e) {
    console.error('Error getting home run:', e);
    return []; // Return an empty array in case of an error
  }


}