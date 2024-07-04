import { expect } from 'chai';
import sinon from 'sinon';
import esmock from 'esmock';

describe('recognizeAudioFiles', () => {
  let recognizeAudioStub;
  let recognizeAudioFiles;

  beforeEach(async () => {
    recognizeAudioStub = sinon.stub();

    // Mocking the acosutidAdapter and its dependency
    const module = await esmock('../../../src/adapters/recognition/acoustidAdapter.js', {
      '../../../src/api/recognition/acoustidApi.js': {
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
    recognizeAudioStub.withArgs('file1.mp3').resolves('id1');
    recognizeAudioStub.withArgs('file2.mp3').resolves('id2');

    const result = await recognizeAudioFiles(audioFiles);

    expect(result).to.deep.equal([
      { filePath: 'file1.mp3', id: 'id1' },
      { filePath: 'file2.mp3', id: 'id2' }
    ]);
    expect(recognizeAudioStub.callCount).to.equal(2);
  });

  it('should handle failures and return null ids', async () => {
    const audioFiles = ['file1.mp3', 'file2.mp3'];
    recognizeAudioStub.withArgs('file1.mp3').resolves('id1');
    recognizeAudioStub.withArgs('file2.mp3').rejects(new Error('Recognition failed'));

    const result = await recognizeAudioFiles(audioFiles);

    expect(result).to.deep.equal([
      { filePath: 'file1.mp3', id: 'id1' },
      { filePath: 'file2.mp3', id: null }
    ]);
    expect(recognizeAudioStub.callCount).to.equal(2);
  });
});

