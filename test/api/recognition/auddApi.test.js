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
    const module = await esmock('../../../src/api/recognition/auddApi.js', {
      'fs': fsStub,
      '../../../src/utils/retryAxios.js': { default: axiosRetryStub },
      '../../../src/errors/generalApiErrorHandler.js': { default: handleErrorStub },
    });

    auddAudioRecognition = module.default;
  });

  afterEach(() => {
    sinon.restore();
    if (bufferStub && bufferStub.restore) bufferStub.restore(); // Restore the Buffer.from stub safely
    esmock.purge();
  });

  it('should successfully recognize the audio file', async function() {
    setupStubs();

    const mockMetadata = { result: 'mock result' };

    axiosRetryStub.post.resolves({
      status: 200,
      data: mockMetadata,
    });

    try {
      const result = await auddAudioRecognition(filePath);

      expect(result.data).to.deep.equal(mockMetadata);
      expect(result.filePath).to.equal(filePath);
      expect(fsStub.readFileSync.callCount).to.equal(1);
      expect(axiosRetryStub.post.callCount).to.equal(1);

      // Correctly compare the URL of the request
      expect(axiosRetryStub.post.firstCall.args[0]).to.equal('https://api.audd.io/');

      // Correctly compare the body
      const body = axiosRetryStub.post.firstCall.args[1];
      expect(body).to.be.an.instanceof(URLSearchParams);
      expect(body.get('api_token')).to.equal(process.env.AUDD_API_TOKEN);
      expect(body.get('audio')).to.equal(mockBase64Audio);
      expect(body.get('return')).to.equal('spotify');

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
      if (error.message.includes('No data received from Audd API')) {
        return 'No data received from Audd API';
      }
      return error.message;
    });

    try {
      await auddAudioRecognition(filePath);
      expect.fail('Expected auddAudioRecognition to throw "No data received from Audd API"');
    } catch (err) {
      expect(err.message).to.equal('No data received from Audd API');
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
      return `Audd API Error: ${JSON.stringify(apiError)}`;
    });

    try {
      await auddAudioRecognition(filePath);
      expect.fail('Expected auddAudioRecognition to throw "Audd API Error: Some API error"');
    } catch (err) {
      expect(err.message).to.equal(`Audd API Error: ${JSON.stringify(apiError)}`);
    }

    expect(fsStub.readFileSync.callCount).to.equal(1);
    expect(axiosRetryStub.post.callCount).to.equal(1);
  });

  it('should handle general errors correctly', async function() {
    setupStubs();

    const generalError = new Error('Network error');
    axiosRetryStub.post.rejects(generalError);

    handleErrorStub.returns('Handled network error');

    try {
      await auddAudioRecognition(filePath);
      expect.fail('Expected auddAudioRecognition to throw "Handled network error"');
    } catch (err) {
      expect(err.message).to.equal('Handled network error');
      expect(handleErrorStub.callCount).to.equal(1);
      expect(handleErrorStub.firstCall.args[0]).to.equal(generalError);
      expect(handleErrorStub.firstCall.args[1]).to.equal(filePath);
    }

    expect(fsStub.readFileSync.callCount).to.equal(1);
    expect(axiosRetryStub.post.callCount).to.equal(1);
  });

});

