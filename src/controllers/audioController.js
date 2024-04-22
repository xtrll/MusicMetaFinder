import fs from 'fs';
import path from 'path';
import recognizeAudio from '../api/audioRecognition.js';
import fetchFilesFromDirectory from '../utils/directoryFileFetcher.js';
import validateAudioFile from '../services/audioFileValidator.js';

export default async function audioController(inputPath) {
  let stats;

  try {
    stats = await fs.promises.stat(inputPath);
  } catch (e) {
    console.error('Error accessing provided path', e);
    return;
  }

  if (stats.isDirectory()) {
    try {
      const files = await fetchFilesFromDirectory(inputPath);
      for (const file of files) {
        await handleFile(file);
      }
    } catch (e) {
      console.error(`Error extracting files from ${inputPath}:`, e);
      throw e;
    }
  } else if (stats.isFile()) {
    await handleFile(inputPath);
  } else {
    console.error('The provided path is neither a file nor a directory.');
  }
}

async function handleFile(filePath) {
  try {
    const audioFile = await validateAudioFile(filePath);
    const result = await recognizeAudio(audioFile, process.env.AUDD_API_TOKEN);
    console.log(`Results for file ${path.basename(filePath)}:`, result);
  } catch (e) {
    console.error(`An error occurred processing the file ${path.basename(filePath)}:`, e);
  }
}
