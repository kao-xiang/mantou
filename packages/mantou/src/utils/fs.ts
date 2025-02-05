import fs from 'fs/promises';
import path from 'path';

export async function writeRecursive(filePath: string, content: string) {
    const dir = path.dirname(filePath); // Extract directory from filePath
    await fs.mkdir(dir, { recursive: true }); // Create directories recursively
    await fs.writeFile(filePath, content); // Write the file
  
    return true;
  }