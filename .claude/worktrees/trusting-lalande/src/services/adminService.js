import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';

/**
 * 제품 카테고리에 따른 단위 및 수량 표기 결정 로직
 * 모든 계산의 기본이 되는 공통 함수
 */
export function formatOrderUnit(item) {
    const category = item.category || '';
    const qty = item.quantity || 0;

    if (category.includes('타일') || category.includes('LVT') || category.includes('PST') || category.includes('데코타일')) {
        return {
            displayQty: `${qty} Box`,
            unit: 'Box'
        };
    } else if (category.includes('장판') || category.includes('시트') || category.includes('롤')) {
        return {
            displayQty: `${qty} M`,
            unit: 'M'
        };
    }
    return {
        displayQty: `${qty} 개`,
        unit: '개'
    };
}

/**
 * 미래하우징 주문 처리 커스텀 함수
 * @param {Object} params - 주문 데이터
 * @returns {Promise<Object>} 처리된 주문 데이터
 */
export async function handleMiraeHousingOrder({ data }) {
    // 공통 단위 결정 로직 사용
    const processedItems = data.items.map(item => {
        const unitData = formatOrderUnit(item);
        return {
            ...item,
            ...unitData
        };
    });

    return {
        ...data,
        items: processedItems,
        processedAt: new Date().toISOString(),
        vendorEmail: data.vendor_info?.email || 'admin@dailyhousing.com' // 외주처 이메일 매칭
    };
}

/**
 * 대시보드 통계 데이터 (Firestore 실제 데이터 기반)
 */
export const getAdminStats = async () => {
    try {
        const snap = await getDocs(query(collection(db, 'orders'), orderBy('date', 'desc')));
        const orders = snap.docs.map(d => d.data());

        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => o.status === 'PAID' || o.status === 'PREPARING' || o.status === 'pending' || o.status === 'processing').length;
        const completedOrders = orders.filter(o => o.status === 'DELIVERED' || o.status === 'completed').length;
        const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

        const recentActivity = orders.slice(0, 3).map((o, i) => ({
            id: i + 1,
            type: 'order',
            message: `주문 ${o.orderId} (${o.customer || '고객'}) — ${o.statusLabel || o.status}`,
            time: o.date ? new Date(o.date).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''
        }));

        return { totalOrders, pendingOrders, completedOrders, totalRevenue, recentActivity };
    } catch {
        // Firestore 실패 시 기본값 반환
        return {
            totalOrders: 0, pendingOrders: 0, completedOrders: 0, totalRevenue: 0,
            recentActivity: [{ id: 1, type: 'info', message: 'Firestore 연결을 확인해 주세요.', time: '' }]
        };
    }
};

/**
 * 주문 상태 저장 (Firestore)
 */
export const saveOrder = async (orderId, data) => {
    try {
        if (data.firestoreId) {
            await updateDoc(doc(db, 'orders', data.firestoreId), {
                status: data.status,
                statusLabel: data.statusLabel || data.status,
                updatedAt: new Date().toISOString()
            });
        }
        return { success: true, message: '주문 정보가 저장되었습니다.' };
    } catch {
        return { success: false, message: '저장에 실패했습니다.' };
    }
};

/**
 * 홈페이지 콘텐츠 조회 (CMS)
 * Firestore 접근 실패 시 localStorage를 폴백으로 사용
 */
// Helper for Firestore timeout
const withTimeout = (promise, ms = 5000) => {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms))
    ]);
};

export const getHomepageContent = async () => {
    // 1. Check localStorage FIRST for speed and stability
    const localData = localStorage.getItem('homepage_cms_content');
    if (localData) {
        try {
            return JSON.parse(localData);
        } catch { /* ignore */ }
    }

    try {
        // Try Firestore with timeout
        const docRef = doc(db, 'site_config', 'homepage');
        const docSnap = await withTimeout(getDoc(docRef));
        if (docSnap.exists()) {
            const data = docSnap.data();
            localStorage.setItem('homepage_cms_content', JSON.stringify(data));
            return data;
        }
    } catch (error) {
        console.warn("Firestore access bypassed or failed:", error.message);
    }

    return null;
};

export const updateSiteContent = async (key, newValue) => {
    // Always update localStorage immediately
    let updatedData = {};
    try {
        const currentData = await getHomepageContent() || {};
        updatedData = { ...currentData, [key]: newValue };
        localStorage.setItem('homepage_cms_content', JSON.stringify(updatedData));
    } catch (err) {
        console.error("Local storage update failed:", err);
    }

    // Attempt Firestore update but don't let it block or crash the UI
    try {
        const docRef = doc(db, 'site_config', 'homepage');
        const docSnap = await withTimeout(getDoc(docRef));

        if (docSnap.exists()) {
            await withTimeout(updateDoc(docRef, { [key]: newValue }));
        } else {
            await withTimeout(setDoc(docRef, updatedData));
        }
        return true;
    } catch (error) {
        console.error("Firestore update failed:", error.message);
        throw new Error("클라우드 저장 실패. 브라우저에만 저장되었습니다.");
    }
};

/**
 * 발주서 다운로드 (Mock)
 */
export const downloadOrderSheet = async (order) => {
    console.log(`Downloading order sheet for ${order.id}`);
    return new Promise((resolve) => {
        setTimeout(() => {
            // 실제 환경에서는 파일 블롭을 생성하여 다운로드 트리거
            resolve({ success: true, filename: `발주서_${order.id}_${order.customer}.pdf` });
        }, 1200);
    });
};
