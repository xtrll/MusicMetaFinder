import saveImageToFile from '../../saveImageToFile.js';

/**
 * Normalizes the metadata from MusicBrainz to a standard format.
 * Downloads and saves album art when available, capturing various metadata attributes.
 *
 * @param {Array} fileObjectsWithMetadata An array containing objects with track metadata and album art URLs.
 * @returns {Promise<Array>} A promise that resolves to an array of objects with normalized metadata.
 */
export default async function normalizeMusicBrainz(fileObjectsWithMetadata) {
  // Use Promise.all to wait for all promises to be resolved
  return Promise.all(fileObjectsWithMetadata.map(async (fileObject) => {
    // Check if metadata is present, otherwise return null
    if (!fileObject || !fileObject.trackMetadata) {
      return null;
    }

    // Destructure properties from fileObject for ease of access
    const {
      trackMetadata: metadata, albumArtUrl, lyrics, filePath,
    } = fileObject;

    try {
      // Initialize variable for the album art path
      let albumArtPath = null;

      // If albumArtUrl is available, download the image and save it locally
      if (albumArtUrl) {
        albumArtPath = await saveImageToFile(albumArtUrl, './images');
      }

      // Construct a normalized metadata object
      return {
        title: metadata.title,
        artist: metadata['artist-credit'][[0]].artist.name,
        releaseDate: metadata['first-release-date'],
        albumArt: albumArtPath,
        lyrics,
        filePath,
      };
    } catch (error) {
      // Throw an error if normalization fails to ensure error handling upstream
      throw new Error(`Error normalizing MusicBrainz metadata for file ${filePath}: ${error.message}`);
    }
  }));
}
