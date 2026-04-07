import { create } from 'zustand';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, orderBy, query } from 'firebase/firestore';

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
