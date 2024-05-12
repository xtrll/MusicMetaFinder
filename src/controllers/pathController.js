import filesFetcher from '../utils/filesFetcher.js';

/**
 * Handle the input path provided by the user to resolve file paths
 * using the appropriate path handling utility. This controller function
 * is responsible for initiating the file fetching process and ensuring
 * that the paths returned comply with the expected format and conditions.
 *
 * @param {string} inputPath - The initial file or directory path provided by the user.
 * @returns {Promise<string[]>} - A promise that resolves to an array of file paths,
 *                                or rejects with an error if the operation fails.
 */
export async function fetchFiles(inputPath) {
  return filesFetcher(inputPath);
}
