import validateAudioFile from '../services/audioFileValidator.js';

/**
 * Processes an array of file paths and returns an array containing only valid audio file paths.
 *
 * @param {string[]} filePaths - The array of file paths to process.
 * @returns {Promise<string[]>} A promise that resolves to an array of valid audio file paths.
 */
export async function validateAudioFiles(filePaths) {
  // Validate input type
  if (!filePaths instanceof Array) {
    throw new TypeError('Input must be an array of file paths (strings).');
  }
  // Create a Promise for each file to validate it as an audio file
  const validationPromises = filePaths.map((filePath) => validateAudioFile(filePath));
  // Wait for all the validation promises to resolve
  const validationResults = await Promise.all(validationPromises);
  // Filter out any non-audio file paths (represented as null from validateAudioFile) and return resulting array
  return validationResults.filter((result) => result.type !== null);
}
