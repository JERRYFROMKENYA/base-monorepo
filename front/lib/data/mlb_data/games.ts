import { fetchWithRetry } from '@/lib/data/mlb_data/videos'
import { DATA_URL_1 } from '@/lib/constants'

export async function fetchGameContent(id: any)
{
    const url =`${DATA_URL_1}/game?gameId=${id}`
      // console.log(response.content)
      return await fetchWithRetry(url);

}