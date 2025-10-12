const fs = require('fs');
const path = require('path');

const clientId = process.env.SPOTIFY_CLIENT_ID || '';
const outDir = path.join(__dirname, '..', 'src', 'app', 'config');
const outFile = path.join(outDir, 'spotify-config.ts');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const content = `// Generated file — do not commit sensitive data here.
export const SPOTIFY_CLIENT_ID = ${JSON.stringify(clientId)};
`;

fs.writeFileSync(outFile, content, { encoding: 'utf8' });
console.log('Wrote', outFile);
