#!/usr/bin/env node
import checkEnvVariables from './src/utils/checkEnvVariables.js';
import checkInputPath from './src/utils/checkInputPath.js';
import fetchFiles from './src/utils/fetchFiles.js';
import validateAudioFiles from './src/services/fileService.js';
import recognizeAudioFiles from './src/services/musicRecognitionService.js';
import retrieveMetadata from './src/services/metadataRetrievalService.js';

const { ACOUSTID_API_KEY, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;

async function main() {
  try {
    // Check for required environment variables
    // checkEnvVariables();
    // Check for required input path
    const inputPath = process.argv[[2]];
    checkInputPath(inputPath);
    // Preferred service can be provided
    const service = process.argv[[3]] || undefined;

    // Resolve the input path to get array of file paths (handles one or more files)
    const files = await fetchFiles(inputPath);
    // Process the resolved paths to confirm and prepare the audio file for metadata recognition
    const audioFiles = await validateAudioFiles(files);
    // Recognize the content of the audio file and obtain the corresponding Spotify track ID
    const audioIds = await recognizeAudioFiles(audioFiles, service);
    // Fetch the audio metadata from Spotify using the recognized track IDs
    const audioMetadata = await retrieveMetadata(audioIds, service);
    console.log(audioMetadata);
    // Write the fetched metadata into the audio file
    // const processedAudioFiles = await fileController.writeMetadata(audioMetadata, audioFiles);
  } catch (e) {
    console.error('An error occurred inside cli.js:', e);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(`Execution error: ${error.message}`);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
