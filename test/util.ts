import fs from 'fs';
import path from 'path';

export const readFixture = (file: string) => {
  const root = path.resolve(__dirname, './fixtures');
  return fs.readFileSync(
    path.join(root, file)
  )
}