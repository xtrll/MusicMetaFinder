import fs from 'fs/promises';
import path from 'path';

export default async function directoryFileFetcher(folderPath) {
  async function enumerateFilesInDirectory(dirPath) {
    let fileList = [];
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        fileList = fileList.concat(await enumerateFilesInDirectory(fullPath));
      } else {
        fileList.push(fullPath);
      }
    }
    return fileList;
  }

  try {
    return await enumerateFilesInDirectory(folderPath); // return array of files
  } catch (e) {
    console.error(`Error enumerating files in directory ${folderPath}:`, e);
    throw e;
  }
}
