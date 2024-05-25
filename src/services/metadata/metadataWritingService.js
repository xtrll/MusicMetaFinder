import writeMetadata from './metadataWriters/writeMetadata.js';

/**
 * Writes metadata to a batch of audio files based on their file extensions.
 *
 * @param {Object[]} metadataArray - An array of metadata objects to write to audio files.
 * @returns {Promise<void>} - A promise that resolves when all metadata writing operations have completed.
 */
export default async function writeMetadataService(metadataArray) {
  // Results will store promises for each write operation
  const results = [];

  for (const metadata of metadataArray) {
    try {
      // Check that metadata and metadata.filePath are present
      if (!metadata || !metadata.filePath) continue;
      // Perform the write operation and push the result (a promise) to the results array
      const writeOperation = writeMetadata(metadata, metadata.filePath);
      results.push(writeOperation);
    } catch (error) {
      console.error(`Error writing metadata to ${metadata.filePath}: `, error);
    }
  }

  // Wait for all write operations to complete
  try {
    await Promise.all(results);
    console.log('Metadata successfully written to all files');
  } catch (error) {
    console.error('One or more metadata writing operations failed:', error);
  }
}
