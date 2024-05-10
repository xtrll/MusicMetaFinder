export function checkEnvVariables() {
  if (!process.env.ACOUSTID_API_TOKEN || !process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
    throw new Error('Please set up ACOUSTID_API_TOKEN, SPOTIFY_CLIENT_ID, and SPOTIFY_CLIENT_SECRET in your .env file.');
  }
}