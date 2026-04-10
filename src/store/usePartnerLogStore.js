import { create } from 'zustand';
import { db } from '../lib/firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

export const usePartnerLogStore = create((set) => ({
    logs: [],
    isLoading: false,
    
    // 로그 구독 (초기화)
    initLogs: () => {
        const logsRef = collection(db, 'partner_activity_logs');
        const q = query(logsRef, orderBy('timestamp', 'desc'), limit(100)); // 최신 100개만 가져오기
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const logsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            set({ logs: logsData });
        });
        
        return unsubscribe;
    },
    
    // 활동 로그 추가
    addLog: async ({ actionType, userId, userName, details }) => {
        try {
            const logsRef = collection(db, 'partner_activity_logs');
            await addDoc(logsRef, {
                actionType, // 'LOGIN', 'UPDATE_INVENTORY', 'UPDATE_PRODUCT', 'SYSTEM'
                userId: userId || 'unknown',
                userName: userName || '알 수 없음',
                details,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error adding activity log:', error);
        }
    }
}));
