const fs = require('fs');
const file = 'src/pages/ShoppingCartCheckout.jsx';
const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

const block1Replacement = `                                                            const isTileOrBox = sub.toLowerCase().includes('타일') || sub.toLowerCase().includes('lvt') || sub.toLowerCase().includes('에디톤') || sub.toLowerCase().includes('pst') || sub.toLowerCase().includes('에코');
                                                            const isPrestige = sub.includes('프레스티지');
                                                            
                                                            let packagingText = item.product.specifications?.packaging || '';

                                                            const boxInfo = getEditonBoxInfo(item);
                                                            if (boxInfo) {
                                                                packagingText = boxInfo.label;
                                                            } else {
                                                                if (!packagingText) return null;
                                                                if ((packagingText.includes('평') || packagingText.includes('㎡')) && packagingText.includes('박스') && !packagingText.includes('/')) {
                                                                    packagingText = packagingText.replace(' ', ' / ');
                                                                }
                                                                if (!isTileOrBox && !isPrestige && !packagingText.includes('롤')) {
                                                                    packagingText = \`\${packagingText} / 1롤\`;
                                                                }
                                                            }

                                                            const prefix = isTileOrBox ? '박스배송' : '롤배송';
                                                            const iconEmoji = isTileOrBox ? '📦' : '🧻';`.split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i] && lines[i].includes('const isTileOrBox = sub.toLowerCase()')) {
        lines.splice(i, block1Replacement.length, ...block1Replacement);
        break;
    }
}

for (let i = 0; i < lines.length; i++) {
    if (lines[i] && lines[i].includes('const isSheet = cat.includes')) {
        let spaces = lines[i].match(/^\s*/)[0];
        lines[i] = spaces + "const isSheet = cat.includes('시트') || cat.includes('프리미엄') || cat.includes('스탠다드') || cat.includes('엑스컴포트') || cat.includes('합판');";
    }
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('Fixed block 1 & isSheet occurrences');
