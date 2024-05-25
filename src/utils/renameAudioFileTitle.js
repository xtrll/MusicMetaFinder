import path from 'path';
import fs from 'fs/promises';

/**
 * Renames an audio file by its metadata properties: artist and title.
 *
 * @param {string} artist - The artist name.
 * @param {string} title - The title of the track.
 * @param {string} filePath - The current path of the file.
 * @returns {Promise<string>} - A promise that resolves to the new file path.
 * @throws {Error} - If the file rename operation fails.
 */
export default async function renameFile(artist, title, filePath) {
  // Ensure file path, artist, and title are provided
  if (!filePath || !artist || !title) {
    throw new Error('File path, artist, and title must be provided.');
  }

  const ext = path.extname(filePath);
  const dir = path.dirname(filePath);
  const newFileName = `${artist} - ${title}${ext}`;
  const newFilePath = path.join(dir, newFileName);

  try {
    await fs.rename(filePath, newFilePath);
    return newFilePath; // Return the new path after successful rename
  } catch (error) {
    console.error(`Error renaming file: ${error.message}`);
    throw error; // Rethrow the error for the caller to handle
  }
}
