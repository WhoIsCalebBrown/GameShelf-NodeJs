const fs = require('fs');
const path = require('path');

// Read the root .env file
const rootEnv = fs.readFileSync('.env', 'utf8');

// Copy to client directory
fs.writeFileSync(path.join('client', '.env'), rootEnv);

// Copy to server directory
fs.writeFileSync(path.join('server', '.env'), rootEnv);

console.log('Environment files copied successfully!'); 