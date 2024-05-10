import axios from 'axios';
import chromaprint from 'chromaprint'
import processApiError from "../errors/apiError.js";


export default async function audioRecognition(filePath) {


  return axios.post('http://api.acoustid.org/v2/lookup', new URLSearchParams(body), requestOptions)
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
