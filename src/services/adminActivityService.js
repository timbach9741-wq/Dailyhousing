import { db } from '../lib/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { sendTelegramAlert } from './telegramService';

// 사장님 본인 계정 — 이 계정이 한 행동은 텔레그램으로 알리지 않음
export const OWNER_EMAIL = 'timbach@naver.com';

/**
 * 관리자 작업을 Firestore(admin_action_logs)에 기록하고,
 * 사장님 본인이 아닌 계정의 작업이면 텔레그램으로 즉시 알림.
 * actor: { uid, email }
 */
export const logAdminAction = async (actor, action, details = '') => {
    const entry = {
        actorUid: actor?.uid || null,
        actorEmail: actor?.email || '알 수 없음',
        action,
        details,
        createdAt: new Date().toISOString()
    };

    try {
        await addDoc(collection(db, 'admin_action_logs'), entry);
    } catch (error) {
        console.warn('[AdminActivity] 로그 기록 실패:', error?.message || error);
    }

    if (actor?.email && actor.email !== OWNER_EMAIL) {
        const message =
            `⚠️ <b>관리자 작업 감지</b>\n` +
            `계정: ${actor.email}\n` +
            `작업: ${action}` +
            (details ? `\n내용: ${details}` : '') +
            `\n시간: ${new Date().toLocaleString('ko-KR')}`;
        sendTelegramAlert(message).catch(() => {});
    }
};

/**
 * Firestore 기록 없이 텔레그램 알림만 보낼 때 사용 (예: 이미 다른 컬렉션에 로그가 남는 재고 변경).
 * 사장님 본인 계정이면 조용히 통과.
 */
export const notifyAdminAction = (actor, action, details = '') => {
    if (!actor?.email || actor.email === OWNER_EMAIL) return;
    const message =
        `⚠️ <b>관리자 작업 감지</b>\n` +
        `계정: ${actor.email}\n` +
        `작업: ${action}` +
        (details ? `\n내용: ${details}` : '') +
        `\n시간: ${new Date().toLocaleString('ko-KR')}`;
    sendTelegramAlert(message).catch(() => {});
};

/**
 * 관리자 로그인 감지 시 텔레그램 알림 (사장님 본인 로그인은 조용히 통과)
 */
export const notifyAdminLogin = (user) => {
    if (!user?.email || user.email === OWNER_EMAIL) return;
    const message =
        `🔑 <b>관리자 로그인 감지</b>\n` +
        `계정: ${user.email}\n` +
        `시간: ${new Date().toLocaleString('ko-KR')}`;
    sendTelegramAlert(message).catch(() => {});
};
