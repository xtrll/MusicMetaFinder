import recognizeAudio from '../../api/recognition/auddApi.js';

/**
 * Recognizes a list of audio files.
 *
 * @param {string[]} audioFiles An array of file paths of the audio files.
 * @return {Promise<(Object|null)[]>} A promise that resolves to an array of recognition result objects or null values for each file.
 */
export default async function recognizeAudioFiles(audioFiles) {
  const recognitionPromises = audioFiles.map(filePath =>
    recognizeAudio(filePath)
      .catch(error => {
        // Log the error and return null for this file.
        // This prevents one failed recognition from stopping the whole process
        console.error(`Recognition failed for file ${filePath}:`, error);
        return null;
      })
  );

  // Wait for all recognitions to resolve. This will be an array of results or null values for each audio file.
  return Promise.all(recognitionPromises);
}
