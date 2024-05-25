export default function checkEnvVariables() {
  if (!process.env.ACOUSTID_API_KEY) {
    throw new Error('Please set up ACOUSTID_API_KEY in your .env file.');
  }
}
