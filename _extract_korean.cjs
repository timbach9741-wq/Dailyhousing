// 번들에서 한국어 문자열 추출하여 파일로 저장
const fs = require('fs');
const bundle = fs.readFileSync('dist/assets/FlooringProductDetailView-CtfCadqa.js', 'utf8');

// 한국어 포함 문자열 리터럴 추출
const koreanStrings = [];
const regex = /"([^"]*[\uAC00-\uD7AF\u3131-\u3163\u3200-\u321E][^"]*)"/g;
let match;
while ((match = regex.exec(bundle)) !== null) {
    if (match[1].length > 2) {
        koreanStrings.push(match[1]);
    }
}

// 중복 제거하고 정렬
const unique = [...new Set(koreanStrings)];
fs.writeFileSync('_korean_strings.json', JSON.stringify(unique, null, 2), 'utf8');
console.log('Extracted', unique.length, 'Korean strings');
console.log('\nSample:');
unique.slice(0, 20).forEach(s => console.log(' -', s));
