const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const axios = require("axios");
const cors = require("cors")({ origin: true });

// 토스페이먼츠 시크릿 키 (공식 문서 테스트용)
// 주의: 정식 운영(Production) 배포 시에는 반드시 토스페이먼츠 개발자 센터에서 
// 발급받은 '라이브 시크릿 키'를 사용해야 하며, 환경 변수로 암호화하여 관리해야 합니다.
const WIDGET_SECRET_KEY = "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6";

exports.confirmTossPayment = onRequest((req, res) => {
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
      const encryptedSecretKey = Buffer.from(`${WIDGET_SECRET_KEY}:`).toString("base64");

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
});
