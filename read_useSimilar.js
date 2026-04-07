const fs = require('fs');
const content = fs.readFileSync('src/hooks/useSimilarProducts.js', 'utf8');
const lines = content.split('\n');
for(let i=35; i<50; i++) {
   console.log(`${i+1}: ${lines[i]}`);
}
