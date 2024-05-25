import axios from 'axios';
import fs from 'fs';

// This function needs to be something like downloadImageToFile
export default async function downloadImageToFile(url, downloadPath) {
  try {
    const response = await axios.get(url, {
      responseType: 'stream',
    });

    const writer = fs.createWriteStream(downloadPath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(downloadPath));
      writer.on('error', reject);
    });
  } catch (e) {
    console.error('Error downloading the image:', e);
    throw e;
  }
}
