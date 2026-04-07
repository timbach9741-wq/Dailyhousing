const fs = require('fs');
let content = fs.readFileSync('src/hooks/useSimilarProducts.js', 'utf8');

// Strip single line comments: // ... until newline
// We have to be careful not to strip // inside strings.
// But since this file is just logic, a simple regex might be okay if we only replace // at the start of lines or after whitespace.
content = content.replace(/^\s*\/\/.*$/gm, '');

// Save it back
fs.writeFileSync('src/hooks/useSimilarProducts.js', content, 'utf8');
console.log('Stripped comments');
