import { expect } from 'chai'
import sinon from 'sinon';
import fs from 'fs/promises';
import path from "path";
import deleteDirectoryRecursively from "../../src/utils/deleteDirectoryRecursively.js";

describe('DeleteDirectoryRecursively', () => {
  let readdirStub, unlinkStub, rmdirStub;

  beforeEach(() => {
    readdirStub = sinon.stub(fs, 'readdir');
    unlinkStub = sinon.stub(fs, 'unlink');
    rmdirStub = sinon.stub(fs, 'rmdir');
  });

  afterEach(() => {
    readdirStub.restore();
    unlinkStub.restore();
    rmdirStub.restore();
  });

  it('should delete an empty directory', async () => {
    const dirPath = 'testDir';

    readdirStub.withArgs(dirPath).resolves([]);
    rmdirStub.withArgs(dirPath).resolves();

    await deleteDirectoryRecursively(dirPath);

    expect(readdirStub.calledOnce).to.be.true;
    expect(rmdirStub.calledOnceWith(dirPath)).to.be.true;
  });

  it('should delete a directory with files', async () => {
    const dirPath = 'dir';
    const filePath = path.join(dirPath, 'file.txt');

    readdirStub.withArgs(dirPath).resolves([{ name: 'file.txt', isDirectory: () => false }]);
    unlinkStub.withArgs(filePath).resolves();
    rmdirStub.withArgs(dirPath).resolves();

    await deleteDirectoryRecursively(dirPath);

    expect(readdirStub.calledOnce).to.be.true;
    expect(unlinkStub.calledOnceWith(filePath)).to.be.true;
    expect(rmdirStub.calledOnceWith(dirPath)).to.be.true;
  });

  it('should delete a nested directory with files', async () => {
    const dirPath = 'dir';
    const nestedDirPath = path.join(dirPath, 'nestedDir');
    const filePath = path.join(dirPath, 'file.txt');
    const nestedFilePath = path.join(nestedDirPath, 'nestedFile.txt');

    readdirStub.withArgs(dirPath).resolves([
      { name: 'file.txt', isDirectory: () => false },
      { name: 'nestedDir', isDirectory: () => true },
    ]);

    readdirStub.withArgs(nestedDirPath).resolves([
      { name: 'nestedFile.txt', isDirectory: () => false },
    ]);

    unlinkStub.withArgs(filePath).resolves();
    unlinkStub.withArgs(nestedFilePath).resolves();
    rmdirStub.withArgs(dirPath).resolves();
    rmdirStub.withArgs(nestedDirPath).resolves();

    await deleteDirectoryRecursively(dirPath);

    expect(readdirStub.calledTwice).to.be.true;
    expect(unlinkStub.calledTwice).to.be.true;
    expect(unlinkStub.calledWith(filePath)).to.be.true;
    expect(unlinkStub.calledWith(nestedFilePath)).to.be.true;
    expect(rmdirStub.calledWith(nestedDirPath)).to.be.true;
    expect(rmdirStub.calledWith(dirPath)).to.be.true;
  });
})
