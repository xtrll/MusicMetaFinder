import fs from 'fs';
import path from 'path';

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
      // eslint-disable-next-line no-use-before-define
      return fetchFilesFromDirectory(inputPath);
    } if (stats.isFile()) {
      // Return the file path in an array for individual files
      return [inputPath];
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
  // Define the recursive function for enumerating files
  async function enumerateFilesInDirectory(currentPath) {
    let fileList = [];
    const entries = await fs.promises.readdir(currentPath, { withFileTypes: true });

    // Loop over directory entries and handle directories and files
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        // Recursively enumerate files in subdirectories
        // eslint-disable-next-line no-await-in-loop
        fileList = [...fileList, ...await enumerateFilesInDirectory(fullPath)];
      } else {
        // Add file to the list
        fileList.push(fullPath);
      }
    }
    return fileList;
  }

  // Use the recursive function starting from the provided directory path
  try {
    return await enumerateFilesInDirectory(dirPath);
  } catch (error) {
    // Log the error with context and rethrow it
    console.error(`Error while enumerating files in directory ${dirPath}:`, error);
    throw new Error(`Unable to enumerate files in directory: ${dirPath}`);
  }
}
