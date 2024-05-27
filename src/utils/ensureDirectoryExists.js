import fs from 'fs';

/**
 * Ensures that a directory exists, creating it if necessary.
 * @param {string} dirPath - The directory path to ensure exists.
 */
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

export default ensureDirectoryExists;
