import path from 'path';
import fs from 'fs/promises';
import generateUniqueFilename from './generateUniqueFilename.js';

/**
 * Utility to normalize paths to use forward slashes
 * @param {string} p
 * @return {string}
 */
function normalizeToForwardSlash(p) {
  return p.split(path.sep).join('/');
}

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
    throw new Error('File path, artist, and title must be provided when renaming file.');
  }

  const ext = path.extname(filePath);
  const dir = path.dirname(filePath);
  const proposedFileName = `${artist} - ${title}${ext}`;

  // Generate a unique filename to avoid overwriting
  const newFilePath = await generateUniqueFilename(normalizeToForwardSlash(dir), normalizeToForwardSlash(proposedFileName));

  try {
    await fs.rename(filePath, newFilePath);
    return normalizeToForwardSlash(newFilePath); // Return the new path after successful rename
  } catch (error) {
    console.error(`Error renaming file: ${error.message}`);
    throw error; // Rethrow the error for the caller to handle
  }
}
