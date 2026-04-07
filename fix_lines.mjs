import fs from 'fs';

let lines = fs.readFileSync('src/pages/ShoppingCartCheckout.jsx', 'utf-8').split('\n');

// 366
lines[365] = '                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">연락처</label>';
// 424
lines[423] = '                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">배송 희망일</label>';
// 459
lines[458] = '                                <span className="font-bold text-sm">카카오페이</span>';
// 467
lines[466] = '                                <span className="text-xs text-slate-500">에스크로 안전결제 지원</span>';

fs.writeFileSync('src/pages/ShoppingCartCheckout.jsx', lines.join('\n'));
console.log('Fixed lines.');
