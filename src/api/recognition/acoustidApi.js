import fpcalc from 'fpcalc'; // Chromaprint MUST be present inside %PATH% as well. https://github.com/acoustid/chromaprint/releases
import axiosRetry from '../../utils/retryAxios.js';
import handleError from '../../errors/acoustidApiErrorHandler.js';

/**
 * Identifies an audio file using the AcoustID API.
 *
 * @param {string} filePath - The path to the audio file to be recognized.
 * @returns {Promise<Object>} - A promise resolving to the recording id.
 */
export default async function acoustdIdAudioRecognition(filePath) {
  const { duration, fingerprint } = await new Promise((resolve, reject) => {
    fpcalc(filePath, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });

  // Prepare the body of the POST request with required parameters
  const body = new URLSearchParams({
    client: process.env.ACOUSTID_API_KEY,
    fingerprint,
    duration,
    meta: 'recordings', // Optional parameter to specify additional metadata
  });

  const requestOptions = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };

  return axiosRetry.post('https://api.acoustid.org/v2/lookup', body, requestOptions)
    .then((response) => {
      const { data } = response;

      if (!data || !data.results.length) {
        console.error(`Song ${filePath} could not be recognized by AcoustId`);
        return null;
      }

      if (data.status !== 'ok') {
        throw new Error(`${data.error.message}`);
      }

      console.log('Recognition successful for:', filePath);
      return data.results[0].recordings[0].id;
    })
    .catch((error) => {
      const errorMessage = handleError(error, filePath);
      throw new Error(errorMessage);
    });
}
