import { create } from 'zustand';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, orderBy, query } from 'firebase/firestore';

const escapeHtml = (str) => {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
};

export const useConsultationStore = create((set) => ({
    consultations: [],

    addConsultation: async (consultation) => {
        const newItem = {
            id: `cons-${Date.now()}`,
            date: new Date().toISOString(),
            status: 'REQUESTED',
            ...consultation
        };

        // Firestore에 저장 시도
        try {
            await addDoc(collection(db, 'consultations'), newItem);
        } catch {
            // Firestore 실패 시 로컬에만 저장 (개발 환경 폴백)
            console.warn('Firestore 저장 실패, 로컬 메모리에만 저장됩니다.');
        }

        set((state) => ({
            consultations: [newItem, ...state.consultations]
        }));

        // 텔레그램 알림 발송 (상담 신청 / 수량 문의 공통)
        try {
            const isQuantityInquiry = newItem.type === 'quantity_inquiry';
            const safeName = escapeHtml(newItem.name || '미기재');
            const safePhone = escapeHtml(newItem.phone || '미기재');
            const safeDetails = escapeHtml(newItem.details || '미기재');

            const message = isQuantityInquiry
                ? `📐 [수량 문의 접수]\n\n` +
                  `👤 성함: ${safeName}\n` +
                  `📱 연락처: ${safePhone}\n` +
                  `🧱 제품정보: ${escapeHtml(newItem.productInfo || '미기재')}\n` +
                  `📝 상세내용: ${safeDetails}`
                : `💬 [상담 신청 접수]\n\n` +
                  `👤 성함: ${safeName}\n` +
                  `📱 연락처: ${safePhone}\n` +
                  `🏗️ 시공품목: ${escapeHtml(newItem.productType || '미기재')}\n` +
                  `📝 상세내용: ${safeDetails}`;

            fetch('https://us-central1-project-dog-1-51759630-ea08b.cloudfunctions.net/sendTelegramAlert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            }).catch(err => console.error('텔레그램 알림 발송 실패:', err));
        } catch (error) {
            console.warn('⚠️ 텔레그램 알림 로직 에러:', error);
        }
    },

    fetchConsultations: async () => {
        try {
            const q = query(collection(db, 'consultations'), orderBy('date', 'desc'));
            const snap = await getDocs(q);
            const list = snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
            set({ consultations: list });
        } catch {
            // Firestore 실패 시 현재 상태 유지
        }
    }
}));
