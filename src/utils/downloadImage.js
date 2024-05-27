import fs from 'fs';
import axiosRetry from './retryAxios.js';

/**
 * Downloads an image from the specified URL and saves it to the provided file path.
 * @param {string} url - The URL of the image to download.
 * @param {string} downloadPath - A relative path of the project where the image will be saved.
 * @returns {Promise<string>} - A promise that resolves to the download path when the image is successfully saved.
 */
export default async function downloadImage(url, downloadPath) {
  try {
    // Make an HTTP GET request to the URL with response type as 'stream'
    const response = await axiosRetry.get(url, {
      responseType: 'stream',
    });

    // Create a write stream to the destination file
    const writer = fs.createWriteStream(downloadPath);

    // Pipe the response data to the write stream
    response.data.pipe(writer);

    // Return a promise that resolves when the write stream finishes successfully
    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(downloadPath));
      writer.on('error', (error) => {
        console.error('Error downloading the image:', error);
        reject(error);
      });
    });
  } catch (error) {
    // Log and rethrow any error encountered during the HTTP request
    console.error('Error during HTTP request to download image:', error);
    throw error;
  }
}
