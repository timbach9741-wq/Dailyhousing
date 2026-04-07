/**
 * FlooringProductDetailView.jsx 인코딩 복구 스크립트
 * 
 * 문제: PowerShell Set-Content가 UTF-8 파일을 시스템 기본 인코딩(CP949)으로 재인코딩,
 * 이후 Node.js가 CP949를 UTF-8로 잘못 읽어 이중 손상 발생
 * 
 * 해결: 역방향 변환 시도 (UTF-8로 읽은 바이트 → CP949로 재해석)
 */
const fs = require('fs');
const iconv = require('iconv-lite');

const filePath = 'src/pages/FlooringProductDetailView.jsx';

// 현재 파일을 raw bytes로 읽기
const rawBytes = fs.readFileSync(filePath);

// 시도 1: 현재 UTF-8로 저장된 파일을 다시 raw bytes → CP949 해석 시도
// PowerShell이 CP949로 저장 → Node.js가 UTF-8로 읽어서 깨짐
// 역변환: UTF-8 깨진 문자열의 바이트를 CP949로 재해석

const currentText = rawBytes.toString('utf8');

// 깨진 영역 감지
let corruptedCount = 0;
let okCount = 0;
for (let i = 0; i < currentText.length; i++) {
    const cp = currentText.charCodeAt(i);
    if (cp === 0xFFFD) corruptedCount++; // replacement character
}
console.log('Replacement characters (U+FFFD):', corruptedCount);

// 시도: raw bytes를 CP949로 디코딩
const decoded = iconv.decode(rawBytes, 'cp949');
const sample1 = decoded.substring(0, 500);
console.log('\n=== CP949 decode sample ===');
console.log(sample1);

// 무광 확인
const idx = decoded.indexOf('무광');
console.log('\n무광 found at:', idx);
if (idx >= 0) {
    console.log('Context:', decoded.substring(Math.max(0, idx-50), idx+200));
}

// 에디톤 확인
const idx2 = decoded.indexOf('에디톤');
console.log('\n에디톤 found at:', idx2);
if (idx2 >= 0) {
    console.log('Context:', decoded.substring(Math.max(0, idx2-20), idx2+100));
}

// CP949 디코딩이 유효하면 UTF-8로 저장
if (idx >= 0 || idx2 >= 0) {
    console.log('\n✅ CP949 디코딩 성공! UTF-8로 복구 저장합니다...');
    fs.writeFileSync(filePath, decoded, 'utf8');
    console.log('✅ 파일 복구 완료!');
    
    // 검증
    const verify = fs.readFileSync(filePath, 'utf8');
    console.log('검증 - 무광 found:', verify.includes('무광'));
    console.log('검증 - 에디톤 found:', verify.includes('에디톤'));
    console.log('검증 - inventory found:', verify.includes('inventory'));
} else {
    console.log('\n❌ CP949 디코딩 실패. 다른 방법을 시도합니다...');
    
    // 시도 2: EUC-KR
    const decoded2 = iconv.decode(rawBytes, 'euc-kr');
    const idx3 = decoded2.indexOf('무광');
    console.log('EUC-KR 무광 found at:', idx3);
    
    if (idx3 >= 0) {
        console.log('✅ EUC-KR 디코딩 성공!');
        fs.writeFileSync(filePath, decoded2, 'utf8');
    }
}
