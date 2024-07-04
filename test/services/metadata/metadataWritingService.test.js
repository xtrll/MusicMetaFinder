import { expect } from 'chai';
import sinon from 'sinon';
import esmock from 'esmock';

describe('writeMetadataService', function() {
  let writeMetadataStub;
  let writeMetadataService;

  const validMetadata = {
    title: 'Test Title',
    artist: 'Test Artist',
    lyrics: 'Test Lyrics',
    filePath: 'path/to/test/file.mp3',
  };

  const invalidMetadata = {
    title: 'Test Title',
    artist: 'Test Artist',
    lyrics: 'Test Lyrics',
    filePath: '',  // Invalid file path
  };

  beforeEach(async function() {
    writeMetadataStub = sinon.stub().resolves();

    // Mocking writeMetadata and its dependencies
    writeMetadataService = await esmock('../../../src/services/metadata/metadataWritingService.js', {
      '../../../src/services/metadata/metadataWriters/writeMetadata.js': { default: writeMetadataStub }
    });

    writeMetadataService = writeMetadataService.default;
  });

  afterEach(() => {
    sinon.restore();
    esmock.purge();
  });

  it('should write metadata to all files in the array', async function() {
    const metadataArray = [validMetadata, validMetadata];

    await writeMetadataService(metadataArray);

    // Ensure writeMetadata is called twice
    expect(writeMetadataStub.calledTwice).to.be.true;
    expect(writeMetadataStub.alwaysCalledWith(validMetadata, validMetadata.filePath)).to.be.true;
  });

  it('should skip metadata objects without a file path', async function() {
    const metadataArray = [validMetadata, invalidMetadata, { title: 'No FilePath' }];

    await writeMetadataService(metadataArray);

    // Ensure writeMetadata is called only once for the valid metadata
    expect(writeMetadataStub.calledOnceWithExactly(validMetadata, validMetadata.filePath)).to.be.true;
  });

  it('should handle errors during the writing of metadata', async function() {
    const error = new Error('Failed to write metadata');
    writeMetadataStub.rejects(error);

    const metadataArray = [validMetadata];

    try {
      await writeMetadataService(metadataArray);
    } catch (e) {
      expect.fail('No error should be thrown from service');
    }

    // Ensure error is logged (this would normally go to your logging mechanism)
    expect(writeMetadataStub.calledOnceWithExactly(validMetadata, validMetadata.filePath)).to.be.true;
    // Check if console.error was called (mock console.error if needed)
  });
});

