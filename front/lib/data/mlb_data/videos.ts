import { VIDEOS_URL_1 } from '@/lib/constants';

const MAX_RETRIES = 10;
const RETRY_DELAY = 1000; // Start with 1 second delay

async function fetchWithRetry(url, retries = MAX_RETRIES, delay = RETRY_DELAY) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }
      const text = await response.text();
      const sanitizedText = text.replace(/NaN/g, 'null');
      return JSON.parse(sanitizedText);
    } catch (error) {
      console.log(`Attempt ${attempt} failed: ${error.message} on ${url}`);
      if (attempt === retries) return [];
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
}

export async function getHomeRunVideos(page, perPage, season = 2024) {
  const url = `${VIDEOS_URL_1}/home_runs?season=${season}&page=${page}&pageSize=${perPage}`;
  return await fetchWithRetry(url);
}

export async function getTeamPlayers(url, year) {
  const requestUrl = `${VIDEOS_URL_1}/getTeams?videoUrl=${url}&season=${year}`;
  return await fetchWithRetry(requestUrl);
}

export async function getHomeRunByPlayId(playId) {
  console.log(playId);
  const url = `${VIDEOS_URL_1}/home_run?playId=${playId}`;
  return await fetchWithRetry(url);
}

export async function getPlayers(url) {
  const requestUrl = `${VIDEOS_URL_1}/getPlayers?videoUrl=${url}`;
  return await fetchWithRetry(requestUrl);
}

export async function getSummary(url) {
  const requestUrl = `${VIDEOS_URL_1}/summary?videoUrl=${url}`;
  return await fetchWithRetry(requestUrl);
}

export async function getPlayExplanation(url) {
  const requestUrl = `${VIDEOS_URL_1}/getPlayExplanation?videoUrl=${url}`;
  return await fetchWithRetry(requestUrl);
}

export async function getTranslation(t, lang) {
  const requestUrl = `${VIDEOS_URL_1}/translate?text=${t}&lang=${lang}`;
  console.log(requestUrl);
  return await fetchWithRetry(requestUrl);
}

export async function getBatSpeed(url) {
  const requestUrl = `${VIDEOS_URL_1}/getBatSpeed?videoUrl=${url}`;
  return await fetchWithRetry(requestUrl);
}


export async function getDetails(url) {
  const requestUrl = `${VIDEOS_URL_1}/get-details?videoUrl=${url}`;
  return await fetchWithRetry(requestUrl);
}
