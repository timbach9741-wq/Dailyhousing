import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import xlsx from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 바탕화면 DB 경로
const dbPath = 'C:\\Users\\Tim\\Desktop\\데일리 하우징 DB\\temp_1773110596023.2146167981.xlsx';
const smsTemplatePath = path.join(__dirname, '../카카오_영업메시지_최종.txt');

async function dryRunSms() {
  console.log('📊 [1단계] 바탕화면 데일리하우징 DB를 불러옵니다...');
  
  if (!fs.existsSync(dbPath)) {
    console.error('⚠️ DB 파일을 찾을 수 없습니다:', dbPath);
    return;
  }

  // 엑셀 파일 읽기 (xlsx 패키지 사용)
  const workbook = xlsx.readFile(dbPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // JSON 형태로 변환 (헤더 없이 배열로 받기 위해 header: 1 옵션 사용)
  const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  
  const targets = [];
  // 1번째 줄은 헤더라고 가정하고 스킵 (필요시 조정)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    // 콘솔 결과 분석 기반 열 맵핑:
    // row[0] = 업체명 (ex: 써니토탈인테리어)
    // row[2] = 연락처 (ex: 010-8567-1197)
    // row[4] = 대표자명 (ex: 박태환)
    const companyName = row[0] ? String(row[0]).trim() : '';
    const phone = row[2] ? String(row[2]).trim() : '';
    const ownerName = row[4] ? String(row[4]).trim() : '';

    if (companyName && phone && phone.includes('-')) {
      targets.push({ companyName, phone, ownerName });
    }
  }

  console.log(`✅ 총 ${targets.length}개의 유효한 연락처 데이터를 확보했습니다!`);
  console.log('--------------------------------------------------');
  
  const smsTemplateRaw = fs.readFileSync(smsTemplatePath, 'utf8');
  
  // 카카오 메시지 추출
  let templateToUse = smsTemplateRaw.split('[웹발신]')[1].split('---')[0];

  console.log('📱 [2단계] 발송 시뮬레이션 (상위 3개 업체만 미리보기)\n');

  for (let i = 0; i < 3; i++) {
    const target = targets[i];
    let message = templateToUse.replace(/{업체명}/g, target.companyName)
                           .replace(/{대표자명}/g, target.ownerName || '사장님');
                           
    console.log(`[발송 대상 ${i+1}] 👤 수신자: ${target.companyName} (${target.ownerName}) / 📞 ${target.phone}`);
    console.log(`[문자 내용]\n${message.trim()}`);
    console.log('\n==================================================\n');
  }
}

dryRunSms();
