import fs from 'fs';

let content = fs.readFileSync('src/hooks/useSimilarProducts.js', 'utf8');

// The issue is a missing newline before `if (!isOutOfStock && !isLowStock) {` which is after a comment.
// Let's replace `        if (!isOutOfStock && !isLowStock) {` that follows anything with a newline.
// Actually let's just find `        if (!isOutOfStock && !isLowStock) {` and ensure it's on a new line.

content = content.replace(/(추천 불필요|필요)\s+if \(!isOutOfStock && !isLowStock\) \{/, '$1\n        if (!isOutOfStock && !isLowStock) {');

// Just in case it's some other corrupted korean chars:
content = content.replace(/([^\n]*)\s+if \(!isOutOfStock && !isLowStock\) \{/, '$1\n        if (!isOutOfStock && !isLowStock) {');

fs.writeFileSync('src/hooks/useSimilarProducts.js', content, 'utf8');
console.log('Fixed useSimilarProducts.js');
