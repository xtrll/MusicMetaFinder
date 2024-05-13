import getTrackMetadata from '../api/metadataRetrieval.js';

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
    const metadata = recordingIds.map((recordingId) => getTrackMetadata(recordingId));
    return metadata;
  } catch (e) {
    console.error('Error retrieving metadata from MusicBrainz:', e);
    throw e;
  }
}
