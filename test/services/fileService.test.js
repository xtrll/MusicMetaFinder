import { expect } from 'chai';
import sinon from 'sinon';
import esmock from 'esmock';
import path from 'path';

describe('validateAudioFiles', function() {
  let validateAudioFileStub;
  let validateAudioFiles;

  const validMp3File = 'path/to/valid/file.mp3';
  const unsupportedFile = 'path/to/unsupported/file.wav';
  const invalidFile = 'path/to/invalid/file.txt';

  beforeEach(async function() {
    validateAudioFileStub = sinon.stub();
    validateAudioFileStub.withArgs(validMp3File).resolves(validMp3File);
    validateAudioFileStub.withArgs(unsupportedFile).resolves(unsupportedFile);
    validateAudioFileStub.withArgs(invalidFile).resolves(null);

    // Mocking validateAudioFile and its dependencies
    validateAudioFiles = await esmock('../../src/services/fileService.js', {
      '../../src/utils/validateAudioFiles.js': { default: validateAudioFileStub }
    });

    validateAudioFiles = validateAudioFiles.default;
  });

  afterEach(() => {
    sinon.restore();
    esmock.purge();
  });

  it('should return only valid and supported audio file paths', async function() {
    const filePaths = [validMp3File, unsupportedFile, invalidFile];

    const result = await validateAudioFiles(filePaths);

    // Ensure that only the valid mp3 file is returned
    expect(result).to.deep.equal([validMp3File]);
  });

  it('should throw a TypeError if input is not an array', async function() {
    try {
      await validateAudioFiles('not an array');
      expect.fail('Expected TypeError to be thrown');
    } catch (error) {
      expect(error).to.be.instanceOf(TypeError);
      expect(error.message).to.equal('Input must be an array of file paths (strings).');
    }
  });

  it('should ignore unsupported file extensions', async function() {
    const filePaths = [validMp3File, unsupportedFile];

    const result = await validateAudioFiles(filePaths);

    // Ensure that only the valid mp3 file is returned
    expect(result).to.deep.equal([validMp3File]);
  });

  it('should handle empty array input gracefully', async function() {
    const result = await validateAudioFiles([]);

    // Ensure that an empty array is returned
    expect(result).to.deep.equal([]);
  });

  it('should log an error for unsupported extensions', async function() {
    const consoleErrorStub = sinon.stub(console, 'error');

    const filePaths = [unsupportedFile];

    await validateAudioFiles(filePaths);

    // Ensure that an error is logged for the unsupported file
    expect(consoleErrorStub.calledOnceWithExactly(`File ${path.basename(unsupportedFile)} is an audio file but .wav format is not yet supported and so is ignored.`)).to.be.true;

    consoleErrorStub.restore();
  });
});
