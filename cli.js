#!/usr/bin/env node

import checkEnv from './src/utils/checks/checkEnvVariables.js';
import checkPath from './src/utils/checks/checkInputPath.js';
import fetchFiles from './src/utils/fetchFiles.js';
import validateFiles from './src/services/fileService.js';
import recognizeFiles from './src/services/musicRecognitionService.js';
import retrieveMetadataService from './src/services/metadata/metadataRetrievalService.js';
import normalizeMetadataService from './src/services/metadata/normalizers/metadataNormalizerService.js';
import writeMetadataService from './src/services/metadata/metadataWritingService.js';

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Check for required environment variables at the start
checkEnv();

/**
 * The main function that serves as the entry point for the CLI tool.
 * @param {string} inputPath - The file system path to the audio files to be processed.
 * @param {string} [service] - Optional; name of the service to use for audio recognition.
 */
async function main(inputPath, service) {
  // Fetch the paths to audio files. This can handle a directory of files or a single file.
  // `fetchFiles` resolves the path(s) and returns an array of file paths.
  const files = await fetchFiles(inputPath);

  // Validate the audio files at provided paths. This step checks their format,
  // returning a filtered list of valid audio files.
  const audioFiles = await validateFiles(files);

  // Perform the audio file recognition. This step takes the valid audio files and
  // uses an audio recognition service to identify each track, associating it with a unique ID.
  const filesWithIds = await recognizeFiles(audioFiles, service);

  // Retrieve the metadata for the recognized audio files. This involves fetching
  // data such as titles, artists, albums, etc., based on the previously obtained track IDs.
  const filesWithMetadata = await retrieveMetadataService(filesWithIds, service);

  // Normalize the fetched metadata. Data normalization involves converting all the
  // metadata to a standard format or schema, ensuring consistency across all data points.
  const normalizedMetadata = await normalizeMetadataService(filesWithMetadata, service);

  // Write the normalized metadata into the audio files. This step actually updates each
  // audio file with the correct metadata, so it's correctly recognized by media players.
  await writeMetadataService(normalizedMetadata);
}

/**
 * Executes the main functionality of the command-line interface.
 *
 * This function parses command-line arguments to retrieve the input path and the
 * optional service argument. It then passes those arguments to the main function for further processing.
 *
 * If an error occurs during the execution of the main function or the input path
 * validation fails, it catches the error and exits the process with a status code of 1.
 */
function runCli() {
  try {
    // Note: Ensure your argument indices are correct.
    // If this is run with `npm run analyze -- <path>`, indices should be [[1]] and [[2]]
    // Validates the input path (second CLI argument)
    const inputPath = process.argv[[2]];
    checkPath(inputPath);

    // Optionally selects a service (third CLI argument)
    const service = process.argv[[3]] || undefined;

    // Invoke the main function with the input path and service
    main(inputPath, service);
  } catch (error) {
    // Log the error message to the console
    console.error('An error occurred:', error.message);
    // Terminate the process with an error status code
    process.exit(1);
  }
}

runCli();
