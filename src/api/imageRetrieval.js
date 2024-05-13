import axios from 'axios';

/**
 * Retrieves the album art image URL for a given album ID.
 * It attempts to get the image from the `coverartarchive.org` service.
 *
 * @param {string} albumId - The unique identifier for the album whose art is being retrieved.
 * @returns {Promise<string|null>} - A promise that resolves to the image URL or null if not found or in case of an error.
 */
export const getAlbumArt = (albumId) => {
  const endpoint = `http://coverartarchive.org/release/${albumId}/front`;

  return axios.get(endpoint, { maxRedirects: 0 })
    .then((response) => {
      // If the status code is 200, the image URL should be in the responseURL
      if (response.status === 200) {
        return response.request.responseURL;
      } if (response.status === 307) {
        // If it's a 307 Temporary Redirect, the image URL will be in the headers 'location'
        return response.headers.location;
      }
      // If the response status is not 200 or 307, which we don't handle, resolve as null
      return null;
    })
    .catch((error) => {
      if (error.response && error.response.status === 307) {
        // In case of a 307 redirect status received in the error, return the 'location' header.
        return error.response.headers.location;
      }
      console.error('Error retrieving cover art:', error);
      return null;
    });
};
