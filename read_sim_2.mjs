import fs from 'fs';

let content = fs.readFileSync('src/hooks/useSimilarProducts.js', 'utf8');

// Replace all non-ASCII characters or strange occurrences
// To be safe, wait, "" is the substitution character \uFFFD.
// Also we saw `?` replacing characters.

// But wait, there are Korean characters inside code logic? e.g., '화이트', '크림', '아이보리'.
// Let's print out lines 40-55 of the file, maybe it shows what's wrong.
const lines = content.split('\n');
for (let i = 30; i < 55; i++) {
   console.log(`${i+1}: ${lines[i]}`);
}
