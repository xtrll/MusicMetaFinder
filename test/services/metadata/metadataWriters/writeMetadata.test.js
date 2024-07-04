import { expect } from 'chai';
import sinon from 'sinon';
import esmock from 'esmock';

describe('writeMetadata', function() {
  let fsExistsSyncStub;
  let writeMetadataPromiseStub;
  let writeAlbumArtStub;
  let renameFileStub;
  let writeMetadata;

  const filePath = 'path/to/track.mp3';
  const albumArtPath = 'path/to/albumArt.jpg';
  const newFilePath = 'path/to/new_track.mp3';

  const validMetadata = {
    title: 'Test Title',
    artist: 'Test Artist',
    lyrics: 'Test Lyrics',
    albumArt: albumArtPath,
  };

  beforeEach(async function() {
    fsExistsSyncStub = sinon.stub();
    writeMetadataPromiseStub = sinon.stub().resolves();
    writeAlbumArtStub = sinon.stub().resolves();
    renameFileStub = sinon.stub().resolves(newFilePath);

    writeMetadata = await esmock('../../../../src/services/metadata/metadataWriters/writeMetadata.js', {
      'fs': { existsSync: fsExistsSyncStub },
      'util': { promisify: sinon.stub().returns(writeMetadataPromiseStub) },
      '../../../../src/services/metadata/metadataWriters/writeAlbumArt.js': { default: writeAlbumArtStub },
      '../../../../src/utils/renameAudioFileTitle.js': { default: renameFileStub }
    });

    writeMetadata = writeMetadata.default;
  });

  afterEach(() => {
    sinon.restore();
    esmock.purge();
  });

  it('should write metadata and album art to an MP3 file', async function() {
    fsExistsSyncStub.withArgs(filePath).returns(true);

    await writeMetadata(validMetadata, filePath);

    expect(writeMetadataPromiseStub.calledOnceWithExactly(filePath, {
      title: validMetadata.title,
      artist: validMetadata.artist,
      lyrics: validMetadata.lyrics,
    })).to.be.true;

    expect(writeAlbumArtStub.calledOnceWithExactly(filePath, albumArtPath)).to.be.true;
    expect(renameFileStub.calledOnceWithExactly(validMetadata.title, validMetadata.artist, filePath)).to.be.true;
  });

  it('should throw an error if metadata is not an object', async function() {
    fsExistsSyncStub.withArgs(filePath).returns(true);

    try {
      await writeMetadata('invalid metadata', filePath);
      expect.fail('Expected TypeError to be thrown');
    } catch (error) {
      expect(error).to.be.instanceOf(TypeError);
      expect(error.message).to.equal('Metadata provided must be an object.');
    }
  });

  it('should throw an error if filePath is not a string', async function() {
    fsExistsSyncStub.withArgs(filePath).returns(true);

    try {
      await writeMetadata(validMetadata, {});
      expect.fail('Expected TypeError to be thrown');
    } catch (error) {
      expect(error).to.be.instanceOf(TypeError);
      expect(error.message).to.equal('File path must be a string.');
    }
  });

  it('should throw an error if the file path does not exist', async function() {
    fsExistsSyncStub.withArgs(filePath).returns(false);

    try {
      await writeMetadata(validMetadata, filePath);
      expect.fail('Expected Error to be thrown');
    } catch (error) {
      expect(error.message).to.equal(`No file found at the given path: ${filePath}`);
    }
  });

  it('should handle errors during metadata writing process and provide context', async function() {
    const writeError = new Error('Failed to write metadata');
    fsExistsSyncStub.withArgs(filePath).returns(true);
    writeMetadataPromiseStub.rejects(writeError);

    try {
      await writeMetadata(validMetadata, filePath);
      expect.fail('Expected Error to be thrown');
    } catch (error) {
      expect(error.message).to.equal(`Failed to write metadata to ${filePath}: ${writeError.message}`);
    }
  });
});

