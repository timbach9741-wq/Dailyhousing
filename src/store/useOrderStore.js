import { create } from 'zustand';
import { db } from '../lib/firebase';
import { collection, getDocs, getDoc, doc, updateDoc, setDoc, query, orderBy, where } from 'firebase/firestore';

export const useOrderStore = create((set, get) => ({
    orders: [],

    // 내 주문 불러오기 (유저별)
    fetchMyOrders: async (uid) => {
        try {
            const q = query(
                collection(db, 'orders'),
                where('uid', '==', uid)
            );
            const snap = await getDocs(q);
            const list = snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
            list.sort((a, b) => new Date(b.date) - new Date(a.date));
            set({ orders: list });
        } catch (error) {
            console.warn('⚠️ fetchMyOrders - Firestore 조회 실패:', error?.message);
        }
    },

    // 비회원 주문 조회 (주문번호 + 연락처)
    fetchGuestOrder: async (orderId, phone) => {
        try {
            const docRef = doc(db, 'orders', orderId);
            const snap = await getDoc(docRef);
            if (!snap.exists()) return { success: false, error: '일치하는 주문 내역이 없습니다.' };

            const data = snap.data();
            if (data.phone !== phone) return { success: false, error: '일치하는 주문 내역이 없습니다.' };

            const list = [{ firestoreId: snap.id, ...data }];

            // 최신순 정렬
            list.sort((a, b) => new Date(b.date) - new Date(a.date));

            set({ orders: list });
            return { success: true };
        } catch (err) {
            console.error('❌ fetchGuestOrder - 주문 조회 실패:', err);
            return { success: false, error: '조회 중 오류가 발생했습니다.' };
        }
    },

    // 전체 주문 불러오기 (어드민용)
    fetchAllOrders: async () => {
        try {
            const q = query(collection(db, 'orders'), orderBy('date', 'desc'));
            const snap = await getDocs(q);
            return snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
        } catch (error) {
            console.warn('⚠️ fetchAllOrders - Firestore 조회 실패:', error?.message);
            return [];
        }
    },

    addOrder: async (cartItems, totalAmount, uid, userInfo = {}, isBusiness = false) => {
        const isGuest = !uid || uid === 'guest';
        const guestId = isGuest ? `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` : uid;

        const pad = (n) => String(n).padStart(2, '0');
        const now = new Date();
        const year = now.getFullYear();
        const month = pad(now.getMonth() + 1);
        const day = pad(now.getDate());
        const hours = pad(now.getHours());
        const minutes = pad(now.getMinutes());
        const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
        
        const generatedOrderId = `${year}${month}${day}-${hours}${minutes}-${randomStr}`;

        const newOrder = {
            orderId: generatedOrderId,
            date: now.toISOString(),
            status: 'PAID',
            statusLabel: '결제완료',
            totalPrice: totalAmount,
            trackingPrefix: '배송준비',
            uid: guestId,
            phone: userInfo.phone || '',
            siteManagerPhone: userInfo.siteManagerPhone || '',
            customerPhone: userInfo.phone || '',
            receiverPhone: userInfo.phone || '',
            shippingAddress: userInfo.address || '',
            receiverName: userInfo.displayName || userInfo.name || '고객',
            unloadCondition: userInfo.unloadCondition || '',
            deliveryDate: userInfo.deliveryDate || '',
            customer: userInfo.displayName || userInfo.name || '고객',
            email: userInfo.email || '',
            isGuest: isGuest,
            isBusiness: isBusiness,
            items: cartItems.map(item => {
                const price = item.product?.price || item.unitPrice || 0;
                const businessPrice = item.product?.businessPrice || 0;
                const effectivePrice = (isBusiness && businessPrice) ? businessPrice : price;
                return {
                    productName: item.product?.title || item.title || '',
                    productId: item.product?.id || item.id || '',
                    category: item.product?.category || item.category || '',
                    subCategory: item.product?.subCategory || '',
                    model_id: item.product?.model_id || '',
                    packaging: item.product?.specifications?.packaging || item.product?.packaging || '',
                    option: item.option || '',
                    unitPrice: price,
                    businessPrice: businessPrice,
                    effectiveUnitPrice: effectivePrice,
                    sellingPrice: item.product?.sellingPrice || item.sellingPrice || 0,
                    totalPrice: effectivePrice * item.qty,
                    qty: item.qty,
                    imageUrl: item.product?.imageUrl || item.imageUrl || '',
                    vendor_info: { email: 'admin@dailyhousing.com' }
                };
            }),
            delivery: { company: '-', trackingNumber: '-' }
        };

        // Firestore 저장 시도
        try {
            await setDoc(doc(db, 'orders', generatedOrderId), newOrder);
            newOrder.firestoreId = generatedOrderId;
        } catch (error) {
            console.warn('⚠️ addOrder - Firestore 저장 실패, 로컬에만 저장합니다:', error?.message);
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
            } catch (error) {
                console.warn('⚠️ addOrder - 비회원 사용자 등록 실패:', error?.message);
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
            } catch (error) { console.warn('⚠️ cancelOrder - Firestore 업데이트 실패:', error?.message); /* 로컬만 업데이트 */ }
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
