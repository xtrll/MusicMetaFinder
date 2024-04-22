import fs from 'fs/promises';
import path from 'path';

export default async function validateAudioFile(filePath) {
  const stats = await fs.lstat(filePath);
  if (!stats.isFile()) {
    throw new Error(`The path ${filePath} is not a file.`);
  }

  const fileExtension = path.extname(filePath).toLowerCase();
  const audioExtensions = ['.mp3', '.wav', '.aac', '.flac', '.ogg', '.aiff', '.m4a'];
  if (audioExtensions.includes(fileExtension)) {
    return filePath;
  }
  console.error(`File ${path.basename(filePath)} is not an audio file and is ignored.`);
}
