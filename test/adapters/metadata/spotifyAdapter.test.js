import { expect } from 'chai';
import esmock from 'esmock';

// Usual import statements at the top
import getSpotifyAccessToken from '../../../src/api/spotifyAuthApi.js';
import requestMetadata from '../../../src/api/metadata/spotifyApi.js';

describe('spotifyAdapter', () => {
  let getMetadata;

  beforeEach(async () => {
    // Use esmock to mock modules and get the module under test
    getMetadata = await esmock('../../../src/adapters/metadata/spotifyAdapter.js', {
      '../../../src/api/spotifyAuthApi.js': {
        default: async () => 'fakeAccessToken'
      },
      '../../../src/api/metadata/spotifyApi.js': {
        default: async (trackId, accessToken) => ({
          id: trackId,
          name: `Track ${trackId}`,
          accessToken
        })
      }
    });
  });

  it('should return metadata for valid trackIds', async () => {
    const trackIds = ['track1', 'track2'];

    const result = await getMetadata(trackIds);

    expect(result).to.deep.equal([
      {
        id: 'track1',
        name: 'Track track1',
        accessToken: 'fakeAccessToken'
      },
      {
        id: 'track2',
        name: 'Track track2',
        accessToken: 'fakeAccessToken'
      }
    ]);
  });

  it('should handle errors when retrieving access token', async () => {
    // Mock the access token method to throw an error
    getMetadata = await esmock('../../../src/adapters/metadata/spotifyAdapter.js', {
      '../../../src/api/spotifyAuthApi.js': {
        default: async () => { throw new Error('Access token error'); }
      }
    });

    let error;

    try {
      await getMetadata(['track1']);
    } catch (e) {
      error = e;
    }

    expect(error).to.be.an('error');
    expect(error.message).to.equal('Access token error');
  });

  it('should handle errors when retrieving metadata', async () => {
    // Mock the metadata method to throw an error for specific trackId
    getMetadata = await esmock('../../../src/adapters/metadata/spotifyAdapter.js', {
      '../../../src/api/spotifyAuthApi.js': {
        default: async () => 'fakeAccessToken'
      },
      '../../../src/api/metadata/spotifyApi.js': {
        default: async (trackId, accessToken) => {
          if (trackId === 'track1') {
            throw new Error('Metadata retrieval error');
          }
          return {
            id: trackId,
            name: `Track ${trackId}`,
            accessToken
          };
        }
      }
    });

    let error;

    try {
      await getMetadata(['track1', 'track2']);
    } catch (e) {
      error = e;
    }

    expect(error).to.be.an('error');
    expect(error.message).to.equal('Metadata retrieval error');
  });

  it('should throw an error for invalid input', async () => {
    let error;

    try {
      await getMetadata('invalid input');
    } catch (e) {
      error = e;
    }

    expect(error).to.be.an('error');
    expect(error.message).to.equal('getMetadata expects an array of trackIds');
  });
});

