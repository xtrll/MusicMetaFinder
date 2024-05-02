import axios from 'axios';
import qs from 'qs';

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

export default function getSpotifyAccessToken() {
  const authOptions = {
    method: 'POST',
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      Authorization: `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: qs.stringify({
      grant_type: 'client_credentials',
    }),
  };

  return axios(authOptions)
    .then((response) => {
      if (response.status === 200) {
        return response.data.access_token;
      }
      return Promise.reject(new Error(`Could not get access token for ${response.status}`));
    })
    .catch((error) => {
      console.error('Auth Error:', error);
      throw error;
    });
}
