const fs = require('fs');
const path = require('path');

// Load environment variables from .env if it exists
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envFileContent = fs.readFileSync(envPath, 'utf8');
  envFileContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) return;
    const firstEquals = trimmedLine.indexOf('=');
    if (firstEquals === -1) return;
    const key = trimmedLine.substring(0, firstEquals).trim();
    let val = trimmedLine.substring(firstEquals + 1).trim();
    // Remove wrapping quotes if present
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.substring(1, val.length - 1);
    }
    process.env[key] = val;
  });
}

// Target directory
const envDir = path.join(__dirname, '../src/environments');
if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true });
}

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || '',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.FIREBASE_APP_ID || ''
};

// Generate environment.ts (development)
const devEnvContent = `export const environment = {
  production: false,
  firebase: ${JSON.stringify(firebaseConfig, null, 2)},
  mercadopago: {},
  backendUrl: '${process.env.DEV_BACKEND_URL || 'http://localhost:3000'}'
};
`;

// Generate environment.prod.ts (production)
const prodEnvContent = `export const environment = {
  production: true,
  firebase: ${JSON.stringify(firebaseConfig, null, 2)},
  mercadopago: {},
  backendUrl: '${process.env.PROD_BACKEND_URL || ''}'
};
`;

fs.writeFileSync(path.join(envDir, 'environment.ts'), devEnvContent, 'utf8');
fs.writeFileSync(path.join(envDir, 'environment.prod.ts'), prodEnvContent, 'utf8');

console.log('Environment files generated successfully.');
