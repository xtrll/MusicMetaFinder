import getSpotifyAccessToken from '../../api/spotifyAuthApi.js';
import requestMetadata from '../../api/metadata/spotifyApi.js';

/**
 * Adapter to handle retrieval of metadata for an array of Spotify track IDs.
 * @async
 * @param {string[]} trackIds - An array of Spotify track IDs.
 * @returns {Promise<Object[]>} A promise that, when resolved, returns an array of metadata objects for the Spotify tracks.
 */
export default async function getMetadata(trackIds) {
  try {
    if (!Array.isArray(trackIds)) {
      throw new Error('getMetadata expects an array of trackIds');
    }

    const accessToken = await getSpotifyAccessToken();

    const metadataPromises = trackIds.map(trackId => requestMetadata(trackId, accessToken));

    // Resolves to an array of metadata objects corresponding to the track IDs.
    return await Promise.all(metadataPromises);
  } catch (e) {
    console.error('Error retrieving metadata from Spotify:', e);
    throw e; // Rethrowing the error to handle it at a higher level
  }
}

