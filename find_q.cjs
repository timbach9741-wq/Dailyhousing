const fs = require('fs');
const file = 'src/pages/ShoppingCartCheckout.jsx';
const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

for (let i = 320; i < lines.length; i++) {
    if (lines[i].includes('?')) {
        console.log((i + 1) + ": " + lines[i].trim());
    }
}
