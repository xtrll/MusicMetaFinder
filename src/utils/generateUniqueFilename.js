import fs from 'fs/promises';
import path from 'path';

/**
 * Utility to normalize paths to use forward slashes
 * @param {string} p
 * @return {string}
 */
function normalizeToForwardSlash(p) {
  return p.split(path.sep).join('/');
}

/**
 * Generates a unique filename based on the original filename, ensuring it doesn't overwrite existing files.
 * @param {string} directory - The directory to save the downloaded image.
 * @param {string} filename - The original filename.
 * @returns {Promise<string>} - A promise that resolves to a unique filename.
 */
const generateUniqueFilename = async (directory, filename) => {
  const extension = path.extname(filename);
  const basename = path.basename(filename, extension);
  let counter = 1;

  let uniqueFilename = filename;
  let filePath = path.join(directory, uniqueFilename);

  // Check if the file exists and append a counter to make it unique
  // eslint-disable-next-line no-await-in-loop
  while (await fs.stat(filePath).catch(() => false)) {
    uniqueFilename = `${basename} (${counter})${extension}`;
    filePath = path.join(directory, uniqueFilename);
    counter += 1;
  }

  return normalizeToForwardSlash(filePath);
};

export default generateUniqueFilename;
