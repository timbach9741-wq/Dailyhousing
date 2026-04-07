import { exec } from 'child_process';
import fs from 'fs';

exec('npm run build', (error, stdout, stderr) => {
  if (error) {
    fs.writeFileSync('build_err.log', stderr || stdout);
    console.log('Build failed. Log written.');
    return;
  }
  console.log('Build successful');
});
