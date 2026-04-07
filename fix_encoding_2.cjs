const fs = require('fs');
const file = 'src/pages/ShoppingCartCheckout.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetStartText = `const cat = item.product.subCategory || item.product.category || '';`;
const targetEndText = `</button>`;

// we'll find lines between these strings or just replace the specific sections
const replacement = `                                                        const cat = item.product.subCategory || item.product.category || '';
                                                        const pkg = item.product.specifications?.packaging || item.product.packaging || '';
                                                        const isSheet = cat.includes('시트') || cat.includes('프리미엄') || cat.includes('스탠다드') || cat.includes('엑스컴포트') || cat.includes('합판');
                                                        const rollMatch = pkg.match(/(\\d+)M/i);
                                                        const step = isSheet && rollMatch ? parseInt(rollMatch[1]) : 1;
                                                        const minQty = step;
                                                        return (
                                                            <>
                                                                <button onClick={() => updateQuantity(item.product.id, item.option, Math.max(minQty, item.qty - step))} className="w-8 h-8 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800"><span className="material-symbols-outlined text-sm">remove</span></button>
                                                                <div className="flex flex-col items-center justify-center min-w-[60px]">
                                                                    <span className="font-medium whitespace-nowrap">{formatOrderUnit({ category: cat, quantity: item.qty, packaging: pkg }).displayQty}</span>
                                                                </div>
                                                                <button onClick={() => updateQuantity(item.product.id, item.option, item.qty + step)} className="w-8 h-8 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800"><span className="material-symbols-outlined text-sm">add</span></button>
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            </td>
                                            <td className="px-3 py-5 text-right font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                                                {isBusiness && item.product.businessPrice ? (
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[11px] text-slate-400 line-through">
                                                            {(item.product.price * item.qty).toLocaleString()}원
                                                        </span>
                                                        <span className="text-[#c8221f]">
                                                            {(item.product.businessPrice * item.qty).toLocaleString()}원
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span>{(item.product.price * item.qty).toLocaleString()}원</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-5 text-center">
                                                <button onClick={() => removeFromCart(item.product.id, item.option)} className="text-slate-400 hover:text-red-500 transition-colors">`;

const lines = content.split('\\n');
let startIndex = -1;
let endIndex = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const cat = item.product.subCategory')) startIndex = i;
    if (startIndex !== -1 && i > startIndex + 10 && lines[i].includes('removeFromCart')) {
        endIndex = i;
        break;
    }
}

if (startIndex !== -1 && endIndex !== -1) {
    const before = lines.slice(0, startIndex);
    const after = lines.slice(endIndex + 1);
    
    const newContent = before.join('\\n') + '\\n' + replacement + '\\n' + after.join('\\n');
    fs.writeFileSync(file, newContent, 'utf8');
    console.log("Fixed pricing and sheet logic at line " + startIndex);
} else {
    console.log("Could not find the target block to replace.", startIndex, endIndex);
}
