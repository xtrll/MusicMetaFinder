import ffmpeg from 'fluent-ffmpeg';

/**
 * Truncates an audio stream to the desired length
 *
 * @param {ReadStream} inputStream The readable stream for the audio file.
 * @param {number} duration The duration in seconds to which the audio is to be truncated.
 * @returns {Promise<Buffer>} A promise that resolves with the truncated audio as a buffer.
 */

export default function truncateAudioStream(inputStream, duration = 25) {
  return new Promise((resolve, reject) => {
    let audioBuffer = Buffer.from([]);

    ffmpeg(inputStream)
      .setDuration(duration)
      .toFormat('mp3')
      .on('end', () => {
        resolve(audioBuffer)
      })
      .on('error', (err) => {
        reject(err)
      })
      .on('data', (chunk) => {
        audioBuffer = Buffer.concat([audioBuffer, chunk]);
      })
      .run();
  })
}