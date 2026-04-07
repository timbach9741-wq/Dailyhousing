/**
 * 사업자등록번호 검증 서비스
 * 국세청 사업자등록정보 상태조회 API 연동
 * 
 * API: https://api.odcloud.kr/api/nts-businessman/v1/status
 * 방식: POST
 * serviceKey 필요 (공공데이터포털 발급)
 */

// 환경변수에서 serviceKey를 읽음 (없으면 형식 검증만 수행)
const NTS_SERVICE_KEY = import.meta.env.VITE_NTS_SERVICE_KEY || '';

/**
 * 사업자등록번호 형식 검증 (10자리 숫자, 체크섬)
 * @param {string} bno - 하이픈 포함/미포함 사업자등록번호
 * @returns {{ valid: boolean, cleaned: string, error?: string }}
 */
export const validateBusinessNumberFormat = (bno) => {
    const cleaned = bno.replace(/[^0-9]/g, '');

    if (cleaned.length !== 10) {
        return { valid: false, cleaned, error: '사업자등록번호는 10자리 숫자입니다.' };
    }

    // 사업자등록번호 체크섬 검증
    const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5];
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleaned[i]) * weights[i];
    }
    sum += Math.floor((parseInt(cleaned[8]) * 5) / 10);
    const checkDigit = (10 - (sum % 10)) % 10;

    if (checkDigit !== parseInt(cleaned[9])) {
        return { valid: false, cleaned, error: '유효하지 않은 사업자등록번호입니다.' };
    }

    return { valid: true, cleaned };
};

/**
 * 국세청 API를 통한 사업자등록 상태조회
 * @param {string} bno - 하이픈 없는 10자리 사업자등록번호
 * @returns {{ success: boolean, status?: string, statusText?: string, error?: string }}
 * 
 * status 값:
 * - "01": 계속사업자 (정상)
 * - "02": 휴업자
 * - "03": 폐업자
 */
export const verifyBusinessNumber = async (bno) => {
    // 형식 검증 먼저
    const formatCheck = validateBusinessNumberFormat(bno);
    if (!formatCheck.valid) {
        return { success: false, error: formatCheck.error };
    }

    const cleaned = formatCheck.cleaned;

    // serviceKey 없으면 형식 검증만 수행
    if (!NTS_SERVICE_KEY) {
        return {
            success: true,
            status: 'format_only',
            statusText: '번호 형식 확인됨 (API 키 미설정)',
            formatValid: true,
        };
    }

    try {
        const url = `https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${encodeURIComponent(NTS_SERVICE_KEY)}&returnType=JSON`;
        
        // 5초 타임아웃 설정 (Transaction Timeout 방지)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ b_no: [cleaned] }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            return { success: false, error: `API 호출 실패 (HTTP ${response.status})` };
        }

        const data = await response.json();

        if (data.data && data.data.length > 0) {
            const result = data.data[0];
            const bStt = result.b_stt; // 사업자 상태 텍스트
            const bSttCd = result.b_stt_cd; // "01", "02", "03"

            let statusText = '';
            if (bSttCd === '01') statusText = '정상 사업자';
            else if (bSttCd === '02') statusText = '휴업자';
            else if (bSttCd === '03') statusText = '폐업자';
            else statusText = bStt || '상태 확인 불가';

            return {
                success: true,
                status: bSttCd,
                statusText,
                taxType: result.tax_type || '',
                isActive: bSttCd === '01',
            };
        }

        return { success: false, error: '조회 결과가 없습니다.' };
    } catch (err) {
        console.error('국세청 API 호출 오류:', err);
        // API 오류 시 형식 검증 결과만 반환
        return {
            success: true,
            status: 'format_only',
            statusText: '번호 형식 확인됨 (API 연결 실패)',
            formatValid: true,
        };
    }
};
