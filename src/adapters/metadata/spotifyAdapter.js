import getSpotifyAccessToken from '../../api/spotifyAuthApi.js';
import requestMetadata from '../../api/metadata/spotifyApi.js';
import getLyrics from '../../api/metadata/lyricOvhApi.js';

/**
 * Adapter to handle retrieval of metadata for an array of Spotify track IDs.
 * @function
 * @param {string[]} trackIds - An array of spotify track IDs.
 * @returns {Promise<Object[]>} A promise that resolves with an object of metadata.
 */
export default async function getMetadata(trackIds) {
  try {
    if (!Array.isArray(trackIds)) {
      throw new Error('spotifyAdapter expects an array of trackIds');
    }

    const accessToken = await getSpotifyAccessToken();

    const metadataPromises = trackIds.map(async (trackId) => {
      const trackMetadata = await requestMetadata(trackId, accessToken);

      // const lyrics = await getLyrics(artist, title);

      // Combine the track metadata with the lyrics
      return {
        ...trackMetadata,
        // lyrics
      };
    });

    return await Promise.all(metadataPromises);
  } catch (e) {
    console.error('Error retrieving metadata using Spotify:', e);
    throw e;
  }
}
