import axios from 'axios';

export default async function (artist, title) {
  const endpoint = `https://api.lyrics.ovh/v1/${artist}/${title}`;

  try {
    const response = await axios.get(endpoint);
    return response.data.lyrics;
  } catch (error) {
    console.error('Error fetching lyrics: ', error);
    return null;
  }
}
