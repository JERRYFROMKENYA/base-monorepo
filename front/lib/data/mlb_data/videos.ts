import { VIDEOS_URL_1 } from '@/lib/constants'

export async function getHomeRunVideos(){
  try {
    let response = await fetch(`${VIDEOS_URL_1}/home_runs?season=2024`)
    return await response.json()
  } catch (e) {
    console.error('Error getting home run videos:', e)
  }
}