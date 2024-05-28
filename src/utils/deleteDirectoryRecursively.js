import { promises as fs } from 'fs';
import path from 'path';

/**
 * Recursively deletes a directory and its contents.
 * @param {string} dirPath - The path to the directory to delete.
 */
async function deleteDirectoryRecursively(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  const promises = entries.map((entry) => {
    const fullPath = path.join(dirPath, entry.name);

    return entry.isDirectory()
      ? deleteDirectoryRecursively(fullPath)
      : fs.unlink(fullPath);
  });

  await Promise.all(promises);
  await fs.rmdir(dirPath);
}

export default deleteDirectoryRecursively;

