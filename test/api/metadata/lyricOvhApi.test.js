import { expect } from 'chai';
import sinon from 'sinon';
import esmock from 'esmock';

describe('getLyrics', () => {
  let axiosRetryStub;
  let handleErrorStub;
  let getLyrics;

  beforeEach(async () => {
    axiosRetryStub = {
      get: sinon.stub(),
    };
    handleErrorStub = sinon.stub();

    // Mocking the lyricOvhApi and its dependencies
    const module = await esmock('../../../src/api/metadata/lyricOvhApi.js', {
      '../../../src/utils/retryAxios.js': {
        default: axiosRetryStub,
      },
      '../../../src/errors/generalApiErrorHandler.js': {
        default: handleErrorStub,
      },
    });

    getLyrics = module.default;
  });

  afterEach(() => {
    sinon.restore(); // Restore the original state of sinon stubs
    esmock.purge();  // Clean up any esmocked modules
  });

  it('should fetch lyrics for a specific song successfully', async () => {
    const artist = 'mockArtist';
    const title = 'mockTitle';
    const lyrics = 'These are the mock lyrics';
    axiosRetryStub.get.resolves({
      status: 200,
      data: { lyrics }
    });

    const result = await getLyrics(artist, title);

    expect(result).to.equal(lyrics);
    expect(axiosRetryStub.get.callCount).to.equal(1);
    expect(axiosRetryStub.get.firstCall.args[0]).to.equal(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
  });

  it('should return null if lyrics are not found (404 error)', async () => {
    const artist = 'mockArtist';
    const title = 'mockTitle';
    const error = new Error('Not Found');
    error.response = { status: 404 };
    axiosRetryStub.get.rejects(error);

    const result = await getLyrics(artist, title);

    expect(result).to.be.null;
    expect(axiosRetryStub.get.callCount).to.equal(1);
    expect(axiosRetryStub.get.firstCall.args[0]).to.equal(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
  });

  it('should handle general errors and return null', async () => {
    const artist = 'mockArtist';
    const title = 'mockTitle';
    const errorMessage = 'API responded with an error';
    const error = new Error('Request failed');
    error.response = {}; // Ensure error.response is an object
    axiosRetryStub.get.rejects(error);
    handleErrorStub.returns(errorMessage);

    const result = await getLyrics(artist, title);

    expect(result).to.be.null;
    expect(handleErrorStub.callCount).to.equal(1);
    expect(handleErrorStub.firstCall.args[0]).to.equal(error);
    expect(axiosRetryStub.get.callCount).to.equal(1);
    expect(axiosRetryStub.get.firstCall.args[0]).to.equal(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
  });
});

