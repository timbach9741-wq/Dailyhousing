import fs from 'fs';

let lines = fs.readFileSync('src/pages/ShoppingCartCheckout.jsx', 'utf-8').split('\n');

// Drop the duplicate line 459 we accidentally inserted and fix the original Line 460
// Wait, to be safe, let's just do a clean pass over everything using simple `.replace` or index.
// Let's use string operations:

let content = lines.join('\n');

// 1. Fix line 460 (카카오페이) and duplicate:
content = content.replace(
    /<span className="font-bold text-sm">카카오페이<\/span>\r?\n\s*<span className="font-bold text-sm">카카.*?\/span>/,
    '<span className="font-bold text-sm">카카오페이</span>'
);

// 2. Fix line 501: missing </span>
content = content.replace(
    /\{totalPrice\.toLocaleString\(\)\}원\r?\n\s*<\/div>/,
    '{totalPrice.toLocaleString()}원</span>\n                            </div>'
);

// 3. Fix line 509: 배송비 missing <
content = content.replace(
    /<span className="text-slate-600 dark:text-slate-400">배송.*?\/span>/,
    '<span className="text-slate-600 dark:text-slate-400">배송비</span>'
);

// 4. Fix line 528: missing </span>
content = content.replace(
    /\{originalTotal\.toLocaleString\(\)\}원\r?\n\s*<\/div>/,
    '{originalTotal.toLocaleString()}원</span>\n                                        </div>'
);

// 5. Fix line 532: missing </span>
content = content.replace(
    /\{totalPrice\.toLocaleString\(\)\}원\r?\n\s*<div className="flex justify-between pt-2 border-t border-red-200">/,
    '{totalPrice.toLocaleString()}원</span>\n                                        </div>\n                                        <div className="flex justify-between pt-2 border-t border-red-200">'
);

fs.writeFileSync('src/pages/ShoppingCartCheckout.jsx', content);
console.log('Final fixes applied.');
