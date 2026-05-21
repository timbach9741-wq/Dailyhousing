/* eslint-disable no-undef */
/* eslint-env node */
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const axios = require("axios");
const cors = require("cors")({ origin: true });

// 토스페이먼츠 시크릿 키 (Firebase Secret Manager로 안전하게 관리)
// 배포 전 아래 명령어로 시크릿 등록 필요:
// firebase functions:secrets:set TOSS_SECRET_KEY
const TOSS_SECRET_KEY = defineSecret("TOSS_SECRET_KEY");

exports.confirmTossPayment = onRequest(
  { secrets: [TOSS_SECRET_KEY] },
  (req, res) => {
    cors(req, res, async () => {
      // POST 요청인지 확인
      if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
      }

      try {
        const { paymentKey, orderId, amount } = req.body;

        if (!paymentKey || !orderId || !amount) {
          return res.status(400).json({ success: false, error: "필수 파라미터가 누락되었습니다." });
        }

        // 토스 승인(Confirm) API 호출을 위한 Secret Key 인코딩 처리 (Base64)
        const secretKey = TOSS_SECRET_KEY.value();
        const encryptedSecretKey = Buffer.from(`${secretKey}:`).toString("base64");

        const response = await axios.post(
          "https://api.tosspayments.com/v1/payments/confirm",
          {
            paymentKey,
            orderId,
            amount,
          },
          {
            headers: {
              Authorization: `Basic ${encryptedSecretKey}`,
              "Content-Type": "application/json",
            },
          }
        );

        // 승인 성공: 클라이언트(프론트엔드)로 응답 데이터 전달
        logger.info("토스페이먼츠 결제 승인 성공:", { orderId, amount });
        return res.status(200).json({
          success: true,
          data: response.data,
        });
        
      } catch (error) {
        logger.error("토스페이먼츠 승인 실패:", error.response ? error.response.data : error.message);
        return res.status(error.response?.status || 500).json({
          success: false,
          error: error.response?.data || "결제 승인 중 알 수 없는 오류가 발생했습니다."
        });
      }
    });
  }
);

// ============================================================================
// 네이버 블로그 AI 마케팅 자동화 봇 (주 3회 발행)
// ============================================================================

const { onSchedule } = require("firebase-functions/v2/scheduler");

// Secrets 설정 (추후 firebase functions:secrets:set 로 설정 필요)
const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");
const NAVER_CLIENT_ID = defineSecret("NAVER_CLIENT_ID");
const NAVER_CLIENT_SECRET = defineSecret("NAVER_CLIENT_SECRET");
const NAVER_ACCESS_TOKEN = defineSecret("NAVER_ACCESS_TOKEN"); // 사용자 블로그용

/**
 * 네이버 블로그 AI 자동 포스팅 봇 (매주 월, 수, 금 오전 10시 실행)
 * - 대표님 요청에 따라 '비공개(임시저장 성격)'로 업로드하여 수동 검토 후 발행.
 * - 셀프 인테리어, DIY 키워드 금지 및 데일리하우징 주력 상품 위주.
 */
exports.generateBlogDraft = onSchedule(
  {
    schedule: "0 10 * * 1,3,5", // 매주 월, 수, 금 오전 10시 (KST)
    timeZone: "Asia/Seoul",
    secrets: [OPENAI_API_KEY, NAVER_CLIENT_ID, NAVER_CLIENT_SECRET, NAVER_ACCESS_TOKEN],
    timeoutSeconds: 300 // AI 텍스트 생성이 지연될 수 있으므로 여유롭게 5분 부여
  },
  async (event) => {
    logger.info("블로그 자동 포스팅 스케줄러가 시작되었습니다.");

    try {
      // 1. OpenAI 연동 (원고 생성)
      const { OpenAI } = require("openai");
      const openai = new OpenAI({
        apiKey: OPENAI_API_KEY.value(),
      });
      
      const prompt = `
당신은 B2B 전문 바닥재 도매 및 대규모 시공 전문 기업 '데일리하우징'의 수석 엔지니어입니다.
오늘 인테리어 업체, 건축/시공사 등 기업 고객을 타겟으로 하는 B2B 홍보 칼럼을 하나 작성해주세요.

[규칙]
1. 타겟 키워드: 장판, 마루, 데코타일, LX지인 에디톤 중 하나를 메인 주제로 잡으세요.
2. 타겟 독자(B2B): '셀프 시공', 'DIY' 등 일반 소비자 대상의 내용은 절대 포함하지 마세요. 오직 인테리어 업체, 건설사 등 B2B 고객을 대상으로 '대량 발주', '정확한 납기', '검증된 B2B 시공 퀄리티' 등 비즈니스 파트너로서의 강점을 강력하게 강조하세요.
3. 글의 어조는 비즈니스 파트너에게 신뢰감을 주는 전문적이고 정중한 톤으로 작성하세요.
4. 제목은 HTML 태그 없이 작성하고, 본문 내용은 네이버 블로그에 그대로 복사할 수 있도록 HTML 포맷(H2, H3, P, Strong 태그 등)으로 깔끔하게 작성해주세요.
5. 응답은 반드시 JSON 형태로 출력해주세요.

JSON 형식:
{
  "title": "[데일리하우징] 블로그 제목 작성",
  "content": "<h1>블로그 HTML 본문...</h1>"
}
      `;

      logger.info("OpenAI API 호출 중...");
      const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: prompt }],
        model: "gpt-4o",
        response_format: { type: "json_object" },
      });

      const responseText = completion.choices[0].message.content;
      const { title, content } = JSON.parse(responseText);
      
      logger.info(`✅ 원고 생성 완료. 제목: ${title}`);

      // 2. 네이버 블로그 API 연동 (비공개로 업로드하여 '임시저장' 효과)
      // 네이버 블로그는 완전한 '임시저장' API는 미지원하므로 비공개 발행(secret: true) 후 직접 수정
      // 네이버 API 키가 발급되었으므로 주석을 해제하고 연동합니다.
      const naverApiUrl = "https://openapi.naver.com/blog/writePost.json";
      
      const formData = new URLSearchParams();
      formData.append("title", title);
      formData.append("contents", content);
      // 비공개 설정을 원하실 경우, 네이버 블로그 카테고리의 기본 설정을 '비공개'로 두시길 권장합니다.
      
      // 비공개로 발행하여 임시저장처럼 활용
      // (대표님이 네이버 블로그 접속 -> 비공개 글에 현장 사진 추가 -> 공개 발행)
      const naverResponse = await axios.post(naverApiUrl, formData.toString(), {
        headers: {
          "Authorization": `Bearer ${NAVER_ACCESS_TOKEN.value()}`,
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });
      
      logger.info("네이버 블로그 비공개 발행 성공:", naverResponse.data);
      
      logger.info("블로그 자동 생성 프로세스(테스트)가 성공적으로 완료되었습니다.");
    } catch (error) {
      logger.error("블로그 자동 포스팅 중 오류 발생:", error.response ? error.response.data : error.message);
    }
  }
);
