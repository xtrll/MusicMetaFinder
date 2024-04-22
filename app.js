#!/usr/bin/env node

import audioController from './src/controllers/audioController.js';


const { AUDD_API_TOKEN } = process.env;
console.log(AUDD_API_TOKEN);
const inputPath = process.argv[[2]];

if (!AUDD_API_TOKEN) {
  console.error('Please set up the AUDD_API_TOKEN in your .env file.');
  process.exit(1);
}

if (!inputPath) {
  console.error('Please provide the path to an audio file.');
  process.exit(1);
}

audioController(inputPath);
