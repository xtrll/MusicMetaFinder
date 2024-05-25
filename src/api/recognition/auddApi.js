import fs from 'fs';
import axiosRetry from '../../utils/retryAxios.js';
import handleError from '../../errors/generalApiErrorHandler.js';

export default async function auddAudioRecognition(filePath) {
  const audioData = fs.readFileSync(filePath);
  const base64Audio = Buffer.from(audioData).toString('base64');
  const body = new URLSearchParams({
    api_token: process.env.AUDD_API_TOKEN,
    audio: base64Audio,
    return: 'spotify',
  });

  const requestOptions = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  };

  return axiosRetry.post('https://api.audd.io/', new URLSearchParams(body), requestOptions)
    .then((response) => {
      const { data } = response;

      if (!data) throw new Error('No data received from Audd API');
      if (data.error) throw new Error(`Audd API Error: ${JSON.stringify(data.error)}`);

      console.log('Recognition successful for:', filePath);
      return {
        data,
        filePath,
      };
    })
    .catch((error) => {
      console.error('Error recognizing audio');
      const errorMessage = handleError(error, filePath);
      throw new Error(errorMessage);
    });
}
