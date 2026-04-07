import { create } from 'zustand';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, setDoc, query, orderBy, where } from 'firebase/firestore';

export const useOrderStore = create((set, get) => ({
    orders: [],

    // 내 주문 불러오기 (유저별)
    fetchMyOrders: async (uid) => {
        try {
            const q = query(
                collection(db, 'orders'),
                where('uid', '==', uid),
                orderBy('date', 'desc')
            );
            const snap = await getDocs(q);
            const list = snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
            set({ orders: list });
        } catch {
            // Firestore 실패 시 현재 상태 유지
        }
    },

    // 비회원 주문 조회 (성함 + 연락처)
    fetchGuestOrder: async (name, phone) => {
        try {
            const q = query(
                collection(db, 'orders'),
                where('customer', '==', name),
                where('phone', '==', phone)
            );
            const snap = await getDocs(q);
            if (snap.empty) return { success: false, error: '일치하는 주문 내역이 없습니다.' };

            const list = snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));

            // 최신순 정렬
            list.sort((a, b) => new Date(b.date) - new Date(a.date));

            set({ orders: list });
            return { success: true };
        } catch (err) {
            console.error('Guest order lookup error:', err);
            return { success: false, error: '조회 중 오류가 발생했습니다.' };
        }
    },

    // 전체 주문 불러오기 (어드민용)
    fetchAllOrders: async () => {
        try {
            const q = query(collection(db, 'orders'), orderBy('date', 'desc'));
            const snap = await getDocs(q);
            return snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
        } catch {
            return [];
        }
    },

    addOrder: async (cartItems, totalAmount, uid, userInfo = {}) => {
        const isGuest = !uid || uid === 'guest';
        const guestId = isGuest ? `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` : uid;

        const newOrder = {
            orderId: `ORD-2026-${Math.floor(Math.random() * 89999) + 10000}`,
            date: new Date().toISOString(),
            status: 'PAID',
            statusLabel: '결제완료',
            totalPrice: totalAmount,
            trackingPrefix: '배송준비',
            uid: guestId,
            phone: userInfo.phone || '',
            customer: userInfo.displayName || userInfo.name || '고객',
            email: userInfo.email || '',
            isGuest: isGuest,
            items: cartItems.map(item => ({
                productName: item.product?.title || item.title || '',
                category: item.product?.category || item.category || '',
                subCategory: item.product?.subCategory || '',
                option: item.option || '',
                unitPrice: item.product?.price || item.unitPrice || 0,
                totalPrice: (item.product?.price || item.unitPrice || 0) * item.qty,
                qty: item.qty,
                imageUrl: item.product?.imageUrl || item.imageUrl || '',
                vendor_info: { email: 'admin@dailyhousing.com' }
            })),
            delivery: { company: '-', trackingNumber: '-' }
        };

        // Firestore 저장 시도
        try {
            const docRef = await addDoc(collection(db, 'orders'), newOrder);
            newOrder.firestoreId = docRef.id;
        } catch {
            console.warn('Firestore 저장 실패, 로컬에만 저장합니다.');
        }

        // 비회원일 경우 users 컬렉션에도 자동 등록 (회원관리에서 조회 가능)
        if (isGuest && (userInfo.phone || userInfo.name)) {
            try {
                await setDoc(doc(db, 'users', guestId), {
                    displayName: userInfo.displayName || userInfo.name || '비회원',
                    email: userInfo.email || '',
                    phone: userInfo.phone || '',
                    address: userInfo.address || '',
                    isGuest: true,
                    role: 'guest',
                    createdAt: new Date().toISOString(),
                    lastOrderDate: new Date().toISOString()
                }, { merge: true });
            } catch {
                console.warn('비회원 사용자 등록 실패');
            }
        }

        set({ orders: [newOrder, ...get().orders] });
        return newOrder.orderId;
    },

    cancelOrder: async (orderId) => {
        const order = get().orders.find(o => o.orderId === orderId);
        if (order?.firestoreId) {
            try {
                await updateDoc(doc(db, 'orders', order.firestoreId), {
                    status: 'CANCELED',
                    statusLabel: '주문취소'
                });
            } catch { /* 로컬만 업데이트 */ }
        }
        set({
            orders: get().orders.map(o =>
                o.orderId === orderId
                    ? { ...o, status: 'CANCELED', statusLabel: '주문취소' }
                    : o
            )
        });
    }
}));
