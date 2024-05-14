import fs from 'fs/promises';
import path from 'path';

/**
 * Validates whether a given file path points to a supported audio file.
 * Logs an error for each file that is not an audio file or not a file at all and ignores it.
 *
 * @param {string} filePath - The absolute path to the file to validate.
 * @returns {Promise<string|null>} - The file path if it is a supported audio file, otherwise null.
 */
export default async function validateAudioFile(filePath) {
  try {
    // Ensure that the path points to a file
    const stats = await fs.lstat(filePath);
    if (!stats.isFile()) {
      console.error(`The path ${filePath} is not an audio file and is ignored.`);
      return null; // Stop further checks and return null
    }

    // List of supported audio file extensions
    const audioExtensions = ['.mp3', '.wav', '.aac', '.flac', '.ogg', '.aiff', '.m4a'];

    // Check if the file extension is in the list of supported audio formats
    const fileExtension = path.extname(filePath).toLowerCase();
    if (!audioExtensions.includes(fileExtension)) {
      console.error(`File ${path.basename(filePath)} is not an audio file and is ignored.`);
      return null; // Not an audio file, return null
    }

    return filePath; // The file is a supported audio file
  } catch (e) {
    console.error(`Error validating file ${filePath}: ${e}`);
  }
}
