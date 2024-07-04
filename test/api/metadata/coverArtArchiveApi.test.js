import { expect } from 'chai';
import sinon from 'sinon';
import esmock from 'esmock';

describe('getAlbumArt', () => {
  let axiosRetryStub;
  let handleErrorStub;
  let getAlbumArt;

  beforeEach(async () => {
    axiosRetryStub = {
      get: sinon.stub()
    };
    handleErrorStub = sinon.stub();

    // Mocking the coverArtArchiveApi and its dependencies
    const module = await esmock('../../../src/api/metadata/coverArtArchiveApi.js', {
      '../../../src/utils/retryAxios.js': {
        default: axiosRetryStub
      },
      '../../../src/errors/generalApiErrorHandler.js': {
        default: handleErrorStub
      }
    });

    getAlbumArt = module.default;
  });

  afterEach(() => {
    sinon.restore(); // Restore the original state of sinon stubs
    esmock.purge();  // Clean up any esmocked modules
  });

  it('should retrieve album art URL for a given album ID (success case)', async () => {
    const albumId = 'mockAlbumId';
    const responseUrl = 'http://coverartarchive.org/mockAlbumId/front.jpg';
    axiosRetryStub.get.resolves({
      status: 200,
      request: { responseURL: responseUrl }
    });

    const result = await getAlbumArt(albumId);

    expect(result).to.equal(responseUrl);
    expect(axiosRetryStub.get.callCount).to.equal(1);
    expect(axiosRetryStub.get.firstCall.args[0]).to.equal(`http://coverartarchive.org/release/${albumId}/front`);
  });

  it('should retrieve album art URL from redirect', async () => {
    const albumId = 'mockAlbumId';
    const redirectUrl = 'http://someotherurl.com/front.jpg';
    axiosRetryStub.get.resolves({
      status: 307,
      headers: { location: redirectUrl }
    });

    const result = await getAlbumArt(albumId);

    expect(result).to.equal(redirectUrl);
    expect(axiosRetryStub.get.callCount).to.equal(1);
    expect(axiosRetryStub.get.firstCall.args[0]).to.equal(`http://coverartarchive.org/release/${albumId}/front`);
  });

  it('should handle 307 redirect error', async () => {
    const albumId = 'mockAlbumId';
    const redirectUrl = 'http://redirecturl.com/front.jpg';
    const error = new Error('Request failed');
    error.response = {
      status: 307,
      headers: { location: redirectUrl }
    };
    axiosRetryStub.get.rejects(error);

    const result = await getAlbumArt(albumId);

    expect(result).to.equal(redirectUrl);
    expect(axiosRetryStub.get.callCount).to.equal(1);
    expect(axiosRetryStub.get.firstCall.args[0]).to.equal(`http://coverartarchive.org/release/${albumId}/front`);
  });

  it('should return null for 404 error', async () => {
    const albumId = 'mockAlbumId';
    const error = new Error('Not Found');
    error.response = {
      status: 404
    };
    axiosRetryStub.get.rejects(error);

    const result = await getAlbumArt(albumId);

    expect(result).to.be.null;
    expect(axiosRetryStub.get.callCount).to.equal(1);
    expect(axiosRetryStub.get.firstCall.args[0]).to.equal(`http://coverartarchive.org/release/${albumId}/front`);
  });

  it('should return null and handle general errors', async () => {
    const albumId = 'mockAlbumId';
    const errorMessage = 'API responded with an error';
    const error = new Error('Request failed');
    error.response = {}; // Ensure error.response is an object
    axiosRetryStub.get.rejects(error);
    handleErrorStub.returns(errorMessage);

    const result = await getAlbumArt(albumId);

    expect(result).to.be.null;
    expect(handleErrorStub.callCount).to.equal(1);
    expect(handleErrorStub.firstCall.args[0]).to.equal(error);
    expect(axiosRetryStub.get.callCount).to.equal(1);
    expect(axiosRetryStub.get.firstCall.args[0]).to.equal(`http://coverartarchive.org/release/${albumId}/front`);
  });
});

