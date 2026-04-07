const fs = require('fs');
const file = 'src/pages/ShoppingCartCheckout.jsx';
const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

for (let i = 0; i < lines.length; i++) {
    if (lines[i] && lines[i].includes('text-slate-400 line-through">{(item.product.price * item.qty).toLocaleString()}원')) {
        if (!lines[i].includes('</span>')) lines[i] += '</span>';
    }
    if (lines[i] && lines[i].includes('text-[#c8221f]">{(item.product.businessPrice * item.qty).toLocaleString()}원')) {
        if (!lines[i].includes('</span>')) lines[i] += '</span>';
    }
    if (lines[i] && lines[i].includes('text-slate-900 dark:text-slate-100">{(effectivePrice * item.qty).toLocaleString()}원')) {
        if (!lines[i].includes('</span>')) lines[i] += '</span>';
    }
    
    // Also correct headers
    if (lines[i] && lines[i].includes('>배송 ')) {
        lines[i] = lines[i].replace('>배송 ?보 ?력</h3>', '>배송 정보 입력</h3>');
        lines[i] = lines[i].replace('>배송 ?보 ?력</h3>', '>배송 정보 입력</h3>');
    }
    if (lines[i] && lines[i].includes('mb-1">?름</label>')) {
        lines[i] = lines[i].replace('?름', '이름');
    }
    if (lines[i] && lines[i].includes('mb-1">?름</label>')) {
        lines[i] = lines[i].replace('?름', '이름');
    }
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('Mobile span closing and labels fixed!');
