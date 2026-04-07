const fs = require('fs');

let content = fs.readFileSync('src/pages/ShoppingCartCheckout.jsx', 'utf8');
const lines = content.split('\n');

// Line 144 is index 143
lines[143] = '                <Link className="text-slate-500 hover:text-primary" to="/">홈</Link>';

// Line 181 is index 180
lines[180] = '                                                            const isTileOrBox = sub.toLowerCase().includes(\'타일\') || sub.toLowerCase().includes(\'lvt\') || sub.toLowerCase().includes(\'에디톤\') || sub.toLowerCase().includes(\'pst\') || sub.toLowerCase().includes(\'에코\');';

fs.writeFileSync('src/pages/ShoppingCartCheckout.jsx', lines.join('\n'), 'utf8');
console.log('Fixed execution');
