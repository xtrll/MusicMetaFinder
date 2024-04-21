import fs from 'fs/promises';
import path from 'path';

export const validateAudioFile = async (filePath, callback) => {
  try {
    const stats = await fs.lstat(filePath);
    if (stats.isFile()) {
      const fileExtension = path.extname(filePath);
      const audioExtensions = ['.mp3', '.wav', '.aac', '.flac', '.ogg', '.aiff', '.m4a'];
      if (audioExtensions.includes(fileExtension)) {
        callback(filePath);
      } else {
        console.error(`File ${filePath} is not an audio file.`);
      }
    }
  } catch (e) {
    console.error(`Error validating audio file ${filePath}: ${e}`);
  }
};
