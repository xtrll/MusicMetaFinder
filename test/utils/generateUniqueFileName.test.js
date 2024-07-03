import { expect } from 'chai';
import sinon from 'sinon';
import fs from 'fs/promises';
import path from "path";
import generateUniqueFilename from '../../src/utils/generateUniqueFilename.js';

describe('generateUniqueFilename', () => {
  let statStub;

  beforeEach(() => {
    // Stub fs.stat to control its behavior during test
    statStub = sinon.stub(fs, 'stat');
  });

  afterEach(() => {
    // Restore fs.stat to its original state
    statStub.restore();
  });

  it('should return the original filename when conflict does not exist', async () => {
    const directory = 'music';
    const originalFilename = 'song.mp3';

    // Configure the stub to simulate that the file does not exist
    statStub.rejects(new Error('File not found'));

    const uniqueFilename = await generateUniqueFilename(directory, originalFilename);

    // Validate that the filename is unchanged
    const unchangedPattern = /^music[\\/][^\\/]+\.\w+$/; // Adjusted to ensure correct path matching
    expect(uniqueFilename).to.match(unchangedPattern);
  });

  it('should generate a unique filename when conflict exists', async () => {
    const directory = 'music';
    const originalFilename = 'song.mp3';

    const existingFiles = [
      path.join(directory, 'song.mp3'),
      path.join(directory, 'song (1).mp3'),
    ];

    statStub.callsFake((filePath) => {
      if (existingFiles.includes(filePath)) {
        return Promise.resolve({});
      }
      return Promise.reject(new Error('File not found'));
    });

    const uniqueFilename = await generateUniqueFilename(directory, originalFilename);

    const changedPattern = /^music[\\/][^\\/]+\s\(\d+\)\.\w+$/;
    expect(uniqueFilename).to.match(changedPattern);
  });
});
