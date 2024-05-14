import axiosRetry from '../../utils/retryAxios.js';
import handleError from '../../errors/generalApiErrorHandler.js';

export default function getMetadata(trackId, accessToken) {
  const endpoint = `https://api.spotify.com/v1/tracks/${trackId}`;

  const requestOptions = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  return axiosRetry.get(endpoint, requestOptions)
    .then((response) => response.data)
    .catch((error) => {
      const errorMessage = handleError(error, trackId);
      throw new Error(errorMessage);
    });
}
