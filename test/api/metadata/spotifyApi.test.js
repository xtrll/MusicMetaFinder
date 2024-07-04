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

    // Mocking the spotifyApi and its dependencies
    const module = await esmock('../../../src/api/metadata/spotifyApi.js', {
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

  it('should fetch metadata for a given track ID successfully', async () => {
    const trackId = 'mockTrackId';
    const accessToken = 'mockAccessToken';
    const metadata = { name: 'Mock Song', artists: [], album: {} };
    axiosRetryStub.get.resolves({
      status: 200,
      data: metadata
    });

    const result = await getMetadata(trackId, accessToken);

    expect(result).to.deep.equal(metadata);
    expect(axiosRetryStub.get.callCount).to.equal(1);
    expect(axiosRetryStub.get.firstCall.args[0]).to.equal(`https://api.spotify.com/v1/tracks/${trackId}`);
    expect(axiosRetryStub.get.firstCall.args[1]).to.deep.include({
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  });

  it('should handle errors and throw an error message', async () => {
    const trackId = 'mockTrackId';
    const accessToken = 'mockAccessToken';
    const errorMessage = 'API responded with an error';
    const error = new Error('Request failed');
    error.response = {}; // Ensure error.response is an object
    axiosRetryStub.get.rejects(error);
    handleErrorStub.returns(errorMessage);

    try {
      await getMetadata(trackId, accessToken);
      // We should not reach here
      expect.fail('Expected getMetadata to throw');
    } catch (err) {
      expect(err.message).to.equal(errorMessage);
      expect(handleErrorStub.callCount).to.equal(1);
      expect(handleErrorStub.firstCall.args[0]).to.equal(error);
      expect(handleErrorStub.firstCall.args[1]).to.equal(trackId);
    }

    expect(axiosRetryStub.get.callCount).to.equal(1);
    expect(axiosRetryStub.get.firstCall.args[0]).to.equal(`https://api.spotify.com/v1/tracks/${trackId}`);
    expect(axiosRetryStub.get.firstCall.args[1]).to.deep.include({
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  });
});

