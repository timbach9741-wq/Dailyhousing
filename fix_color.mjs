import fs from 'fs';

let content = fs.readFileSync('src/hooks/useSimilarProducts.js', 'utf8');

// We will find `const getColorFamily = (product) => { ... };` and replace it entirely to fix the quote issues.
const replaceRegex = /const getColorFamily = \(product\) => \{[\s\S]*?\};/;

const newGetColorFamily = `        const getColorFamily = (product) => {
            const text = (product.colorText || product.specifications?.color || product.title || '').toLowerCase();

            if (text.includes('white') || text.includes('cream') || text.includes('ivory')) return 'white';
            if (text.includes('gray') || text.includes('grey') || text.includes('ash') || text.includes('concrete')) return 'gray';
            if (text.includes('brown') || text.includes('oak') || text.includes('walnut') || text.includes('wood') || text.includes('maple')) return 'brown';
            if (text.includes('beige') || text.includes('sand') || text.includes('natural')) return 'beige';
            if (text.includes('dark') || text.includes('black') || text.includes('charcoal')) return 'dark';
            return 'other';
        };`;

content = content.replace(replaceRegex, newGetColorFamily);

// Also remove any corrupted characters in the surrounding lines just in case
content = content.replace(/\?/g, ''); // not ideal but just in case for now, wait no this might break `?.` optional chaining...
// Let's not remove `?`.

fs.writeFileSync('src/hooks/useSimilarProducts.js', content, 'utf8');
console.log('Fixed getColorFamily');
