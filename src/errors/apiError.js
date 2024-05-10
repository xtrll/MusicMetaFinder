const errorMessages = {
  NO_DATA: 'No data received',
  NO_RESPONSE: 'No response received',
  SETUP_ERROR: 'Error setting up the request',
  UNKNOWN_ERROR: 'An unknown error occurred',
};

export default function processApiError(error) {
  let errorMessage = errorMessages[error.code] || errorMessages['UNKNOWN_ERROR'];

  console.error(errorMessage);
  throw new Error(errorMessage);
}
