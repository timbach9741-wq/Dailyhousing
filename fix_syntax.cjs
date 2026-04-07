const fs = require('fs');
const file = 'src/pages/ShoppingCartCheckout.jsx';
let text = fs.readFileSync(file, 'utf8');

// Fix Line 144 Link tag
text = text.replace(/<Link className="text-slate-500 hover:text-primary" to="\/">[^<]*\/Link>/g, '<Link className="text-slate-500 hover:text-primary" to="/">홈</Link>');

// Fix missing span close logic for price
text = text.replace(/<span>\{\(item\.product\.price \* item\.qty\)\.toLocaleString\(\)\}[^<]*\/span>/g, '<span>{(item.product.price * item.qty).toLocaleString()}원</span>');

fs.writeFileSync(file, text, 'utf8');
console.log('Regex replace complete');
