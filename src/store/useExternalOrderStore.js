// 외부 주문(전화/카카오/현장 등) 일정 관리 전용 스토어
// 기존 orders(사이트 주문)와 완전 분리된 별도 컬렉션 사용
import { create } from 'zustand';
import { db } from '../lib/firebase';
import {
    collection, getDocs, doc, setDoc, updateDoc, deleteDoc,
    query, orderBy
} from 'firebase/firestore';

const COLLECTION = 'external_orders';

// 고유 ID 생성: EXT-20260410-A1B2
const generateId = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const datePart = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `EXT-${datePart}-${rand}`;
};

export const useExternalOrderStore = create((set, get) => ({
    orders: [],
    loading: false,

    // 전체 외부 주문 불러오기
    fetchAll: async () => {
        set({ loading: true });
        try {
            const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            const list = snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
            set({ orders: list });
        } catch (error) {
            console.error('external_orders fetch error:', error);
        } finally {
            set({ loading: false });
        }
    },

    // 새 외부 주문 등록
    add: async (data) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newOrder = {
            id,
            customerName: data.customerName || '',
            phone: data.phone || '',
            productName: data.productName || '',
            quantity: data.quantity || '',
            unitPrice: Number(data.unitPrice) || 0,
            totalPrice: Number(data.totalPrice) || 0,
            deliveryDate: data.deliveryDate || '',
            channel: data.channel || 'phone',
            address: data.address || '',
            memo: data.memo || '',
            status: 'received', // received, preparing, shipped, delivered
            createdAt: now,
            updatedAt: now,
        };

        try {
            await setDoc(doc(db, COLLECTION, id), newOrder);
            set({ orders: [{ firestoreId: id, ...newOrder }, ...get().orders] });
            return { success: true, id };
        } catch (error) {
            console.error('external_orders add error:', error);
            return { success: false, error: error.message };
        }
    },

    // 외부 주문 수정
    update: async (id, data) => {
        const updateData = { ...data, updatedAt: new Date().toISOString() };
        try {
            await updateDoc(doc(db, COLLECTION, id), updateData);
            set({
                orders: get().orders.map(o =>
                    o.id === id ? { ...o, ...updateData } : o
                )
            });
            return { success: true };
        } catch (error) {
            console.error('external_orders update error:', error);
            return { success: false, error: error.message };
        }
    },

    // 상태만 빠르게 변경
    updateStatus: async (id, status) => {
        return get().update(id, { status });
    },

    // 외부 주문 삭제
    remove: async (id) => {
        try {
            await deleteDoc(doc(db, COLLECTION, id));
            set({ orders: get().orders.filter(o => o.id !== id) });
            return { success: true };
        } catch (error) {
            console.error('external_orders remove error:', error);
            return { success: false, error: error.message };
        }
    },
}));
