import { expect } from 'chai';
import { createSandbox } from 'sinon';
import handleError from '../../src/errors/generalApiErrorHandler.js';

describe('generalApiErrorHandler', function() {
  const sandbox = createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should handle API response errors correctly', function() {
    const error = {
      response: {
        status: 400,
        headers: { 'content-type': 'application/json' },
        data: { message: 'Bad Request' },
      },
    };

    const identifier = 'testFilePath';

    const expectedMessage = `API responded with an error for ${identifier}: Bad Request - Bad Request: The server could not understand the request due to invalid syntax.`;

    const result = handleError(error, identifier);

    expect(result).to.equal(expectedMessage);
  });

  it('should append correct messages for different status codes', function() {
    const statuses = [
      { code: 400, description: 'Bad Request: The server could not understand the request due to invalid syntax.' },
      { code: 401, description: 'Unauthorized: Authentication is needed to get the requested response.' },
      { code: 403, description: 'Forbidden: You do not have access to this resource.' },
      { code: 404, description: 'Not Found: The requested resource or endpoint was not found on the server.' },
      { code: 503, description: 'Service Unavailable: The server is not ready to handle the request.' },
    ];

    const identifier = 'testFilePath';

    statuses.forEach(status => {
      const error = {
        response: {
          status: status.code,
          headers: { 'content-type': 'application/json' },
          data: { message: 'Error message' },
        },
      };

      const expectedMessage = `API responded with an error for ${identifier}: Error message - ${status.description}`;

      const result = handleError(error, identifier);

      expect(result).to.equal(expectedMessage);
    });
  });

  it('should handle cases where no response is received', function() {
    const error = {
      request: {},
    };

    const identifier = 'testFilePath';

    const expectedMessage = `No response from API for ${identifier}`;

    const result = handleError(error, identifier);

    expect(result).to.equal(expectedMessage);
  });

  it('should handle setup errors correctly', function() {
    const error = {
      message: 'Network error',
    };

    const identifier = 'testFilePath';

    const expectedMessage = `Problem with setting up the request for ${identifier} - Network error`;

    const result = handleError(error, identifier);

    expect(result).to.equal(expectedMessage);
  });
});


