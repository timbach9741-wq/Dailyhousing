import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import ExcelJS from 'exceljs';

/**
 * 제품 카테고리에 따른 단위 및 수량 표기 결정 로직
 * 모든 계산의 기본이 되는 공통 함수
 */
export function formatOrderUnit(item) {
    const category = item.category || '';
    const qty = item.quantity || 0;
    const packaging = item.packaging || item.specifications?.packaging || '';

    // 타일/LVT/데코타일 → Box
    if (category.includes('타일') || category.includes('LVT') || category.includes('PST') || category.includes('데코타일')) {
        return {
            displayQty: `${qty} Box`,
            unit: 'Box'
        };
    }
    // 에디톤 → Box
    if (category.includes('에디톤')) {
        return {
            displayQty: `${qty} Box`,
            unit: 'Box'
        };
    }
    // 마루 → Box
    if (category.includes('마루')) {
        return {
            displayQty: `${qty} Box`,
            unit: 'Box'
        };
    }
    // 시트/장판/롤 제품 → R(롤)
    if (category.includes('장판') || category.includes('시트') || category.includes('롤') || category.includes('프리미엄') || category.includes('스탠다드') || category.includes('엑스컴포트')) {
        // 롤 포장 단위가 있는 경우 → 롤 수량으로 변환 표시
        const rollMatch = packaging.match(/(\d+)M/i);
        if (rollMatch) {
            const rollLength = parseInt(rollMatch[1]);
            const rollQty = rollLength > 0 && qty >= rollLength ? Math.round(qty / rollLength) : qty;
            return {
                displayQty: `${rollQty} 롤`,
                unit: 'R'
            };
        }
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
    } catch (error) {
        console.warn('⚠️ getAdminStats - Firestore 조회 실패:', error?.message);
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
            const updatePayload = {
                status: data.status,
                statusLabel: data.statusLabel || data.status,
                updatedAt: new Date().toISOString()
            };
            if (data.deliveryCompany || data.trackingNumber) {
                updatePayload.delivery = {
                    company: data.deliveryCompany || '-',
                    trackingNumber: data.trackingNumber || '-'
                };
            }
            await updateDoc(doc(db, 'orders', data.firestoreId), updatePayload);
        }
        return { success: true, message: '주문 정보가 저장되었습니다.' };
    } catch (error) {
        console.error('❌ saveOrder - 주문 저장 실패:', error?.message);
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
        } catch (error) { console.warn('⚠️ getHomepageContent - localStorage 파싱 실패:', error); }
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
        console.warn("Firestore update failed (localStorage saved):", error.message);
        return true; // localStorage에 이미 저장됨
    }
};

/**
 * 주문서 Excel 다운로드
 */
export const downloadOrderSheet = async (orders) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('주문서');

        // 헤더 정의
        worksheet.columns = [
            { header: '주문번호', key: 'orderId', width: 15 },
            { header: '고객명', key: 'customerName', width: 15 },
            { header: '상품명', key: 'productName', width: 25 },
            { header: '수량', key: 'quantity', width: 10 },
            { header: '가격', key: 'price', width: 15 },
            { header: '배송지', key: 'address', width: 30 },
            { header: '주문일', key: 'createdAt', width: 15 }
        ];

        // 헤더 스타일
        worksheet.getRow(1).eachCell(cell => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A1A2E' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        // 데이터 추가
        const orderList = Array.isArray(orders) ? orders : [orders];
        orderList.forEach(order => {
            const items = order.items || [];
            if (items.length > 0) {
                items.forEach(item => {
                    worksheet.addRow({
                        orderId: order.orderId || order.id,
                        customerName: order.customer || order.delivery?.name || '-',
                        productName: item.productName || item.title || '-',
                        quantity: item.quantity || item.qty || 1,
                        price: item.totalPrice || item.price || 0,
                        address: order.delivery?.address || order.address || '-',
                        createdAt: order.date ? new Date(order.date).toLocaleDateString('ko-KR') : '-'
                    });
                });
            } else {
                worksheet.addRow({
                    orderId: order.orderId || order.id,
                    customerName: order.customer || order.delivery?.name || '-',
                    productName: '-',
                    quantity: 0,
                    price: order.totalPrice || 0,
                    address: order.delivery?.address || order.address || '-',
                    createdAt: order.date ? new Date(order.date).toLocaleDateString('ko-KR') : '-'
                });
            }
        });

        // 자동 필터
        worksheet.autoFilter = {
            from: 'A1',
            to: `G${worksheet.rowCount}`
        };

        // 파일 다운로드
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `주문서_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return { success: true };
    } catch (error) {
        console.error('❌ 주문서 다운로드 실패:', error);
        return { success: false, error: error.message };
    }
};
