import ExcelJS from 'exceljs';
import path from 'path';
import os from 'os';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 왜: JS 파일에서 export된 배열 데이터를 안전하게 추출하기 위한 헬퍼 함수
function loadProductData(filePath) {
    const content = readFileSync(filePath, 'utf-8');
    const match = content.match(/export\s+const\s+\w+\s*=\s*(\[[\s\S]*\]);?\s*$/m);
    if (!match) return [];
    try { return eval(match[1]); } catch { return []; }
}

async function createExampleExcel() {
    console.log('📦 제품 데이터 로딩 중...');

    const dataDir = path.join(__dirname, 'src', 'data');
    
    // 왜: 카테고리 정보를 미리 정의하여 순서, 색상, 아이콘을 일관적으로 관리
    const categories = [
        {
            name: '상업용 LVT',
            icon: '🏢',
            data: loadProductData(path.join(dataDir, 'commercial-products.js')),
            headerColor: 'FF2E7D32',   // 진한 초록
            bgColor: 'FFE8F5E9',       // 연한 초록
            altColor: 'FFC8E6C9',      // 살짝 더 진한 초록 (줄무늬)
        },
        {
            name: '에디톤',
            icon: '✨',
            data: loadProductData(path.join(dataDir, 'editon-products.js')),
            headerColor: 'FF1565C0',   // 진한 파랑
            bgColor: 'FFE3F2FD',       // 연한 파랑
            altColor: 'FFBBDEFB',
        },
        {
            name: '마루',
            icon: '🪵',
            data: loadProductData(path.join(dataDir, 'maru-products.js')),
            headerColor: 'FFE65100',   // 진한 주황
            bgColor: 'FFFFF3E0',       // 연한 주황
            altColor: 'FFFFE0B2',
        },
        {
            name: '시트',
            icon: '📜',
            data: loadProductData(path.join(dataDir, 'sheet-products.js')),
            headerColor: 'FFF9A825',   // 진한 노랑
            bgColor: 'FFFFFDE7',       // 연한 노랑
            altColor: 'FFFFF9C4',
        },
        {
            name: '타일',
            icon: '🔲',
            data: loadProductData(path.join(dataDir, 'tile-products.js')),
            headerColor: 'FF6A1B9A',   // 진한 보라
            bgColor: 'FFF3E5F5',       // 연한 보라
            altColor: 'FFE1BEE7',
        },
    ];

    const totalCount = categories.reduce((sum, c) => sum + c.data.length, 0);
    categories.forEach(c => console.log(`  ${c.icon} ${c.name}: ${c.data.length}개`));
    console.log(`\n✅ 전체 제품 수: ${totalCount}개\n`);

    const workbook = new ExcelJS.Workbook();

    // ============================================================
    // 1. 목차 시트 - 카테고리별 바로 이동 (하이퍼링크)
    // ============================================================
    const tocSheet = workbook.addWorksheet('📋 목차', {
        properties: { tabColor: { argb: 'FF1565C0' } }
    });

    tocSheet.columns = [
        { width: 5 },
        { width: 8 },
        { width: 25 },
        { width: 15 },
        { width: 40 },
    ];

    // 제목
    tocSheet.addRow([]);
    tocSheet.mergeCells('B2:E2');
    tocSheet.getCell('B2').value = '📋 데일리하우징 재고 업데이트 양식 - 목차';
    tocSheet.getCell('B2').font = { size: 18, bold: true, color: { argb: 'FF1A237E' } };
    tocSheet.getCell('B2').alignment = { vertical: 'middle' };
    tocSheet.getRow(2).height = 35;

    tocSheet.addRow([]);
    tocSheet.mergeCells('B3:E3');
    tocSheet.getCell('B3').value = `전체 ${totalCount}개 제품 | 마지막 업데이트: ${new Date().toLocaleDateString('ko-KR')}`;
    tocSheet.getCell('B3').font = { size: 11, color: { argb: 'FF757575' } };

    tocSheet.addRow([]);

    // 카테고리 테이블 헤더
    const tocHeaderRow = tocSheet.addRow(['', '', '카테고리', '제품 수', '바로가기']);
    tocHeaderRow.font = { bold: true, size: 11 };
    tocHeaderRow.height = 25;
    for (let i = 3; i <= 5; i++) {
        tocHeaderRow.getCell(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF37474F' } };
        tocHeaderRow.getCell(i).font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
        tocHeaderRow.getCell(i).alignment = { vertical: 'middle', horizontal: 'center' };
        tocHeaderRow.getCell(i).border = {
            top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'}
        };
    }

    // 왜: 각 카테고리에 대한 하이퍼링크를 만들어서 클릭 시 해당 시트의 위치로 바로 이동
    let currentRowForLink = 3; // 재고업데이트 시트에서의 시작 행 (헤더=1, 데이터 헤더=2)
    categories.forEach((cat) => {
        const targetCell = `A${currentRowForLink}`;
        const tocRow = tocSheet.addRow(['', '', `${cat.icon} ${cat.name}`, `${cat.data.length}개`, '👉 이동하기']);
        tocRow.height = 28;

        // 카테고리 이름 셀 스타일
        tocRow.getCell(3).font = { size: 12, bold: true };
        tocRow.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cat.bgColor.replace('FF', 'FF') } };
        tocRow.getCell(3).alignment = { vertical: 'middle' };

        // 제품 수 셀
        tocRow.getCell(4).font = { size: 12, bold: true };
        tocRow.getCell(4).alignment = { vertical: 'middle', horizontal: 'center' };

        // 하이퍼링크 셀 - 클릭하면 해당 카테고리로 이동
        tocRow.getCell(5).value = {
            text: '👉 이동하기',
            hyperlink: `#'재고업데이트(입력)'!${targetCell}`
        };
        tocRow.getCell(5).font = { size: 11, color: { argb: 'FF0070C0' }, underline: true };
        tocRow.getCell(5).alignment = { vertical: 'middle', horizontal: 'center' };

        for (let i = 3; i <= 5; i++) {
            tocRow.getCell(i).border = {
                top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'}
            };
        }

        // 왜: 다음 카테고리의 시작 위치 계산 (구분 헤더 1행 + 데이터 행)
        currentRowForLink += 1 + cat.data.length; // 구분 헤더 + 데이터 행
    });

    // 사용법 안내
    tocSheet.addRow([]);
    tocSheet.addRow([]);

    // 📝 일일기록 시트 바로가기
    const logLinkRow = tocSheet.addRow(['', '', '📝 일일기록 시트', '매일 기록', '👉 이동하기']);
    logLinkRow.height = 28;
    logLinkRow.getCell(3).font = { size: 12, bold: true };
    logLinkRow.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3E0' } };
    logLinkRow.getCell(3).alignment = { vertical: 'middle' };
    logLinkRow.getCell(4).font = { size: 12, bold: true };
    logLinkRow.getCell(4).alignment = { vertical: 'middle', horizontal: 'center' };
    logLinkRow.getCell(5).value = { text: '👉 이동하기', hyperlink: `#'일일기록'!A1` };
    logLinkRow.getCell(5).font = { size: 11, color: { argb: 'FF0070C0' }, underline: true };
    logLinkRow.getCell(5).alignment = { vertical: 'middle', horizontal: 'center' };
    for (let i = 3; i <= 5; i++) {
        logLinkRow.getCell(i).border = {
            top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'}
        };
    }

    tocSheet.addRow([]);
    const tipRow1 = tocSheet.addRow(['', '', '💡 검색 방법']);
    tipRow1.getCell(3).font = { size: 13, bold: true, color: { argb: 'FF1565C0' } };

    tocSheet.addRow(['', '', '1️⃣  재고업데이트 시트에서 열 머리의 ▼(드롭다운) 클릭']);
    tocSheet.addRow(['', '', '2️⃣  "텍스트 필터" 또는 "검색 상자"에 품번/제품명 입력']);
    tocSheet.addRow(['', '', '3️⃣  원하는 제품만 필터링되어 표시됩니다']);
    tocSheet.addRow(['', '', '']);
    tocSheet.addRow(['', '', '📝 일일기록 시트에 매일 입출고를 기록하면 주간/월간/연간이 자동 합산됩니다']);
    tocSheet.lastRow.getCell(3).font = { size: 11, bold: true, color: { argb: 'FFFF6F00' } };
    tocSheet.addRow(['', '', '⌨️ Ctrl+F 로도 엑셀 내 전체 검색이 가능합니다']);
    tocSheet.lastRow.getCell(3).font = { size: 11, bold: true, color: { argb: 'FF388E3C' } };


    // ============================================================
    // 2. 작성 가이드(안내) 시트 생성
    // ============================================================
    const guideSheet = workbook.addWorksheet('⚠️ 작성가이드(필독)', {
        properties: { tabColor: { argb: 'FFFF0000' } }
    });

    guideSheet.columns = [{ width: 5 }, { width: 80 }];
    guideSheet.addRow(['']);
    guideSheet.addRow(['', '📋 [데일리하우징 일일 재고 업데이트 양식 작성 가이드]']);
    guideSheet.getCell('B2').font = { size: 16, bold: true };

    guideSheet.addRow(['']);
    guideSheet.addRow(['', `📌 전체 등록 제품 수: ${totalCount}개`]);
    guideSheet.getCell('B4').font = { size: 12, bold: true, color: { argb: 'FF0070C0' } };

    guideSheet.addRow(['']);
    guideSheet.addRow(['', '1. [수정 금지 열] A열 ~ E열 (회색/색상 배경)']);
    guideSheet.addRow(['', '   - 대분류, 컬렉션, 제품명, 품번, 규격 등 제품의 기본 정보입니다.']);
    guideSheet.addRow(['', '   - 임의로 수정 시 전산 매칭에 오류가 발생합니다. 절대 변경하지 마세요.']);

    guideSheet.addRow(['']);
    guideSheet.addRow(['', '2. [입력 가능 열] F열 ~ Q열 (노란색 배경)']);
    guideSheet.addRow(['', '   - F/G열 [일일 입출고량]: 오늘 변동 내역(숫자).']);
    guideSheet.addRow(['', '   - H열 [현재고(BOX/Roll)]: (선택) 여기에 숫자를 넣으면 시스템 상 현재고가 덮어쓰기 처리됩니다.']);
    guideSheet.addRow(['', '   - I열 [판매상태]: 드롭다운 [정상, 일시품절, 단종] 중 선택.']);
    guideSheet.addRow(['', '   - J열 [입고예정일]: 품절 시 YYYY-MM-DD 형식으로 입력.']);
    guideSheet.addRow(['', '   - K열 [비고 열]: 자유 입력']);
    guideSheet.addRow(['']);
    guideSheet.addRow(['', '3. [자동 계산 열] L열 ~ Q열 (수정 금지 - 자동 합산)']);
    guideSheet.addRow(['', '   - L~Q열은 "📝 일일기록" 시트의 데이터를 기반으로 자동 합산됩니다.']);
    guideSheet.addRow(['', '   - 직접 수정하지 마세요. 일일기록 시트에 기록하면 자동 반영됩니다.']);
    guideSheet.addRow(['']);
    guideSheet.addRow(['', '4. [📝 일일기록 시트 사용법]']);
    guideSheet.addRow(['', '   - 매일 날짜, 품번, 입고량, 출고량을 한 줄씩 추가로 기록합니다.']);
    guideSheet.addRow(['', '   - 기록하면 메인 시트의 주간/월간/연간 열이 자동으로 합산됩니다.']);
    guideSheet.addRow(['', '   - 날짜 형식: YYYY-MM-DD (예: 2026-04-04)']);

    guideSheet.addRow(['']);
    guideSheet.addRow(['', '🔍 검색 방법: 열 머리의 ▼ 버튼 클릭 → 검색창에 품번/제품명 입력']);
    guideSheet.addRow(['', '   또는 Ctrl+F를 눌러 엑셀 내 전체 검색이 가능합니다.']);

    guideSheet.addRow(['']);
    guideSheet.addRow(['', '⚠️ 현재고가 0이면 시스템이 자동으로 "일시품절" 처리합니다.']);
    guideSheet.lastRow.getCell(2).font = { size: 11, bold: true, color: { argb: 'FFFF0000' } };


    // ============================================================
    // 3. 📝 일일기록 시트 - 재고업데이트 시트와 동일한 레이아웃
    // ============================================================
    // 왜: 재고업데이트 시트와 같은 구조로 전체 제품 목록 표시
    // 업체가 날짜+입고/출고만 직접 채우고, 다음 날은 블록 복사→날짜 변경
    const logSheet = workbook.addWorksheet('일일기록', {
        properties: { tabColor: { argb: 'FFFF6F00' } }
    });

    // 열 너비 설정 (재고업데이트 시트와 동일)
    logSheet.columns = [
        { key: 'date',     width: 14 },  // A: 📅 날짜
        { key: 'category', width: 18 },  // B: 카테고리
        { key: 'product',  width: 25 },  // C: 제품명
        { key: 'modelId',  width: 28 },  // D: 품번
        { key: 'spec',     width: 22 },  // E: 규격
        { key: 'inbound',  width: 14 },  // F: 입고량
        { key: 'outbound', width: 14 },  // G: 출고량
        { key: 'memo',     width: 25 },  // H: 비고
    ];

    // ── 1행: 안내 배너 ──
    logSheet.mergeCells('A1:H1');
    logSheet.getCell('A1').value = `📝 일일 입출고 기록  |  전체 ${totalCount}개 제품  |  입고/출고가 있는 제품에만 수량 입력  |  다음 날 → 블록 복사 후 날짜 변경`;
    logSheet.getCell('A1').font = { size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
    logSheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF6F00' } };
    logSheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    logSheet.getRow(1).height = 32;

    // ── 2행: 열 헤더 (재고업데이트 시트와 유사한 구조) ──
    const logHeaders = [
        '📅 날짜', '카테고리 (수정금지)', '제품명 (수정금지)',
        '품번 (수정금지)', '규격 (수정금지)',
        '📥 입고량', '📤 출고량', '📝 비고'
    ];
    const logHeaderRow = logSheet.getRow(2);
    logHeaders.forEach((h, i) => {
        logHeaderRow.getCell(i + 1).value = h;
    });
    logHeaderRow.height = 28;
    for (let i = 1; i <= 8; i++) {
        const cell = logHeaderRow.getCell(i);
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        // 왜: 날짜+입출고(초록) / 제품정보(회색) 구분 — 메인 시트와 동일한 색상 체계
        const hColor = (i >= 2 && i <= 5) ? 'FFB0BEC5' : 'FF81C784';
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hColor } };
        cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
        cell.border = {
            top: {style:'medium'}, bottom: {style:'medium'},
            left: {style:'thin'}, right: {style:'thin'}
        };
    }

    // ── 3행~: 전체 제품 목록 (재고업데이트 시트와 동일한 카테고리 구분) ──
    const todayStr = new Date().toISOString().split('T')[0];
    let logRowIdx = 3;

    categories.forEach((cat) => {
        // 카테고리 구분 헤더
        const separatorRow = logSheet.getRow(logRowIdx);
        logSheet.mergeCells(`A${logRowIdx}:H${logRowIdx}`);
        separatorRow.getCell(1).value = `${cat.icon}  ${cat.name}  (${cat.data.length}개 제품) — 입고/출고가 있는 제품에만 수량을 입력하세요`;
        separatorRow.getCell(1).font = { size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
        separatorRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cat.headerColor } };
        separatorRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        separatorRow.height = 30;
        separatorRow.getCell(1).border = {
            top: {style:'medium'}, bottom: {style:'medium'},
            left: {style:'medium'}, right: {style:'medium'}
        };
        logRowIdx++;

        // 각 제품 행
        cat.data.forEach((product, prodIdx) => {
            const specs = product.specifications || {};
            let specText = specs.size || '';
            if (specs.packaging) specText += ` (${specs.packaging})`;

            const row = logSheet.getRow(logRowIdx);
            row.values = [
                todayStr,                    // A: 날짜 (오늘 기본값)
                cat.name,                    // B: 카테고리
                product.title || '',         // C: 제품명
                product.model_id || '',      // D: 품번
                specText,                    // E: 규격
                '',                          // F: 입고량 (업체 입력)
                '',                          // G: 출고량 (업체 입력)
                ''                           // H: 비고
            ];

            const isAlt = prodIdx % 2 === 1;
            const bgColor = isAlt ? cat.altColor : cat.bgColor;

            // 제품 정보 영역 (B-E): 읽기전용 느낌의 배경
            row.getCell(1).numFmt = 'yyyy-mm-dd';
            row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFDE7' } };
            for (let i = 2; i <= 5; i++) {
                row.getCell(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
                row.getCell(i).font = { size: 10 };
            }
            // 입고/출고/비고 (F-H): 입력 영역 노란 배경
            for (let i = 6; i <= 8; i++) {
                row.getCell(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFDE7' } };
            }

            for (let i = 1; i <= 8; i++) {
                row.getCell(i).alignment = { vertical: 'middle', horizontal: 'center' };
                row.getCell(i).border = {
                    bottom: {style:'hair', color: {argb:'FFBDBDBD'}},
                    right: {style:'hair', color: {argb:'FFBDBDBD'}}
                };
            }

            // 숫자 유효성 검사 (입고/출고)
            [6, 7].forEach(ci => {
                logSheet.getCell(logRowIdx, ci).dataValidation = {
                    type: 'whole', operator: 'greaterThanOrEqual',
                    allowBlank: true, formulae: [0],
                    showErrorMessage: true, errorTitle: '입력 오류',
                    error: '0 이상의 숫자만 입력 가능합니다.'
                };
            });

            logRowIdx++;
        });
    });

    // ── 다음 날 안내 구분선 ──
    logRowIdx++;
    const nextDayRow = logSheet.getRow(logRowIdx);
    logSheet.mergeCells(`A${logRowIdx}:H${logRowIdx}`);
    nextDayRow.getCell(1).value = '⬇️  다음 날: 위의 전체 블록(3행~여기)을 선택 → 복사 → 아래에 붙여넣기 → A열 날짜만 변경  ⬇️';
    nextDayRow.getCell(1).font = { size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
    nextDayRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1565C0' } };
    nextDayRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
    nextDayRow.height = 34;

    // 틀 고정 (헤더 2행까지)
    logSheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 2 }];

    // 자동필터
    logSheet.autoFilter = {
        from: { row: 2, column: 1 },
        to: { row: 2, column: 8 }
    };


    // ============================================================
    // 4. 재고 입력 메인 시트 생성
    // ============================================================
    const sheet = workbook.addWorksheet('재고업데이트(입력)', {
        views: [{ state: 'frozen', xSplit: 0, ySplit: 2 }],  // 2행 틀고정 (데이터 열 헤더까지)
        properties: { tabColor: { argb: 'FF00C853' } }
    });

    // ── 1행: 전체 안내 배너 ──
    sheet.mergeCells('A1:Q1');
    sheet.getCell('A1').value = `📦 데일리하우징 재고 업데이트 양식  |  전체 ${totalCount}개 제품  |  🔍 Ctrl+F로 검색  |  열 머리 ▼버튼으로 필터`;
    sheet.getCell('A1').font = { size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF37474F' } };
    sheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getRow(1).height = 30;

    // ── 2행: 데이터 열 헤더 ──
    sheet.columns = [
        { key: 'category', width: 15 },
        { key: 'collection', width: 28 },
        { key: 'title', width: 22 },
        { key: 'id', width: 28 },
        { key: 'spec', width: 38 },
        { key: 'inbound_daily', width: 13 },
        { key: 'outbound_daily', width: 13 },
        { key: 'inventoryQuantity', width: 20 },
        { key: 'status', width: 15 },
        { key: 'expectedRestockDate', width: 18 },
        { key: 'notes', width: 30 },
        { key: 'inbound_weekly', width: 13 },
        { key: 'outbound_weekly', width: 13 },
        { key: 'inbound_monthly', width: 13 },
        { key: 'outbound_monthly', width: 13 },
        { key: 'inbound_yearly', width: 13 },
        { key: 'outbound_yearly', width: 13 }
    ];

    const headers = [
        '대분류 (수정금지)', '컬렉션 (수정금지)', '제품명 (수정금지)',
        '품번 (수정금지)', '규격 (수정금지)',
        '▶ 일일 입고량', '▶ 일일 출고량', 
        '▶ 현재고(BOX/Roll)', '▶ 판매상태', '▶ 입고예정일', '▶ 비고(선택)',
        '📊 주간 입고 (자동)', '📊 주간 출고 (자동)',
        '📊 월간 입고 (자동)', '📊 월간 출고 (자동)',
        '📊 연간 입고 (자동)', '📊 연간 출고 (자동)'
    ];
    const headerRow = sheet.getRow(2);
    headers.forEach((h, i) => {
        headerRow.getCell(i + 1).value = h;
    });
    headerRow.font = { bold: true, size: 10 };
    headerRow.height = 28;

    for (let i = 1; i <= 17; i++) {
        const cell = headerRow.getCell(i);
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        // 왜: 수정금지(회색) / 입력(초록) / 자동계산(파랑) 세 가지 영역을 색상으로 구분
        const headerColor = i <= 5 ? 'FFB0BEC5' : (i <= 11 ? 'FF81C784' : 'FF64B5F6');
        cell.fill = {
            type: 'pattern', pattern: 'solid',
            fgColor: { argb: headerColor }
        };
        cell.border = {
            top: {style:'medium'}, left: {style:'thin'},
            bottom: {style:'medium'}, right: {style:'thin'}
        };
    }

    // ============================================================
    // 4. 카테고리별 구분 헤더 + 실제 데이터 삽입
    // ============================================================
    let dataRowIndex = 3; // 3행부터 데이터 시작

    categories.forEach((cat) => {
        // ── 카테고리 구분 헤더 (병합 셀, 굵은 배경) ──
        const separatorRow = sheet.getRow(dataRowIndex);
        sheet.mergeCells(`A${dataRowIndex}:Q${dataRowIndex}`);
        separatorRow.getCell(1).value = `${cat.icon}  ${cat.name}  (${cat.data.length}개 제품)`;
        separatorRow.getCell(1).font = { size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
        separatorRow.getCell(1).fill = {
            type: 'pattern', pattern: 'solid',
            fgColor: { argb: cat.headerColor }
        };
        separatorRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        separatorRow.height = 32;
        separatorRow.getCell(1).border = {
            top: {style:'medium'}, bottom: {style:'medium'},
            left: {style:'medium'}, right: {style:'medium'}
        };
        dataRowIndex++;

        // ── 제품 데이터 행 ──
        cat.data.forEach((product, prodIdx) => {
            const specs = product.specifications || {};
            let specText = specs.size || '';
            if (specs.packaging) specText += ` (${specs.packaging})`;

            const row = sheet.getRow(dataRowIndex);
            const currentStock = product.inventory || 0;

            row.values = [
                cat.name,                        // A: 대분류
                product.subCategory || '',       // B: 컬렉션
                product.title || '',             // C: 제품명
                product.model_id || '',          // D: 품번
                specText,                        // E: 규격
                '',                              // F: 일일 입고량
                '',                              // G: 일일 출고량
                { formula: `${currentStock} + IF(ISBLANK(F${dataRowIndex}), 0, F${dataRowIndex}) - IF(ISBLANK(G${dataRowIndex}), 0, G${dataRowIndex})`, result: currentStock }, // H: 현재고 (로컬 기초재고 기준 증감 반영)
                { formula: `IF(H${dataRowIndex}<=0, "일시품절", "정상")`, result: currentStock <= 0 ? "일시품절" : "정상" },  // I: 판매상태 (현재고 기반 스위치)
                '',                              // J: 입고예정일
                '',                              // K: 비고
                // 왜: SUMIFS로 일일기록 시트의 해당 품번 데이터를 기간별로 자동 합산
                // 일일기록 열 구조: A=날짜, D=품번, F=입고량, G=출고량
                { formula: `SUMIFS(일일기록!$F:$F,일일기록!$D:$D,$D${dataRowIndex},일일기록!$A:$A,">="&(TODAY()-WEEKDAY(TODAY(),2)+1))`, result: 0 },  // L: 주간 입고 (자동)
                { formula: `SUMIFS(일일기록!$G:$G,일일기록!$D:$D,$D${dataRowIndex},일일기록!$A:$A,">="&(TODAY()-WEEKDAY(TODAY(),2)+1))`, result: 0 },  // M: 주간 출고 (자동)
                { formula: `SUMIFS(일일기록!$F:$F,일일기록!$D:$D,$D${dataRowIndex},일일기록!$A:$A,">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1))`, result: 0 },  // N: 월간 입고 (자동)
                { formula: `SUMIFS(일일기록!$G:$G,일일기록!$D:$D,$D${dataRowIndex},일일기록!$A:$A,">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1))`, result: 0 },  // O: 월간 출고 (자동)
                { formula: `SUMIFS(일일기록!$F:$F,일일기록!$D:$D,$D${dataRowIndex},일일기록!$A:$A,">="&DATE(YEAR(TODAY()),1,1))`, result: 0 },  // P: 연간 입고 (자동)
                { formula: `SUMIFS(일일기록!$G:$G,일일기록!$D:$D,$D${dataRowIndex},일일기록!$A:$A,">="&DATE(YEAR(TODAY()),1,1))`, result: 0 }   // Q: 연간 출고 (자동)
            ];

            // 왜: 짝수/홀수 행에 다른 배경색(줄무늬)을 적용하여 시각적으로 행 구분이 쉽도록 함
            const isAlt = prodIdx % 2 === 1;
            const rowBgColor = isAlt ? cat.altColor : cat.bgColor;

            for (let i = 1; i <= 5; i++) {
                row.getCell(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBgColor } };
                row.getCell(i).alignment = { vertical: 'middle' };
                row.getCell(i).font = { size: 10 };
                row.getCell(i).border = {
                    bottom: {style:'hair', color: {argb:'FFBDBDBD'}},
                    right: {style:'hair', color: {argb:'FFBDBDBD'}}
                };
            }

            // 입력 영역 (F~K) 노란 배경, 자동계산 영역 (L~Q) 연한 파란 배경
            for (let i = 6; i <= 11; i++) {
                row.getCell(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFDE7' } };
                row.getCell(i).alignment = { vertical: 'middle', horizontal: 'center' };
                row.getCell(i).border = {
                    bottom: {style:'hair', color: {argb:'FFBDBDBD'}},
                    right: {style:'hair', color: {argb:'FFBDBDBD'}}
                };
            }
            // 왜: 자동계산 영역은 파란 배경으로 시각적으로 구분하여 수정 금지 의도 전달
            for (let i = 12; i <= 17; i++) {
                row.getCell(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE3F2FD' } };
                row.getCell(i).alignment = { vertical: 'middle', horizontal: 'center' };
                row.getCell(i).font = { size: 10, color: { argb: 'FF1565C0' } };
                row.getCell(i).border = {
                    bottom: {style:'hair', color: {argb:'FFBDBDBD'}},
                    right: {style:'hair', color: {argb:'FFBDBDBD'}}
                };
            }

            // 데이터 유효성 검사 - 입력 가능 열만 (L~Q 자동계산 열 제외)
            sheet.getCell(`I${dataRowIndex}`).dataValidation = {
                type: 'list', allowBlank: true,
                formulae: ['"정상,일시품절,단종"']
            };

            ['F', 'G', 'H'].forEach(col => {
                sheet.getCell(`${col}${dataRowIndex}`).dataValidation = {
                    type: 'whole', operator: 'greaterThanOrEqual',
                    allowBlank: true,
                    formulae: [0],
                    showErrorMessage: true, errorTitle: '입력 오류',
                    error: '수량은 0 이상의 숫자만 입력할 수 있습니다.'
                };
            });

            sheet.getCell(`J${dataRowIndex}`).numFmt = 'yyyy-mm-dd';

            dataRowIndex++;
        });
    });

    // ── 자동 필터 (2행 헤더부터 마지막 데이터까지) ──
    sheet.autoFilter = {
        from: { row: 2, column: 1 },
        to: { row: dataRowIndex - 1, column: 17 }
    };

    // ============================================================
    // 5. 파일 저장
    // ============================================================
    const desktopPath = path.join(os.homedir(), 'Desktop', '데일리하우징_재고업데이트양식.xlsx');
    await workbook.xlsx.writeFile(desktopPath);
    console.log(`\n🎉 엑셀 파일 생성 완료!`);
    console.log(`📁 경로: ${desktopPath}`);
    console.log(`📊 전체 ${totalCount}개 제품 (${categories.length}개 카테고리)`);
    console.log(`\n🔍 검색 방법:`);
    console.log(`   1. 열 머리의 ▼ 버튼 → 검색 상자에 품번/제품명 입력`);
    console.log(`   2. Ctrl+F로 전체 검색`);
    console.log(`   3. 목차 시트에서 카테고리별 바로 이동`);
}

createExampleExcel().catch(console.error);
