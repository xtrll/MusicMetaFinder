import normalizeMusicBrainz from './normalizeMusicBrainz.js';

// List of supported services
const serviceMap = {
  audd: null,
  acoustid: normalizeMusicBrainz,
};

export default async function normalizeMetadata(fileObjectsWithMetadata, source) {
  let normalizerService = serviceMap[source];
  if (!normalizerService) {
    normalizerService = normalizeMusicBrainz; // Default service
  }

  return normalizerService(fileObjectsWithMetadata);
}
