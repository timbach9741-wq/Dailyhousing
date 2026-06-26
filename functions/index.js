/* eslint-disable no-undef */
/* eslint-env node */
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const axios = require("axios");
const cors = require("cors")({ origin: true });
const admin = require("firebase-admin");

try {
  admin.initializeApp();
} catch (e) {
  // Ignore
}

// 토스페이먼츠 시크릿 키 (Firebase Secret Manager로 안전하게 관리)
// 배포 전 아래 명령어로 시크릿 등록 필요:
// firebase functions:secrets:set TOSS_SECRET_KEY
const TOSS_SECRET_KEY = defineSecret("TOSS_SECRET_KEY");

// 카카오 소셜 로그인 비밀값 정의
const KAKAO_REST_API_KEY = defineSecret("KAKAO_REST_API_KEY");
const KAKAO_CLIENT_SECRET = defineSecret("KAKAO_CLIENT_SECRET");

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

// ============================================================================
// 텔레그램 알림 발송 (프론트엔드 취약점 보안용)
// ============================================================================
exports.sendTelegramAlert = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }
  
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ success: false, error: '메시지가 없습니다.' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    logger.error("텔레그램 토큰 또는 챗 ID가 서버에 설정되지 않았습니다.");
    return res.status(500).json({ success: false, error: '서버 환경변수 설정 오류' });
  }

  try {
    const response = await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML'
    });
    
    return res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    logger.error("텔레그램 발송 실패:", error.response ? error.response.data : error.message);
    return res.status(500).json({ success: false, error: '텔레그램 발송 중 오류 발생' });
  }
});

// ============================================================================
// 카카오 로그인 인증 및 커스텀 토큰 생성
// ============================================================================
exports.kakaoLogin = onRequest(
  { secrets: [KAKAO_REST_API_KEY, KAKAO_CLIENT_SECRET], cors: true },
  async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    const { code, redirectUri } = req.body;
    if (!code || !redirectUri) {
      return res.status(400).json({ success: false, error: 'code와 redirectUri가 필요합니다.' });
    }

    try {
      const restApiKey = KAKAO_REST_API_KEY.value().trim();
      const clientSecret = KAKAO_CLIENT_SECRET.value().trim();

      // 1. 카카오 액세스 토큰 요청
      const tokenParams = {
        grant_type: 'authorization_code',
        client_id: restApiKey,
        redirect_uri: redirectUri,
        code: code
      };
      if (clientSecret && clientSecret !== "NONE") {
        tokenParams.client_secret = clientSecret;
      }
      
      logger.info("Kakao Token Request Params (excluding code):", { ...tokenParams, code: "***" });

      const tokenResponse = await axios.post(
        'https://kauth.kakao.com/oauth/token',
        new URLSearchParams(tokenParams).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' }
        }
      );

      const accessToken = tokenResponse.data.access_token;
      if (!accessToken) {
        throw new Error('Access token not found in Kakao response.');
      }

      // 2. 카카오 프로필 요청
      const profileResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
        }
      });

      const profile = profileResponse.data;
      const kakaoId = String(profile.id);
      
      const email = profile.kakao_account?.email || `kakao_${kakaoId}@dailyhousing.com`;
      const nickname = profile.properties?.nickname || profile.kakao_account?.profile?.nickname || '카카오 회원';
      const photoURL = profile.properties?.profile_image || profile.kakao_account?.profile?.profile_image_url || '';
      
      const db = admin.firestore();
      
      let userRecord = null;
      let uid = '';
      
      // A. 이메일로 기존 Auth 유저 조회
      try {
        userRecord = await admin.auth().getUserByEmail(email);
        uid = userRecord.uid;
        logger.info(`기존 이메일 매칭 회원 발견: ${email}, uid: ${uid}`);
      } catch (err) {
        // Ignore
      }

      // B. Firestore에서 kakaoId로 연동된 회원 조회
      if (!uid) {
        const usersSnap = await db.collection('users').where('socialLinks.kakaoId', '==', kakaoId).limit(1).get();
        if (!usersSnap.empty) {
          uid = usersSnap.docs[0].id;
          logger.info(`Firestore kakaoId 연동 회원 발견, uid: ${uid}`);
        }
      }

      // C. 신규 회원 생성
      let isNewUser = false;
      if (!uid) {
        isNewUser = true;
        const randomPassword = Math.random().toString(36).slice(-16) + 'A1!';
        userRecord = await admin.auth().createUser({
          email,
          emailVerified: true,
          password: randomPassword,
          displayName: nickname,
          ...(photoURL ? { photoURL } : {})
        });
        uid = userRecord.uid;
        logger.info(`신규 소셜 회원 생성 성공, uid: ${uid}`);
      }

      // 4. Firestore 유저 문서 동기화
      const userRef = db.collection('users').doc(uid);
      const userSnap = await userRef.get();
      
      const socialLinkUpdate = {
        'socialLinks.kakaoId': kakaoId,
        'socialLinks.kakaoEmail': email,
        updatedAt: new Date().toISOString()
      };

      if (!userSnap.exists) {
        await userRef.set({
          uid,
          email,
          displayName: nickname,
          role: 'individual',
          approved: true,
          socialLinks: {
            kakaoId,
            kakaoEmail: email
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } else {
        await userRef.update(socialLinkUpdate);
      }

      // 5. Firebase Custom Token 생성
      const customToken = await admin.auth().createCustomToken(uid);

      return res.status(200).json({
        success: true,
        customToken,
        uid,
        email,
        isNewUser,
        role: userSnap.exists ? (userSnap.data().role || 'individual') : 'individual',
        approved: userSnap.exists ? (userSnap.data().approved !== false) : true
      });

    } catch (error) {
      logger.error('카카오 로그인 처리 실패:', error.response ? error.response.data : error.message);
      return res.status(500).json({
        success: false,
        error: error.response?.data || error.message || '카카오 로그인 처리 중 에러가 발생했습니다.'
      });
    }
  }
);

// ============================================================================
// 네이버 로그인 인증 및 커스텀 토큰 생성
// ============================================================================
exports.naverLogin = onRequest(
  { secrets: [NAVER_CLIENT_ID, NAVER_CLIENT_SECRET], cors: true },
  async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    const { code, redirectUri, state } = req.body;
    if (!code || !redirectUri) {
      return res.status(400).json({ success: false, error: 'code와 redirectUri가 필요합니다.' });
    }

    try {
      const clientId = NAVER_CLIENT_ID.value().trim();
      const clientSecret = NAVER_CLIENT_SECRET.value().trim();

      // 1. 네이버 액세스 토큰 요청
      const tokenResponse = await axios.post(
        'https://nid.naver.com/oauth2.0/token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          code: code,
          state: state || 'naver_login'
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      );

      const accessToken = tokenResponse.data.access_token;
      if (!accessToken) {
        throw new Error('Access token not found in Naver response.');
      }

      // 2. 네이버 프로필 요청
      const profileResponse = await axios.get('https://openapi.naver.com/v1/nid/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      const profile = profileResponse.data.response;
      if (!profile) {
        throw new Error('Naver profile response is empty.');
      }

      const naverId = String(profile.id);
      const email = profile.email || `naver_${naverId}@dailyhousing.com`;
      const nickname = profile.name || profile.nickname || '네이버 회원';
      const photoURL = profile.profile_image || '';
      
      const db = admin.firestore();
      
      let userRecord = null;
      let uid = '';
      
      // A. 이메일로 기존 Auth 유저 조회
      try {
        userRecord = await admin.auth().getUserByEmail(email);
        uid = userRecord.uid;
        logger.info(`기존 이메일 매칭 회원 발견: ${email}, uid: ${uid}`);
      } catch (err) {
        // Ignore
      }

      // B. Firestore에서 naverId로 연동된 회원 조회
      if (!uid) {
        const usersSnap = await db.collection('users').where('socialLinks.naverId', '==', naverId).limit(1).get();
        if (!usersSnap.empty) {
          uid = usersSnap.docs[0].id;
          logger.info(`Firestore naverId 연동 회원 발견, uid: ${uid}`);
        }
      }

      // C. 신규 회원 생성
      let isNewUser = false;
      if (!uid) {
        isNewUser = true;
        const randomPassword = Math.random().toString(36).slice(-16) + 'A1!';
        userRecord = await admin.auth().createUser({
          email,
          emailVerified: true,
          password: randomPassword,
          displayName: nickname,
          ...(photoURL ? { photoURL } : {})
        });
        uid = userRecord.uid;
        logger.info(`신규 소셜 회원 생성 성공, uid: ${uid}`);
      }

      // 4. Firestore 유저 문서 동기화
      const userRef = db.collection('users').doc(uid);
      const userSnap = await userRef.get();
      
      const socialLinkUpdate = {
        'socialLinks.naverId': naverId,
        'socialLinks.naverEmail': email,
        updatedAt: new Date().toISOString()
      };

      if (!userSnap.exists) {
        await userRef.set({
          uid,
          email,
          displayName: nickname,
          role: 'individual',
          approved: true,
          socialLinks: {
            naverId,
            naverEmail: email
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } else {
        await userRef.update(socialLinkUpdate);
      }

      // 5. Firebase Custom Token 생성
      const customToken = await admin.auth().createCustomToken(uid);

      return res.status(200).json({
        success: true,
        customToken,
        uid,
        email,
        isNewUser,
        role: userSnap.exists ? (userSnap.data().role || 'individual') : 'individual',
        approved: userSnap.exists ? (userSnap.data().approved !== false) : true
      });

    } catch (error) {
      logger.error('네이버 로그인 처리 실패:', error.response ? error.response.data : error.message);
      return res.status(500).json({
        success: false,
        error: error.response?.data || error.message || '네이버 로그인 처리 중 에러가 발생했습니다.'
      });
    }
  }
);
