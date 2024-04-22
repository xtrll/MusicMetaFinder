#!/usr/bin/env node

import dotenv from 'dotenv';

import audioController from './src/controllers/audioController.js';

dotenv.config();

const { AUDD_API_TOKEN } = process.env;
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
