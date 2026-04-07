const fs = require('fs');
const file = 'src/pages/ShoppingCartCheckout.jsx';
const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

const block1Replacement = `                                                    const isTileOrBox = sub.toLowerCase().includes('타일') || sub.toLowerCase().includes('lvt') || sub.toLowerCase().includes('에디톤') || sub.toLowerCase().includes('pst') || sub.toLowerCase().includes('에코');
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
                                                    const prefix = isTileOrBox ? '📦' : '🧻';`.split('\n');


// Fix Line 299 logic blocks
for (let i = 0; i < lines.length; i++) {
    if (lines[i] && lines[i].includes('const isTileOrBox = sub.toLowerCase()')) {
        let matchStr = lines[i];
        if (matchStr.includes('???') || matchStr.includes('?')) {
            // Find the end of it, which is the prefix
            let endI = i;
            while(endI < lines.length && !lines[endI].includes('const prefix')) {
                endI++;
            }
            if (endI < lines.length) {
                // Determine spaces
                let spaces = lines[i].match(/^\s*/)[0];
                let replacement = block1Replacement.map(line => spaces + line.trimStart());
                lines.splice(i, endI - i + 1, ...replacement);
            }
        }
    }
}

// Fix Mobile price formats
for (let i = 0; i < lines.length; i++) {
    if (lines[i] && lines[i].includes('toLocaleString()')) {
        if (lines[i].includes('??') || lines[i].includes('</span') === false && lines[i].includes('span>')) {
           lines[i] = lines[i].replace(/\?\?[^<]*/, '원').replace(/\?\?\/span>/, '원</span>');
        }
    }
}

// Fix mobile image comments
for (let i = 0; i < lines.length; i++) {
    if (lines[i] && lines[i].includes('{/* ?품 ??지 */}')) lines[i] = lines[i].replace('{/* ?품 ??지 */}', '{/* 상품 이미지 */}');
    if (lines[i] && lines[i].includes('{/* ?품 ?보 */}')) lines[i] = lines[i].replace('{/* ?품 ?보 */}', '{/* 상품 정보 */}');
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('Mobile block regex and string replacement completed.');
