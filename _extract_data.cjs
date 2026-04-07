// 번들을 prettier로 정리하여 원본 코드 구조를 추출
const fs = require('fs');

const bundle = fs.readFileSync('dist/assets/FlooringProductDetailView-CtfCadqa.js', 'utf8');

// 번들에서 주요 데이터 구조 추출

// 1. INTERIOR_IMAGES 추출 (시공사례 이미지)
function extractInteriorImages() {
    const results = [];
    // 패턴: src:"xxx", title:"xxx", desc:"xxx"
    // interior-0x 이미지 찾기
    const interiorRegex = /src:"(\/assets\/lxzin\/maru_detail\/interior-\d+\.\w+)",\s*title:"([^"]+)",\s*desc:"([^"]+)"/g;
    // 번들에서 alternative 패턴 시도
    const altRegex = /interior-0(\d+)/g;
    let m;
    const positions = [];
    while ((m = altRegex.exec(bundle)) !== null) {
        positions.push({ idx: m.index, num: m[1] });
    }
    
    positions.forEach(p => {
        // 이 위치 주변에서 title과 desc 추출
        const context = bundle.substring(Math.max(0, p.idx - 200), p.idx + 500);
        results.push({ num: p.num, context: context.substring(0, 300) });
    });
    
    return results;
}

// 2. STONE_SPEC 추출
function extractStoneSpec() {
    const idx = bundle.indexOf('SPC (Stone Polymer');
    if (idx >= 0) {
        return bundle.substring(Math.max(0, idx - 500), idx + 200);
    }
    return 'NOT FOUND';
}

// 3. getColorFromTitle 추출 - 색상 매칭 데이터
function extractColorNames() {
    const colors = [];
    // 번들에서 hex 색상코드와 한국어 색상명 추출
    const colorRegex = /name:\s*"([^"]+)",\s*hex:\s*"(#[0-9a-fA-F]+)"/g;
    let m;
    while ((m = colorRegex.exec(bundle)) !== null) {
        colors.push({ name: m[1], hex: m[2] });
    }
    return colors;
}

// 4. 주요 UI 문자열 추출
function extractUIStrings() {
    const uiStrings = [];
    // 특정 패턴의 한국어 UI 문자열
    const patterns = [
        /children:\s*"([^"]*[\uAC00-\uD7AF][^"]*)"/g,
        /children:\s*\["([^"]*[\uAC00-\uD7AF][^"]*)"/g,
    ];
    
    patterns.forEach(regex => {
        let m;
        while ((m = regex.exec(bundle)) !== null) {
            if (m[1].length > 3) {
                uiStrings.push(m[1]);
            }
        }
    });
    return [...new Set(uiStrings)];
}

console.log('=== INTERIOR IMAGES ===');
const interiors = extractInteriorImages();
interiors.forEach(i => console.log(`\n--- Interior ${i.num} ---\n${i.context}`));

console.log('\n\n=== STONE_SPEC ===');
console.log(extractStoneSpec());

console.log('\n\n=== COLORS ===');
const colors = extractColorNames();
colors.forEach(c => console.log(`${c.name} -> ${c.hex}`));

console.log('\n\n=== UI STRINGS (first 30) ===');
const uiStrings = extractUIStrings();
uiStrings.slice(0, 30).forEach(s => console.log(` - "${s}"`));

// 결과를 파일로 저장
fs.writeFileSync('_bundle_data.json', JSON.stringify({
    interiors, stoneSpec: extractStoneSpec(), colors, uiStrings
}, null, 2), 'utf8');

console.log('\n\nAll data saved to _bundle_data.json');
