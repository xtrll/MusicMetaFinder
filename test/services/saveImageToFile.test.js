import { expect } from 'chai';
import sinon from 'sinon';
import esmock from 'esmock';
import path from 'path';

describe('saveImageToFile', function() {
  let downloadImageStub;
  let ensureDirectoryExistsStub;
  let saveImageToFile;

  const imageUrl = 'http://example.com/image.jpg';
  const outputDirectory = 'path/to/output';
  const savedImagePath = path.join(path.resolve(outputDirectory), path.basename(imageUrl));

  beforeEach(async function() {
    downloadImageStub = sinon.stub().resolves(savedImagePath);
    ensureDirectoryExistsStub = sinon.stub();

    // Mocking downloadImage and ensureDirectoryExists functions
    saveImageToFile = await esmock('../../src/services/saveImageToFile.js', {
      '../../src/utils/downloadImage.js': { default: downloadImageStub },
      '../../src/utils/ensureDirectoryExists.js': { default: ensureDirectoryExistsStub }
    });

    saveImageToFile = saveImageToFile.default;
  });

  afterEach(() => {
    sinon.restore();
    esmock.purge();
  });

  it('should save image to specified directory', async function() {
    const result = await saveImageToFile(imageUrl, outputDirectory);

    // Ensure ensureDirectoryExists is called with the resolved output directory
    expect(ensureDirectoryExistsStub.calledOnceWithExactly(path.resolve(outputDirectory))).to.be.true;

    // Ensure downloadImage is called with correct URL and save path
    expect(downloadImageStub.calledOnceWithExactly(imageUrl, savedImagePath)).to.be.true;

    // Validate the return value (saved image path)
    expect(result).to.equal(savedImagePath);
  });

  it('should throw an error if downloadImage fails', async function() {
    const error = new Error('Failed to download image');
    downloadImageStub.rejects(error);

    try {
      await saveImageToFile(imageUrl, outputDirectory);
      expect.fail('Expected an error to be thrown');
    } catch (err) {
      // Ensure error is logged and re-thrown
      expect(err).to.equal(error);
    }
  });

  it('should throw an error if ensureDirectoryExists fails', async function() {
    const error = new Error('Failed to ensure directory exists');
    ensureDirectoryExistsStub.throws(error);

    try {
      await saveImageToFile(imageUrl, outputDirectory);
      expect.fail('Expected an error to be thrown');
    } catch (err) {
      // Ensure error is logged and re-thrown
      expect(err).to.equal(error);
    }
  });
});

