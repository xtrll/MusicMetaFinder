import path from 'path'; // Replace with your actual path
import downloadImageToFile from './downloadImageToFile.js';

export default async function saveImageToFile(imageUrl, outputDirectory) {
  try {
    // Create a safe file name
    const imageName = path.basename(imageUrl); // This may need to be adjusted for unique naming
    const savePath = path.join(outputDirectory, imageName);

    // Use the updated function to download and get the path to the saved image
    const savedImagePath = await downloadImageToFile(imageUrl, savePath);

    console.log('Image saved to', savedImagePath);
    return savedImagePath; // Return the saved image path for further use
  } catch (error) {
    console.error('Error writing image to file:', error);
    throw error;
  }
}
