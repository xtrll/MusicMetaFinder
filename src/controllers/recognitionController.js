import audioRecognition from '../api/audioRecognition.js';

/**
 * Recognizes a list of audio files.
 *
 * @param {string[]} audioFiles An array of file paths of the audio files.
 * @return {Promise<Object[]>} A promise that resolves to an array of recognition results.
 */
export async function recognizeAudioFiles(audioFiles) {
  const recognitionPromises = audioFiles.map((filePath) => {
    audioRecognition(filePath)
      .catch((error) => {
        // Log the error and return null
        // This prevents one failed recognition from stopping the whole process
        console.error(`Recognition failed for file ${filePath}:`, error);
        return null;
      });
  });

  // Wait for all recognitions to resolve. This will be an array of results or null values
  const recognizedAudioFiles = await Promise.all(recognitionPromises);
  // Filter out unsuccessful recognitions
  return recognizedAudioFiles.filter((result) => result !== null);
}