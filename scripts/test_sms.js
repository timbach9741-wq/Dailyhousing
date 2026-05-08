import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { SolapiMessageService } from 'solapi';

// 환경변수 로드
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const CONFIG = {
  smsTemplatePath: path.join(__dirname, '../B2B_영업문자_템플릿.txt'),
  solapiApiKey: process.env.SOLAPI_API_KEY,
  solapiApiSecret: process.env.SOLAPI_API_SECRET,
  solapiSenderNumber: process.env.SOLAPI_SENDER_NUMBER,
};

async function sendTestSms() {
  console.log('🧪 파일럿 테스트 발송을 시작합니다...');
  
  if (!CONFIG.solapiApiKey || !CONFIG.solapiApiSecret || !CONFIG.solapiSenderNumber) {
    console.error('🚨 .env 파일 설정이 누락되었습니다.');
    return;
  }

  const messageService = new SolapiMessageService(CONFIG.solapiApiKey, CONFIG.solapiApiSecret);
  const smsTemplate = fs.readFileSync(CONFIG.smsTemplatePath, 'utf8');
  
  // 테스트용 수신번호 및 업체명 설정
  const targetPhone = CONFIG.solapiSenderNumber; // 본인 번호로 발송
  const targetName = '데일리하우징(테스트)';
  
  const messageText = smsTemplate.replace(/{업체명}/g, targetName);

  try {
    const response = await messageService.send({
      to: targetPhone,
      from: CONFIG.solapiSenderNumber,
      text: messageText,
      autoTypeDetect: true
    });
    console.log(`✅ [전송 성공] 대상: ${targetName} (${targetPhone})`);
    console.log(`📝 메시지 ID: ${response.messageId}`);
    console.log(`\n발송된 메시지 내용:\n------------------\n${messageText}\n------------------`);
  } catch (error) {
    console.error(`❌ [전송 실패] 사유: ${error.message}`);
    if (error.failedMessageList) {
      console.error(JSON.stringify(error.failedMessageList, null, 2));
    }
  }
}

sendTestSms();
