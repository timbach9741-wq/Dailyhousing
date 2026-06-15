/**
 * 텔레그램 알림 발송 서비스
 */
export const sendTelegramAlert = async (message) => {
    try {
        const response = await fetch('https://us-central1-project-dog-1-51759630-ea08b.cloudfunctions.net/sendTelegramAlert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            console.error('❌ 백엔드 텔레그램 발송 실패:', response.statusText);
            return false;
        }

        return true;
    } catch (error) {
        console.error('❌ 백엔드 연결 중 에러 발생:', error);
        return false;
    }
};
