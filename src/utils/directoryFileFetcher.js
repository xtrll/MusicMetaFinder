import fs from 'fs/promises';
import path from 'path';

export const enumerateFilesInDirectory = async (folderPath, callback) => {
  try {
    const entries = await fs.readdir(folderPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(folderPath, entry.name);
      if (entry.isDirectory()) {
        await enumerateFilesInDirectory(fullPath, callback);
      } else {
        callback(fullPath);
      }
    }
  } catch (e) {
    console.error(`Error enumerating files in directory ${folderPath}: ${e}`);
  }
};
