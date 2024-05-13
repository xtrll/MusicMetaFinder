export function handleError(error, identifier) {
  let message = '';

  // Handler when the API responds with an error status.
  if (error.response) {
    const { status } = error.response;
    console.error(`Request failed with status: ${status}`);
    console.error('Headers:', error.response.headers);
    console.error('Data:', error.response.data);

    message = `API responded with an error for ${identifier}: ${error.response.data.message || status}`;

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
        message += ' - Not Found: The requested resource or endpoint was not found on the server.';
        break;
      case 503:
        message += ' - Service Unavailable: The server is not ready to handle the request.';
        break;
      default:
        message += ' - An unexpected error occurred.';
    }
  } else if (error.request) {
    // Case when the request was made but no response was received.
    console.error(`No response received for ${identifier}`);
    console.error('Error request:', error.request);
    message = `No response from API for ${identifier}`;
  } else {
    // Errors that  occur before the request is made, during setup.
    console.error(`Error setting up the request for ${identifier}`);
    console.error('Error message:', error.message);
    message = `Problem with setting up the request for ${identifier} - ${error.message}`;
  }

  // Log the message and return it
  console.error(message);
  return message;
}
