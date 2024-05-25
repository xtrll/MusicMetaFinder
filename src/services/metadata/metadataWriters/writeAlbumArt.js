import { promises as fs } from 'fs';
import { exec as execCallback } from 'child_process';
import { promisify } from 'util';

const exec = promisify(execCallback);

/**
 * Adds album art to an MP3 track using FFmpeg.
 * This function overwrites the original MP3 file with the album art embedded.
 * If any error occurs during the process, it attempts to clean up any temporary files created.
 *
 * @param {string} trackPath Absolute path to the input track file.
 * @param {string} albumArtPath Absolute path to the album art image file.
 * @returns {Promise<void>}
 */
export default async function addAlbumArt(trackPath, albumArtPath) {
  // Temp file has a '.tmp.mp3' extension to maintain format consistency
  const tmpOutputPath = `${trackPath}.tmp.mp3`;

  try {
    // Command constructed with necessary FFmpeg flags
    const command = `ffmpeg -y -i "${trackPath}" -i "${albumArtPath}" `
      + '-map 0:0 -map 1:0 -c copy -id3v2_version 3 '
      + '-metadata:s:v title="Album cover" -metadata:s:v comment="Cover (front)" '
      + `-f mp3 "${tmpOutputPath}"`;

    // Execute the FFmpeg command
    await exec(command);

    // Replace original file with updated temp file
    await fs.rename(tmpOutputPath, trackPath);

    console.log(`Album art successfully added to track: ${trackPath}`);
  } catch (error) {
    // Attempt to clean up temporary files before throwing the error
    console.error(`An error occurred; attempting to remove temporary file: ${tmpOutputPath}`);
    try {
      await fs.unlink(tmpOutputPath);
    } catch (cleanupError) {
      console.error(`Failed to remove temporary file: ${cleanupError.message}`);
    }

    // Enhance error message with additional context
    console.error(`Failed to add album art to ${trackPath}: ${error.message}`);
  }
}
