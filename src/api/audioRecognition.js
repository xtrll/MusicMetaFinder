import axios from 'axios';
import fs from 'fs';

export default function audioController(filePath, AUDD_API_TOKEN) {
  const audioData = fs.readFileSync(filePath);
  const base64Audio = Buffer.from(audioData).toString('base64');
  const body = new URLSearchParams({
    api_token: AUDD_API_TOKEN,
    audio: base64Audio,
    return: 'spotify',
  });

  const requestOptions = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  };

  return axios.post('https://api.audd.io/', new URLSearchParams(body), requestOptions)
    .then((response) => {
      const { data } = response;
      if (!data) throw new Error('No data received from Audd API');
      if (data.error) throw new Error(`Audd API Error: ${JSON.stringify(data.error)}`);
      return data;
    })
    .catch((error) => {
      console.error('Error recognizing audio:', error.toString());
      throw error;
    });
}
