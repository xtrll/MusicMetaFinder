import { expect } from 'chai';
import sinon from 'sinon';
import esmock from 'esmock';

describe('validateAudioFile', () => {
  let validateAudioFile, fsStub, mimeStub;

  beforeEach(async () => {
    fsStub = {
      lstat: sinon.stub()
    };

    mimeStub = {
      lookup: sinon.stub()
    };

    validateAudioFile = await esmock('../../src/utils/validateAudioFiles.js', {
      'fs/promises': fsStub,
      'mime-types': mimeStub
    });
  });

  afterEach(() => {
    esmock.purge(validateAudioFile);
    sinon.restore();
  });

  it('should return null and log an error if the path is not a file', async () => {
    const filePath = '/path/to/directory';
    const consoleErrorStub = sinon.stub(console, 'error');

    fsStub.lstat.resolves({ isFile: () => false });

    const result = await validateAudioFile(filePath);
    expect(result).to.be.null;
    expect(consoleErrorStub.calledWith(`The path ${filePath} is not a file and is ignored.`)).to.be.true;

    consoleErrorStub.restore();
  });

  it('should return null and log an error if the file is not a recognized audio file type', async () => {
    const filePath = '/path/to/file.txt';
    const consoleErrorStub = sinon.stub(console, 'error');

    fsStub.lstat.resolves({ isFile: () => true });
    mimeStub.lookup.returns('text/plain');

    const result = await validateAudioFile(filePath);
    expect(result).to.be.null;
    expect(consoleErrorStub.calledWith(`File ${filePath} is not an audio file and is ignored.`)).to.be.true;

    consoleErrorStub.restore();
  });

  it('should return the file path if the file is a recognized audio file type', async () => {
    const filePath = '/path/to/file.mp3';

    fsStub.lstat.resolves({ isFile: () => true });
    mimeStub.lookup.returns('audio/mpeg');

    const result = await validateAudioFile(filePath);
    expect(result).to.equal(filePath);
  });

  it('should return null and log an error if an exception occurs during validation', async () => {
    const filePath = '/path/to/file.mp3';
    const error = new Error('Test Error');
    const consoleErrorStub = sinon.stub(console, 'error');

    fsStub.lstat.rejects(error);

    const result = await validateAudioFile(filePath);
    expect(result).to.be.null;
    expect(consoleErrorStub.calledWith(`Error validating file ${filePath}: ${error}`)).to.be.true;

    consoleErrorStub.restore();
  });
});
