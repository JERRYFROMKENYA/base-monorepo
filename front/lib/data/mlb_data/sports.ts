import { DATA_URL_1 } from '@/lib/constants'

export async function getAllSports() {
  try {
    const response = await fetch(`${DATA_URL_1}/sports`);
    const text = await response.text();
    console.log('Raw response:', text);
    const sanitizedText = text.replace(/NaN/g, 'null');
    const data = JSON.parse(sanitizedText);
    return data;
  } catch (error) {
    console.error('Error fetching all sports:', error);
    throw error;
  }
}

export async function getSportById(Id: string) {
  try {
    const response = await fetch(`${DATA_URL_1}/sports?sportId=${Id}`);
    const text = await response.text();
    console.log('Raw response:', text);
    const sanitizedText = text.replace(/NaN/g, 'null');
    const data = JSON.parse(sanitizedText);
    return data;
  } catch (error) {
    console.error(`Error fetching sport by Id ${Id}:`, error);
    throw error;
  }
}