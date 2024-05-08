import axios from 'axios';
import fs from 'fs';
import processApiError from "../errors/ApiError.js";
import truncateAudioStream from "../utils/truncateAudioStream";

/**
 * Recognizes audio via the AudD API.
 *
 * @param {string} filePath The local path to the audio file to recognize.
 * @param {string} AUDD_API_TOKEN The token for authentication with the AudD API.
 * @return {Promise<Object>} A promise that resolves with the recognition data from AudD API.
 */
export default async function audioRecognition(filePath, AUDD_API_TOKEN) {
  try {
    // Create a read stream for the audio file.
    const stream = fs.createReadStream(filePath);

    // Truncate the audio stream to 25 seconds.
    const truncatedAudioBuffer = await truncateAudioStream(stream);

    // Convert the truncated audio buffer to a base64-encoded string.
    const base64audio = truncatedAudioBuffer.toString('base64');

    // Construct the request body with necessary parameters
    const body = new URLSearchParams({
      api_token: AUDD_API_TOKEN,
      audio: base64Audio,
      return: 'spotify', // Asking the API to return data in a format that can be used to reference Spotify tracks
    });

    // Define request options, including a 10-second timeout
    const requestOptions = {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 10000,
    };
  } catch (e) {
    console.error('Error during setup of audio recognition:', e.message, filePath);
    throw e;
  }

  // Send a POST request to the AudD API with the audio data for recognition
  return axios.post('https://api.audd.io/', new URLSearchParams(body), requestOptions)
    .then((response) => {
      const { data } = response; // Destructure the data from the response object
      if (!data) throw { code: 'NO_DATA' }; // Throw an error if no data is returned
      if (data.error) {
        // If the API returned an error, handle it accordingly
        throw {
          code: data.error.error_code,
          additionalMessage: data.error.message
        };
      }
      // If no errors, resolve the promise with the API response data
      return data;
    })
    .catch((error) => {
      // Catch any errors and process them using a custom error handler function
      processApiError(error);
    });
}
