import fs from 'fs';
import path from 'path';

export function writeJson(relativePath: string, content: any): Promise<any> {
  return fs.promises
    .writeFile(path.resolve(relativePath), JSON.stringify(content, null, 2), {
      encoding: 'utf8',
    })
    .then(() => {
      console.log(`Successfully wrote to ${path.resolve(relativePath)}`);
    })
    .catch(() => {
      console.error(
        `ERROR: Failed to write to ${path.resolve(relativePath)}. Check the path!`,
      );
    });
}
