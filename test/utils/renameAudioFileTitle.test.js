import path from 'path';
import { expect } from 'chai';
import sinon from 'sinon';
import esmock from 'esmock';

// Utility function to normalize paths to use forward slashes
function normalizeToForwardSlash(p) {
  return p.split(path.sep).join('/');
}

describe('renameFile', () => {
  let renameFile, fsStub, generateUniqueFilenameStub;

  beforeEach(async () => {
    fsStub = {
      rename: sinon.stub()
    };

    generateUniqueFilenameStub = sinon.stub();

    renameFile = await esmock('../../src/utils/renameAudioFileTitle.js', {
      'fs/promises': fsStub,
      '../../src/utils/generateUniqueFilename.js': generateUniqueFilenameStub
    });
  });

  afterEach(() => {
    esmock.purge(renameFile);
    sinon.restore();
  });

  it('should rename a file successfully with valid artist, title, and filePath', async () => {
    const artist = 'Artist';
    const title = 'Title';
    const filePath = normalizeToForwardSlash('/path/to/file.mp3');
    const newFilePath = normalizeToForwardSlash('/path/to/Artist - Title.mp3');

    generateUniqueFilenameStub.resolves(newFilePath);
    fsStub.rename.resolves();

    const result = await renameFile(artist, title, filePath);

    console.log('Arguments passed to generateUniqueFilename:', generateUniqueFilenameStub.args);
    console.log('Arguments expected for generateUniqueFilename:', [normalizeToForwardSlash('/path/to'), normalizeToForwardSlash('Artist - Title.mp3')]);

    expect(result).to.equal(normalizeToForwardSlash(newFilePath));
    expect(generateUniqueFilenameStub.calledWith(normalizeToForwardSlash('/path/to'), 'Artist - Title.mp3')).to.be.true;
    expect(fsStub.rename.calledWith(normalizeToForwardSlash(filePath), normalizeToForwardSlash(newFilePath))).to.be.true;
  });

  it('should throw an error if filePath, artist, or title are not provided', async () => {
    try {
      await renameFile('', 'Title', normalizeToForwardSlash('/path/to/file.mp3'));
      throw new Error('Test failed - expected error not thrown');
    } catch (error) {
      expect(error.message).to.equal('File path, artist, and title must be provided when renaming file.');
    }

    try {
      await renameFile('Artist', '', normalizeToForwardSlash('/path/to/file.mp3'));
      throw new Error('Test failed - expected error not thrown');
    } catch (error) {
      expect(error.message).to.equal('File path, artist, and title must be provided when renaming file.');
    }

    try {
      await renameFile('Artist', 'Title', '');
      throw new Error('Test failed - expected error not thrown');
    } catch (error) {
      expect(error.message).to.equal('File path, artist, and title must be provided when renaming file.');
    }
  });

  it('should throw an error if the file rename operation fails', async () => {
    const artist = 'Artist';
    const title = 'Title';
    const filePath = normalizeToForwardSlash('/path/to/file.mp3');
    const newFilePath = normalizeToForwardSlash('/path/to/Artist - Title.mp3');
    const renameError = new Error('Rename failed');

    generateUniqueFilenameStub.resolves(newFilePath);
    fsStub.rename.rejects(renameError);

    try {
      await renameFile(artist, title, filePath);
      throw new Error('Test failed - expected error not thrown');
    } catch (error) {
      expect(error).to.equal(renameError);
    }
  });
});

