// 정밀 복구 스크립트: 번들에서 원본 한국어를 추출하여 소스 파일의 깨진 한국어를 복원
const fs = require('fs');

// 1. 현재 깨진 소스 파일 읽기
const src = fs.readFileSync('src/pages/FlooringProductDetailView.jsx', 'utf8');
const lines = src.split('\n');

// 2. 번들에서 원본 한국어 문자열 추출
const bundle = fs.readFileSync('dist/assets/FlooringProductDetailView-CtfCadqa.js', 'utf8');

// 3. 번들에서 특정 패턴의 한국어 문자열 찾기 함수
function findInBundle(asciiAnchor) {
    const idx = bundle.indexOf(asciiAnchor);
    if (idx === -1) return null;
    // 앞뒤로 충분히 추출
    return bundle.substring(Math.max(0, idx - 200), idx + 500);
}

// 4. 깨진 줄의 ASCII 앵커를 찾아서 번들에서 대응하는 원본 한국어 추출
// 한국어가 깨진 줄을 식별 (? 가 연속으로 나타나는 줄)
const corruptedLines = [];
lines.forEach((line, i) => {
    // 연속된 ? 패턴이 있으면 깨진 것
    if (/\?{2,}/.test(line) || (/\?/.test(line) && /[\uFFFD]/.test(line))) {
        corruptedLines.push(i + 1);
    }
});

console.log('Total corrupted lines:', corruptedLines.length);
console.log('First 20:', corruptedLines.slice(0, 20));

// 5. 각 깨진 줄에서 ASCII 부분만 추출
corruptedLines.slice(0, 5).forEach(lineNum => {
    const line = lines[lineNum - 1];
    // ASCII 문자만 추출
    const asciiOnly = line.replace(/[^\x20-\x7E]/g, '');
    console.log(`\nLine ${lineNum}:`);
    console.log('  Corrupted:', line.substring(0, 100));
    console.log('  ASCII only:', asciiOnly.substring(0, 100));
});
