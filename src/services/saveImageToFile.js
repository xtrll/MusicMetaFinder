import path from 'path';
import downloadImage from '../utils/downloadImage.js';
import ensureDirectoryExists from '../utils/ensureDirectoryExists.js';

/**
 * Saves an image from a specified URL to a given output directory.
 * @param {string} imageUrl - The URL of the image to download.
 * @param {string} outputDirectory - The directory to save the downloaded image.
 * @returns {Promise<string>} - A promise that resolves to the path of the saved image.
 */
export default async function saveImageToFile(imageUrl, outputDirectory) {
  try {
    // Resolve the output directory to an absolute path
    const absoluteOutputDirectory = path.resolve(outputDirectory);

    // Ensure the output directory exists
    ensureDirectoryExists(absoluteOutputDirectory);

    // Create a safe file name
    const imageName = path.basename(imageUrl);
    const savePath = path.join(absoluteOutputDirectory, imageName);

    // Use the downloadImage function to download and get the path to the saved image
    return await downloadImage(imageUrl, savePath); // Return the saved image path for further use
  } catch (error) {
    console.error('Error saving image to file:', error);
    throw error;
  }
}
