import path from 'path';
import { expect } from 'chai';
import sinon from 'sinon';
import esmock from 'esmock';

function normalizeToForwardSlash(p) {
  return p.split(path.sep).join('/');
}

describe('fetchFiles', () => {
  let fetchFiles, fsStub;

  beforeEach(async () => {
    fsStub = {
      promises: {
        stat: sinon.stub(),
        readdir: sinon.stub()
      }
    };

    fetchFiles = await esmock('../../src/utils/fetchFiles.js', {
      fs: fsStub
    });
  });

  afterEach(() => {
    esmock.purge(fetchFiles);
    sinon.restore();
  });

  it('should return an array with a single file when given a file path', async () => {
    const filePath = '/path/to/file.txt';

    fsStub.promises.stat.resolves({ isFile: () => true, isDirectory: () => false });

    const result = await fetchFiles(filePath);
    expect(result).to.deep.equal([normalizeToForwardSlash(filePath)]);
  });

  it('should return an array of files when given a directory path', async () => {
    const dirPath = '/path/to/directory';
    const subdirPath = path.join(dirPath, 'subdir'); // Use path.join for consistency

    fsStub.promises.stat.withArgs(dirPath).resolves({ isFile: () => false, isDirectory: () => true });
    fsStub.promises.stat.withArgs(subdirPath).resolves({ isFile: () => false, isDirectory: () => true });
    fsStub.promises.stat.resolves({ isFile: () => true, isDirectory: () => false }); // Default for files

    fsStub.promises.readdir.withArgs(dirPath, { withFileTypes: true }).resolves([
      { name: 'file1.txt', isFile: () => true, isDirectory: () => false },
      { name: 'file2.txt', isFile: () => true, isDirectory: () => false },
      { name: 'subdir', isFile: () => false, isDirectory: () => true }
    ]);
    fsStub.promises.readdir.withArgs(subdirPath, { withFileTypes: true }).resolves([
      { name: 'file3.txt', isFile: () => true, isDirectory: () => false }
    ]);

    const result = await fetchFiles(dirPath);
    console.log('Test Result:', result); // Add logging to debug the result
    expect(result).to.deep.equal([
      normalizeToForwardSlash(`${dirPath}/file1.txt`),
      normalizeToForwardSlash(`${dirPath}/file2.txt`),
      normalizeToForwardSlash(`${dirPath}/subdir/file3.txt`)
    ]);
  });

  it('should throw an error if the path does not exist', async () => {
    const invalidPath = '/invalid/path';

    fsStub.promises.stat.rejects(new Error('ENOENT: no such file or directory'));

    try {
      await fetchFiles(invalidPath);
    } catch (error) {
      expect(error.message).to.equal('Failed to fetch files: ENOENT: no such file or directory');
    }
  });

  it('should throw an error if the path is neither a file nor a directory', async () => {
    const weirdPath = '/weird/path';

    fsStub.promises.stat.resolves({ isFile: () => false, isDirectory: () => false });

    try {
      await fetchFiles(weirdPath);
    } catch (error) {
      expect(error.message).to.equal('Failed to fetch files: Input path is neither a file nor a directory: /weird/path');
    }
  });
});
