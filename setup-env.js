import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');

if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists. Skipping auto-generation.');
  process.exit(0);
}

console.log('🔍 .env file is missing. Attempting to auto-generate from Firebase project...');

try {
  // FloorCraft-NewBase App ID
  const appId = "1:237870624730:web:b723174f922d4a26f01ae3";
  
  console.log(`📡 Fetching SDK config for Firebase App ID: ${appId}...`);
  // --json 옵션을 주어 JSON 데이터 출력 유도
  const output = execSync(`firebase apps:sdkconfig WEB ${appId} --json`, { encoding: 'utf8' });
  
  // Extract JSON block from output (bypasses progress messages)
  const startIndex = output.indexOf('{');
  const endIndex = output.lastIndexOf('}');
  if (startIndex === -1 || endIndex === -1) {
    throw new Error('No JSON payload found in Firebase CLI output.');
  }
  
  const jsonStr = output.substring(startIndex, endIndex + 1);
  const parsed = JSON.parse(jsonStr);
  
  // firebase CLI output structure can be { status: "success", result: { sdkConfig: { ... } } }
  const config = parsed.result?.sdkConfig || parsed.sdkConfig || parsed.result || parsed;
  
  if (config && config.apiKey) {
    const envContent = [
      `# Firebase Web Configuration (Auto-generated on ${new Date().toISOString()})`,
      `VITE_FIREBASE_API_KEY=${config.apiKey}`,
      `VITE_FIREBASE_AUTH_DOMAIN=${config.authDomain}`,
      `VITE_FIREBASE_PROJECT_ID=${config.projectId}`,
      `VITE_FIREBASE_STORAGE_BUCKET=${config.storageBucket}`,
      `VITE_FIREBASE_MESSAGING_SENDER_ID=${config.messagingSenderId}`,
      `VITE_FIREBASE_APP_ID=${config.appId}`,
      '',
      '# Add your private keys here if needed:',
      '# VITE_TELEGRAM_BOT_TOKEN=',
      '# VITE_TELEGRAM_CHAT_ID='
    ].join('\n');
    
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('✅ .env file successfully auto-generated!');
  } else {
    throw new Error('Invalid Firebase SDK config structure.');
  }
} catch (err) {
  console.warn('⚠️ Failed to auto-generate .env file:', err.message);
  console.log('⚠️ Please manually create .env using .env.example as a guide if Firebase CLI is not configured.');
}
