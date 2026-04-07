const fs = require('fs');
const content = fs.readFileSync('src/hooks/useSimilarProducts.js', 'utf8');
const lines = content.split('\n');
for(let i=30; i<55; i++) {
   console.log(`${i+1}: ${lines[i]}`);
}
