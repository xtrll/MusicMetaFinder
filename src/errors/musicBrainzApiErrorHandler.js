export function handleError(error, recordingId) {
  // Handler when the API responds with an error status.
  if (error.response) {
    const { status } = error.response;
    console.error(`Error with recording ID: ${recordingId}`);
    console.error(`Request failed with status: ${status}`);
    console.error('Headers:', error.response.headers);
    console.error('Data:', error.response.data);

    let message = `API responded with an error: ${error.response.data.message || status}`;

    switch (status) {
      case 400:
        message += ' - Bad Request: The server could not understand the request due to invalid syntax.';
        break;
      case 401:
        message += ' - Unauthorized: Authentication is needed to get the requested response.';
        break;
      case 403:
        message += ' - Forbidden: You do not have access to this resource.';
        break;
      case 404:
        message += ' - Not Found: The requested resource was not found on the server.';
        break;
      case 503:
        message += ' - Service Unavailable: The server is not ready to handle the request. Common causes include server overload or server taken down for maintenance.';
        break;
      default:
        message += ' - An unexpected error occurred.';
    }
    return message;

    // Case when the request was made but no response was received.
  } if (error.request) {
    console.error(`No response received for recording ID: ${recordingId}`);
    console.error('Error request:', error.request);
    return `No response from API for recording ID: ${recordingId}`;

    // Errors that occur before the request is made, during setup.
  }
  console.error(`Error setting up the request for recording ID: ${recordingId}`);
  console.error('Error message:', error.message);
  return `Problem with setting up the request for recording ID: ${recordingId} - ${error.message}`;
}
