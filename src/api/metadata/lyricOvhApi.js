import axiosRetry from '../../utils/retryAxios.js';
import handleError from '../../errors/generalApiErrorHandler.js';

/**
 * Fetches lyrics for a specific song using the provided artist name and title.
 * Makes a call to the `lyrics.ovh` API and returns the lyrics found, if any.
 *
 * @param {string} artist - The name of the artist.
 * @param {string} title - The title of the song.
 * @returns {Promise<axiosRetry.AxiosResponse<any>>} Promise object representing the lyrics for the song or null if not found or in case of an error.
 */
export default async function getLyrics(artist, title) {
  const endpoint = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
  return axiosRetry.get(endpoint)
    .then((response) => response.data.lyrics || null)
    .catch((error) => {
      if (error.response.status === 404) {
        console.error(`No lyrics found for ${artist} - ${title}`);
        return null;
      }
      const errorMessage = handleError(error, `${artist} - ${title}`);
      console.error(errorMessage);
      return null;
    });
}
