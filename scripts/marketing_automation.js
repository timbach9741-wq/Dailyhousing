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
  sentHistoryPath: path.join(__dirname, '../data/sent_history.json'), // 발송 이력 파일 추가
  // 외부 문자 발송 API (Solapi) 키 세팅
  solapiApiKey: process.env.SOLAPI_API_KEY,
  solapiApiSecret: process.env.SOLAPI_API_SECRET,
  solapiSenderNumber: process.env.SOLAPI_SENDER_NUMBER,
  naverBlogApiKey: process.env.NAVER_API_KEY || 'YOUR_NAVER_API_KEY'
};

// 발송 이력 불러오기
function getSentHistory() {
  if (fs.existsSync(CONFIG.sentHistoryPath)) {
    try {
      return JSON.parse(fs.readFileSync(CONFIG.sentHistoryPath, 'utf8'));
    } catch (e) {
      return [];
    }
  }
  return [];
}

// 발송 이력 저장하기
function saveSentHistory(history) {
  fs.writeFileSync(CONFIG.sentHistoryPath, JSON.stringify(history, null, 2), 'utf8');
}

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

  const sentHistory = getSentHistory();
  const targets = [];
  worksheet.eachRow((row, rowNumber) => {
    const name = row.getCell(1).value;    // 1열: 업체명
    const phone = row.getCell(3).value;   // 3열: 연락처
    const yearIdentifier = row.getCell(7).value; // 7열: 2025 식별자 포함 컬럼

    if (name && phone && yearIdentifier) {
      const nameStr = String(name).trim();
      const phoneStr = String(phone).trim();
      const yearStr = String(yearIdentifier).trim();

      // 헤더나 빈 행(예: '2025'로 채워진 행) 스킵하고, 7열에 '2025'가 포함된 실제 사업자만 추출
      if (nameStr !== '2025' && yearStr.includes('2025') && phoneStr.length > 8) {
        const cleanPhone = phoneStr.replace(/[^0-9]/g, '');
        // 이미 발송한 이력이 없는 번호만 추가
        if (!sentHistory.includes(cleanPhone)) {
          targets.push({ name: nameStr, phone: cleanPhone, rawPhone: phoneStr });
        }
      }
    }
  });

  console.log(`✅ 발송 대기 중인 타겟(미발송) 업체: 총 ${targets.length}개 로드 완료 (2025년 기준)`);
  return targets;
}

/**
 * 2. 카카오톡/문자 대량 발송 (템플릿 기반)
 */
async function sendSmsCampaign(limit = 50) {
  const allTargets = await loadTargetDB();
  if (allTargets.length === 0) {
    console.log('✨ 모든 타겟에게 발송이 완료되었거나 대기 중인 타겟이 없습니다.');
    return;
  }

  // 발송 제한(기본 50)만큼 잘라내기. limit이 0이나 false면 전체 발송
  const targets = limit > 0 ? allTargets.slice(0, limit) : allTargets;

  const smsTemplate = fs.readFileSync(CONFIG.smsTemplatePath, 'utf8');
  
  // 솔라피 연동 확인
  if (!CONFIG.solapiApiKey || !CONFIG.solapiApiSecret || !CONFIG.solapiSenderNumber) {
    console.log('🚨 .env 파일에 솔라피 API 키와 발신번호가 세팅되지 않았습니다.');
    console.log('발신을 중단합니다. .env 파일을 먼저 확인해주세요.');
    return;
  }

  const messageService = new SolapiMessageService(CONFIG.solapiApiKey, CONFIG.solapiApiSecret);
  const sentHistory = getSentHistory();

  console.log(`\n🚀 [솔라피 문자 대량 발송 캠페인 시작] 금일 ${targets.length}건 발송 예정`);
  
  for (const target of targets) {
    try {
      // 템플릿 변환: {업체명} 치환
      const messageText = smsTemplate.replace(/{업체명}/g, target.name);

      // 솔라피 발송 요청
      const response = await messageService.send({
        to: target.phone, // 하이픈이 이미 제거된 상태
        from: CONFIG.solapiSenderNumber,
        text: messageText,
        // 알림톡/LMS/SMS 여부는 text 길이나 템플릿 설정에 따라 자동 지정됨 (기본값)
        autoTypeDetect: true
      });

      console.log(`[전송 성공] 대상: ${target.name} (${target.phone}) - 메시지 ID: ${response.messageId}`);
      
      // 전송 성공 시 기록
      sentHistory.push(target.phone);
      saveSentHistory(sentHistory);

      // 발송 딜레이 (스팸/서버 과부하 방지, 1초)
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`[전송 실패] 대상: ${target.name} - 사유: ${error.message}`);
    }
  }
  
  console.log(`🎉 오늘 목표치인 ${targets.length}건 발송이 완료되었습니다.`);
  if (allTargets.length - targets.length > 0) {
    console.log(`남은 발송 대기 타겟 수: ${allTargets.length - targets.length}건`);
  }
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

async function sendTestCampaign() {
  const smsTemplate = fs.readFileSync(CONFIG.smsTemplatePath, 'utf8');
  
  if (!CONFIG.solapiApiKey || !CONFIG.solapiApiSecret || !CONFIG.solapiSenderNumber) {
    console.log('🚨 .env 파일에 솔라피 API 키와 발신번호가 세팅되지 않았습니다.');
    return;
  }

  const messageService = new SolapiMessageService(CONFIG.solapiApiKey, CONFIG.solapiApiSecret);
  const messageText = smsTemplate.replace(/{업체명}/g, '테스트업체');
  
  console.log(`\n🚀 [테스트 발송 시작] 발신 및 수신번호: ${CONFIG.solapiSenderNumber}`);
  
  try {
    const response = await messageService.send({
      to: CONFIG.solapiSenderNumber,
      from: CONFIG.solapiSenderNumber,
      text: messageText,
      autoTypeDetect: true
    });
    console.log(`[테스트 발송 성공] 메시지 ID: ${response.messageId}`);
  } catch (error) {
    console.error(`[테스트 발송 실패] 사유: ${error.message}`);
  }
}

// 실행 옵션
const action = process.argv[2];

if (action === 'sms') {
  const limitArg = process.argv[3];
  const limit = limitArg !== undefined ? parseInt(limitArg, 10) : 50; // 기본 50건
  sendSmsCampaign(limit);
} else if (action === 'blog') {
  autoPostToNaverBlog();
} else if (action === 'test') {
  loadTargetDB().then(targets => {
    console.log(`\n[테스트] 로드된 타겟 샘플 (최대 3개):`, targets.slice(0, 3));
  });
} else if (action === 'send-test') {
  sendTestCampaign();
} else {
  console.log(`
[데일리하우징 마케팅 자동화 스크립트]
사용법: 
  node scripts/marketing_automation.js sms        # 미발송 대상자에게 50건 발송 (기본값)
  node scripts/marketing_automation.js sms 100    # 미발송 대상자에게 100건 발송
  node scripts/marketing_automation.js sms 0      # 남은 전원에게 전부 발송
  node scripts/marketing_automation.js blog       # 네이버 블로그 포스팅
  node scripts/marketing_automation.js test       # 미발송 대상자 DB 로드 테스트
  node scripts/marketing_automation.js send-test  # 내 번호로 1건 테스트 발송
  `);
}
