import getTrackMetadata from '../api/metadataRetrieval.js';
import getLyrics from '../api/lyricRetrieval.js';
import {getAlbumArt} from "../api/imageRetrieval.js";

/**
 * Controller to handle retrieval of metadata for an array of MusicBrainz recording IDs.
 * @function
 * @param {string[]} recordingIds - An array of MusicBrainz recording IDs.
 * @returns {Promise<Object[]>} A promise that resolves with an array of metadata objects.
 */
export async function retrieveMetadata(recordingIds) {
  try {
    if (!Array.isArray(recordingIds)) {
      throw new Error('MetadataController expects an array of recordingIds');
    }

    // Prepare an array to hold the metadata results initialized as an array of Promises
    const metadataPromises = recordingIds.map(async (recordingId) => {
      const trackMetadata = await getTrackMetadata(recordingId);
      const artist = trackMetadata['artist-credit']?.[0]?.name;
      const title = trackMetadata.title;
      const albumId = trackMetadata.releases[0].id

      // Assume getLyrics requires artist name and track name, which are to be obtained from the trackMetadata
      const lyrics = await getLyrics(artist, title);
      const albumArt = await getAlbumArt(albumId);

      // Combine the track metadata with the lyrics
      return {
        ...trackMetadata,
        albumArt,
        lyrics
      };
    });

    return await Promise.all(metadataPromises);
  } catch (e) {
    console.error('Error retrieving metadata from MusicBrainz or lyrics:', e);
    throw e;
  }
}
