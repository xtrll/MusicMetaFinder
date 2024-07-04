import { expect } from 'chai';
import sinon from 'sinon';
import esmock from 'esmock';

describe('normalizeMetadata', function() {
  let normalizeMusicBrainzStub;
  let normalizeMetadata;

  const fileObjectsWithMetadata = [{ id: 1 }, { id: 2 }];

  beforeEach(async function() {
    normalizeMusicBrainzStub = sinon.stub().resolves([{ normalized: true }]);

    // Mocking normalizeMusicBrainz module and its dependencies
    normalizeMetadata = await esmock('../../../../src/services/metadata/normalizers/metadataNormalizerService.js', {
      '../../../../src/services/metadata/normalizers/normalizeMusicBrainz.js': { default: normalizeMusicBrainzStub }
    });

    normalizeMetadata = normalizeMetadata.default;
  });

  afterEach(() => {
    sinon.restore();
    esmock.purge();
  });

  it('should use normalizeMusicBrainz for "acoustid" source', async function() {
    const result = await normalizeMetadata(fileObjectsWithMetadata, 'acoustid');

    // Ensure normalizeMusicBrainzStub is called once with correct parameters
    expect(normalizeMusicBrainzStub.calledOnceWithExactly(fileObjectsWithMetadata)).to.be.true;
    // Validate the return value
    expect(result).to.deep.equal([{ normalized: true }]);
  });

  it('should use default normalizer (normalizeMusicBrainz) for unsupported source', async function() {
    const result = await normalizeMetadata(fileObjectsWithMetadata, 'unsupportedSource');

    // Ensure default normalizer is used for unsupported source
    expect(normalizeMusicBrainzStub.calledOnceWithExactly(fileObjectsWithMetadata)).to.be.true;
    // Validate the return value
    expect(result).to.deep.equal([{ normalized: true }]);
  });

  it('should use default normalizer (normalizeMusicBrainz) when source is not provided', async function() {
    const result = await normalizeMetadata(fileObjectsWithMetadata);

    // Ensure default normalizer is used when source is not provided
    expect(normalizeMusicBrainzStub.calledOnceWithExactly(fileObjectsWithMetadata)).to.be.true;
    // Validate the return value
    expect(result).to.deep.equal([{ normalized: true }]);
  });

  // it('should return <audd normalizer>  when "audd" source is provided', async function() {
  //
  //   const result = await normalizeMetadata(fileObjectsWithMetadata, 'audd');
  //
  //   expect(normalizeMusicBrainzStub.called).to.be.false;
  // });
});
