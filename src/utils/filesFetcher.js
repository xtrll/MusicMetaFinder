import fs from 'fs';
import path from 'path';

/**
 * Fetches files from a given input path. If the path is a directory,
 * it recursively fetches all files within it, including in subdirectories.
 * If the path is an individual file, it returns an array with just
 * that file path. This function handles both files and directories,
 * making it versatile for various file fetching needs.
 *
 * @param {string} inputPath - The path to the file or directory to fetch files from.
 * @returns {Promise<string[]>} A promise that resolves with an array of file paths.
 * @throws {Error} If the inputPath does not refer to an existing file or directory.
 */
export default async function fetchFiles(inputPath) {
  try {
    const stats = await fs.promises.stat(inputPath);
    let files = [];
    if (stats.isDirectory()) {
      // Recursive case: inputPath is a directory.
      files = await fetchFilesFromDirectory(inputPath);
    } else if (stats.isFile()) {
      // Base case: inputPath is a file.
      files = [inputPath];
    } else {
      throw new Error('Invalid path: not a file or directory');
    }
    return files;
  } catch (e) {
    console.error('Error resolving path', e);
    throw e;
  }
}

/**
 * A private helper function that recursively fetches all files within a directory.
 * It will traverse all subdirectories and return a flat array of file paths.
 *
 * @param {string} folderPath - The directory path to start the file search from.
 * @returns {Promise<string[]>} A promise that resolves with an array of file paths.
 * @throws {Error} If an error occurs while reading the directory.
 */
async function fetchFilesFromDirectory(folderPath) {
  async function enumerateFilesInDirectory(dirPath) {
    let fileList = [];
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        // Recurse into subdirectories.
        fileList = fileList.concat(await enumerateFilesInDirectory(fullPath));
      } else {
        // Add file path to the list.
        fileList.push(fullPath);
      }
    }
    return fileList;
  }

  try {
    // Initiate recursive file listing from the root folder path.
    return await enumerateFilesInDirectory(folderPath);
  } catch (e) {
    console.error(`Error enumerating files in directory ${folderPath}:`, e);
    throw e;
  }
}
