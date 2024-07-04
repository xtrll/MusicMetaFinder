import { expect } from 'chai';
import sinon from 'sinon';
import esmock from 'esmock';

describe('recognizeAudio', function() {
  let recognizeUsingAuddStub;
  let recognizeUsingAcoustidStub;
  let recognizeAudio;

  const filePaths = ['path/to/file1.mp3', 'path/to/file2.mp3'];

  beforeEach(async function() {
    recognizeUsingAuddStub = sinon.stub().resolves([{ recognized: true, service: 'audd' }]);
    recognizeUsingAcoustidStub = sinon.stub().resolves([{ recognized: true, service: 'acoustid' }]);

    // Mocking recognition services and their dependencies
    recognizeAudio = await esmock('../../src/services/musicRecognitionService.js', {
      '../../src/adapters/recognition/auddAdapter.js': { default: recognizeUsingAuddStub },
      '../../src/adapters/recognition/acoustidAdapter.js': { default: recognizeUsingAcoustidStub }
    });

    recognizeAudio = recognizeAudio.default;
  });

  afterEach(() => {
    sinon.restore();
    esmock.purge();
  });

  it('should use recognizeUsingAudd for "audd" source', async function() {
    const result = await recognizeAudio(filePaths, 'audd');

    // Ensure recognizeUsingAuddStub is called once with the correct parameters
    expect(recognizeUsingAuddStub.calledOnceWithExactly(filePaths)).to.be.true;
    // Validate the return value
    expect(result).to.deep.equal([{ recognized: true, service: 'audd' }]);
  });

  it('should use recognizeUsingAcoustid for "acoustid" source', async function() {
    const result = await recognizeAudio(filePaths, 'acoustid');

    // Ensure recognizeUsingAcoustidStub is called once with the correct parameters
    expect(recognizeUsingAcoustidStub.calledOnceWithExactly(filePaths)).to.be.true;
    // Validate the return value
    expect(result).to.deep.equal([{ recognized: true, service: 'acoustid' }]);
  });

  it('should use default recognition service for unsupported source', async function() {
    const result = await recognizeAudio(filePaths, 'unsupportedSource');

    // Ensure default recognition service (recognizeUsingAcoustid) is used for unsupported source
    expect(recognizeUsingAcoustidStub.calledOnceWithExactly(filePaths)).to.be.true;
    // Validate the return value
    expect(result).to.deep.equal([{ recognized: true, service: 'acoustid' }]);
  });

  it('should use default recognition service when source is not provided', async function() {
    const result = await recognizeAudio(filePaths);

    // Ensure default recognition service (recognizeUsingAcoustid) is used when source is not provided
    expect(recognizeUsingAcoustidStub.calledOnceWithExactly(filePaths)).to.be.true;
    // Validate the return value
    expect(result).to.deep.equal([{ recognized: true, service: 'acoustid' }]);
  });
});

