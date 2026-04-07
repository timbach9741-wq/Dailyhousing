import * as xlsx from 'xlsx';
import path from 'path';

const filePath = 'c:\\Users\\Tim\\Desktop\\데일리하우징_재고업데이트양식.xlsx';
const workbook = xlsx.readFile(filePath);
console.log('Sheet Names:', workbook.SheetNames);

const firstSheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[firstSheetName];
const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

console.log(`\nContents of ${firstSheetName} (First 5 rows):`);
console.log(JSON.stringify(data.slice(0, 5), null, 2));
