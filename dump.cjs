const fs = require('fs');
let content = fs.readFileSync('src/hooks/useSimilarProducts.js', 'utf8');

// Replace everything outside of ASCII range with a placeholder, so we can see the structure cleanly.
content = content.replace(/[^\x00-\x7F]/g, '*');

fs.writeFileSync('out_ascii.txt', content, 'utf8');
console.log('Done');
