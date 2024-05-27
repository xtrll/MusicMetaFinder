import recognizeAudio from '../../api/recognition/acoustidApi.js';

/**
 * Recognizes a list of audio files.
 *
 * @param {string[]} audioFiles An array of file paths of the audio files.
 * @return {Promise<Object[]>} A promise that resolves to an array of recognition results.
 */
export default async function recognizeAudioFiles(audioFiles) {
  const recognitionPromises = audioFiles.map(async (filePath) => {
    try {
      // Attempt to recognize the audio and return an object with filePath and id
      const id = await recognizeAudio(filePath);
      return { filePath, id };
    } catch (error) {
      // Log the error, return an object with filePath and null id
      // This prevents one failed recognition from stopping the whole process
      console.error(`Recognition failed for file ${filePath}:`, error);
      return { filePath, id: null };
    }
  });

  // This will be an array of objects with filePaths and ids or null values for ids
  return Promise.all(recognitionPromises);
}
