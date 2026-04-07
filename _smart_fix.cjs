// 번들에서 모든 한국어 문자열을 추출하고, 깨진 소스 파일과 매칭하여 복구
const fs = require('fs');

const bundle = fs.readFileSync('dist/assets/FlooringProductDetailView-CtfCadqa.js', 'utf8');
const src = fs.readFileSync('src/pages/FlooringProductDetailView.jsx', 'utf8');

// 번들에서 한국어 포함 문자열을 모두 추출 (작은따옴표와 큰따옴표 포함)
const allKoreanStrings = [];
// 큰따옴표 문자열
const dq = /"([^"]*[\uAC00-\uD7AF][^"]*)"/g;
let m;
while ((m = dq.exec(bundle)) !== null) {
    allKoreanStrings.push(m[1]);
}
// 작은따옴표 문자열
const sq = /'([^']*[\uAC00-\uD7AF][^']*)'/g;
while ((m = sq.exec(bundle)) !== null) {
    allKoreanStrings.push(m[1]);
}

// 고유 문자열만
const unique = [...new Set(allKoreanStrings)];
console.log('Total unique Korean strings from bundle:', unique.length);

// 소스 파일에서 한국어 + ? 패턴이 있는 줄 찾기 
const lines = src.split('\n');
const problematic = [];
lines.forEach((line, i) => {
    // ? 가 2개 이상 연속되면 깨진 것
    if (/\?\?/.test(line) && line.includes("'")) {
        problematic.push({ lineNum: i + 1, line });
    }
});

console.log('\nProblematic lines with corrupted Korean:', problematic.length);

// 매칭 시도: 깨진 줄의 ASCII 부분과 번들 문자열의 ASCII 부분을 비교
let fixedCount = 0;
let fixedSrc = src;

problematic.forEach(({ lineNum, line }) => {
    // 작은따옴표 안의 깨진 문자열들 추출
    const regex = /'([^']*\?\?[^']*)'/g;
    let match;
    while ((match = regex.exec(line)) !== null) {
        const corrupted = match[1];
        // ASCII 부분만 추출
        const asciiParts = corrupted.replace(/[^\x20-\x7E]/g, '').replace(/\?+/g, ' ').trim();
        
        // 번들에서 같은 ASCII 부분을 포함하는 문자열 찾기
        if (asciiParts.length > 5) {
            const candidates = unique.filter(s => {
                const sAscii = s.replace(/[^\x20-\x7E]/g, '').replace(/\s+/g, ' ').trim();
                return sAscii.includes(asciiParts) || asciiParts.includes(sAscii);
            });
            
            if (candidates.length === 1) {
                fixedSrc = fixedSrc.replace(`'${corrupted}'`, `'${candidates[0]}'`);
                fixedCount++;
            } else if (candidates.length > 1) {
                // 길이가 가장 비슷한 것 선택
                const best = candidates.sort((a, b) => 
                    Math.abs(a.length - corrupted.length) - Math.abs(b.length - corrupted.length)
                )[0];
                fixedSrc = fixedSrc.replace(`'${corrupted}'`, `'${best}'`);
                fixedCount++;
            }
        }
    }
});

console.log('Auto-fixed strings:', fixedCount);

// 수동으로 알려진 데이터 복원
// MARU_LAYERS - 번들에서 정확한 값을 확인하고 복원
const maruFixes = [
    { 
        from: "무광 ?�과 ?�면�?",
        to: "무광 효과 표면층"
    },
    {
        from: "고내�??�명�?",
        to: "고내구 투명층"
    },
    {
        from: "고해???�자?�층",
        to: "고해상 디자인층"
    },
    {
        from: "?�용 ?�착??",
        to: "전용 접착제"
    }
];

maruFixes.forEach(({ from, to }) => {
    if (fixedSrc.includes(from)) {
        fixedSrc = fixedSrc.replace(from, to);
        console.log(`Fixed: "${from}" -> "${to}"`);
    }
});

// 남은 깨진 문자열 수 확인
const remainingBroken = (fixedSrc.match(/\?\?/g) || []).length;
console.log('\nRemaining broken patterns (??):', remainingBroken);

// 임시 파일로 저장 (원본 유지)
fs.writeFileSync('_fixed_preview.jsx', fixedSrc, 'utf8');
console.log('\nSaved preview to _fixed_preview.jsx');
console.log('Please review before applying!');
