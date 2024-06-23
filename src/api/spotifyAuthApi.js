import querystring from 'querystring';
import axiosRetry from '../utils/retryAxios.js';
import handleError from '../errors/generalApiErrorHandler.js';

export default async function getSpotifyAccessToken() {
  const { client_id, client_secret } = process.env;

  const authOptions = {
    method: 'POST',
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      Authorization: `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: querystring.stringify({
      grant_type: 'client_credentials',
    }),
  };

  return axiosRetry(authOptions)
    .then((response) => {
      if (response.status === 200) {
        return response.data.access_token;
      }
      throw new Error(`Could not get access token for ${response.status}`);
    })
    .catch((error) => {
      console.error('Spotify authentication error:', error);
      const errorMessage = handleError(error);
      throw new Error(errorMessage);
    });
}
