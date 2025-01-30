import { VIDEOS_URL_1 } from '@/lib/constants'

export async function getHomeRunVideos(page: number, perPage: number, season: number = 2024) {
  try {
    let response = await fetch(`${VIDEOS_URL_1}/home_runs?season=${season}&page=${page}&pageSize=${perPage}`)
    return await response.json()
  } catch (e) {
    console.error('Error getting home run videos:', e)
  }
}