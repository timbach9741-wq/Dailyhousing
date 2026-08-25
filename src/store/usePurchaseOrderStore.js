import { create } from 'zustand';
import { db } from '../lib/firebase';
import { collection, addDoc, setDoc, doc, getDocs, deleteDoc, orderBy, query } from 'firebase/firestore';

export const usePurchaseOrderStore = create((set, get) => ({
    purchaseOrders: [],
    loading: false,

    fetchPurchaseOrders: async () => {
        set({ loading: true });
        try {
            const q = query(collection(db, 'purchaseOrders'), orderBy('updatedAt', 'desc'));
            const snap = await getDocs(q);
            const list = snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
            set({ purchaseOrders: list, loading: false });
        } catch (error) {
            console.warn('⚠️ fetchPurchaseOrders 실패:', error?.message);
            set({ loading: false });
        }
    },

    // firestoreId가 있으면 덮어쓰기(수정), 없으면 새로 생성
    savePurchaseOrder: async (data) => {
        const payload = { ...data, updatedAt: new Date().toISOString() };
        delete payload.firestoreId;

        if (data.firestoreId) {
            await setDoc(doc(db, 'purchaseOrders', data.firestoreId), payload, { merge: true });
            set((state) => ({
                purchaseOrders: state.purchaseOrders.map(po =>
                    po.firestoreId === data.firestoreId ? { firestoreId: data.firestoreId, ...payload } : po
                )
            }));
            return data.firestoreId;
        }

        payload.createdAt = payload.updatedAt;
        const docRef = await addDoc(collection(db, 'purchaseOrders'), payload);
        set((state) => ({
            purchaseOrders: [{ firestoreId: docRef.id, ...payload }, ...state.purchaseOrders]
        }));
        return docRef.id;
    },

    deletePurchaseOrder: async (firestoreId) => {
        await deleteDoc(doc(db, 'purchaseOrders', firestoreId));
        set((state) => ({
            purchaseOrders: state.purchaseOrders.filter(po => po.firestoreId !== firestoreId)
        }));
    }
}));
