import axios from 'axios';

export default function getTrackMetadata(trackId, accessToken) {
  const endpoint = `https://api.spotify.com/v1/tracks/${trackId}`;

  const requestOptions = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  return axios.get(endpoint, requestOptions)
    .then((response) => response.data)
    .catch((error) => {
      console.error('Error retrieving track metadata:', error);
      throw error;
    });
}
