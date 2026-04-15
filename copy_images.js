const fs = require('fs');

const src1 = 'C:\\Users\\Tim\\.gemini\\antigravity\\brain\\867adc9f-ad9d-4e1d-b0ee-3f1840e3bbd6\\promise_experts_kr_1776265819759.png';
const dest1 = 'C:\\Users\\Tim\\Desktop\\Dailyhousing\\public\\promise_experts_kr.png';
fs.copyFileSync(src1, dest1);

const src2 = 'C:\\Users\\Tim\\.gemini\\antigravity\\brain\\867adc9f-ad9d-4e1d-b0ee-3f1840e3bbd6\\promise_disassembly_kr_1776265838101.png';
const dest2 = 'C:\\Users\\Tim\\Desktop\\Dailyhousing\\public\\promise_disassembly_kr.png';
fs.copyFileSync(src2, dest2);

console.log('Images copied successfully.');
