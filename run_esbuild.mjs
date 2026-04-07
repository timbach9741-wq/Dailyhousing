import { exec } from 'child_process';
import fs from 'fs';

exec('npx esbuild src/pages/ShoppingCartCheckout.jsx', (error, stdout, stderr) => {
  if (error) {
    fs.writeFileSync('esbuild_err.log', stderr);
    console.log('Error written to esbuild_err.log');
    return;
  }
  console.log('Build successful');
});
