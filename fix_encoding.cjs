const fs = require('fs');
const file = 'src/pages/ShoppingCartCheckout.jsx';
let content = fs.readFileSync(file, 'utf8');

// The starting line of the broken code is `const isPrestige = sub.includes(`
// We will replace everything from that line until `const iconName = isTileOrBox ? 'inventory_2' : 'straighten';`
const startStr = `const isTileOrBox = sub.toLowerCase().includes('타일') || sub.toLowerCase().includes('lvt') || sub.toLowerCase().includes('에디톤') || sub.toLowerCase().includes('pst') || sub.toLowerCase().includes('에코');`;
const endStr = `const iconName = isTileOrBox ? 'inventory_2' : 'straighten';`;

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
    const replacement = `const isTileOrBox = sub.toLowerCase().includes('타일') || sub.toLowerCase().includes('lvt') || sub.toLowerCase().includes('에디톤') || sub.toLowerCase().includes('pst') || sub.toLowerCase().includes('에코');
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
                                                            const iconEmoji = isTileOrBox ? '📦' : '🧻';
                                                            `;
                                                            
    content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Successfully fixed the broken character encodings.");
} else {
    console.log("Could not find start or end strings.");
}
