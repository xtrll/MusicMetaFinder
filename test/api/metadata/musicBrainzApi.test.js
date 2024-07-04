import { expect } from 'chai';
import sinon from 'sinon';
import esmock from 'esmock';

describe('getMetadata', () => {
  let axiosRetryStub;
  let handleErrorStub;
  let getMetadata;

  beforeEach(async () => {
    axiosRetryStub = {
      get: sinon.stub()
    };
    handleErrorStub = sinon.stub();

    // Mocking the musicBrainzApi and its dependencies
    const module = await esmock('../../../src/api/metadata/musicBrainzApi.js', {
      '../../../src/utils/retryAxios.js': {
        default: axiosRetryStub,
      },
      '../../../src/errors/generalApiErrorHandler.js': {
        default: handleErrorStub,
      },
    });

    getMetadata = module.default;
  });

  afterEach(() => {
    sinon.restore(); // Restore the original state of sinon stubs
    esmock.purge();  // Clean up any esmocked modules
  });

  it('should fetch metadata for a given recording ID successfully', async () => {
    const recordingId = 'mockRecordingId';
    const metadata = { title: 'Mock Title', artists: [], releases: [] };
    axiosRetryStub.get.resolves({
      status: 200,
      data: metadata
    });

    const result = await getMetadata(recordingId);

    expect(result).to.deep.equal(metadata);
    expect(axiosRetryStub.get.callCount).to.equal(1);
    expect(axiosRetryStub.get.firstCall.args[0]).to.equal(`https://musicbrainz.org/ws/2/recording/${recordingId}?fmt=json&inc=artists+releases`);
  });

  it('should return null if metadata is not found (404 error)', async () => {
    const recordingId = 'mockRecordingId';
    const error = new Error('Not Found');
    error.response = { status: 404 };
    axiosRetryStub.get.rejects(error);

    const result = await getMetadata(recordingId);

    expect(result).to.be.null;
    expect(axiosRetryStub.get.callCount).to.equal(1);
    expect(axiosRetryStub.get.firstCall.args[0]).to.equal(`https://musicbrainz.org/ws/2/recording/${recordingId}?fmt=json&inc=artists+releases`);
  });

  it('should handle general errors and throw an error', async () => {
    const recordingId = 'mockRecordingId';
    const errorMessage = 'API responded with an error';
    const error = new Error('Request failed');
    error.response = {}; // Ensure error.response is an object
    axiosRetryStub.get.rejects(error);
    handleErrorStub.returns(errorMessage);

    try {
      await getMetadata(recordingId);
      // We should not reach here
      expect.fail('Expected getMetadata to throw');
    } catch (err) {
      expect(err.message).to.equal(errorMessage);
      expect(handleErrorStub.callCount).to.equal(1);
      expect(handleErrorStub.firstCall.args[0]).to.equal(error);
    }

    expect(axiosRetryStub.get.callCount).to.equal(1);
    expect(axiosRetryStub.get.firstCall.args[0]).to.equal(`https://musicbrainz.org/ws/2/recording/${recordingId}?fmt=json&inc=artists+releases`);
  });
});

