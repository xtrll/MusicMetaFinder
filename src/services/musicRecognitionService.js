import recognizeUsingAudd from '../adapters/recognition/auddAdapter.js';
import recognizeUsingAcoustid from '../adapters/recognition/acoustidAdapter.js';

// List of supported services
const serviceMap = {
  audd: recognizeUsingAudd,
  acoustid: recognizeUsingAcoustid,
};

export default async function recognizeAudio(filePaths, source) {
  let recognitionService = serviceMap[source];
  if (!recognitionService) {
    console.error('Recognition service unknown or not provided, using default configuration');
    recognitionService = recognizeUsingAcoustid; // Default service
  }

  return recognitionService(filePaths);
}
