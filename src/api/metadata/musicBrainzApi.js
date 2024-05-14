import axiosRetry from '../../utils/retryAxios.js';
import handleError from '../../errors/generalApiErrorHandler.js';

/**
 * Retrieves the metadata for a recording from MusicBrainz.
 *
 * @param {string} recordingId - The MusicBrainz recording ID (can be obtained from acoustid).
 * @returns {Promise<Object>} - A promise resolving to the track metadata.
 */
export default async function getMetadata(recordingId) {
  const baseUrl = 'https://musicbrainz.org';
  const query = `/ws/2/recording/${recordingId}?fmt=json&inc=artists+releases+release-groups+isrcs+url-rels+discids+media+artist-credits+aliases+tags+ratings+genres`;

  const { VERSION, PROJECTNAME, EMAIL } = process.env;
  const requestOptions = {
    headers: {
      'User-Agent': `${PROJECTNAME}/${VERSION} ( ${EMAIL} )`,
      Accept: 'application/json',
    },
  };

  return axiosRetry.get(baseUrl + query, requestOptions)
    .then((response) => {
      const { data } = response;

      if (!data) {
        console.error(`Recording ID ${recordingId} could not retrieve metadata from MusicBrainz`);
        return null;
      }

      console.log('Metadata retrieval successful for:', recordingId);
      return data;
    })
    .catch((error) => {
      // If it's a 404 error, log the error and proceed
      if (error.response && error.response.status === 404) {
        console.error(`No metadata found for recording ID: ${recordingId}`);
        return null;
      }
      const errorMessage = handleError(error, recordingId);
      throw new Error(errorMessage);
    });
}
