import validateAudioFile from '../utils/validateAudioFiles.js';
import path from 'path';

/**
 * Processes an array of file paths and returns an array containing only valid and supported audio file paths.
 *
 * @param {string[]} filePaths - The array of file paths to process.
 * @returns {Promise<string[]>} A promise that resolves to an array of valid and supported audio file paths.
 * @throws {TypeError} - If the input is not an array of file paths (strings).
 */
export default async function validateAudioFiles(filePaths) {
  // Validate input type to ensure it is an array
  if (!Array.isArray(filePaths)) {
    throw new TypeError('Input must be an array of file paths (strings).');
  }

  /**
   * Set of supported audio file extensions for this project.
   * Currently, the project only supports .mp3 files.
   */
  const supportedAudioExtensions = new Set(['.mp3']);

  // Create a Promise for each file to validate it as an audio file
  const validationPromises = filePaths.map(async (filePath) => {
    // Validate the file as a generic audio file
    const validFilePath = await validateAudioFile(filePath);

    // If the file is a valid audio file, check if its extension is supported
    if (validFilePath) {
      const fileExtension = path.extname(validFilePath).toLowerCase();
      if (supportedAudioExtensions.has(fileExtension)) {
        // Return the file path if the extension is supported
        return validFilePath;
      } else {
        console.error(`File ${path.basename(validFilePath)} is an audio file but ${fileExtension} format is not yet supported and so is ignored.`);
      }
    }
    return null; // Return null if file is not valid or not supported
  });

  // Wait for all the validation promises to resolve
  const validationResults = await Promise.all(validationPromises);

  // Filter out any non-audio or unsupported file paths (represented as null) and return the resulting array
  return validationResults.filter((filePath) => filePath !== null);
}
