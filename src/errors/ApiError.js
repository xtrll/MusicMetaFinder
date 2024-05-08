const errorMessages = {
  NO_DATA: 'No data received from AudD API',
  NO_RESPONSE: 'No response received from AudD API',
  SETUP_ERROR: 'Error setting up the request to AudD API',
  UNKNOWN_ERROR: 'An unknown error occurred with the AudD API. Contact us in this case.',
  901: 'No API token passed, and the limit was reached (you need to obtain an API token).',
  900: 'Wrong API token (check the api_token parameter).',
  600: 'Incorrect audio URL.',
  700: 'You haven\'t sent a file for recognition (or we didn\'t receive it). If you use the POST HTTP method, check the Content-Type header: it should be multipart/form-data; also check the URL you\'re sending requests to: it should start with https:// (http:// requests get redirected and we don\'t receive any data from you when your code follows the redirect).',
  500: 'Incorrect audio file.',
  400: 'Too big audio file. 10MB or 25 seconds is the maximum. We recommend recording no more than 20 seconds (usually, it takes less than one megabyte). If you need to recognize larger audio files, use the enterprise endpoint instead, it supports even days-long files.',
  300: 'Fingerprinting error: there was a problem with audio decoding or with the neural network. Possibly, the audio file is too small.',
  100: 'An unknown error.'
};

export default function processApiError(error) {
  let errorMessage = errorMessages[error.code] || errorMessages['UNKNOWN_ERROR'];

  console.error(errorMessage);
  throw new Error(errorMessage);
}
