const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
const index = fs.readFileSync(indexPath, 'utf8');
const additions = [
  '<link rel="manifest" href="/manifest.json" />',
  '<meta name="theme-color" content="#0B1220" />',
  '<meta name="mobile-web-app-capable" content="yes" />',
  '<meta name="apple-mobile-web-app-capable" content="yes" />',
  '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />',
  '<link rel="apple-touch-icon" href="/icon.svg" />',
].join('\n    ');

if (!index.includes('rel="manifest"')) {
  fs.writeFileSync(indexPath, index.replace('</head>', `    ${additions}\n  </head>`));
}
