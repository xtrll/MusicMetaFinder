import { expect } from 'chai';
import sinon from 'sinon';
import esmock from 'esmock';

describe('normalizeMusicBrainz', function() {
  let saveImageToFileStub;
  let normalizeMusicBrainz;

  beforeEach(async function() {
    saveImageToFileStub = sinon.stub().resolves('/path/to/saved/image.jpg');

    // Mocking saveImageToFile and its dependencies
    normalizeMusicBrainz = await esmock('../../../../src/services/metadata/normalizers/normalizeMusicBrainz.js', {
      '../../../../src/services/saveImageToFile.js': { default: saveImageToFileStub }
    });

    normalizeMusicBrainz = normalizeMusicBrainz.default;
  });

  afterEach(() => {
    sinon.restore();
    esmock.purge();
  });

  it('should normalize metadata and save album art', async function() {
    const fileObjectsWithMetadata = [{
      trackMetadata: {
        title: 'Test Title',
        'artist-credit': [{ artist: { name: 'Test Artist' } }],
        'first-release-date': '2023-01-01',
      },
      albumArtUrl: 'http://example.com/albumArt.jpg',
      lyrics: 'Test lyrics',
      filePath: 'path/to/test/file.mp3',
    }];

    const result = await normalizeMusicBrainz(fileObjectsWithMetadata);

    expect(result).to.deep.equal([{
      title: 'Test Title',
      artist: 'Test Artist',
      releaseDate: '2023-01-01',
      albumArt: '/path/to/saved/image.jpg',
      lyrics: 'Test lyrics',
      filePath: 'path/to/test/file.mp3',
    }]);
    expect(saveImageToFileStub.calledOnceWithExactly('http://example.com/albumArt.jpg', './images')).to.be.true;
  });

  it('should handle missing metadata and return null', async function() {
    const fileObjectsWithMetadata = [{
      trackMetadata: null,
      albumArtUrl: 'http://example.com/albumArt.jpg',
      lyrics: 'Test lyrics',
      filePath: 'path/to/test/file.mp3',
    }];

    const result = await normalizeMusicBrainz(fileObjectsWithMetadata);

    expect(result).to.deep.equal([null]);
    expect(saveImageToFileStub.called).to.be.false;
  });

  it('should handle missing album art URL gracefully', async function() {
    const fileObjectsWithMetadata = [{
      trackMetadata: {
        title: 'Test Title',
        'artist-credit': [{ artist: { name: 'Test Artist' } }],
        'first-release-date': '2023-01-01',
      },
      albumArtUrl: null,
      lyrics: 'Test lyrics',
      filePath: 'path/to/test/file.mp3',
    }];

    const result = await normalizeMusicBrainz(fileObjectsWithMetadata);

    expect(result).to.deep.equal([{
      title: 'Test Title',
      artist: 'Test Artist',
      releaseDate: '2023-01-01',
      albumArt: null,
      lyrics: 'Test lyrics',
      filePath: 'path/to/test/file.mp3',
    }]);
    expect(saveImageToFileStub.called).to.be.false;
  });

  it('should propagate errors from saveImageToFile', async function() {
    const fileObjectsWithMetadata = [{
      trackMetadata: {
        title: 'Test Title',
        'artist-credit': [{ artist: { name: 'Test Artist' } }],
        'first-release-date': '2023-01-01',
      },
      albumArtUrl: 'http://example.com/albumArt.jpg',
      lyrics: 'Test lyrics',
      filePath: 'path/to/test/file.mp3',
    }];

    const saveImageError = new Error('Failed to save image');
    saveImageToFileStub.rejects(saveImageError);

    try {
      await normalizeMusicBrainz(fileObjectsWithMetadata);
      expect.fail('Expected an error to be thrown');
    } catch (error) {
      expect(error.message).to.equal(`Error normalizing MusicBrainz metadata for file path/to/test/file.mp3: ${saveImageError.message}`);
    }
    expect(saveImageToFileStub.calledOnceWithExactly('http://example.com/albumArt.jpg', './images')).to.be.true;
  });
});

