import { expect } from 'chai';
import sinon from 'sinon';
import esmock from 'esmock';

describe('getSpotifyAccessToken', () => {
  let axiosRetryStub;
  let handleErrorStub;
  let getSpotifyAccessToken;

  beforeEach(async () => {
    axiosRetryStub = sinon.stub();
    handleErrorStub = sinon.stub();

    // Mocking the spotifyAuthApi and its dependencies
    const module = await esmock('../../src/api/spotifyAuthApi.js', {
      '../../src/utils/retryAxios.js': axiosRetryStub,
      '../../src/errors/generalApiErrorHandler.js': {
        default: handleErrorStub,
      },
      'querystring': {
        stringify: sinon.stub().returns('grant_type=client_credentials'),
      },
    });

    getSpotifyAccessToken = module.default;
  });

  afterEach(() => {
    sinon.restore(); // Restore the original state of sinon stubs
    esmock.purge();  // Clean up any esmocked modules
  });

  it('should retrieve the Spotify access token', async () => {
    process.env.client_id = 'mockClientId';
    process.env.client_secret = 'mockClientSecret';

    const token = 'mocked_access_token';
    const response = { status: 200, data: { access_token: token } };
    axiosRetryStub.resolves(response);

    const result = await getSpotifyAccessToken();

    expect(result).to.equal(token);
    expect(axiosRetryStub.callCount).to.equal(1);
    expect(axiosRetryStub.firstCall.args[0]).to.include({
      url: 'https://accounts.spotify.com/api/token',
    });
    expect(axiosRetryStub.firstCall.args[0].headers.Authorization).to.include('Basic');
  });

  it('should throw an error if the request fails after retries', async () => {
    process.env.client_id = 'mockClientId';
    process.env.client_secret = 'mockClientSecret';

    const errorMessage = 'Handled error message';
    const error = new Error('Request failed');
    axiosRetryStub.rejects(error);
    handleErrorStub.returns(errorMessage);

    try {
      await getSpotifyAccessToken();
      // We should not reach here
      expect.fail('Expected getSpotifyAccessToken to throw');
    } catch (err) {
      expect(err.message).to.equal(errorMessage);
      expect(handleErrorStub.callCount).to.equal(1);
      expect(handleErrorStub.firstCall.args[0]).to.equal(error);
    }

    expect(axiosRetryStub.callCount).to.equal(1); // Only one stub call since retry logic is inside `retryAxios.js`
  });
});

