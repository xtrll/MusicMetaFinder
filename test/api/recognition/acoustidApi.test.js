import { expect } from 'chai';
import sinon from 'sinon';
import esmock from 'esmock';

describe('acoustIdAudioRecognition', () => {
  let fpcalcStub;
  let axiosRetryStub;
  let handleErrorStub;
  let acoustIdAudioRecognition;

  beforeEach(async () => {
    fpcalcStub = sinon.stub();
    axiosRetryStub = {
      post: sinon.stub()
    };
    handleErrorStub = sinon.stub();

    // Mocking the acoustidApi and its dependencies
    const module = await esmock('../../../src/api/recognition/acoustidApi.js', {
      'fpcalc': fpcalcStub,
      '../../../src/utils/retryAxios.js': {
        default: axiosRetryStub,
      },
      '../../../src/errors/acoustidApiErrorHandler.js': {
        default: handleErrorStub,
      },
    });

    acoustIdAudioRecognition = module.default;
  });

  afterEach(() => {
    sinon.restore(); // Restore the original state of sinon stubs
    esmock.purge();  // Clean up any esmocked modules
  });

  it('should successfully recognize audio file', async () => {
    const filePath = 'mockFilePath.mp3';
    const mockDuration = 200;
    const mockFingerprint = 'mockFingerprint';
    const mockRecordingId = 'mockRecordingId';

    fpcalcStub.callsFake((path, callback) => {
      expect(path).to.equal(filePath);
      callback(null, { duration: mockDuration, fingerprint: mockFingerprint });
    });

    axiosRetryStub.post.resolves({
      status: 200,
      data: {
        status: 'ok',
        results: [{
          recordings: [{
            id: mockRecordingId
          }]
        }]
      }
    });

    const result = await acoustIdAudioRecognition(filePath);

    expect(result).to.equal(mockRecordingId);
    expect(fpcalcStub.callCount).to.equal(1);
    expect(axiosRetryStub.post.callCount).to.equal(1);
    expect(axiosRetryStub.post.firstCall.args[0]).to.equal('https://api.acoustid.org/v2/lookup');
  });

  it('should return null if song could not be recognized', async () => {
    const filePath = 'mockFilePath.mp3';
    const mockDuration = 200;
    const mockFingerprint = 'mockFingerprint';

    fpcalcStub.callsFake((path, callback) => {
      expect(path).to.equal(filePath);
      callback(null, { duration: mockDuration, fingerprint: mockFingerprint });
    });

    axiosRetryStub.post.resolves({
      status: 200,
      data: {
        status: 'ok',
        results: []
      }
    });

    const result = await acoustIdAudioRecognition(filePath);

    expect(result).to.be.null;
    expect(fpcalcStub.callCount).to.equal(1);
    expect(axiosRetryStub.post.callCount).to.equal(1);
    expect(axiosRetryStub.post.firstCall.args[0]).to.equal('https://api.acoustid.org/v2/lookup');
  });

  it('should handle errors and throw an error message', async () => {
    const filePath = 'mockFilePath.mp3';
    const mockDuration = 200;
    const mockFingerprint = 'mockFingerprint';
    const errorMessage = 'API error occurred';
    const error = new Error('Request failed');
    error.response = {}; // Ensure error.response is an object

    fpcalcStub.callsFake((path, callback) => {
      expect(path).to.equal(filePath);
      callback(null, { duration: mockDuration, fingerprint: mockFingerprint });
    });

    axiosRetryStub.post.rejects(error);
    handleErrorStub.returns(errorMessage);

    try {
      await acoustIdAudioRecognition(filePath);
      // We should not reach here
      expect.fail('Expected acoustdIdAudioRecognition to throw');
    } catch (err) {
      expect(err.message).to.equal(errorMessage);
      expect(handleErrorStub.callCount).to.equal(1);
      expect(handleErrorStub.firstCall.args[0]).to.equal(error);
      expect(handleErrorStub.firstCall.args[1]).to.equal(filePath);
    }

    expect(fpcalcStub.callCount).to.equal(1);
    expect(axiosRetryStub.post.callCount).to.equal(1);
  });
});

