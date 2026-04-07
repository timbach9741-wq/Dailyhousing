/**
 * 매입가(sellingPrice) 일괄 업데이트 스크립트
 * subCategory 및 thickness 기반으로 sellingPrice를 추가합니다.
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = join(__dirname, '..', 'src', 'data', 'sheet-products.js');

let content = readFileSync(filePath, 'utf-8');

// 매입가 매핑 (subCategory → sellingPrice)
const priceMap = {
    '스탠다드 1.8(뉴청맥)': 7400,
    '스탠다드 2.0(은행목)': 12300,
    '프리미엄 2.2(지아 자연애)': 15700,
    '엑스컴포트 4.5(지아 소리잠)': 32600,
    '엑스컴포트 5.0': 37600,
};

// 3.2/2.7 지아사랑애는 thickness로 구분
// thickness 3.2 → 26100, thickness 2.7 → 22600
const sarangaeCategory = '프리미엄 3.2/2.7(지아 사랑애)';

// JSON 파싱을 위해 export 제거
const jsonStr = content.replace('export const SHEET_PRODUCTS = ', '').replace(/;\s*$/, '');
let products;
try {
    products = JSON.parse(jsonStr);
} catch(e) {
    console.error('JSON 파싱 실패. eval로 시도합니다.');
    // eval fallback
    const evalStr = content.replace('export const SHEET_PRODUCTS = ', 'globalThis.__PRODUCTS__ = ');
    eval(evalStr);
    products = globalThis.__PRODUCTS__;
}

console.log(`총 ${products.length}개 제품을 처리합니다.`);

let updated = 0;
products.forEach(p => {
    const sub = p.subCategory || '';
    
    // 일반 카테고리 매핑
    if (priceMap[sub] !== undefined) {
        p.sellingPrice = priceMap[sub];
        updated++;
    }
    // 지아사랑애 3.2/2.7 → thickness로 구분
    else if (sub === sarangaeCategory) {
        if (p.thickness === 3.2 || (p.title && p.title.includes('[3.2]'))) {
            p.sellingPrice = 26100;
        } else {
            // 2.7 or default
            p.sellingPrice = 22600;
        }
        updated++;
    }
});

console.log(`${updated}개 제품에 sellingPrice 업데이트 완료.`);

// 결과를 다시 파일에 저장
const output = `export const SHEET_PRODUCTS = ${JSON.stringify(products, null, 4)};\n`;
writeFileSync(filePath, output, 'utf-8');

console.log('✅ sheet-products.js에 매입가(sellingPrice) 반영 완료!');

// 통계 출력
const stats = {};
products.forEach(p => {
    const key = p.subCategory || 'unknown';
    if (!stats[key]) stats[key] = { count: 0, sellingPrice: p.sellingPrice || 0 };
    stats[key].count++;
});
console.log('\n📊 카테고리별 통계:');
Object.entries(stats).forEach(([k, v]) => {
    console.log(`  ${k}: ${v.count}개 → sellingPrice: ${v.sellingPrice.toLocaleString()}원`);
});
