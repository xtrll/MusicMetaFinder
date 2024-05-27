import fs from 'fs/promises';
import mime from 'mime-types';

/**
 * Validates whether a given file path points to an audio file by checking its MIME type.
 * Logs an error if the path is not a file or if the file is not a recognized audio type.
 *
 * @param {string} filePath - The absolute path to the file to validate.
 * @returns {Promise<string|null>} - The file path if it is a recognized audio file, otherwise null.
 */
export default async function validateAudioFile(filePath) {
  try {
    // Ensure that the path points to a file
    const stats = await fs.lstat(filePath);
    if (!stats.isFile()) {
      console.error(`The path ${filePath} is not a file and is ignored.`);
      return null; // Stop further checks and return null
    }

    // MIME type checking
    const mimeType = mime.lookup(filePath);
    console.log(`MIME type of ${filePath} is ${mimeType}`); // Log the MIME type

    // Set of recognized audio MIME types
    const validAudioMimeTypes = new Set([
      'audio/mpeg',       // .mp3
      'audio/wav',        // .wav
      'audio/x-wav',      // .wav
      'audio/flac',       // .flac
      'audio/x-flac',     // .flac
      'audio/ogg',        // .ogg
      'audio/aac',        // .aac
      'audio/aiff',       // .aiff
      'audio/x-aiff',     // .aiff
      'audio/x-m4a',      // .m4a
    ]);

    // Perform the MIME type validation
    if (!validAudioMimeTypes.has(mimeType)) {
      console.error(`File ${filePath} is not an audio file and is ignored.`);
      return null; // Not a recognized audio file type, return null
    }

    return filePath; // The file is a recognized audio file
  } catch (e) {
    console.error(`Error validating file ${filePath}: ${e}`);
    return null; // Return null on error to maintain a consistent return type
  }
}
