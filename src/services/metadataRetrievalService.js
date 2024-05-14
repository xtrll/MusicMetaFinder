import getMetadataUsingSpotify from '../adapters/metadata/spotifyAdapter.js';
import getMetadataUsingMusicBrainz from '../adapters/metadata/musicBrainzAdapter.js';

// List of supported services
const serviceMap = {
  audd: getMetadataUsingSpotify,
  acoustid: getMetadataUsingMusicBrainz,
};

export default async function recognizeAudio(audioIds, source) {
  let recognitionService = serviceMap[source];
  if (!recognitionService) {
    console.error('Recognition service unknown or not provided, using default configuration');
    recognitionService = getMetadataUsingMusicBrainz; // Default service
  }

  return recognitionService(audioIds);
}
