import fs from 'fs';
import util from 'util';
import ffmetadata from 'ffmetadata'; // Ensure ffmpeg is installed on your system
import writeAlbumArt from './writeAlbumArt.js';
import renameFile from '../../../utils/renameAudioFileTitle.js';

// Convert callback-based ffmetadata.write to a promise-returning one
const writeMetadataPromise = util.promisify(ffmetadata.write);

/**
 * Writes the given metadata into the specified MP3 file's ID3 tags.
 * Album art is handled separately using the writeAlbumArt function.
 *
 * @param {Object} metadata - An object containing metadata fields like title, artist, and lyrics.
 * @param {string} filePath - Absolute path to the MP3 file.
 * @throws {Error} Throws an error if writing metadata fails or file does not exist.
 */
async function writeMetadata(metadata, filePath) {
  if (!metadata || typeof metadata !== 'object') {
    throw new TypeError('Metadata provided must be an object.');
  }
  if (!filePath || typeof filePath !== 'string') {
    throw new TypeError('File path must be a string.');
  }
  if (!fs.existsSync(filePath)) {
    throw new Error(`No file found at the given path: ${filePath}`);
  }

  try {
    // Define the tags to be written to the file's ID3 tags
    const tags = {
      title: metadata.title,
      artist: metadata.artist,
      lyrics: metadata.lyrics,
      // Add other tags here as necessary
    };

    // Attempt to write the provided metadata
    await writeMetadataPromise(filePath, tags);
    console.log(`Metadata written successfully to ${filePath}`);

    // If album art exists, use the provided function to add it
    if (metadata.albumArt) {
      await writeAlbumArt(filePath, metadata.albumArt);
    }

    // Rename audio file using artist name and title of the song
    metadata.filePath = await renameFile(tags.title, tags.artist, filePath);
  } catch (error) {
    // Throw a descriptive error with context to help diagnose issues more easily
    throw new Error(`Failed to write metadata to ${filePath}: ${error.message}`);
  }
}

export default writeMetadata;
