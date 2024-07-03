import { expect } from 'chai';
import esmock from 'esmock';

// Use esmock to mock dependencies
const getMetadata = await esmock('../../../src/adapters/metadata/musicBrainzAdapter.js', {
  '../../../src/api/metadata/musicBrainzApi.js': {
    default: async (id) => ({
      'artist-credit': [{ name: id === '12345' ? 'Artist1' : 'Artist2' }],
      title: id === '12345' ? 'Title1' : 'Title2',
      releases: [{ id: id === '12345' ? 'album1' : 'album2' }]
    })
  },
  '../../../src/api/metadata/coverArtArchiveApi.js': {
    default: async (albumId) => albumId === 'album1' ? 'AlbumArtUrl1' : 'AlbumArtUrl2'
  },
  '../../../src/api/metadata/lyricOvhApi.js': {
    default: async (artist, title) => title === 'Title1' ? 'Lyrics1' : 'Lyrics2'
  }
});

describe('musicBrainzAdapter', () => {
  it('should return metadata for valid input', async () => {
    const fileObjectsWithIds = [
      { id: '12345', filePath: 'path/to/file1.mp3' },
      { id: '67890', filePath: 'path/to/file2.mp3' }
    ];

    const result = await getMetadata(fileObjectsWithIds);

    expect(result).to.deep.equal([
      {
        id: '12345',
        filePath: 'path/to/file1.mp3',
        trackMetadata: {
          'artist-credit': [{ name: 'Artist1' }],
          title: 'Title1',
          releases: [{ id: 'album1' }]
        },
        albumArtUrl: 'AlbumArtUrl1',
        lyrics: 'Lyrics1'
      },
      {
        id: '67890',
        filePath: 'path/to/file2.mp3',
        trackMetadata: {
          'artist-credit': [{ name: 'Artist2' }],
          title: 'Title2',
          releases: [{ id: 'album2' }]
        },
        albumArtUrl: 'AlbumArtUrl2',
        lyrics: 'Lyrics2'
      }
    ]);
  });

  it('should handle errors in metadata retrieval gracefully', async () => {
    const mockRequestMetadata = async (id) => {
      if (id === '12345') {
        throw new Error('Metadata retrieval failed');
      }
      return {
        'artist-credit': [{ name: 'Artist2' }],
        title: 'Title2',
        releases: [{ id: 'album2' }]
      };
    };

    const getMetadataWithMocks = await esmock('../../../src/adapters/metadata/musicBrainzAdapter.js', {
      '../../../src/api/metadata/musicBrainzApi.js': {
        default: mockRequestMetadata
      },
      '../../../src/api/metadata/coverArtArchiveApi.js': {
        default: async (albumId) => 'AlbumArtUrl2'
      },
      '../../../src/api/metadata/lyricOvhApi.js': {
        default: async (artist, title) => 'Lyrics2'
      }
    });

    const fileObjectsWithIds = [
      { id: '12345', filePath: 'path/to/file1.mp3' },
      { id: '67890', filePath: 'path/to/file2.mp3' }
    ];

    const result = await getMetadataWithMocks(fileObjectsWithIds);

    expect(result).to.deep.equal([
      { id: '12345', filePath: 'path/to/file1.mp3' }, // Failed metadata retrieval
      {
        id: '67890',
        filePath: 'path/to/file2.mp3',
        trackMetadata: {
          'artist-credit': [{ name: 'Artist2' }],
          title: 'Title2',
          releases: [{ id: 'album2' }]
        },
        albumArtUrl: 'AlbumArtUrl2',
        lyrics: 'Lyrics2'
      }
    ]);
  });

  it('should throw an error for invalid input', async () => {
    let error;
    try {
      await getMetadata('invalid input');
    } catch (e) {
      error = e;
    }
    expect(error).to.be.an('error');
    expect(error.message).to.equal('musicBrainzAdapter expects an array of objects with file paths and recording IDs');
  });
});

