const fs = require('fs');
const file = 'src/pages/ShoppingCartCheckout.jsx';
let text = fs.readFileSync(file, 'utf8');

// replace isSheet definition
text = text.replace(/const isSheet =[^;]+;/, "const isSheet = cat.includes('시트') || cat.includes('프리미엄') || cat.includes('스탠다드') || cat.includes('엑스컴포트') || cat.includes('합판');");

// replace price elements
text = text.replace(/\{\(item\.product\.price \* item\.qty\)\.toLocaleString\(\)\}\?\?[ \t\r\n]*<\/span>/g, "{(item.product.price * item.qty).toLocaleString()}원</span>");
text = text.replace(/\{\(item\.product\.businessPrice \* item\.qty\)\.toLocaleString\(\)\}\?\?[ \t\r\n]*<\/span>/g, "{(item.product.businessPrice * item.qty).toLocaleString()}원</span>");
text = text.replace(/<span>\{\(item\.product\.price \* item\.qty\)\.toLocaleString\(\)\}\?\?\/span>/g, "<span>{(item.product.price * item.qty).toLocaleString()}원</span>");

fs.writeFileSync(file, text, 'utf8');
console.log('Replaced via regex!');
