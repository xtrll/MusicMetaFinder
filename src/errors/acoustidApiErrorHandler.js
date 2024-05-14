export default function handleError(error, filePath) {
  if (error.response) { // Detailed error information when the API responds with an error status
    console.error(`Request failed with status: ${error.response.status}`);
    console.error('Headers:', error.response.headers);
    console.error('Data:', error.response.data);

    return `API responded with an error: ${error.response.data.message || error.response.status}`;
  } if (error.request) { // Case when the request was made but no response was received
    console.error('No response received from the API:', error.request);
    return `No response from API when processing file: ${filePath}`;
  } // Any errors that occur before the request is made
  console.error('Error setting up the request:', error.message);
  return `Problem with setting up the request for file: ${filePath} - ${error.message}`;
}
