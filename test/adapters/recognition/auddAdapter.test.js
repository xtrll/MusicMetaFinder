import { expect } from 'chai';
import sinon from 'sinon';
import esmock from 'esmock';

describe('recognizeAudioFiles', () => {
  let recognizeAudioStub;
  let recognizeAudioFiles;

  beforeEach(async () => {
    recognizeAudioStub = sinon.stub();

    // Mocking the auddAdapter and its dependency
    const module = await esmock('../../../src/adapters/recognition/auddAdapter.js', {
      '../../../src/api/recognition/auddApi.js': {
        default: recognizeAudioStub
      }
    });

    recognizeAudioFiles = module.default;
  });

  afterEach(() => {
    sinon.restore();
    esmock.purge();
  });

  it('should recognize audio files and return their ids', async () => {
    const audioFiles = ['file1.mp3', 'file2.mp3'];
    recognizeAudioStub.withArgs('file1.mp3').resolves({ id: 'id1' });
    recognizeAudioStub.withArgs('file2.mp3').resolves({ id: 'id2' });

    const result = await recognizeAudioFiles(audioFiles);

    expect(result).to.deep.equal([
      { id: 'id1' },
      { id: 'id2' }
    ]);
    expect(recognizeAudioStub.callCount).to.equal(2);
  });

  it('should handle failures and return null ids', async () => {
    const audioFiles = ['file1.mp3', 'file2.mp3'];
    recognizeAudioStub.withArgs('file1.mp3').resolves({ id: 'id1' });
    recognizeAudioStub.withArgs('file2.mp3').rejects(new Error('Recognition failed'));

    const result = await recognizeAudioFiles(audioFiles);

    expect(result).to.deep.equal([
      { id: 'id1' },
      null
    ]);
    expect(recognizeAudioStub.callCount).to.equal(2);
  });
});

