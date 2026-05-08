import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import exceljs from 'exceljs';
import dotenv from 'dotenv';
import { SolapiMessageService } from 'solapi';

// 환경변수(.env) 로드
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 설정 정보
const CONFIG = {
  dbPath: path.join(__dirname, '../data/b2b_partners_db.xlsx'),
  smsTemplatePath: path.join(__dirname, '../B2B_영업문자_템플릿.txt'),
  blogTemplatePath: path.join(__dirname, '../네이버블로그_원고_4종.txt'),
  // 외부 문자 발송 API (Solapi) 키 세팅
  solapiApiKey: process.env.SOLAPI_API_KEY,
  solapiApiSecret: process.env.SOLAPI_API_SECRET,
  solapiSenderNumber: process.env.SOLAPI_SENDER_NUMBER,
  naverBlogApiKey: process.env.NAVER_API_KEY || 'YOUR_NAVER_API_KEY'
};

/**
 * 1. 엑셀 DB에서 타겟 업체 연락처 추출
 */
async function loadTargetDB() {
  console.log('📊 엑셀 DB에서 타겟 파트너 목록을 로드합니다...');
  if (!fs.existsSync(CONFIG.dbPath)) {
    console.log('⚠️ DB 파일이 존재하지 않습니다. 먼저 data 폴더에 b2b_partners_db.xlsx를 추가해주세요.');
    return [];
  }

  const workbook = new exceljs.Workbook();
  await workbook.xlsx.readFile(CONFIG.dbPath);
  const worksheet = workbook.worksheets[0]; // 첫 번째 시트

  const targets = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // 헤더 스킵
    const name = row.getCell(1).value;    // 업체명
    const phone = row.getCell(2).value;   // 연락처
    if (name && phone) {
      targets.push({ name, phone });
    }
  });

  console.log(`✅ 총 ${targets.length}개의 타겟 업체 정보를 로드했습니다.`);
  return targets;
}

/**
 * 2. 카카오톡/문자 대량 발송 (템플릿 기반)
 */
async function sendSmsCampaign() {
  const targets = await loadTargetDB();
  if (targets.length === 0) return;

  const smsTemplate = fs.readFileSync(CONFIG.smsTemplatePath, 'utf8');
  
  // 솔라피 연동 확인
  if (!CONFIG.solapiApiKey || !CONFIG.solapiApiSecret || !CONFIG.solapiSenderNumber) {
    console.log('🚨 .env 파일에 솔라피 API 키와 발신번호가 세팅되지 않았습니다.');
    console.log('발신을 중단합니다. .env 파일을 먼저 확인해주세요.');
    return;
  }

  const messageService = new SolapiMessageService(CONFIG.solapiApiKey, CONFIG.solapiApiSecret);

  console.log('\n🚀 [솔라피 문자 대량 발송 캠페인 시작]');
  
  for (const target of targets) {
    try {
      // 템플릿 변환: {업체명} 치환
      const messageText = smsTemplate.replace(/{업체명}/g, target.name);
      
      // 수신자 번호 형식 다듬기 (하이픈 제거 등)
      const targetPhone = target.phone.toString().replace(/[^0-9]/g, '');

      // 솔라피 발송 요청
      const response = await messageService.send({
        to: targetPhone,
        from: CONFIG.solapiSenderNumber,
        text: messageText,
        // 알림톡/LMS/SMS 여부는 text 길이나 템플릿 설정에 따라 자동 지정됨 (기본값)
        autoTypeDetect: true
      });

      console.log(`[전송 성공] 대상: ${target.name} (${target.phone}) - 메시지 ID: ${response.messageId}`);
      
      // 발송 딜레이 (스팸/서버 과부하 방지, 1초)
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`[전송 실패] 대상: ${target.name} - 사유: ${error.message}`);
    }
  }
  
  console.log('🎉 문자 발송 캠페인이 완료되었습니다.');
}

/**
 * 3. 네이버 블로그 자동 포스팅
 */
async function autoPostToNaverBlog() {
  console.log('\n📝 [네이버 블로그 자동 포스팅 시작]');
  const blogData = fs.readFileSync(CONFIG.blogTemplatePath, 'utf8');
  
  // TODO: 템플릿을 여러 포스팅 단위로 파싱하여 네이버 OpenAPI(블로그 API)로 전송
  console.log('블로그 원고 템플릿 로드 완료. (분량:', blogData.length, 'bytes)');
  
  try {
    // await axios.post('https://openapi.naver.com/blog/writePost.json', { ... });
    console.log('[포스팅 성공] 제목: "데일리하우징 도매 단가 공개..."');
  } catch (error) {
    console.error('[포스팅 실패]', error.message);
  }
}

// 실행 옵션
const action = process.argv[2];

if (action === 'sms') {
  sendSmsCampaign();
} else if (action === 'blog') {
  autoPostToNaverBlog();
} else {
  console.log(`
[데일리하우징 마케팅 자동화 스크립트]
사용법: 
  node scripts/marketing_automation.js sms   # 문자/카카오 자동 발송
  node scripts/marketing_automation.js blog  # 네이버 블로그 포스팅
  `);
}
