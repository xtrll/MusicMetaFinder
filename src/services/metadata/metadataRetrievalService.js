import getMetadataUsingSpotify from '../../adapters/metadata/spotifyAdapter.js';
import getMetadataUsingMusicBrainz from '../../adapters/metadata/musicBrainzAdapter.js';

// List of supported services
const serviceMap = {
  audd: getMetadataUsingSpotify,
  acoustid: getMetadataUsingMusicBrainz,
};

export default async function recognizeAudio(fileObjectsWithIds, source) {
  let recognitionService = serviceMap[source];
  if (!recognitionService) {
    recognitionService = getMetadataUsingMusicBrainz; // Default service
  }

  return recognitionService(fileObjectsWithIds);
}
