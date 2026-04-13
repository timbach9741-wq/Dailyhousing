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
