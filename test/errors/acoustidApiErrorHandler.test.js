import { expect } from 'chai';
import sinon from 'sinon';
import esmock from 'esmock';

describe('auddAudioRecognition', function() {
  let fsStub;
  let axiosRetryStub;
  let handleErrorStub;
  let auddAudioRecognition;
  let bufferStub;

  const filePath = 'mockFilePath.mp3';
  const mockAudioData = 'mockAudioData';
  const mockBase64Audio = 'mockBase64Audio';
  let originalBufferFrom, originalBufferToString;

  before(function() {
    console.log("Setting process environment variables");
    process.env.AUDD_API_TOKEN = 'mockToken';
  });

  const setupStubs = () => {
    try {
      // Stubbing fs.readFileSync
      fsStub.readFileSync.withArgs(filePath).returns(mockAudioData);

      // Stubbing Buffer.from
      originalBufferFrom = Buffer.from;
      bufferStub = sinon.stub(Buffer, 'from').callsFake((data) => {
        const buffer = originalBufferFrom(data);
        if (data === mockAudioData) {
          if (!originalBufferToString) {
            originalBufferToString = buffer.toString;
          }
          sinon.stub(buffer, 'toString').callsFake((encoding) => {
            if (encoding === 'base64') {
              return mockBase64Audio;
            }
            return originalBufferToString.call(buffer, encoding);
          });
        }
        return buffer;
      });
    } catch (e) {
      console.error('Error during setupStubs:', e);
      throw e;
    }
  };

  beforeEach(async function() {
    fsStub = { readFileSync: sinon.stub() };
    axiosRetryStub = { post: sinon.stub() };
    handleErrorStub = sinon.stub();

    // Mocking the auddApi and its dependencies
    const module = await esmock('../../src/api/recognition/auddApi.js', {
      'fs': fsStub,
      '../../src/utils/retryAxios.js': { default: axiosRetryStub },
      '../../src/errors/generalApiErrorHandler.js': { default: handleErrorStub },
    });

    auddAudioRecognition = module.default;
  });

  afterEach(() => {
    sinon.restore();
    if (bufferStub && bufferStub.restore) bufferStub.restore(); // Restore the Buffer.from stub safely
    esmock.purge();
  });

  const errorMessages = {
    noData: 'No data received from Audd API',
    apiError: (message) => `Audd API Error: ${JSON.stringify({ message })}`,
    networkError: (filePath, message) => `Problem with setting up the request for file: ${filePath} - ${message}`
  };

  it('should successfully recognize the audio file', async function() {
    setupStubs();

    const mockMetadata = { result: 'mock result' };

    axiosRetryStub.post.resolves({
      status: 200,
      data: mockMetadata,
    });

    try {
      const result = await auddAudioRecognition(filePath);

      // Assertions on result
      expect(result.data).to.deep.equal(mockMetadata);
      expect(result.filePath).to.equal(filePath);

      // Verify the stubs
      expect(fsStub.readFileSync.callCount).to.equal(1);
      expect(axiosRetryStub.post.callCount).to.equal(1);

      // Detailed logging for debugging
      console.log('Request URL:', axiosRetryStub.post.firstCall.args[0]);
      console.log('Request Body:', axiosRetryStub.post.firstCall.args[1].toString());

      const expectedBodyString = new URLSearchParams({
        api_token: process.env.AUDD_API_TOKEN,
        audio: mockBase64Audio,
        return: 'spotify'
      }).toString();

      console.log('Expected Body String:', expectedBodyString);

      // Correctly compare the URL of the request
      expect(axiosRetryStub.post.firstCall.args[0]).to.equal('https://api.audd.io/');

      // Correctly compare the body
      const body = axiosRetryStub.post.firstCall.args[1];
      expect(body).to.be.an.instanceof(URLSearchParams);
      expect(body.toString()).to.equal(expectedBodyString);

    } catch (e) {
      throw e;
    }
  });

  it('should handle no data received from API', async function() {
    setupStubs();

    axiosRetryStub.post.resolves({
      status: 200,
      data: null,
    });

    handleErrorStub.callsFake((error) => {
      console.log(`handleError called with error: ${error.message}`);
      return errorMessages.noData;
    });

    try {
      await auddAudioRecognition(filePath);
      expect.fail('Expected auddAudioRecognition to throw "No data received from Audd API"');
    } catch (err) {
      console.log(`Caught error: ${err.message}`);
      expect(err.message).to.equal(errorMessages.noData);
    }

    expect(fsStub.readFileSync.callCount).to.equal(1);
    expect(axiosRetryStub.post.callCount).to.equal(1);
  });

  it('should handle API errors correctly', async function() {
    setupStubs();

    const apiError = { message: 'Some API error' };
    axiosRetryStub.post.resolves({
      status: 200,
      data: { error: apiError },
    });

    handleErrorStub.callsFake((error) => {
      console.log(`handleError called with API error: ${JSON.stringify(apiError)}`);
      return errorMessages.apiError(apiError.message);
    });

    try {
      await auddAudioRecognition(filePath);
      expect.fail(`Expected auddAudioRecognition to throw "${errorMessages.apiError(apiError.message)}"`);
    } catch (err) {
      console.log(`Caught error: ${err.message}`);
      expect(err.message).to.equal(errorMessages.apiError(apiError.message));
    }

    expect(fsStub.readFileSync.callCount).to.equal(1);
    expect(axiosRetryStub.post.callCount).to.equal(1);
  });

  it('should handle general errors correctly', async function() {
    setupStubs();

    const generalError = new Error('Network error');
    axiosRetryStub.post.rejects(generalError);

    handleErrorStub.callsFake(({ message }) => {
      console.log(`handleError called with general error: ${message}`);
      return errorMessages.networkError(filePath, message);
    });

    try {
      await auddAudioRecognition(filePath);
      expect.fail(`Expected auddAudioRecognition to throw "${errorMessages.networkError(filePath, generalError.message)}"`);
    } catch (err) {
      console.log(`Caught error: ${err.message}`);
      expect(err.message).to.equal(errorMessages.networkError(filePath, generalError.message));
      expect(handleErrorStub.callCount).to.equal(1);
      expect(handleErrorStub.firstCall.args[0]).to.equal(generalError);
      expect(handleErrorStub.firstCall.args[1]).to.equal(filePath);
    }

    expect(fsStub.readFileSync.callCount).to.equal(1);
    expect(axiosRetryStub.post.callCount).to.equal(1);
  });

});


