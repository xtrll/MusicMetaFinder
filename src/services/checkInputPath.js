export function checkInputPath(inputPath) {
  if (!inputPath) {
    throw new Error('Please provide the path to an audio file or directory.');
  }
}
