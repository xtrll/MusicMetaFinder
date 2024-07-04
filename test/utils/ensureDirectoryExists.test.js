import { expect } from 'chai';
import esmock from 'esmock';
import sinon from 'sinon';
import fs from 'fs';

describe('ensureDirectoryExists', () => {
  let ensureDirectoryExists;
  let fsMock;
  let sandbox;

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    fsMock = {
      existsSync: sandbox.stub(),
      mkdirSync: sandbox.stub(),
    };

    // Dynamically import ensureDirectoryExists and replace fs with a mock
    ensureDirectoryExists = await esmock(
      '../../src/utils/ensureDirectoryExists.js',
      {
        'fs': fsMock,
      }
    );
  });

  afterEach(() => {
    sandbox.restore();
    esmock.purge(ensureDirectoryExists);
  });

  it('should not create a directory if it already exists', () => {
    const dirPath = 'path/to/existing/dir';

    fsMock.existsSync.returns(true);

    ensureDirectoryExists(dirPath);

    expect(fsMock.existsSync.calledOnceWith(dirPath)).to.be.true;
    expect(fsMock.mkdirSync.notCalled).to.be.true;
  });

  it('should create a directory if it does not exist', () => {
    const dirPath = 'path/to/new/dir';

    fsMock.existsSync.returns(false);

    ensureDirectoryExists(dirPath);

    expect(fsMock.existsSync.calledOnceWith(dirPath)).to.be.true;
    expect(fsMock.mkdirSync.calledOnceWith(dirPath, { recursive: true })).to.be.true;
  });
});

