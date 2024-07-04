import fs from 'fs';
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
 * Recursively fetches all files within a directory tree, or if the path is a file, returns it in an array.
 *
 * @param {string} inputPath - Path to the directory or file.
 * @returns {Promise<string[]>} A promise that resolves with an array of file paths.
 * @throws {Error} Throws an error if the path does not exist or is not accessible.
 */
export default async function fetchFiles(inputPath) {
  try {
    // Stat the path to determine if it's a file or directory
    const stats = await fs.promises.stat(inputPath);

    if (stats.isDirectory()) {
      // Initiate recursive file fetching for directories
      return fetchFilesFromDirectory(inputPath);
    }
    if (stats.isFile()) {
      // Return the file path in an array for individual files
      return [normalizeToForwardSlash(inputPath)];
    }
    // The path is neither a file nor a directory
    throw new Error(`Input path is neither a file nor a directory: ${inputPath}`);
  } catch (error) {
    // Throw an error with a clear message for the caller to handle
    throw new Error(`Failed to fetch files: ${error.message}`);
  }
}

/**
 * Helper function that recursively traverses through a directory and accumulates file paths.
 *
 * @param {string} dirPath The starting directory path.
 * @returns {Promise<string[]>} A promise that resolves with an array of file paths found recursively within the directory path.
 * @private
 */
async function fetchFilesFromDirectory(dirPath) {
  async function enumerateFilesInDirectory(currentPath) {
    try {
      let fileList = [];
      const entries = await fs.promises.readdir(currentPath, { withFileTypes: true });
      console.log('Enumerate entries from:', currentPath, 'Entries:', entries);

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);

        if (entry.isDirectory()) {
          const subDirFiles = await enumerateFilesInDirectory(fullPath);
          fileList = [...fileList, ...subDirFiles];
        } else {
          fileList.push(normalizeToForwardSlash(fullPath));
        }
      }
      return fileList;
    } catch (error) {
      console.error(`Error while enumerating files in directory ${currentPath}:`, error);
      throw new Error(`Unable to enumerate files in directory: ${currentPath}`);
    }
  }

  return enumerateFilesInDirectory(dirPath);
}
