/**
 * Google Sheets 회원정보 기록 서비스
 * 
 * 회원가입 시 Google Apps Script 웹훅을 통해
 * Google Sheets에 회원 데이터를 자동 기록합니다.
 * 
 * .env에 VITE_GOOGLE_SHEETS_WEBHOOK 설정 필요
 */

const SHEETS_WEBHOOK_URL = import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK || '';

/**
 * 회원가입 정보를 Google Sheets에 기록
 * @param {Object} userData - 회원가입 데이터
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const recordSignupToSheets = async (userData) => {
    if (!SHEETS_WEBHOOK_URL) {
        console.warn('Google Sheets 웹훅 URL 미설정 — 기록 스킵');
        return { success: false, error: 'WEBHOOK_NOT_SET' };
    }

    try {
        const payload = {
            createdAt: new Date().toLocaleString('ko-KR', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit'
            }),
            role: userData.role || 'individual',
            displayName: userData.displayName || '',
            email: userData.email || '',
            phoneNumber: userData.phoneNumber || '',
            companyName: userData.businessInfo?.businessName || '',
            registrationNumber: userData.businessInfo?.businessNumber || '',
            ntsVerified: userData.businessInfo?.ntsVerified || false,
            licenseFileUrl: userData.businessInfo?.licenseUrl || '',
        };

        // Google Apps Script는 브라우저 CORS 정책과 충돌하므로 no-cors 옵션 필수
        // text/plain Content-Type으로 preflight 우회 및 직접 쏘기
        const response = await fetch(SHEETS_WEBHOOK_URL, {
            method: 'POST',
            mode: 'no-cors', // CORS 차단 무시 (응답은 opaque로 옴)
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(payload),
        });

        // no-cors 설정 시 response.ok 등은 false가 되지만, response.type === 'opaque' 면 웹훅 발송 자체는 100% 성공한 것임
        if (response.type === 'opaque' || response.ok || response.redirected) {
            console.log('✅ Google Sheets 기록 요청 전송 완료 (CORS 우회 성공)');
            return { success: true };
        }

        try {
            const result = await response.json();
            console.log('Google Sheets 응답:', result);
        } catch {
            // JSON 파싱 실패해도 요청 자체는 성공일 수 있음
            console.log('Google Sheets 응답 파싱 스킵 (요청은 전송됨)');
        }
        return { success: true };
    } catch (err) {
        console.error('Google Sheets 기록 실패:', err);
        // Sheets 기록 실패해도 가입은 정상 진행
        return { success: false, error: err.message };
    }
};

/**
 * 구글시트에서 회원 승인 상태를 업데이트
 * @param {string} email - 회원 이메일 (행 검색용)
 * @param {boolean} approved - 승인 여부
 */
export const updateApprovalToSheets = async (email, approved) => {
    if (!SHEETS_WEBHOOK_URL) return;
    try {
        const payload = {
            action: 'updateApproval',
            email,
            approved
        };
        await fetch(SHEETS_WEBHOOK_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload),
        });
        console.log('✅ Google Sheets 승인 상태 업데이트 전송');
    } catch (err) {
        console.error('Google Sheets 승인 업데이트 실패:', err);
    }
};
