import requestMetadata from '../../api/metadata/musicBrainzApi.js';
import getAlbumArt from "../../api/metadata/coverArtArchiveApi.js";
import getLyrics from '../../api/metadata/lyricOvhApi.js';

/**
 * Adapter to handle retrieval of metadata for an array of objects containing MusicBrainz recording IDs and file paths.
 * @param {Object[]} fileObjectsWithIds - An array of objects containing file paths and MusicBrainz recording IDs.
 * @returns {Promise<Object[]>} A promise that resolves with an array of objects containing file paths, IDs, and metadata.
 */
export default async function getMetadata(fileObjectsWithIds) {
  try {
    if (!Array.isArray(fileObjectsWithIds)) {
      throw new Error('musicBrainzAdapter expects an array of objects with file paths and recording IDs');
    }

    // Prepare an object to hold the metadata results initialized as an array of Promises
    const metadataPromises = fileObjectsWithIds.map(async (objectWithId) => {
      // Only attempt to retrieve metadata if an ID is present
      const id = objectWithId.id;
      if (id) {
        try {
          const trackMetadata = await requestMetadata(id);
          const artist = trackMetadata['artist-credit']?.[0]?.name;
          const title = trackMetadata.title;
          const albumId = trackMetadata.releases[[0]]?.id;

          // Parallel requests for lyrics and album art, these are independent
          const [lyrics, albumArtUrl] = await Promise.all([
            getLyrics(artist, title),
            albumId ? getAlbumArt(albumId) : null
          ]);

          return {
            ...objectWithId,
            trackMetadata,
            albumArtUrl,
            lyrics
          };
        } catch (error) {
          console.error(`Error retrieving metadata for ID ${objectWithId.id}:`, error);

          return { ...objectWithId };
        }
      }
    });

    return await Promise.all(metadataPromises);
  } catch (e) {
    console.error('Error retrieving metadata using MetaBrainz:', e);
    throw e;
  }
}
