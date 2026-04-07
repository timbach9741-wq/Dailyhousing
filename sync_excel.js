import fs from 'fs';
import ExcelJS from 'exceljs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyB9dPaKxOp2XyoYJrENSMX5nskoWbAFBog",
    authDomain: "project-dog-1-51759630-ea08b.firebaseapp.com",
    projectId: "project-dog-1-51759630-ea08b",
    storageBucket: "project-dog-1-51759630-ea08b.firebasestorage.app",
    messagingSenderId: "237870624730",
    appId: "1:237870624730:web:b723174f922d4a26f01ae3",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
    console.log('🔄 Firebase에서 최신 재고 데이터를 가져오는 중...');
    const productsSnap = await getDocs(collection(db, 'products'));
    const productsMap = {};
    productsSnap.forEach(doc => {
        const data = doc.data();
        if (data.model_id) {
            productsMap[data.model_id.toUpperCase().replace(/\\s/g, '')] = data.inventory || 0;
        }
    });

    console.log(`✅ 총 ${Object.keys(productsMap).length}개의 DB 데이터 확보 완료.`);

    const filePath = 'c:\\\\Users\\\\Tim\\\\Desktop\\\\데일리하우징_재고업데이트양식.xlsx';
    console.log('📂 엑셀 파일 불러오는 중...', filePath);
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const sheet = workbook.worksheets.find(s => s.name.includes('재고업데이트') || s.name.includes('재고'));
    if (!sheet) {
        console.error('❌ 해당 시트를 찾을 수 없습니다.');
        process.exit(1);
    }

    // 헤더 찾기
    let headerRowIdx = -1;
    let modelColIdx = -1;
    let inColIdx = -1;
    let outColIdx = -1;
    let stockColIdx = -1;

    sheet.eachRow((row, rowNumber) => {
        if (headerRowIdx !== -1) return;
        row.eachCell((cell, colNumber) => {
            const val = cell.value ? String(cell.value) : '';
            if (val.includes('품번') || val.includes('모델명')) {
                headerRowIdx = rowNumber;
            }
        });
    });

    if (headerRowIdx !== -1) {
        const headerRow = sheet.getRow(headerRowIdx);
        headerRow.eachCell((cell, colNumber) => {
            const val = cell.value ? String(cell.value) : '';
            if (val.includes('품번') || val.includes('모델명')) modelColIdx = colNumber;
            if (val.includes('입고량')) inColIdx = colNumber;
            if (val.includes('출고량')) outColIdx = colNumber;
            if (val.includes('현재고') || val.includes('재고')) stockColIdx = colNumber;
        });

        if(modelColIdx === -1 || stockColIdx === -1) {
            console.error('❌ 필수 헤더(품번, 재고)를 찾을 수 없습니다.');
            process.exit(1);
        }

        console.log(`📝 매핑 완료: 품번열(${modelColIdx}), 입고열(${inColIdx}), 출고열(${outColIdx}), 재고열(${stockColIdx})`);

        let updated = 0;
        sheet.eachRow((row, rowNumber) => {
            if (rowNumber <= headerRowIdx) return;
            const modelCell = row.getCell(modelColIdx);
            if (!modelCell || !modelCell.value) return;
            
            const modelId = String(modelCell.value).toUpperCase().replace(/\\s/g, '');
            if (productsMap[modelId] !== undefined) {
                // Update final stock
                const stockCell = row.getCell(stockColIdx);
                stockCell.value = productsMap[modelId];
                
                // Clear inbound and outbound
                if (inColIdx !== -1) row.getCell(inColIdx).value = null;
                if (outColIdx !== -1) row.getCell(outColIdx).value = null;
                
                updated++;
            }
        });

        console.log(`✨ 총 ${updated}건의 재고가 엑셀 파일에 동기화되었습니다.`);
        await workbook.xlsx.writeFile(filePath);
        console.log('💾 엑셀 파일 바탕화면에 저장 완료!');
    } else {
        console.error('❌ 헤더가 있는 행을 찾지 못했습니다!');
    }
}

run().catch(console.error);
