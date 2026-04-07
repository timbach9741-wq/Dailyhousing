import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { handleMiraeHousingOrder, getAdminStats, saveOrder, getHomepageContent, updateSiteContent } from '../services/adminService';
import { downloadPurchaseOrder } from '../services/excelService';
import { resetPassword } from '../services/authService';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { useProductStore } from '../store/useProductStore';
import { useConsultationStore } from '../store/useConsultationStore';
import { useOrderStore } from '../store/useOrderStore';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, setDoc, query, orderBy, deleteDoc, updateDoc, where, writeBatch, limit } from 'firebase/firestore';
import { updateApprovalToSheets } from '../services/googleSheetsService';
import DaumPostcode from 'react-daum-postcode';
import PurchaseOrderForm from '../components/PurchaseOrderForm';
import * as XLSX from 'xlsx';

/* ── 날짜 헬퍼 ── */
const startOfDay = (d) => { const c = new Date(d); c.setHours(0,0,0,0); return c; };
const startOfWeek = (d) => { const c = startOfDay(d); c.setDate(c.getDate() - c.getDay()); return c; };
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const startOfYear = (d) => new Date(d.getFullYear(), 0, 1);

const filterByDateRange = (orders, range) => {
    const now = new Date();
    let start;
    switch (range) {
        case 'today': start = startOfDay(now); break;
        case 'week': start = startOfWeek(now); break;
        case 'month': start = startOfMonth(now); break;
        case 'year': start = startOfYear(now); break;
        default: return orders;
    }
    return orders.filter(o => o.date && new Date(o.date) >= start);
};

const calcRevenueStats = (orders, products) => {
    if (!orders.length) return { daily: 0, weekly: 0, monthly: 0, yearly: 0, avgDaily: 0, avgMonthly: 0, profitDaily: 0, profitWeekly: 0, profitMonthly: 0, profitYearly: 0 };
    const now = new Date();
    const today = filterByDateRange(orders, 'today');
    const week = filterByDateRange(orders, 'week');
    const month = filterByDateRange(orders, 'month');
    const year = filterByDateRange(orders, 'year');
    const sum = (arr) => arr.reduce((s, o) => s + (o.totalPrice || 0), 0);

    // 수익 계산: 판매액 - (매입가 × 수량)
    const productMap = {};
    (products || []).forEach(p => { if (p.id) productMap[p.id] = p; });
    const calcProfit = (arr) => arr.reduce((s, o) => {
        const items = o.items || o.originalItems || [];
        const orderRevenue = o.totalPrice || 0;
        let orderCost = 0;
        items.forEach(item => {
            const pId = item.productId || item.id;
            const matched = pId ? productMap[pId] : null;
            const sellingPrice = item.sellingPrice || matched?.sellingPrice || 0;
            const qty = item.qty || item.quantity || 0;
            orderCost += sellingPrice * qty;
        });
        return s + (orderRevenue - orderCost);
    }, 0);
    
    // 평균 계산
    const dayOfYear = Math.ceil((now - startOfYear(now)) / 86400000) || 1;
    const monthOfYear = now.getMonth() + 1;
    const allSum = sum(year);
    
    return {
        daily: sum(today),
        weekly: sum(week),
        monthly: sum(month),
        yearly: allSum,
        avgDaily: Math.round(allSum / dayOfYear),
        avgMonthly: Math.round(allSum / monthOfYear),
        todayCount: today.length,
        weekCount: week.length,
        monthCount: month.length,
        yearCount: year.length,
        profitDaily: calcProfit(today),
        profitWeekly: calcProfit(week),
        profitMonthly: calcProfit(month),
        profitYearly: calcProfit(year)
    };
};


const AdminDashboard = () => {
    const { user } = useAuthStore();
    const { addToast } = useToastStore();

    const { products, initProducts, addProduct, updateProduct, removeProduct } = useProductStore();
    const { fetchAllOrders, addOrder } = useOrderStore();

    const [stats, setStats] = useState({ totalOrders: 0, pendingOrders: 0, completedOrders: 0, totalRevenue: 0, recentActivity: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('orders');
    const [orderFilter, setOrderFilter] = useState('all');
    const [cmsContent, setCmsContent] = useState(null);
    const [cmsSaving, setCmsSaving] = useState(false);

    // 사이트 설정 (사업자 정보)
    const [bizSettings, setBizSettings] = useState({
        ceoName: '', bizNumber: '', ecomNumber: '', companyName: '', bankAccount: ''
    });
    const [bizSaving, setBizSaving] = useState(false);

    // 기간별 필터
    const [dateFilter, setDateFilter] = useState('all');
    const [revenueView, setRevenueView] = useState('monthly');

    // 제품 관리 상태
    const [productSearch, setProductSearch] = useState('');
    const [editingProduct, setEditingProduct] = useState(null);
    const [productSaving, setProductSaving] = useState(false);
    const [productCategory, setProductCategory] = useState('all');
    const [newProductModal, setNewProductModal] = useState(false);
    const [adjustStockModal, setAdjustStockModal] = useState(null); // { product, type: 'in' | 'out', amount: '' }
    const [newProduct, setNewProduct] = useState({
        title: '', model_id: '', categoryId: 'residential', subCategory: '',
        price: 0, businessPrice: 0, sellingPrice: 0, imageUrl: '', thickness: 5,
        patterns: [], tags: [], priceUnit: 'm²',
        specifications: { size: '', material: '' }
    });

    const [isUploadingExcel, setIsUploadingExcel] = useState(false);
    
    // 재고 변동 내역 모달 상태
    const [showInventoryLogs, setShowInventoryLogs] = useState(false);
    const [inventoryLogs, setInventoryLogs] = useState([]);
    const [inventoryLogFilter, setInventoryLogFilter] = useState('daily'); // 'daily', 'weekly', 'monthly'
    const [inventoryLogsLoading, setInventoryLogsLoading] = useState(false);

    // 인라인 재고 관리 상태
    const [inlineStock, setInlineStock] = useState({});
    const [allInventoryLogs, setAllInventoryLogs] = useState([]);
    const [stockViewPeriod, setStockViewPeriod] = useState('daily'); // daily, weekly, monthly, yearly
    
    // 전체 재고 로그 프리패치
    useEffect(() => {
        const fetchAllLogs = async () => {
            try {
                const snap = await getDocs(query(collection(db, 'inventory_logs'), orderBy('createdAt', 'desc'), limit(2000)));
                setAllInventoryLogs(snap.docs.map(d => ({id: d.id, ...d.data()})));
            } catch(e) { console.error('fetch all inventory logs error', e); }
        };
        fetchAllLogs();
    }, []);

    // 사용자 관리 상태
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [userSearch, setUserSearch] = useState('');
    const [userFilter, setUserFilter] = useState('all'); // 'all', 'pending', 'approved'
    const [selectedUser, setSelectedUser] = useState(null); // 회원 상세 모달
    const [selectedUserOrders, setSelectedUserOrders] = useState([]);
    const [banConfirm, setBanConfirm] = useState(null); // { uid, displayName, action: 'ban'|'unban' }

    // 전화 주문 상담 모달
    const [proxyOrderModal, setProxyOrderModal] = useState(false);
    const [proxySearch, setProxySearch] = useState('');
    const [proxyTarget, setProxyTarget] = useState(null);
    const [proxyStep, setProxyStep] = useState(1); // 1:고객검색 2:배송정보 3:제품선택 4:확인
    const [proxyDelivery, setProxyDelivery] = useState({ name: '', phone: '', address: '', addressDetail: '', memo: '' });
    const [proxyCart, setProxyCart] = useState([]); // [{ product, qty, option }]
    const [proxyProductSearch, setProxyProductSearch] = useState('');
    const [proxyPostcodeOpen, setProxyPostcodeOpen] = useState(false);

    // 세금계산서 발급 모달
    const [taxInvoiceModal, setTaxInvoiceModal] = useState(null);

    // 발주서 양식 모달
    const [purchaseOrderModal, setPurchaseOrderModal] = useState(null); // null 또는 order 객체

    // 재고 로그 로딩 함수
    const fetchInventoryLogs = async () => {
        setInventoryLogsLoading(true);
        try {
            // Firestore에서 최신 순으로 가져옴
            const qRef = query(collection(db, 'inventory_logs'), orderBy('createdAt', 'desc'), limit(500));
            const snap = await getDocs(qRef);
            const logs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setInventoryLogs(logs);
        } catch (error) {
            console.error('❌ 재고 로그 로딩 실패:', error);
            addToast('재고 변동 내역을 불러오는데 실패했습니다.', 'error');
        } finally {
            setInventoryLogsLoading(false);
        }
    };

    // 실시간 수시 재고 조정 (개별 업데이트)
    const handleStockAdjust = async () => {
        if (!adjustStockModal || !adjustStockModal.amount || isNaN(adjustStockModal.amount)) return;
        const amt = parseInt(adjustStockModal.amount, 10);
        if (amt <= 0) return addToast('수량은 1 이상의 올바른 숫자를 입력해주세요.', 'warning');
        
        const { product, type } = adjustStockModal;
        const prevStock = product.inventory || 0;
        let finalStock = prevStock;
        let inAmt = 0; let outAmt = 0;

        if (type === 'in') {
            finalStock += amt;
            inAmt = amt;
        } else {
            finalStock -= amt;
            if (finalStock < 0) finalStock = 0;
            outAmt = amt;
        }

        try {
            const batch = writeBatch(db);
            const pRef = doc(db, 'products', product.id);
            batch.update(pRef, { inventory: finalStock, status: finalStock === 0 ? '일시품절' : '판매중' });

            const logRef = doc(collection(db, 'inventory_logs'));
            const newLog = {
                productId: product.id,
                title: product.title,
                model_id: product.model_id,
                prevStock,
                inbound: inAmt,
                outbound: outAmt,
                finalStock,
                createdAt: new Date().toISOString()
            };
            batch.set(logRef, newLog);

            await batch.commit();

            addToast(`재고가 성공적으로 반영되었습니다. (${type === 'in' ? '+' : '-'}${amt})`, 'success');
            setAdjustStockModal(null);
            
            // 스토어 즉시 업데이트 (로컬 UI 즉시 갱신)
            if (updateProduct) {
                updateProduct(product.id, { 
                    inventory: finalStock, 
                    status: finalStock === 0 ? '일시품절' : '판매중' 
                });
            } else if (initProducts) {
                initProducts();
            }

            // 통계용 로그 배열 업데이트
            setAllInventoryLogs(prev => [{id: logRef.id, ...newLog}, ...prev]);

        } catch (e) {
            console.error('재고 변경 실패:', e);
            addToast('재고 변경에 실패했습니다.', 'error');
        }
    };

    // 기간별 재고 통계 계산
    const productStats = useMemo(() => {
        const stats = {};
        const now = new Date();
        let startTime;
        if (stockViewPeriod === 'daily') startTime = startOfDay(now);
        else if (stockViewPeriod === 'weekly') startTime = startOfWeek(now);
        else if (stockViewPeriod === 'monthly') startTime = startOfMonth(now);
        else startTime = startOfYear(now);

        allInventoryLogs.forEach(log => {
            const d = new Date(log.createdAt || log.date);
            if (d >= startTime) {
                if (!stats[log.productId]) stats[log.productId] = { in: 0, out: 0 };
                stats[log.productId].in += (Number(log.inbound) || 0);
                stats[log.productId].out += (Number(log.outbound) || 0);
            }
        });
        return stats;
    }, [allInventoryLogs, stockViewPeriod]);

    // 인라인 재고 적용
    const applyInlineStock = async (productId, product) => {
        const data = inlineStock[productId];
        if (!data) return;
        const inAmt = parseInt(data.in || 0, 10);
        const outAmt = parseInt(data.out || 0, 10);
        if (isNaN(inAmt) && isNaN(outAmt)) return;
        const finalIn = isNaN(inAmt) ? 0 : inAmt;
        const finalOut = isNaN(outAmt) ? 0 : outAmt;
        if (finalIn === 0 && finalOut === 0) return;

        setProductSaving(true);
        try {
            const batch = writeBatch(db);
            const prevStock = product.inventory || 0;
            let finalStock = prevStock + finalIn - finalOut;
            if (finalStock < 0) finalStock = 0;

            const docRef = doc(db, 'products', productId);
            const newStatus = finalStock <= 0 ? '일시품절' : '판매중';
            batch.update(docRef, { inventory: finalStock, status: newStatus, updatedAt: new Date().toISOString() });

            const logRef = doc(collection(db, 'inventory_logs'));
            const newLog = {
                productId,
                title: product.title,
                model_id: product.model_id,
                prevStock,
                inbound: finalIn,
                outbound: finalOut,
                finalStock,
                createdAt: new Date().toISOString()
            };
            batch.set(logRef, newLog);

            await batch.commit();

            updateProduct(productId, { inventory: finalStock, status: newStatus }); 
            setInlineStock(prev => { const n = {...prev}; delete n[productId]; return n; });
            addToast(`재고 반영 완료! (입출고 ${finalIn - finalOut})`, 'success');
            
            setAllInventoryLogs(prev => [{id: logRef.id, ...newLog}, ...prev]);

            // 스토어 업데이트 (UI 즉시 반영용)
            updateProduct(productId, { inventory: finalStock, status: newStatus });

        } catch (e) {
            console.error(e);
            addToast('재고 변경에 실패했습니다.', 'error');
        } finally {
            setProductSaving(false);
        }
    };



    const [expandedCustomer, setExpandedCustomer] = useState({}); // { email: true/false }

    // 상담 관리 상태
    const { consultations, fetchConsultations } = useConsultationStore();
    const [consultFilter, setConsultFilter] = useState('all');
    const [consultSearch, setConsultSearch] = useState('');

    const [processedOrders, setProcessedOrders] = useState([]);

    // 기간별 필터 적용 + 상태 필터 적용
    const dateFilteredOrders = useMemo(() => filterByDateRange(processedOrders, dateFilter), [processedOrders, dateFilter]);
    const filteredOrders = dateFilteredOrders.filter(order => {
        if (orderFilter === 'all') return true;
        if (orderFilter === 'pending') return ['pending', 'processing', 'PAID', 'PREPARING'].includes(order.status);
        if (orderFilter === 'completed') return ['completed', 'DELIVERED'].includes(order.status);
        return true;
    });

    // 매출 통계 계산
    const revenueStats = useMemo(() => calcRevenueStats(processedOrders, products), [processedOrders, products]);

    // 회원 상세 조회
    const handleUserDetail = async (u) => {
        setSelectedUser(u);
        try {
            const q2 = query(collection(db, 'orders'), where('uid', '==', u.id));
            const snap = await getDocs(q2);
            const list = snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
            list.sort((a, b) => new Date(b.date) - new Date(a.date));
            setSelectedUserOrders(list);
        } catch (error) {
            console.error('❌ 회원 주문내역 조회 실패:', error);
            setSelectedUserOrders([]);
        }
    };

    // 자주 구매한 제품 집계
    const getFrequentProducts = (orders) => {
        const map = {};
        orders.forEach(o => (o.items || []).forEach(item => {
            const key = item.productName || item.title || '';
            if (!key) return;
            if (!map[key]) map[key] = { name: key, count: 0, totalQty: 0, imageUrl: item.imageUrl };
            map[key].count++;
            map[key].totalQty += item.qty || 0;
        }));
        return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 5);
    };

    // 카테고리 목록 추출
    const productCategories = useMemo(() => {
        const cats = new Set();
        products.forEach(p => {
            if (p.subCategory) cats.add(p.subCategory);
        });
        return ['all', ...Array.from(cats).sort()];
    }, [products]);

    // 제품 필터링 (카테고리 + 검색어)
    const filteredProducts = products.filter(p => {
        // 카테고리 필터
        if (productCategory !== 'all' && p.subCategory !== productCategory) return false;
        // 검색어 필터
        if (!productSearch.trim()) return true;
        const q = productSearch.toLowerCase();
        return (p.title || '').toLowerCase().includes(q) ||
            (p.model_id || '').toLowerCase().includes(q) ||
            (p.subCategory || '').toLowerCase().includes(q);
    });

    // 카테고리별 제품 수
    const categoryCount = useMemo(() => {
        const counts = { all: products.length };
        products.forEach(p => {
            if (p.subCategory) {
                counts[p.subCategory] = (counts[p.subCategory] || 0) + 1;
            }
        });
        return counts;
    }, [products]);

    // 사용자 필터링
    const filteredUsers = users.filter(u => {
        // 탭 상태에 따른 엄격한 분리
        if (userFilter === 'pending') {
            if (u.approved !== false) return false;
        } else if (userFilter === 'guest') {
            if (!u.isGuest && u.role !== 'guest') return false;
        } else if (userFilter === 'banned') {
            if (!u.banned) return false;
        } else if (userFilter === 'individual') {
            if (u.role !== 'individual' || u.approved === false || u.banned) return false;
        } else if (userFilter === 'business') {
            if (u.role !== 'business' || u.approved === false || u.banned) return false;
        } else if (userFilter === 'all') {
            // 'all' 탭에서는 승인 대기, 비회원, 퇴출 회원을 제외하고 모두 노출
            if (u.approved === false || u.banned || u.isGuest || u.role === 'guest') return false;
        }
        
        if (!userSearch.trim()) return true;
        const q = userSearch.toLowerCase();
        return (u.email || '').toLowerCase().includes(q) ||
            (u.displayName || '').toLowerCase().includes(q) ||
            (u.phone || u.phoneNumber || '').includes(q);
    });

    const pendingUsersCount = users.filter(u => u.approved === false).length;
    const guestUsersCount = users.filter(u => u.isGuest || u.role === 'guest').length;
    const bannedUsersCount = users.filter(u => u.banned).length;

    // 사용자 목록 불러오기 (Firestore 전용 - 단일 소스)
    const fetchUsers = useCallback(async () => {
        setUsersLoading(true);
        try {
            const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
            const firestoreUsers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setUsers(firestoreUsers);
        } catch {
            addToast('사용자 목록을 불러오지 못했습니다.', 'error');
        } finally {
            setUsersLoading(false);
        }
    }, [addToast]);

    // 회원 퇴출 - 모달 열기
    const handleBan = (uid, displayName) => {
        setBanConfirm({ uid, displayName: displayName || '이 회원', action: 'ban' });
    };

    // 퇴출 해제 - 모달 열기
    const handleUnban = (uid, displayName) => {
        setBanConfirm({ uid, displayName: displayName || '이 회원', action: 'unban' });
    };

    // 퇴출/해제 실행
    const executeBanAction = async () => {
        if (!banConfirm) return;
        const { uid, displayName, action } = banConfirm;
        const isBan = action === 'ban';
        setBanConfirm(null);
        setUsers(prev => prev.map(u => u.id === uid ? { ...u, banned: isBan } : u));
        addToast(isBan ? `${displayName}이(가) 퇴출되었습니다.` : `${displayName} 퇴출이 해제되었습니다.`, 'success');
        try {
            await updateDoc(doc(db, 'users', uid), { banned: isBan });
        } catch (err) {
            console.log('Firestore 퇴출 처리 참고:', err);
        }
        // localStorage에도 반영
        try {
            const localUsers = JSON.parse(localStorage.getItem('floorcraft_mock_users') || '[]');
            const updated = localUsers.map(u => (u.uid === uid) ? { ...u, banned: isBan } : u);
            localStorage.setItem('floorcraft_mock_users', JSON.stringify(updated));
        } catch { /* ignore */ }
    };

    // 회원 승인 처리
    const [approveConfirm, setApproveConfirm] = useState(null); // { uid, displayName, action: 'approve'|'reject' }

    const handleApprove = (uid, displayName) => {
        setApproveConfirm({ uid, displayName: displayName || '이 회원', action: 'approve' });
    };

    const handleReject = (uid, displayName) => {
        setApproveConfirm({ uid, displayName: displayName || '이 회원', action: 'reject' });
    };

    const executeApproveAction = async () => {
        if (!approveConfirm) return;
        const { uid, displayName, action } = approveConfirm;
        const isApprove = action === 'approve';
        setApproveConfirm(null);

        if (isApprove) {
            setUsers(prev => prev.map(u => u.id === uid ? { ...u, approved: true } : u));
            addToast(`${displayName}의 가입이 승인되었습니다.`, 'success');
        } else {
            // 거절 시 사용자 삭제 (또는 banned 처리)
            setUsers(prev => prev.filter(u => u.id !== uid));
            addToast(`${displayName}의 가입이 거절되었습니다.`, 'error');
        }

        try {
            if (isApprove) {
                await updateDoc(doc(db, 'users', uid), { approved: true });
                // 구글시트에 승인 상태 업데이트
                const approvedUser = users.find(u => u.id === uid);
                if (approvedUser?.email) {
                    updateApprovalToSheets(approvedUser.email, true).catch(() => {});
                }
            } else {
                // Firestore에서 삭제
                const { deleteDoc: delDoc } = await import('firebase/firestore');
                await delDoc(doc(db, 'users', uid));
            }
        } catch (err) {
            console.log('Firestore 승인/거절 처리 참고:', err);
        }
        // localStorage에도 반영
        try {
            const localUsers = JSON.parse(localStorage.getItem('floorcraft_mock_users') || '[]');
            if (isApprove) {
                const updated = localUsers.map(u => (u.uid === uid) ? { ...u, approved: true } : u);
                localStorage.setItem('floorcraft_mock_users', JSON.stringify(updated));
            } else {
                const filtered = localUsers.filter(u => u.uid !== uid);
                localStorage.setItem('floorcraft_mock_users', JSON.stringify(filtered));
            }
        } catch { /* ignore */ }
    };

    // 제품 저장 (Store 즉시 반영 + Firestore 백업)
    const handleProductSave = async () => {
        if (!editingProduct) return;
        setProductSaving(true);
        try {
            const productId = String(editingProduct.id);
            const updateData = {
                title: editingProduct.title || '',
                model_id: editingProduct.model_id || '',
                imageUrl: editingProduct.imageUrl || '',
                subCategory: editingProduct.subCategory || '',
                price: Number(editingProduct.price) || 0,
                businessPrice: Number(editingProduct.businessPrice) || 0,
                sellingPrice: Number(editingProduct.sellingPrice) || 0,
                tags: editingProduct.tags || [],
                updatedAt: new Date().toISOString()
            };
            // 1) Store에 먼저 즉시 반영 → UI 바로 업데이트
            updateProduct(editingProduct.id, updateData);
            addToast(`${editingProduct.title} 저장 완료! 홈페이지에 즉시 반영됩니다.`, 'success');
            setEditingProduct(null);
            // 2) Firestore 백업 (실패해도 로컬은 이미 반영됨)
            try {
                await setDoc(doc(db, 'products', productId), updateData, { merge: true });
                console.log('[Admin] Firestore 저장 성공:', productId);
            } catch (fbErr) {
                console.warn('[Admin] Firestore 저장 실패 (로컬은 반영됨):', fbErr?.message || fbErr);
            }
        } catch (err) {
            console.error('[Admin] 제품 저장 에러:', err);
            addToast(`저장 실패: ${err?.message || '알 수 없는 오류'}`, 'error');
        } finally {
            setProductSaving(false);
        }
    };

    // 새 제품 등록
    const handleProductRegister = async () => {
        if (!newProduct.title || !newProduct.model_id) {
            addToast('제품명과 코드는 필수 입력입니다.', 'error');
            return;
        }
        setProductSaving(true);
        try {
            const productId = `custom_${Date.now()}`;
            const productData = {
                ...newProduct,
                id: productId,
                price: Number(newProduct.price),
                businessPrice: Number(newProduct.businessPrice),
                sellingPrice: Number(newProduct.sellingPrice || 0),
                rating: 4.8,
                reviews: 0,
                description: `${newProduct.title} (${newProduct.model_id})`,
                createdAt: new Date().toISOString()
            };
            await setDoc(doc(db, 'products', productId), productData);
            // Store에 즉시 추가 → 홈페이지 바로 노출
            addProduct(productData);
            addToast(`"${newProduct.title}" 제품이 등록되었습니다! 홈페이지에 즉시 반영됩니다.`, 'success');
            setNewProductModal(false);
            setNewProduct({
                title: '', model_id: '', categoryId: 'residential', subCategory: '',
                price: 0, businessPrice: 0, sellingPrice: 0, imageUrl: '', thickness: 5,
                patterns: [], tags: [], priceUnit: 'm²',
                specifications: { size: '', material: '' }
            });
        } catch {
            addToast('제품 등록에 실패했습니다.', 'error');
        } finally {
            setProductSaving(false);
        }
    };

    // 제품 삭제
    const handleProductDelete = async (product) => {
        if (!window.confirm(`"${product.title}" 제품을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) return;
        // Store에서 즉시 제거 (UI 즉시 반영)
        removeProduct(product.id);
        addToast(`${product.title} 제품이 삭제되었습니다.`, 'success');
        window.alert(`✅ "${product.title}" 제품이 삭제 완료되었습니다.`);
        try {
            await deleteDoc(doc(db, 'products', product.id));
        } catch (err) {
            console.log('Firestore 삭제 참고:', err);
        }
    };

    // 인기 태그 토글
    const togglePopularTag = (product) => {
        const tags = product.tags || [];
        const newTags = tags.includes('인기') ? tags.filter(t => t !== '인기') : [...tags, '인기'];
        setEditingProduct(prev => prev?.id === product.id ? { ...prev, tags: newTags } : prev);
    };





    const handleSave = async (order) => {
        try {
            const result = await saveOrder(order.id, order);
            if (result.success) addToast(result.message, 'success');
        } catch {
            addToast('저장 중 오류가 발생했습니다.', 'error');
        }
    };

    const handleDownload = async (order) => {
        try {
            await downloadPurchaseOrder(order);
            addToast(`${order.id} 발주서 다운로드를 시작합니다.`, 'success');
        } catch {
            addToast('다운로드 중 오류가 발생했습니다.', 'error');
        }
    };

    const handleCmsUpdate = async (key, value) => {
        setCmsSaving(true);
        try {
            await updateSiteContent(key, value);
            addToast('홈페이지에 성공적으로 반영되었습니다!', 'success');
            setCmsContent(prev => ({ ...prev, [key]: value }));
        } catch {
            addToast('저장 중 오류가 발생했습니다.', 'error');
        } finally {
            setCmsSaving(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [s, cms, rawOrders] = await Promise.all([
                    getAdminStats(),
                    getHomepageContent(),
                    fetchAllOrders()
                ]);
                setStats(s);
                setCmsContent(cms);
                // 사업자 정보 초기화
                if (cms?.business) {
                    setBizSettings(prev => ({ ...prev, ...cms.business }));
                }
                const processed = await Promise.all(
                    rawOrders.map(order => handleMiraeHousingOrder({
                        data: {
                            ...order,
                            id: order.orderId || order.firestoreId,
                            customer: order.customer || '고객',
                            items: (order.items || []).map(item => ({
                                ...item,
                                title: item.productName || item.title || '',
                                category: item.category || '',
                                quantity: item.qty || 0,
                                price: item.unitPrice || 0,
                                vendor_info: item.vendor_info || { email: order.email || '' }
                            }))
                        }
                    }))
                );
                setProcessedOrders(processed);
            } catch {
                addToast('데이터를 불러오는 중 오류가 발생했습니다.', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        initProducts();
    }, [addToast, initProducts, fetchAllOrders]);

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'consultations') fetchConsultations();
    }, [activeTab, fetchUsers, fetchConsultations]);

    const roleLabel = (u) => {
        if (u.approved === false) return { text: '승인대기', cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
        if (u.banned) return { text: '퇴출', cls: 'bg-red-500/20 text-red-400 border-red-500/30' };
        if (u.role === 'admin') return { text: '관리자', cls: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
        if (u.role === 'business') return { text: '사업자', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
        if (u.isGuest || u.role === 'guest') return { text: '비회원', cls: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
        return { text: '일반회원', cls: 'bg-slate-500/20 text-slate-400 border-slate-500/30' };
    };

    const handleExcelUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingExcel(true);
        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: 'array' });
            
            let uploadedData = [];
            // "재고업데이트" 또는 "재고" 시트 찾기
            const sheetName = workbook.SheetNames.find(n => n.includes('재고'));
            if (!sheetName) {
                addToast('엑셀 파일에서 "재고업데이트" 또는 "재고" 시트를 찾을 수 없습니다.', 'error');
                return;
            }
            const worksheet = workbook.Sheets[sheetName];
            
            // 헤더가 있는 행을 찾기 위해 데이터 배열로 변환
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            // B열(1번 인덱스)이 "품번 (모델명)"인 행 찾기
            let headerRowIdx = -1;
            for (let i = 0; i < jsonData.length; i++) {
                if (jsonData[i] && typeof jsonData[i][1] === 'string' && (jsonData[i][1].includes('품번') || jsonData[i][1].includes('모델명'))) {
                    headerRowIdx = i;
                    break;
                }
            }

            if (headerRowIdx === -1) {
                // 대체 로직: 어디든 '품번'이 있는 열 검색
                for (let i = 0; i < jsonData.length; i++) {
                    const row = jsonData[i] || [];
                    if (row.some(val => typeof val === 'string' && (val.includes('품번') || val.includes('모델명')))) {
                        headerRowIdx = i;
                        break;
                    }
                }
                
                if (headerRowIdx === -1) {
                    addToast('유효한 양식이 아닙니다. ("품번" 헤더를 찾을 수 없음)', 'error');
                    return;
                }
            }

            // 헤더 맵핑
            const headers = jsonData[headerRowIdx];
            const modelIdIdx = headers.findIndex(h => typeof h === 'string' && (h.includes('품번') || h.includes('모델명')));
            const stockIdx = headers.findIndex(h => typeof h === 'string' && (h.includes('현재고') || h.includes('현재 재고') || h.includes('재고 수량') || h.includes('재고')));
            const restockDateIdx = headers.findIndex(h => typeof h === 'string' && (h.includes('입고예정일') || h.includes('입고 예정일')));
            const inboundIdx = headers.findIndex(h => typeof h === 'string' && h.includes('일일 입고량'));
            const outboundIdx = headers.findIndex(h => typeof h === 'string' && h.includes('일일 출고량'));
            const titleIdx = headers.findIndex(h => typeof h === 'string' && h.includes('제품명'));

            if (modelIdIdx === -1) {
                addToast('필수 열(품번)을 찾을 수 없습니다.', 'error');
                return;
            }

            // 데이터 추출
            for (let i = headerRowIdx + 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (!row || !row[modelIdIdx]) continue; // 품번 없으면 무시
                
                // 가이드 등 불필요한 행이면 패스
                if (typeof row[modelIdIdx] === 'string' && row[modelIdIdx].includes('주의사항')) continue;

                const modelId = String(row[modelIdIdx]).trim();
                const title = titleIdx !== -1 && row[titleIdx] ? String(row[titleIdx]) : '';
                
                const inboundVal = inboundIdx !== -1 ? parseInt(row[inboundIdx], 10) : 0;
                const inbound = isNaN(inboundVal) ? 0 : inboundVal;

                const outboundVal = outboundIdx !== -1 ? parseInt(row[outboundIdx], 10) : 0;
                const outbound = isNaN(outboundVal) ? 0 : outboundVal;

                let stock = null;
                if (stockIdx !== -1 && row[stockIdx] !== undefined && row[stockIdx] !== '') {
                    const stockVal = parseInt(row[stockIdx], 10);
                    stock = isNaN(stockVal) ? null : stockVal;
                }
                
                let restockDate = '';
                if (restockDateIdx !== -1) {
                    const dateVal = row[restockDateIdx];
                    if (dateVal) {
                        if (typeof dateVal === 'number') {
                            const date = new Date((dateVal - (25569)) * 86400 * 1000);
                            const y = date.getFullYear();
                            const m = String(date.getMonth() + 1).padStart(2, '0');
                            const d = String(date.getDate()).padStart(2, '0');
                            restockDate = `${y}-${m}-${d}`;
                        } else if (typeof dateVal === 'string') {
                            const cleaned = dateVal.replace(/\//g, '-').trim();
                            if (cleaned.split('-').length === 2) {
                                restockDate = `${new Date().getFullYear()}-${cleaned}`;
                            } else {
                                restockDate = cleaned;
                            }
                        } else if (dateVal instanceof Date) {
                            const y = dateVal.getFullYear();
                            const m = String(dateVal.getMonth() + 1).padStart(2, '0');
                            const d = String(dateVal.getDate()).padStart(2, '0');
                            restockDate = `${y}-${m}-${d}`;
                        }
                    }
                }

                if (inbound === 0 && outbound === 0 && stock === null && restockDate === '') continue; // 무변동

                uploadedData.push({ model_id: modelId, title, inbound, outbound, rawStock: stock, restockDate });
            }

            if (uploadedData.length === 0) {
                addToast('업데이트할 데이터가 없습니다 (수량이 비어있거나 올바른 숫자가 아님).', 'warning');
                return;
            }

            let matchCount = 0;
            const batch = writeBatch(db);
            
            const productsQuery = await getDocs(collection(db, 'products'));
            const productsMap = {};
            productsQuery.docs.forEach(doc => {
                const data = doc.data();
                if (data.model_id) {
                    // 특수문자나 공백을 제외하고 비교
                    const normalizedModelId = data.model_id.toUpperCase().replace(/\s/g, '');
                    productsMap[normalizedModelId] = { id: doc.id, inventory: data.inventory || 0, title: data.title || '' };
                }
            });

            // 생성된 새 로그들을 모아둘 배열
            const newLogsToPush = [];

            uploadedData.forEach(item => {
                const upperModelId = item.model_id.toUpperCase().replace(/\s/g, '');
                if (productsMap[upperModelId]) {
                    const docData = productsMap[upperModelId];
                    const docId = docData.id;
                    const prevStock = docData.inventory;
                    
                    let finalStock = prevStock;

                    if (item.inbound > 0 || item.outbound > 0) {
                        finalStock = prevStock + item.inbound - item.outbound;
                        if (finalStock < 0) finalStock = 0;
                    } else if (item.rawStock !== null) {
                        finalStock = item.rawStock;
                    }

                    const docRef = doc(db, 'products', docId);
                    
                    const updateData = {
                        inventory: finalStock,
                        restockDate: item.restockDate || null
                    };

                    // 재고가 0이면 자동으로 '일시품절' 설정
                    if (finalStock === 0) {
                        updateData.status = '일시품절';
                    } else {
                        updateData.status = '판매중';
                    }

                    batch.update(docRef, updateData);

                    if (item.inbound > 0 || item.outbound > 0 || finalStock !== prevStock) {
                        const logRef = doc(collection(db, 'inventory_logs'));
                        const newLog = {
                            productId: docId,
                            title: item.title || docData.title,
                            model_id: item.model_id,
                            prevStock: prevStock,
                            inbound: item.inbound,
                            outbound: item.outbound,
                            finalStock: finalStock,
                            createdAt: new Date().toISOString()
                        };
                        batch.set(logRef, newLog);
                        newLogsToPush.push({id: logRef.id, ...newLog});
                    }

                    matchCount++;
                }
            });

            if (matchCount > 0) {
                await batch.commit();
                await initProducts(); 
                // 통계용 로그 배열 업데이트 (화면 새로고침 없이 일일 통계 즉시 반영)
                if (newLogsToPush.length > 0) {
                    setAllInventoryLogs(prev => [...newLogsToPush, ...prev]);
                }
                addToast(`성공적으로 ${matchCount}개 제품의 재고가 일괄 업데이트되었습니다.`, 'success');
            } else {
                addToast('엑셀의 품번과 데이터베이스에 일치하는 제품을 찾을 수 없습니다.', 'warning');
            }

        } catch (error) {
            console.error('Excel upload error:', error);
            addToast('엑셀 파일 처리 중 오류가 발생했습니다.', 'error');
        } finally {
            setIsUploadingExcel(false);
            if (e.target) e.target.value = '';
        }
    };

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        </div>
    );

    const tabs = [
        { id: 'orders', label: '📦 주문 관리' },
        { id: 'purchaseOrder', label: '📝 발주 관리' },
        { id: 'revenue', label: '📊 매출 통계' },
        { id: 'products', label: '🏷️ 제품 관리' },
        { id: 'users', label: '👤 회원 관리' },
        { id: 'consultations', label: '💬 상담·문의' },
        { id: 'cms', label: '🌐 홈페이지 관리' },
        { id: 'siteSettings', label: '⚙️ 사이트 설정' },
    ];

    return (
        <div className="min-h-screen w-full bg-[#020617] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 p-4 md:p-8 lg:p-12 text-slate-200">

            {/* 퇴출 확인 모달 */}
            {banConfirm && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setBanConfirm(null)}>
                    <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="text-center mb-6">
                            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${banConfirm.action === 'ban' ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                                <span className={`material-symbols-outlined text-3xl ${banConfirm.action === 'ban' ? 'text-red-400' : 'text-green-400'}`}>
                                    {banConfirm.action === 'ban' ? 'person_remove' : 'person_add'}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">
                                {banConfirm.action === 'ban' ? '회원 퇴출' : '퇴출 해제'}
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                {banConfirm.action === 'ban'
                                    ? <><span className="text-white font-semibold">"{banConfirm.displayName}"</span>을(를) 퇴출시키겠습니까?<br /><span className="text-red-400">⚠️ 퇴출된 회원은 로그인이 차단됩니다.</span></>
                                    : <><span className="text-white font-semibold">"{banConfirm.displayName}"</span>의 퇴출을 해제하시겠습니까?<br /><span className="text-green-400">해제 시 다시 로그인이 가능합니다.</span></>
                                }
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setBanConfirm(null)}
                                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 font-semibold hover:bg-white/10 transition-all"
                            >
                                취소
                            </button>
                            <button
                                onClick={executeBanAction}
                                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${banConfirm.action === 'ban' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                            >
                                {banConfirm.action === 'ban' ? '퇴출 실행' : '해제 실행'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 승인/거절 확인 모달 */}
            {approveConfirm && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setApproveConfirm(null)}>
                    <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="text-center mb-6">
                            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${approveConfirm.action === 'approve' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                                <span className={`material-symbols-outlined text-3xl ${approveConfirm.action === 'approve' ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {approveConfirm.action === 'approve' ? 'how_to_reg' : 'person_remove'}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">
                                {approveConfirm.action === 'approve' ? '가입 승인' : '가입 거절'}
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                {approveConfirm.action === 'approve'
                                    ? <><span className="text-white font-semibold">"{approveConfirm.displayName}"</span>의 가입을 승인하시겠습니까?<br /><span className="text-emerald-400">✅ 승인 후 로그인이 가능합니다.</span></>
                                    : <><span className="text-white font-semibold">"{approveConfirm.displayName}"</span>의 가입을 거절하시겠습니까?<br /><span className="text-red-400">⚠️ 거절 시 계정이 삭제됩니다.</span></>
                                }
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setApproveConfirm(null)}
                                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 font-semibold hover:bg-white/10 transition-all"
                            >
                                취소
                            </button>
                            <button
                                onClick={executeApproveAction}
                                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${approveConfirm.action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                            >
                                {approveConfirm.action === 'approve' ? '승인 실행' : '거절 실행'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
                        Admin Dashboard
                    </h1>
                    <p className="mt-2 text-slate-400 text-sm">시스템 주문 처리 및 관리자 설정 허브</p>
                </div>
                <div className="flex flex-wrap bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md gap-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setOrderFilter('all'); }}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 md:mb-12">
                {[
                    { id: 'all', label: '전체 주문', value: stats.totalOrders, sub: `오늘 +${revenueStats.todayCount}건`, icon: '📦', color: 'from-blue-500/20', activeColor: 'ring-blue-500' },
                    { id: 'pending', label: '대기 중', value: stats.pendingOrders, sub: '처리 필요', icon: '⏳', color: 'from-amber-500/20', activeColor: 'ring-amber-500' },
                    { id: 'completed', label: '완료 주문', value: stats.completedOrders, sub: '배송 완료', icon: '✅', color: 'from-emerald-500/20', activeColor: 'ring-emerald-500' },
                    { id: 'rev', label: '오늘 매출', value: `₩${revenueStats.daily.toLocaleString()}`, sub: `월 ₩${revenueStats.monthly.toLocaleString()}`, icon: '💰', color: 'from-indigo-500/20', activeColor: 'ring-indigo-500', tab: 'revenue' }
                ].map((stat, i) => (
                    <button
                        key={i}
                        onClick={() => { if (stat.tab) { setActiveTab(stat.tab); } else { setOrderFilter(stat.id); setActiveTab('orders'); } }}
                        className={`relative group overflow-hidden rounded-2xl md:rounded-3xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${(orderFilter === stat.id && activeTab === 'orders') || (stat.tab && activeTab === stat.tab) ? `border-white/50 bg-white/10 ring-2 ${stat.activeColor} shadow-2xl` : 'border-white/10 bg-white/5 hover:border-white/20'}`}
                    >
                        <div className={`absolute -right-4 -top-4 h-24 w-24 bg-gradient-to-br ${stat.color} to-transparent blur-2xl`}></div>
                        <div className="relative z-10 p-4 md:p-6">
                            <span className="text-2xl md:text-3xl mb-2 md:mb-4 block">{stat.icon}</span>
                            <h3 className="text-slate-400 text-xs md:text-sm font-medium">{stat.label}</h3>
                            <p className="text-xl md:text-2xl font-bold mt-1 text-white">{stat.value}</p>
                            <p className="text-xs text-slate-500 mt-1">{stat.sub}</p>
                        </div>
                    </button>
                ))}
            </div>

            {/* ===================== 매출 통계 탭 ===================== */}
            {activeTab === 'revenue' && (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white">📊 매출 통계</h2>
                            <p className="text-slate-400 text-sm mt-1">기간별 매출 분석 및 평균 매출</p>
                        </div>
                        <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                            {[{id:'daily',label:'일별'},{id:'weekly',label:'주별'},{id:'monthly',label:'월별'},{id:'yearly',label:'연별'}].map(v => (
                                <button key={v.id} onClick={() => setRevenueView(v.id)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${revenueView === v.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>{v.label}</button>
                            ))}
                        </div>
                    </div>

                    {/* 매출 카드 4개 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: '오늘 매출', value: revenueStats.daily, count: revenueStats.todayCount, color: 'from-cyan-500 to-blue-600', icon: '📅' },
                            { label: '이번 주 매출', value: revenueStats.weekly, count: revenueStats.weekCount, color: 'from-violet-500 to-purple-600', icon: '📆' },
                            { label: '이번 달 매출', value: revenueStats.monthly, count: revenueStats.monthCount, color: 'from-amber-500 to-orange-600', icon: '🗓️' },
                            { label: '올해 누적', value: revenueStats.yearly, count: revenueStats.yearCount, color: 'from-emerald-500 to-green-600', icon: '📊' },
                        ].map((item, i) => (
                            <div key={i} className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6">
                                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-10`}></div>
                                <div className="relative z-10">
                                    <span className="text-2xl block mb-3">{item.icon}</span>
                                    <p className="text-xs text-slate-400 font-medium">{item.label}</p>
                                    <p className="text-2xl font-black text-white mt-1">₩{item.value.toLocaleString()}</p>
                                    <p className="text-xs text-slate-500 mt-1">{item.count}건 주문</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 💰 수익 카드 4개 (매출 - 매입가) */}
                    <div className="mt-2">
                        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">💰 실제 수익 <span className="text-xs text-slate-500 font-normal">(판매액 - 매입가)</span></h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: '오늘 수익', value: revenueStats.profitDaily, revenue: revenueStats.daily, color: 'from-emerald-400 to-teal-600', icon: '💵' },
                                { label: '이번 주 수익', value: revenueStats.profitWeekly, revenue: revenueStats.weekly, color: 'from-emerald-500 to-green-600', icon: '💵' },
                                { label: '이번 달 수익', value: revenueStats.profitMonthly, revenue: revenueStats.monthly, color: 'from-emerald-600 to-green-700', icon: '💵' },
                                { label: '올해 누적 수익', value: revenueStats.profitYearly, revenue: revenueStats.yearly, color: 'from-emerald-500 to-lime-600', icon: '💰' },
                            ].map((item, i) => (
                                <div key={i} className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-10`}></div>
                                    <div className="relative z-10">
                                        <span className="text-2xl block mb-3">{item.icon}</span>
                                        <p className="text-xs text-emerald-400 font-medium">{item.label}</p>
                                        <p className="text-2xl font-black text-emerald-300 mt-1">₩{item.value.toLocaleString()}</p>
                                        <p className="text-xs text-slate-500 mt-1">마진율 {item.revenue > 0 ? ((item.value / item.revenue) * 100).toFixed(1) : 0}%</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 평균 매출 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><span>📈</span> 평균 매출</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <span className="text-slate-400 text-sm">일 평균 매출</span>
                                    <span className="text-xl font-bold text-cyan-400">₩{revenueStats.avgDaily.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <span className="text-slate-400 text-sm">월 평균 매출</span>
                                    <span className="text-xl font-bold text-amber-400">₩{revenueStats.avgMonthly.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <span className="text-slate-400 text-sm">평균 주문 단가</span>
                                    <span className="text-xl font-bold text-emerald-400">₩{stats.totalOrders > 0 ? Math.round(revenueStats.yearly / (revenueStats.yearCount || 1)).toLocaleString() : 0}</span>
                                </div>
                            </div>
                        </div>

                        {/* 매출 바 차트 (시각화) */}
                        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><span>📊</span> 기간별 비교</h3>
                            <div className="space-y-5">
                                {[
                                    { label: '오늘', value: revenueStats.daily, color: 'bg-cyan-500' },
                                    { label: '이번 주', value: revenueStats.weekly, color: 'bg-violet-500' },
                                    { label: '이번 달', value: revenueStats.monthly, color: 'bg-amber-500' },
                                    { label: '올해', value: revenueStats.yearly, color: 'bg-emerald-500' },
                                ].map((bar, i) => {
                                    const maxVal = Math.max(revenueStats.yearly, 1);
                                    const pct = Math.round((bar.value / maxVal) * 100);
                                    return (
                                        <div key={i}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-slate-400">{bar.label}</span>
                                                <span className="text-white font-semibold">₩{bar.value.toLocaleString()}</span>
                                            </div>
                                            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                                <div className={`h-full ${bar.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===================== 주문 관리 탭 ===================== */}
            {activeTab === 'orders' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
                            <div className="px-6 md:px-8 py-6 border-b border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <h2 className="text-xl font-semibold">
                                    {orderFilter === 'all' ? '전체 주문' : orderFilter === 'pending' ? '대기/진행 중 주문' : '완료된 주문'} 내역
                                    <span className="ml-2 text-sm text-slate-400">({filteredOrders.length}건)</span>
                                </h2>
                                {/* 기간별 필터 */}
                                <div className="flex flex-wrap gap-2">
                                    {[{id:'all',label:'전체'},{id:'today',label:'오늘'},{id:'week',label:'이번 주'},{id:'month',label:'이번 달'},{id:'year',label:'올해'}].map(df => (
                                        <button key={df.id} onClick={() => setDateFilter(df.id)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${dateFilter === df.id ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'}`}>{df.label}</button>
                                    ))}
                                </div>
                            </div>
                                <div className="space-y-3 p-4 md:p-6">
                                    {(() => {
                                        // 회원별 그룹핑
                                        const grouped = filteredOrders.reduce((acc, order) => {
                                            const key = order.vendorEmail || order.customer || 'unknown';
                                            if (!acc[key]) acc[key] = { customer: order.customer, email: order.vendorEmail, isBusiness: order.isBusiness, orders: [] };
                                            acc[key].orders.push(order);
                                            return acc;
                                        }, {});
                                        // 배송 미확인 사업자를 최상단으로 정렬
                                        const sortedGroups = Object.entries(grouped).sort(([,a], [,b]) => {
                                            const aNeed = a.isBusiness && a.orders.some(o => !o.deliveryType) ? 1 : 0;
                                            const bNeed = b.isBusiness && b.orders.some(o => !o.deliveryType) ? 1 : 0;
                                            return bNeed - aNeed;
                                        });
                                        if (sortedGroups.length === 0) return <p className="text-center text-slate-500 py-16">해당 조건의 주문 내역이 없습니다.</p>;
                                        return sortedGroups.map(([key, group]) => {
                                            const isExpanded = expandedCustomer[key] !== undefined ? expandedCustomer[key] : (group.isBusiness && group.orders.some(o => !o.deliveryType));
                                            const totalAmount = group.orders.reduce((s, o) => s + (o.totalAmount || o.items?.reduce((a, it) => a + ((it.price || 0) * (it.qty || it.quantity || 0)), 0) || 0), 0);
                                            const hasNeedApproval = group.isBusiness && group.orders.some(o => !o.deliveryType);
                                            const pendingCount = group.orders.filter(o => o.status === 'pending').length;
                                            return (
                                                <div key={key} className={`rounded-2xl border overflow-hidden transition-all ${hasNeedApproval ? 'border-amber-500/40 animate-blink-delivery' : 'border-white/10'}`}>
                                                    {/* 회원 카드 헤더 */}
                                                    <button
                                                        onClick={() => setExpandedCustomer(prev => ({ ...prev, [key]: !isExpanded }))}
                                                        className="w-full px-5 py-4 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-all text-left"
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${group.isBusiness ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'}`}>
                                                                {group.isBusiness ? '🏢' : '👤'}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className="font-bold text-white text-sm truncate">{group.customer}</span>
                                                                    {group.isBusiness && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">사업자</span>}
                                                                    {hasNeedApproval && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/30 text-amber-300 border border-amber-500/50 animate-pulse">🚚 배송확인 필요</span>}
                                                                </div>
                                                                <p className="text-[11px] text-slate-500 truncate">{group.email}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4 shrink-0">
                                                            <div className="text-right hidden sm:block">
                                                                <p className="text-xs text-slate-400">주문 <span className="text-white font-bold">{group.orders.length}</span>건</p>
                                                                <p className="text-sm font-bold text-emerald-400">₩{totalAmount.toLocaleString()}</p>
                                                            </div>
                                                            {pendingCount > 0 && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30">{pendingCount} 대기</span>}
                                                            <span className={`material-symbols-outlined text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                                                        </div>
                                                    </button>
                                                    {/* 주문 목록 (아코디언) */}
                                                    {isExpanded && (
                                                        <div className="divide-y divide-white/5 bg-slate-900/30">
                                                            {group.orders.map((order, oi) => {
                                                                const isBizOrder = order.isBusiness === true;
                                                                return (<div key={oi} className="px-5 py-4">
                                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                                                        {/* 주문 정보 */}
                                                                        <div className="flex items-start gap-3 min-w-0 flex-1">
                                                                            <div>
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="text-xs font-mono text-slate-500">{order.id}</span>
                                                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${order.status === 'pending' ? 'bg-amber-500/20 text-amber-500' : order.status === 'completed' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-blue-500/20 text-blue-500'}`}>{order.status}</span>
                                                                                    {isBizOrder && (
                                                                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/20 text-red-400">
                                                                                            📦 착불
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                                <div className="flex flex-wrap gap-2 mt-1.5">
                                                                                    {order.items.map((item, idx) => (
                                                                                        <span key={idx} className="inline-flex items-center gap-1 text-xs bg-white/5 rounded-lg px-2 py-1 border border-white/10">
                                                                                            <span className="text-slate-300 truncate max-w-[120px]">{item.title}</span>
                                                                                            <span className="text-indigo-400 font-bold">{item.displayQty}</span>
                                                                                        </span>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        {/* 액션 버튼 */}
                                                                        <div className="flex items-center gap-1.5 shrink-0">
                                                                            <button onClick={() => handleSave(order)} className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-emerald-500/20 transition-all" title="저장">
                                                                                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                                                                            </button>
                                                                            <button onClick={() => handleDownload(order)} className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-blue-500/20 transition-all" title="발주서">
                                                                                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                                            </button>
                                                                            <button onClick={() => setTaxInvoiceModal({ type: 'tax_invoice', user: { displayName: order.customer, email: order.vendorEmail } })} className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-indigo-500/20 transition-all" title="세금계산서">
                                                                                <span className="material-symbols-outlined text-slate-400 text-[16px]">receipt</span>
                                                                            </button>
                                                                            <button onClick={() => setTaxInvoiceModal({ type: 'cash_receipt', user: { displayName: order.customer, email: order.vendorEmail } })} className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-violet-500/20 transition-all" title="현금영수증">
                                                                                <span className="material-symbols-outlined text-slate-400 text-[16px]">request_quote</span>
                                                                            </button>
                                                                            <button onClick={() => setPurchaseOrderModal(order)} className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-amber-500/20 transition-all" title="발주서 양식">
                                                                                <span className="material-symbols-outlined text-slate-400 text-[16px]">description</span>
                                                                            </button>
                                                                        </div>
                                                                    </div>

                                                                </div>);
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">
                            <h2 className="text-xl font-semibold mb-6">최근 활동</h2>
                            <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
                                {stats.recentActivity.map((activity) => (
                                    <div key={activity.id} className="relative pl-10">
                                        <div className="absolute left-0 top-1 h-6 w-6 rounded-full border-2 border-slate-900 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                                        <p className="text-slate-300 text-sm leading-relaxed">{activity.message}</p>
                                        <span className="text-slate-500 text-xs mt-1 block">{activity.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===================== 발주 관리 탭 ===================== */}
            {activeTab === 'purchaseOrder' && (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white">📝 발주 관리</h2>
                            <p className="text-slate-400 text-sm mt-1">외주처·공급사에 보낼 발주서를 작성하고 인쇄·엑셀 다운로드합니다.</p>
                        </div>
                        <button
                            onClick={() => setPurchaseOrderModal('new')}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/20"
                        >
                            <span className="material-symbols-outlined text-[18px]">add_circle</span>
                            새 발주서 작성
                        </button>
                    </div>

                    {/* 빠른 발주서 생성: 최근 주문 목록에서 선택 */}
                    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
                        <div className="px-6 md:px-8 py-5 border-b border-white/10">
                            <h3 className="text-lg font-semibold text-white">최근 주문에서 발주서 생성</h3>
                            <p className="text-xs text-slate-500 mt-1">주문 데이터를 기반으로 발주서를 자동 작성합니다.</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 md:px-8 py-4">주문번호</th>
                                        <th className="px-6 md:px-8 py-4">고객</th>
                                        <th className="px-6 md:px-8 py-4">품목 수</th>
                                        <th className="px-6 md:px-8 py-4">상태</th>
                                        <th className="px-6 md:px-8 py-4 text-center">발주서</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {processedOrders.slice(0, 15).map((order, i) => (
                                        <tr key={i} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 md:px-8 py-4">
                                                <span className="text-sm text-white font-semibold">{order.id}</span>
                                            </td>
                                            <td className="px-6 md:px-8 py-4">
                                                <span className="text-sm text-slate-300">{order.customer || '-'}</span>
                                            </td>
                                            <td className="px-6 md:px-8 py-4">
                                                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-xs font-bold border border-indigo-500/30">
                                                    {order.items?.length || 0}건
                                                </span>
                                            </td>
                                            <td className="px-6 md:px-8 py-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.status === 'pending' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : order.status === 'completed' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-500 border border-blue-500/30'}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 md:px-8 py-4 text-center">
                                                <button
                                                    onClick={() => setPurchaseOrderModal(order)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold hover:bg-amber-500/20 transition-all mx-auto"
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">description</span>
                                                    발주서 작성
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {processedOrders.length === 0 && (
                                        <tr><td colSpan="5" className="px-8 py-16 text-center text-slate-500">주문 내역이 없습니다.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 안내 카드 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { icon: '📄', title: '발주서 작성', desc: '품목, 수량, 단가를 입력하고 공급처·배송 정보를 기입합니다.', color: 'from-blue-500/20' },
                            { icon: '🖨️', title: '인쇄 / PDF', desc: '완성된 발주서를 브라우저 인쇄 기능으로 PDF 저장하거나 인쇄합니다.', color: 'from-violet-500/20' },
                            { icon: '📥', title: '엑셀 다운로드', desc: '엑셀 파일로 다운로드하여 이메일 전송 등에 활용합니다.', color: 'from-emerald-500/20' },
                        ].map((card, i) => (
                            <div key={i} className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6">
                                <div className={`absolute -right-4 -top-4 h-20 w-20 bg-gradient-to-br ${card.color} to-transparent blur-2xl`}></div>
                                <div className="relative z-10">
                                    <span className="text-2xl block mb-3">{card.icon}</span>
                                    <h4 className="text-white font-bold text-sm mb-1">{card.title}</h4>
                                    <p className="text-slate-500 text-xs leading-relaxed">{card.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ===================== 제품 관리 탭 ===================== */}
            {activeTab === 'products' && (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white">🏷️ 제품 관리</h2>
                            <p className="text-slate-400 text-sm mt-1">
                                총 {products.length}개 제품 · 
                                {productCategory !== 'all' ? ` ${productCategory} (${categoryCount[productCategory] || 0}개)` : ' 전체'}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setNewProductModal(true)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-600/20"
                            >
                                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                                새 제품 등록
                            </button>
                            <button
                                onClick={() => {
                                    setShowInventoryLogs(true);
                                    fetchInventoryLogs();
                                }}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 font-semibold text-sm transition-all hover:bg-indigo-500/30"
                            >
                                <span className="material-symbols-outlined text-[18px]">history</span>
                                재고 변동 내역
                            </button>
                            <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl">
                                <a
                                    href="/재고업데이트양식_예시.xlsx"
                                    download
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 text-xs font-semibold transition-all"
                                >
                                    <span className="material-symbols-outlined text-[16px]">download</span>
                                    템플릿 다운
                                </a>
                                <input 
                                    type="file" 
                                    accept=".xlsx, .xls" 
                                    className="hidden" 
                                    id="excel-upload" 
                                    onChange={handleExcelUpload}
                                    disabled={isUploadingExcel}
                                />
                                <label 
                                    htmlFor="excel-upload" 
                                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg ml-1 font-semibold text-xs transition-all ${isUploadingExcel ? 'bg-indigo-500/20 text-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-lg shadow-indigo-600/20'}`}
                                >
                                    <span className="material-symbols-outlined text-[16px]">
                                        {isUploadingExcel ? 'sync' : 'upload_file'}
                                    </span>
                                    {isUploadingExcel ? '업데이트 중...' : '엑셀 업로드'}
                                </label>
                            </div>
                            <div className="relative w-full sm:w-72">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                                <input
                                    type="text"
                                    placeholder="제품명, 모델코드 검색..."
                                    value={productSearch}
                                    onChange={e => setProductSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 카테고리 필터 스크롤 */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
                        {productCategories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setProductCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold border whitespace-nowrap transition-all shrink-0 ${productCategory === cat ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-300 ring-1 ring-indigo-500/30' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'}`}
                            >
                                {cat === 'all' ? '전체' : cat}
                                <span className="ml-1.5 text-[10px] opacity-60">({categoryCount[cat] || 0})</span>
                            </button>
                        ))}
                    </div>

                    {/* 재고 변동 내역 모달 */}
                    {showInventoryLogs && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 text-white">
                            <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-6 w-full max-w-4xl shadow-2xl max-h-[90vh] flex flex-col">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                        <span className="material-symbols-outlined text-indigo-400">history</span>
                                        재고 변동 내역
                                    </h3>
                                    <button onClick={() => setShowInventoryLogs(false)} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                                        <span className="material-symbols-outlined text-slate-400">close</span>
                                    </button>
                                </div>

                                <div className="flex items-center gap-2 mb-4">
                                    <button onClick={() => setInventoryLogFilter('daily')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${inventoryLogFilter === 'daily' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>일간</button>
                                    <button onClick={() => setInventoryLogFilter('weekly')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${inventoryLogFilter === 'weekly' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>주간</button>
                                    <button onClick={() => setInventoryLogFilter('monthly')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${inventoryLogFilter === 'monthly' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>월간</button>
                                    <button onClick={() => setInventoryLogFilter('yearly')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${inventoryLogFilter === 'yearly' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>연간</button>
                                    
                                    <button onClick={fetchInventoryLogs} className="ml-auto p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all" title="새로고침">
                                        <span className="material-symbols-outlined text-slate-400 text-[18px]">refresh</span>
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto min-h-[300px]">
                                    {inventoryLogsLoading ? (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
                                        </div>
                                    ) : inventoryLogs.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                                            <span className="material-symbols-outlined text-4xl mb-3 opacity-50">inventory_2</span>
                                            <p>기록된 재고 변동 내역이 없습니다.</p>
                                        </div>
                                    ) : (
                                        <table className="w-full text-left">
                                            <thead className="bg-white/5 text-slate-400 text-xs uppercase sticky top-0">
                                                <tr>
                                                    <th className="px-4 py-3">일시</th>
                                                    <th className="px-4 py-3">제품/모델명</th>
                                                    <th className="px-4 py-3">입고량</th>
                                                    <th className="px-4 py-3">출고량</th>
                                                    <th className="px-4 py-3">잔여재고</th>
                                                    <th className="px-4 py-3">증감치</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {inventoryLogs.filter(log => {
                                                    const logDate = new Date(log.createdAt);
                                                    const today = new Date();
                                                    if (inventoryLogFilter === 'daily') {
                                                        return logDate.toDateString() === today.toDateString();
                                                    } else if (inventoryLogFilter === 'weekly') {
                                                        const diff = today - logDate;
                                                        return diff <= 7 * 24 * 60 * 60 * 1000;
                                                    } else if (inventoryLogFilter === 'monthly') {
                                                        return logDate.getMonth() === today.getMonth() && logDate.getFullYear() === today.getFullYear();
                                                    } else if (inventoryLogFilter === 'yearly') {
                                                        return logDate.getFullYear() === today.getFullYear();
                                                    }
                                                    return true;
                                                }).map((log, i) => {
                                                    const cDate = new Date(log.createdAt);
                                                    const diff = log.finalStock - log.prevStock;
                                                    const dtStr = `${cDate.toLocaleDateString().slice(2)} ${cDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
                                                    return (
                                                        <tr key={i} className="hover:bg-white/5 transition-colors text-sm">
                                                            <td className="px-4 py-3 text-slate-400 font-mono text-xs">{dtStr}</td>
                                                            <td className="px-4 py-3">
                                                                <span className="font-semibold block">{log.title || '이름 없음'}</span>
                                                                <span className="text-xs text-slate-500">{log.model_id}</span>
                                                            </td>
                                                            <td className="px-4 py-3 font-mono text-emerald-400">{log.inbound > 0 ? `+${log.inbound}` : '-'}</td>
                                                            <td className="px-4 py-3 font-mono text-rose-400">{log.outbound > 0 ? `-${log.outbound}` : '-'}</td>
                                                            <td className="px-4 py-3 font-mono font-bold">{log.finalStock}</td>
                                                            <td className="px-4 py-3">
                                                                <span className={`px-2 py-1 rounded-md text-xs font-bold ${diff > 0 ? 'bg-emerald-500/20 text-emerald-400' : diff < 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-500/20 text-slate-400'}`}>
                                                                    {diff > 0 ? `+${diff}` : diff}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 새 제품 등록 모달 */}
                    {newProductModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                            <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="material-symbols-outlined text-emerald-400 text-[28px]">add_circle</span>
                                    <h3 className="text-white font-bold text-xl">새 제품 등록</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-2">제품명 *</label>
                                            <input
                                                type="text"
                                                placeholder="예: 솔티 애쉬"
                                                value={newProduct.title}
                                                onChange={e => setNewProduct(prev => ({ ...prev, title: e.target.value }))}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-2">제품 코드 *</label>
                                            <input
                                                type="text"
                                                placeholder="예: EDT7724"
                                                value={newProduct.model_id}
                                                onChange={e => setNewProduct(prev => ({ ...prev, model_id: e.target.value }))}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-2">카테고리</label>
                                            <select
                                                value={newProduct.categoryId}
                                                onChange={e => setNewProduct(prev => ({ ...prev, categoryId: e.target.value }))}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                            >
                                                <option value="residential">주거용</option>
                                                <option value="commercial">상업용</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-2">서브 카테고리</label>
                                            <input
                                                type="text"
                                                placeholder="예: 에디톤 스톤"
                                                value={newProduct.subCategory}
                                                onChange={e => setNewProduct(prev => ({ ...prev, subCategory: e.target.value }))}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">이미지 URL</label>
                                        <input
                                            type="text"
                                            placeholder="/assets/lxzin/image.jpg 또는 https://..."
                                            value={newProduct.imageUrl}
                                            onChange={e => setNewProduct(prev => ({ ...prev, imageUrl: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        />
                                        {newProduct.imageUrl && (
                                            <div className="mt-2 flex items-center gap-3">
                                                <img src={newProduct.imageUrl} alt="미리보기" className="w-16 h-16 rounded-xl object-cover bg-white/5 border border-white/10" onError={e => e.target.style.display = 'none'} />
                                                <span className="text-xs text-slate-500">미리보기</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-2">일반 가격 (원)</label>
                                            <input
                                                type="number"
                                                value={newProduct.price}
                                                onChange={e => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-2">사업자 가격 (원)</label>
                                            <input
                                                type="number"
                                                value={newProduct.businessPrice}
                                                onChange={e => setNewProduct(prev => ({ ...prev, businessPrice: e.target.value }))}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#d4a853] focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-rose-400 mb-2">💰 매입가 (원)</label>
                                            <input
                                                type="number"
                                                value={newProduct.sellingPrice}
                                                onChange={e => setNewProduct(prev => ({ ...prev, sellingPrice: e.target.value }))}
                                                className="w-full bg-rose-500/5 border border-rose-500/20 rounded-xl px-4 py-3 text-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                                                placeholder="매입 원가"
                                            />
                                        </div>
                                    </div>
                                    {Number(newProduct.price) > 0 && Number(newProduct.sellingPrice) > 0 && (() => {
                                        const price = Number(newProduct.price);
                                        const purchasePrice = Number(newProduct.sellingPrice);
                                        const profitPerUnit = price - purchasePrice;
                                        const marginRate = ((1 - purchasePrice / price) * 100).toFixed(1);
                                        const sub = (newProduct.subCategory || '').toLowerCase();
                                        const isTileOrBox = sub.includes('에디톤') || sub.includes('타일') || sub.includes('lvt') || sub.includes('pst') || sub.includes('데코타일');
                                        return (
                                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-emerald-400 font-medium">📊 예상 수익 (1개 판매 시)</span>
                                                <span className="text-emerald-300 font-bold">₩{profitPerUnit.toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-500">마진율</span>
                                                <span className="text-emerald-400 font-semibold">{marginRate}%</span>
                                            </div>
                                            <div className="border-t border-emerald-500/20 pt-3 space-y-2">
                                                <p className="text-[11px] text-slate-400 font-semibold">📦 단위별 예상 수익</p>
                                                {isTileOrBox ? (
                                                    <>
                                                        <div className="flex items-center justify-between text-xs bg-white/5 rounded-lg px-3 py-2">
                                                            <span className="text-cyan-400">📦 1박스 (4매) 수익</span>
                                                            <span className="text-cyan-300 font-bold">₩{(profitPerUnit * 4).toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-xs bg-white/5 rounded-lg px-3 py-2">
                                                            <span className="text-cyan-400">📦 1박스 (7매) 수익</span>
                                                            <span className="text-cyan-300 font-bold">₩{(profitPerUnit * 7).toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-xs bg-white/5 rounded-lg px-3 py-2">
                                                            <span className="text-amber-400">📦 10박스 (40~70매) 수익</span>
                                                            <span className="text-amber-300 font-bold">₩{(profitPerUnit * 40).toLocaleString()} ~ ₩{(profitPerUnit * 70).toLocaleString()}</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="flex items-center justify-between text-xs bg-white/5 rounded-lg px-3 py-2">
                                                            <span className="text-cyan-400">📏 1롤 수익</span>
                                                            <span className="text-cyan-300 font-bold">₩{profitPerUnit.toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-xs bg-white/5 rounded-lg px-3 py-2">
                                                            <span className="text-amber-400">📏 10롤 수익</span>
                                                            <span className="text-amber-300 font-bold">₩{(profitPerUnit * 10).toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-xs bg-white/5 rounded-lg px-3 py-2">
                                                            <span className="text-rose-400">📏 50롤 수익</span>
                                                            <span className="text-rose-300 font-bold">₩{(profitPerUnit * 50).toLocaleString()}</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>);
                                    })()}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">규격 (사이즈)</label>
                                        <input
                                            type="text"
                                            placeholder="예: 450mm x 900mm"
                                            value={newProduct.specifications.size}
                                            onChange={e => setNewProduct(prev => ({ ...prev, specifications: { ...prev.specifications, size: e.target.value } }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-8">
                                    <button onClick={() => setNewProductModal(false)} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 font-semibold hover:bg-white/10 transition-all">취소</button>
                                    <button onClick={handleProductRegister} disabled={productSaving} className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all disabled:opacity-50">
                                        {productSaving ? '등록 중...' : '등록하기'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 편집 모달 */}
                    {editingProduct && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                            <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                                <div className="flex items-center gap-4 mb-6">
                                    <img src={editingProduct.imageUrl} alt={editingProduct.title} className="w-16 h-16 rounded-xl object-cover bg-white/5" onError={e => e.target.style.display = 'none'} />
                                    <div>
                                        <h3 className="text-white font-bold text-lg">제품 수정</h3>
                                        <p className="text-slate-400 text-sm">{editingProduct.id}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-2">제품명</label>
                                            <input
                                                type="text"
                                                value={editingProduct.title}
                                                onChange={e => setEditingProduct(prev => ({ ...prev, title: e.target.value }))}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-2">제품 코드</label>
                                            <input
                                                type="text"
                                                value={editingProduct.model_id}
                                                onChange={e => setEditingProduct(prev => ({ ...prev, model_id: e.target.value }))}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">이미지 URL</label>
                                        <input
                                            type="text"
                                            value={editingProduct.imageUrl}
                                            onChange={e => setEditingProduct(prev => ({ ...prev, imageUrl: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                        />
                                        {editingProduct.imageUrl && (
                                            <div className="mt-2">
                                                <img src={editingProduct.imageUrl} alt="미리보기" className="w-20 h-20 rounded-xl object-cover bg-white/5 border border-white/10" onError={e => e.target.style.display = 'none'} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">서브 카테고리</label>
                                        <input
                                            type="text"
                                            value={editingProduct.subCategory}
                                            onChange={e => setEditingProduct(prev => ({ ...prev, subCategory: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-2">일반 가격 (원)</label>
                                            <input
                                                type="number"
                                                value={editingProduct.price}
                                                onChange={e => setEditingProduct(prev => ({ ...prev, price: e.target.value }))}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-2">사업자 가격 (원)</label>
                                            <input
                                                type="number"
                                                value={editingProduct.businessPrice}
                                                onChange={e => setEditingProduct(prev => ({ ...prev, businessPrice: e.target.value }))}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#d4a853] focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-rose-400 mb-2">💰 매입가 (원)</label>
                                            <input
                                                type="number"
                                                value={editingProduct.sellingPrice || ''}
                                                onChange={e => setEditingProduct(prev => ({ ...prev, sellingPrice: e.target.value }))}
                                                className="w-full bg-rose-500/5 border border-rose-500/20 rounded-xl px-4 py-3 text-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                                                placeholder="매입 원가"
                                            />
                                        </div>
                                    </div>
                                    {Number(editingProduct.price) > 0 && Number(editingProduct.sellingPrice) > 0 && (() => {
                                        const price = Number(editingProduct.price);
                                        const purchasePrice = Number(editingProduct.sellingPrice);
                                        const profitPerUnit = price - purchasePrice;
                                        const marginRate = ((1 - purchasePrice / price) * 100).toFixed(1);
                                        const sub = (editingProduct.subCategory || '').toLowerCase();
                                        const isTileOrBox = sub.includes('에디톤') || sub.includes('타일') || sub.includes('lvt') || sub.includes('pst') || sub.includes('데코타일');
                                        return (
                                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-emerald-400 font-medium">📊 예상 수익 (1개 판매 시)</span>
                                                <span className="text-emerald-300 font-bold">₩{profitPerUnit.toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-500">마진율</span>
                                                <span className="text-emerald-400 font-semibold">{marginRate}%</span>
                                            </div>
                                            <div className="border-t border-emerald-500/20 pt-3 space-y-2">
                                                <p className="text-[11px] text-slate-400 font-semibold">📦 단위별 예상 수익</p>
                                                {isTileOrBox ? (
                                                    <>
                                                        <div className="flex items-center justify-between text-xs bg-white/5 rounded-lg px-3 py-2">
                                                            <span className="text-cyan-400">📦 1박스 (4매) 수익</span>
                                                            <span className="text-cyan-300 font-bold">₩{(profitPerUnit * 4).toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-xs bg-white/5 rounded-lg px-3 py-2">
                                                            <span className="text-cyan-400">📦 1박스 (7매) 수익</span>
                                                            <span className="text-cyan-300 font-bold">₩{(profitPerUnit * 7).toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-xs bg-white/5 rounded-lg px-3 py-2">
                                                            <span className="text-amber-400">📦 10박스 (40~70매) 수익</span>
                                                            <span className="text-amber-300 font-bold">₩{(profitPerUnit * 40).toLocaleString()} ~ ₩{(profitPerUnit * 70).toLocaleString()}</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="flex items-center justify-between text-xs bg-white/5 rounded-lg px-3 py-2">
                                                            <span className="text-cyan-400">📏 1롤 수익</span>
                                                            <span className="text-cyan-300 font-bold">₩{profitPerUnit.toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-xs bg-white/5 rounded-lg px-3 py-2">
                                                            <span className="text-amber-400">📏 10롤 수익</span>
                                                            <span className="text-amber-300 font-bold">₩{(profitPerUnit * 10).toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-xs bg-white/5 rounded-lg px-3 py-2">
                                                            <span className="text-rose-400">📏 50롤 수익</span>
                                                            <span className="text-rose-300 font-bold">₩{(profitPerUnit * 50).toLocaleString()}</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>);
                                    })()}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">인기 제품 노출</label>
                                        <button
                                            onClick={() => togglePopularTag(editingProduct)}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${editingProduct.tags?.includes('인기') ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'bg-white/5 border-white/10 text-slate-400'}`}
                                        >
                                            <span className="material-symbols-outlined text-[18px]">{editingProduct.tags?.includes('인기') ? 'star' : 'star_border'}</span>
                                            {editingProduct.tags?.includes('인기') ? '인기 제품으로 노출 중' : '인기 제품 미노출'}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-8">
                                    <button onClick={() => setEditingProduct(null)} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 font-semibold hover:bg-white/10 transition-all">취소</button>
                                    <button onClick={handleProductSave} disabled={productSaving} className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all disabled:opacity-50">
                                        {productSaving ? '저장 중...' : '저장 (홈페이지 반영)'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 제품 목록 */}
                    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">제품</th>
                                        <th className="px-6 py-4 hidden md:table-cell">카테고리</th>
                                        <th className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span>재고 관리 <span className="text-[10px] text-slate-500 font-normal">(기간내 누적 증감)</span></span>
                                                <div className="flex items-center gap-1 mt-1">
                                                    {['daily','weekly','monthly','yearly'].map(p => {
                                                        const label = p==='daily'?'일간':p==='weekly'?'주간':p==='monthly'?'월간':'연간';
                                                        return <button key={p} onClick={()=>setStockViewPeriod(p)} className={`px-1.5 py-0.5 text-[10px] rounded border ${stockViewPeriod===p ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30 font-bold':'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}>{label}</button>
                                                    })}
                                                </div>
                                            </div>
                                        </th>
                                        <th className="px-6 py-4">일반가</th>
                                        <th className="px-6 py-4">사업자가</th>
                                        <th className="px-6 py-4">💰 매입가</th>
                                        <th className="px-6 py-4 hidden lg:table-cell">수익</th>
                                        <th className="px-6 py-4">태그</th>
                                        <th className="px-6 py-4 text-center">관리</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredProducts.slice(0, 50).map((product) => (
                                        <tr key={product.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-white/5 shrink-0 overflow-hidden flex items-center justify-center">
                                                        {product.imageUrl ? (
                                                            <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span class="text-slate-600 text-[10px]">No IMG</span>'; }} />
                                                        ) : (
                                                            <span className="text-slate-600 text-[10px]">No IMG</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-white text-sm font-semibold">{product.title}</p>
                                                        <p className="text-slate-500 text-xs">{product.model_id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 hidden md:table-cell">
                                                <span className="text-slate-400 text-xs">{product.subCategory}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-2 min-w-[200px]">
                                                    {/* 직접입력 */}
                                                    <div className="flex items-center gap-1.5 bg-white/5 p-1.5 rounded-lg border border-white/10">
                                                        <span className="text-[10px] text-emerald-400 font-bold ml-1 w-6">입고</span>
                                                        <input 
                                                            type="number" 
                                                            value={inlineStock[product.id]?.in || ''} 
                                                            onChange={e => setInlineStock(prev => ({...prev, [product.id]: {...prev[product.id], in: e.target.value}}))}
                                                            onKeyDown={e => { if(e.key==='Enter') applyInlineStock(product.id, product); }}
                                                            className="w-12 bg-black/20 border border-white/10 rounded px-1.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500/50" 
                                                            placeholder="0"
                                                        />
                                                        <span className="text-[10px] text-rose-400 font-bold ml-1 w-6">출고</span>
                                                        <input 
                                                            type="number" 
                                                            value={inlineStock[product.id]?.out || ''} 
                                                            onChange={e => setInlineStock(prev => ({...prev, [product.id]: {...prev[product.id], out: e.target.value}}))}
                                                            onKeyDown={e => { if(e.key==='Enter') applyInlineStock(product.id, product); }}
                                                            className="w-12 bg-black/20 border border-white/10 rounded px-1.5 py-1 text-xs text-white focus:outline-none focus:border-rose-500/50" 
                                                            placeholder="0"
                                                        />
                                                        <button onClick={() => applyInlineStock(product.id, product)} disabled={productSaving} className="ml-1 px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded transition-all whitespace-nowrap">
                                                            적용
                                                        </button>
                                                    </div>
                                                    
                                                    {/* 현황 */}
                                                    <div className="flex items-center justify-between px-1">
                                                        <div className="flex items-center gap-2 text-[11px] font-mono font-bold">
                                                            <span className="text-emerald-400" title="기간 내 누적 입고량">+{productStats[product.id]?.in || 0}</span>
                                                            <span className="text-slate-600">/</span>
                                                            <span className="text-rose-400" title="기간 내 누적 출고량">-{productStats[product.id]?.out || 0}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-slate-400 text-[10px]">현재고</span>
                                                            <span className="text-white text-sm font-bold">{product.inventory || 0}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-white text-sm font-mono">{product.price?.toLocaleString()}원</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[#d4a853] text-sm font-mono">{product.businessPrice?.toLocaleString()}원</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-rose-400 text-sm font-mono">{product.sellingPrice ? `${product.sellingPrice.toLocaleString()}원` : <span className="text-slate-600">미설정</span>}</span>
                                            </td>
                                            <td className="px-6 py-4 hidden lg:table-cell">
                                                {product.sellingPrice ? (
                                                    <div>
                                                        <span className="text-emerald-400 text-sm font-bold">₩{(product.price - product.sellingPrice).toLocaleString()}</span>
                                                        <span className="text-emerald-500/60 text-[10px] block">{((1 - product.sellingPrice / product.price) * 100).toFixed(1)}%</span>
                                                    </div>
                                                ) : <span className="text-slate-600 text-xs">—</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-1 flex-wrap">
                                                    {product.tags?.length > 0 ? product.tags.map((tag, i) => (
                                                        <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">{tag}</span>
                                                    )) : <span className="text-slate-600 text-xs">-</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => setEditingProduct({ ...product })}
                                                        className="px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-semibold hover:bg-indigo-500/30 transition-all"
                                                    >
                                                        수정
                                                    </button>
                                                    <button
                                                        onClick={() => handleProductDelete(product)}
                                                        className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/30 transition-all"
                                                    >
                                                        삭제
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredProducts.length > 50 && (
                            <div className="px-6 py-4 border-t border-white/10 text-center text-slate-500 text-sm">
                                검색으로 범위를 좁혀주세요 (현재 {filteredProducts.length}개 중 50개 표시)
                            </div>
                        )}
                        {filteredProducts.length === 0 && (
                            <div className="px-8 py-16 text-center text-slate-500">
                                {productSearch || productCategory !== 'all' ? '해당 조건의 제품이 없습니다.' : '등록된 제품이 없습니다.'}
                            </div>
                        )}
                    </div>

                    {/* 수시 재고 조정 모달 (Inline) */}
                    {adjustStockModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                            <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-8 w-full max-w-sm shadow-2xl">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className={`material-symbols-outlined text-[28px] ${adjustStockModal.type === 'in' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {adjustStockModal.type === 'in' ? 'inventory' : 'outbox'}
                                    </span>
                                    <h3 className="text-white font-bold text-xl">{adjustStockModal.type === 'in' ? '재고 입고' : '재고 출고'}</h3>
                                </div>
                                <div className="mb-6 bg-white/5 border border-white/10 p-4 rounded-xl">
                                    <p className="text-slate-400 text-xs mb-1">제품 정보</p>
                                    <p className="text-white text-sm font-semibold line-clamp-1">{adjustStockModal.product.title}</p>
                                    <p className="text-slate-500 text-xs font-mono">{adjustStockModal.product.model_id}</p>
                                    <div className="mt-3 pt-3 border-t border-white/10 flex justify-between">
                                        <span className="text-slate-400 text-sm">현재고</span>
                                        <span className="text-white font-bold">{adjustStockModal.product.inventory || 0} 개</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">
                                        {adjustStockModal.type === 'in' ? '몇 개가 입고되었나요?' : '몇 개가 출고되었나요?'}
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="수량 입력..."
                                        value={adjustStockModal.amount}
                                        onChange={e => setAdjustStockModal(prev => ({ ...prev, amount: e.target.value }))}
                                        className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 ${adjustStockModal.type === 'in' ? 'focus:ring-emerald-500/50' : 'focus:ring-rose-500/50'} text-lg font-bold text-center`}
                                        autoFocus
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleStockAdjust(); }}
                                    />
                                </div>
                                <div className="flex gap-3 mt-8">
                                    <button onClick={() => setAdjustStockModal(null)} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 font-semibold hover:bg-white/10 transition-all">취소</button>
                                    <button onClick={handleStockAdjust} className={`flex-1 py-3 rounded-xl font-semibold transition-all text-white ${adjustStockModal.type === 'in' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-500/20'}`}>
                                        {adjustStockModal.type === 'in' ? '입고 처리' : '출고 처리'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ===================== 회원 관리 탭 ===================== */}
            {activeTab === 'users' && (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white">👤 회원 관리</h2>
                            <p className="text-slate-400 text-sm mt-1">총 {users.length}명 · 이름으로 검색하면 상세 정보가 즉시 표시됩니다</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative w-full sm:w-72">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                                <input
                                    type="text"
                                    placeholder="이름, 이메일, 연락처 검색..."
                                    value={userSearch}
                                    onChange={e => setUserSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                                />
                            </div>
                            <button onClick={fetchUsers} className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all" title="새로고침">
                                <span className="material-symbols-outlined text-slate-400 text-[20px]">refresh</span>
                            </button>
                            <button onClick={() => { setProxyStep(1); setProxyOrderModal(true); }} className="px-4 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold hover:bg-amber-500/30 transition-all flex items-center gap-2" title="전화 주문 등록">
                                <span className="material-symbols-outlined text-[16px]">phone_in_talk</span>
                                <span className="hidden sm:inline">전화 주문</span>
                            </button>
                        </div>
                    </div>

                    {/* 회원 상태 필터 탭 */}
                    <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
                        <button
                            onClick={() => setUserFilter('all')}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${userFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                        >
                            전체 회원
                        </button>
                        <button
                            onClick={() => setUserFilter('individual')}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${userFilter === 'individual' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                        >
                            일반회원
                        </button>
                        <button
                            onClick={() => setUserFilter('business')}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${userFilter === 'business' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                        >
                            사업자
                        </button>
                        <button
                            onClick={() => setUserFilter('pending')}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${userFilter === 'pending' ? 'bg-amber-600 text-white' : 'bg-white/5 text-amber-400 hover:bg-white/10'}`}
                        >
                            가입 승인 대기
                            {pendingUsersCount > 0 && (
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                                    {pendingUsersCount}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setUserFilter('guest')}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${userFilter === 'guest' ? 'bg-orange-600 text-white' : 'bg-white/5 text-orange-400 hover:bg-white/10'}`}
                        >
                            비회원
                            {guestUsersCount > 0 && (
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold">
                                    {guestUsersCount}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setUserFilter('banned')}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${userFilter === 'banned' ? 'bg-red-700 text-white' : 'bg-white/5 text-red-400 hover:bg-white/10'}`}
                        >
                            퇴출 회원
                            {bannedUsersCount > 0 && (
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-bold">
                                    {bannedUsersCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {usersLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
                        </div>
                    ) : (
                        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">이름 / 이메일</th>
                                            <th className="px-6 py-4">연락처</th>
                                            <th className="px-6 py-4">현재 역할</th>
                                            <th className="px-6 py-4">사업자 정보</th>
                                            <th className="px-6 py-4 hidden md:table-cell">가입일</th>
                                            <th className="px-6 py-4 text-center">관리</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredUsers.length > 0 ? filteredUsers.map((u) => {
                                            const rl = roleLabel(u);
                                            const isSelf = u.id === user?.uid;
                                            return (
                                                <tr key={u.id} className={`hover:bg-white/5 transition-colors cursor-pointer ${u.banned ? 'opacity-50' : ''}`} onClick={() => handleUserDetail(u)}>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border ${u.isGuest || u.role === 'guest' ? 'bg-orange-500/20 border-orange-500/30' : 'bg-indigo-500/20 border-indigo-500/30'}`}>
                                                                <span className={`material-symbols-outlined text-[18px] ${u.isGuest || u.role === 'guest' ? 'text-orange-400' : 'text-indigo-400'}`}>{u.isGuest || u.role === 'guest' ? 'person_off' : 'person'}</span>
                                                            </div>
                                                            <div>
                                                                <p className="text-white text-sm font-semibold">{u.displayName || '이름 없음'} {(u.isGuest || u.role === 'guest') && <span className="text-[10px] text-orange-400 ml-1">(비회원)</span>}</p>
                                                                <p className="text-slate-500 text-xs">{u.email || u.phone || '-'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className="text-slate-300 text-sm">{u.phone || u.phoneNumber || '-'}</span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${rl.cls}`}>{rl.text}</span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        {u.role === 'business' && u.businessInfo ? (
                                                            <div className="flex flex-col gap-1">
                                                                <p className="text-white text-xs font-bold">{u.businessInfo.businessName || '-'}</p>
                                                                <p className="text-slate-500 text-[10px] font-mono">{u.businessInfo.businessNumber || '-'}</p>
                                                                {u.businessInfo.licenseUrl && (
                                                                    <a 
                                                                        href={u.businessInfo.licenseUrl} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer"
                                                                        onClick={e => e.stopPropagation()}
                                                                        className="text-indigo-400 text-[10px] hover:underline flex items-center gap-1"
                                                                    >
                                                                        <span className="material-symbols-outlined text-[12px]">description</span>
                                                                        등록증 보기
                                                                    </a>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-600 text-xs">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-5 hidden md:table-cell">
                                                        <span className="text-slate-500 text-xs">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('ko-KR') : '-'}</span>
                                                    </td>
                                                    <td className="px-6 py-5" onClick={e => e.stopPropagation()}>
                                                        <div className="flex items-center justify-center gap-2">
                                                            {isSelf ? (
                                                                <span className="text-slate-600 text-xs">본인</span>
                                                            ) : u.approved === false ? (
                                                                <div className="flex items-center gap-1">
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleApprove(u.id, u.displayName); }}
                                                                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/30 transition-all"
                                                                    >
                                                                        승인
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleReject(u.id, u.displayName); }}
                                                                        className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/30 transition-all"
                                                                    >
                                                                        거절
                                                                    </button>
                                                                </div>
                                                            ) : u.banned ? (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleUnban(u.id, u.displayName); }}
                                                                    className="px-3 py-1.5 rounded-lg bg-slate-500/20 border border-slate-500/30 text-slate-400 text-xs font-semibold hover:bg-slate-500/30 transition-all"
                                                                >
                                                                    퇴출 해제
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleBan(u.id, u.displayName); }}
                                                                    className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/30 transition-all"
                                                                >
                                                                    퇴출
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr><td colSpan="6" className="px-8 py-16 text-center text-slate-500">
                                                {userSearch ? '검색 결과가 없습니다.' : '등록된 회원이 없습니다.'}
                                            </td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ===== 회원 상세 정보 모달 ===== */}
                    {selectedUser && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => { setSelectedUser(null); setSelectedUserOrders([]); }}>
                            <div className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                                {/* 헤더 */}
                                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-indigo-400 text-2xl">person</span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">{selectedUser.displayName || '이름 없음'}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleLabel(selectedUser).cls}`}>{roleLabel(selectedUser).text}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => { setSelectedUser(null); setSelectedUserOrders([]); }} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                                        <span className="material-symbols-outlined text-slate-400">close</span>
                                    </button>
                                </div>

                                {/* 기본 정보 */}
                                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">📧 이메일</p>
                                        <p className="text-sm text-white">{selectedUser.email || '-'}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">🔑 비밀번호</p>
                                        <button
                                            onClick={async () => {
                                                if (!selectedUser.email) { addToast('이메일 정보가 없습니다.', 'error'); return; }
                                                if (!window.confirm(`${selectedUser.displayName || selectedUser.email}님에게 비밀번호 초기화 이메일을 발송하시겠습니까?`)) return;
                                                const result = await resetPassword(selectedUser.email);
                                                if (result.success) addToast('비밀번호 초기화 이메일이 발송되었습니다.', 'success');
                                                else addToast(result.error || '발송 실패', 'error');
                                            }}
                                            className="px-4 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/30 transition-all flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">vpn_key</span>
                                            비밀번호 초기화
                                        </button>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">📞 연락처</p>
                                        <p className="text-sm text-white">{selectedUser.phone || selectedUser.phoneNumber || '-'}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">📍 주소지</p>
                                        <p className="text-sm text-white">{selectedUser.address || selectedUser.shippingAddress || '-'}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">📅 가입일</p>
                                        <p className="text-sm text-white">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('ko-KR') : '-'}</p>
                                    </div>
                                    {selectedUser.role === 'business' && selectedUser.businessInfo && (
                                        <>
                                            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                                                <p className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider mb-1">🏢 사업자명</p>
                                                <p className="text-sm text-white">{selectedUser.businessInfo.businessName || '-'}</p>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                                                <p className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider mb-1">📋 사업자번호</p>
                                                <p className="text-sm text-white">{selectedUser.businessInfo.businessNumber || '-'}</p>
                                            </div>
                                            {selectedUser.businessInfo.licenseUrl && (
                                                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 col-span-1 sm:col-span-2">
                                                    <p className="text-[11px] text-indigo-400 font-bold uppercase tracking-wider mb-2">📄 사업자등록증</p>
                                                    <a 
                                                        href={selectedUser.businessInfo.licenseUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                                                        등록증 파일 열기
                                                    </a>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* 액션 버튼 */}
                                <div className="px-6 pb-4 flex flex-wrap gap-3">
                                    <button
                                        onClick={() => { setProxyTarget(selectedUser); setProxyDelivery({ name: selectedUser.displayName || '', phone: selectedUser.phone || '', address: selectedUser.address || '', addressDetail: '', memo: '' }); setProxyStep(2); setProxyOrderModal(true); setSelectedUser(null); }}
                                        className="px-4 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold hover:bg-amber-500/30 transition-all flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">phone_in_talk</span>
                                        전화 주문 등록
                                    </button>
                                    {selectedUser.role === 'business' && (
                                        <button
                                            onClick={() => setTaxInvoiceModal({ type: 'tax_invoice', user: selectedUser })}
                                            className="px-4 py-2.5 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold hover:bg-blue-500/30 transition-all flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">receipt</span>
                                            세금계산서 발급
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setTaxInvoiceModal({ type: 'cash_receipt', user: selectedUser })}
                                        className="px-4 py-2.5 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-400 text-xs font-bold hover:bg-violet-500/30 transition-all flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">request_quote</span>
                                        현금영수증 발급
                                    </button>
                                </div>

                                {/* 자주 구매한 제품 */}
                                {selectedUserOrders.length > 0 && (
                                    <div className="px-6 pb-4">
                                        <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-amber-400 text-[18px]">star</span>
                                            자주 구매한 제품 TOP 5
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {getFrequentProducts(selectedUserOrders).map((fp, i) => (
                                                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs">
                                                    {fp.imageUrl && <img src={fp.imageUrl} alt="" className="w-6 h-6 rounded object-cover" />}
                                                    <span className="text-white font-semibold">{fp.name}</span>
                                                    <span className="text-amber-400 font-bold">{fp.count}회</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 구매 내역 리스트 */}
                                <div className="px-6 pb-6">
                                    <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-indigo-400 text-[18px]">receipt_long</span>
                                        구매 내역 ({selectedUserOrders.length}건)
                                    </h4>
                                    {selectedUserOrders.length === 0 ? (
                                        <p className="text-slate-500 text-sm py-4">구매 내역이 없습니다.</p>
                                    ) : (
                                        <div className="space-y-3 max-h-60 overflow-y-auto">
                                            {selectedUserOrders.map((order, i) => (
                                                <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row justify-between gap-3">
                                                    <div>
                                                        <p className="text-white text-sm font-semibold">#{order.orderId}</p>
                                                        <p className="text-slate-500 text-xs mt-1">{order.date ? new Date(order.date).toLocaleDateString('ko-KR') : '-'}</p>
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {(order.items || []).slice(0, 3).map((item, idx) => (
                                                                <span key={idx} className="text-xs text-slate-400 px-2 py-0.5 bg-white/5 rounded">{item.productName || item.title}</span>
                                                            ))}
                                                            {(order.items || []).length > 3 && <span className="text-xs text-slate-500">+{order.items.length - 3}개</span>}
                                                        </div>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <p className="text-white font-bold">₩{(order.totalPrice || 0).toLocaleString()}</p>
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${order.status === 'CANCELED' ? 'bg-red-500/20 text-red-400' : order.status === 'DELIVERED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                            {order.statusLabel || order.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===== 전화 주문 상담 모달 ===== */}
                    {proxyOrderModal && (() => {
                        const closeProxy = () => { setProxyOrderModal(false); setProxyTarget(null); setProxyStep(1); setProxySearch(''); setProxyDelivery({ name: '', phone: '', address: '', addressDetail: '', memo: '' }); setProxyCart([]); setProxyProductSearch(''); setProxyPostcodeOpen(false); };
                        const proxySearchResults = proxySearch.trim() ? users.filter(u => {
                            const s = proxySearch.toLowerCase();
                            return (u.displayName || '').toLowerCase().includes(s) || (u.phone || '').includes(s) || (u.email || '').toLowerCase().includes(s);
                        }) : [];
                        const selectCustomer = (u) => {
                            setProxyTarget(u);
                            setProxyDelivery({ name: u.displayName || '', phone: u.phone || '', address: u.address || '', addressDetail: '', memo: '' });
                            setProxyStep(2);
                            setProxySearch('');
                        };
                        const filteredProducts = proxyProductSearch.trim().length >= 1 ? products.filter(p => {
                            const s = proxyProductSearch.toLowerCase();
                            return (p.title || '').toLowerCase().includes(s) || (p.model_id || '').toLowerCase().includes(s) || (p.subCategory || '').toLowerCase().includes(s);
                        }).slice(0, 20) : [];
                        const addToProxyCart = (product) => {
                            setProxyCart(prev => {
                                const exists = prev.find(c => c.product.id === product.id);
                                if (exists) return prev.map(c => c.product.id === product.id ? { ...c, qty: c.qty + 1 } : c);
                                return [...prev, { product, qty: 1, option: '' }];
                            });
                            setProxyProductSearch('');
                        };
                        const proxyTotal = proxyCart.reduce((s, c) => s + (c.product.price || 0) * c.qty, 0);
                        const proxyTax = Math.floor(proxyTotal * 0.1);
                        const proxyFinal = proxyTotal + proxyTax;
                        const handleProxyPostcode = (data) => {
                            let fullAddress = data.address;
                            let extraAddress = '';
                            if (data.addressType === 'R') {
                                if (data.bname) extraAddress += data.bname;
                                if (data.buildingName) extraAddress += extraAddress ? `, ${data.buildingName}` : data.buildingName;
                                fullAddress += extraAddress ? ` (${extraAddress})` : '';
                            }
                            setProxyDelivery(prev => ({ ...prev, address: `[${data.zonecode}] ${fullAddress}` }));
                            setProxyPostcodeOpen(false);
                        };
                        const handleProxySubmit = async () => {
                            if (proxyCart.length === 0) { addToast('제품을 추가해주세요.', 'error'); return; }
                            if (!proxyDelivery.name || !proxyDelivery.phone) { addToast('배송 정보를 입력해주세요.', 'error'); return; }
                            const cartItems = proxyCart.map(c => ({ product: c.product, qty: c.qty, option: c.option }));
                            const userInfo = { name: proxyDelivery.name, displayName: proxyDelivery.name, phone: proxyDelivery.phone, email: proxyTarget?.email || 'phone@order.com', address: `${proxyDelivery.address} ${proxyDelivery.addressDetail}`.trim() };
                            const orderId = await addOrder(cartItems, proxyFinal, proxyTarget?.id || 'guest', userInfo);
                            addToast(`전화주문 등록 완료! 주문번호: ${orderId}`, 'success');
                            closeProxy();
                            // 주문 리스트 갱신
                            const allOrders = await fetchAllOrders();
                            setProcessedOrders(allOrders);
                        };
                        return (
                        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={closeProxy}>
                            <div className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                                {/* 헤더 */}
                                <div className="sticky top-0 bg-[#0f172a] border-b border-white/10 rounded-t-3xl px-6 py-4 flex items-center justify-between z-10">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-amber-400">phone_in_talk</span>
                                        전화 주문 상담
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        {/* 단계 표시 */}
                                        {[1,2,3,4].map(s => (
                                            <div key={s} className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                                proxyStep === s ? 'bg-amber-500 text-black' : proxyStep > s ? 'bg-emerald-500/30 text-emerald-400' : 'bg-white/10 text-slate-500'
                                            }`}>{proxyStep > s ? '✓' : s}</div>
                                        ))}
                                        <button onClick={closeProxy} className="ml-2 material-symbols-outlined text-slate-400 hover:text-white transition-colors">close</button>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {/* ==== Step 1: 고객 검색 ==== */}
                                    {proxyStep === 1 && (
                                        <div>
                                            <p className="text-slate-400 text-sm mb-4">고객 이름, 연락처, 이메일로 검색하세요.</p>
                                            <div className="relative mb-4">
                                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">search</span>
                                                <input className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm" placeholder="이름, 연락처, 이메일 검색..." value={proxySearch} onChange={e => setProxySearch(e.target.value)} autoFocus />
                                            </div>
                                            {proxySearchResults.length > 0 && (
                                                <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
                                                    {proxySearchResults.map(u => (
                                                        <div key={u.id} onClick={() => selectCustomer(u)} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-amber-500/10 hover:border-amber-500/30 cursor-pointer transition-all flex items-center gap-3">
                                                            <span className={`material-symbols-outlined text-xl ${u.isGuest ? 'text-orange-400' : 'text-indigo-400'}`}>{u.isGuest ? 'person_off' : 'person'}</span>
                                                            <div className="flex-1">
                                                                <p className="text-white text-sm font-semibold">{u.displayName || '이름없음'} {u.isGuest && <span className="text-orange-400 text-xs">(비회원)</span>}</p>
                                                                <p className="text-slate-500 text-xs">{u.phone || '-'} · {u.email || '-'}</p>
                                                            </div>
                                                            <span className="text-amber-400 text-xs font-semibold">선택</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {proxySearch.trim() && proxySearchResults.length === 0 && (
                                                <p className="text-slate-500 text-sm text-center py-4">검색 결과가 없습니다.</p>
                                            )}
                                            <div className="border-t border-white/10 pt-4">
                                                <button onClick={() => { setProxyTarget(null); setProxyStep(2); }} className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                                                    신규 고객으로 직접 입력
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* ==== Step 2: 배송 정보 ==== */}
                                    {proxyStep === 2 && (
                                        <div>
                                            <p className="text-slate-400 text-sm mb-4">
                                                {proxyTarget ? <><span className="text-amber-400 font-semibold">{proxyTarget.displayName}</span>님의 배송 정보를 확인하세요.</> : '신규 고객 정보를 입력하세요.'}
                                            </p>
                                            <div className="space-y-4 mb-6">
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">이름 *</label>
                                                    <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50" value={proxyDelivery.name} onChange={e => setProxyDelivery(prev => ({ ...prev, name: e.target.value }))} placeholder="고객 이름" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">연락처 *</label>
                                                    <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50" value={proxyDelivery.phone} onChange={e => setProxyDelivery(prev => ({ ...prev, phone: e.target.value }))} placeholder="010-0000-0000" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">주소</label>
                                                    {/* 기존 배송지 */}
                                                    {(() => {
                                                        const prevAddresses = [];
                                                        const seen = new Set();
                                                        // 고객 프로필 주소
                                                        if (proxyTarget?.address && proxyTarget.address.trim()) {
                                                            const addr = proxyTarget.address.trim();
                                                            if (!seen.has(addr)) { seen.add(addr); prevAddresses.push({ address: addr, label: '프로필 주소' }); }
                                                        }
                                                        // 과거 주문 배송지
                                                        if (proxyTarget?.id) {
                                                            processedOrders.filter(o => o.uid === proxyTarget.id).forEach(o => {
                                                                const addr = (o.delivery?.address || o.address || '').trim();
                                                                if (addr && !seen.has(addr)) { seen.add(addr); prevAddresses.push({ address: addr, label: `주문 ${o.orderId || ''}` }); }
                                                            });
                                                        }
                                                        if (prevAddresses.length === 0) return null;
                                                        return (
                                                            <div className="mb-2 space-y-1">
                                                                <p className="text-[10px] text-slate-500 mb-1 flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">history</span> 기존 배송지</p>
                                                                {prevAddresses.map((pa, idx) => (
                                                                    <div key={idx} onClick={() => setProxyDelivery(prev => ({ ...prev, address: pa.address }))}
                                                                        className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center gap-2 text-xs ${proxyDelivery.address === pa.address ? 'bg-amber-500/15 border-amber-500/40 text-amber-300' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-amber-500/10 hover:border-amber-500/20'}`}>
                                                                        <span className="material-symbols-outlined text-[14px]">{proxyDelivery.address === pa.address ? 'check_circle' : 'location_on'}</span>
                                                                        <span className="flex-1 truncate">{pa.address}</span>
                                                                        <span className="text-[10px] text-slate-500 shrink-0">{pa.label}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        );
                                                    })()}
                                                    <div className="flex gap-2">
                                                        <input className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50" value={proxyDelivery.address} onChange={e => setProxyDelivery(prev => ({ ...prev, address: e.target.value }))} placeholder="주소 검색" readOnly />
                                                        <button onClick={() => setProxyPostcodeOpen(true)} className="px-4 py-3 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm font-semibold hover:bg-amber-500/30 transition-all whitespace-nowrap">새 주소 검색</button>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">상세주소</label>
                                                    <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50" value={proxyDelivery.addressDetail} onChange={e => setProxyDelivery(prev => ({ ...prev, addressDetail: e.target.value }))} placeholder="동/호수" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">배송 메모</label>
                                                    <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50" value={proxyDelivery.memo} onChange={e => setProxyDelivery(prev => ({ ...prev, memo: e.target.value }))} placeholder="배송 시 요청사항" />
                                                </div>
                                            </div>
                                            {/* 우편번호 검색 */}
                                            {proxyPostcodeOpen && (
                                                <div className="mb-4 rounded-xl overflow-hidden border border-white/10">
                                                    <DaumPostcode onComplete={handleProxyPostcode} style={{ height: '350px' }} />
                                                </div>
                                            )}
                                            <div className="flex gap-3">
                                                <button onClick={() => setProxyStep(1)} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 font-semibold hover:bg-white/10 transition-all">이전</button>
                                                <button onClick={() => { if (!proxyDelivery.name || !proxyDelivery.phone) { addToast('이름과 연락처는 필수입니다.', 'error'); return; } setProxyStep(3); }} className="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold transition-all">다음: 제품 선택</button>
                                            </div>
                                        </div>
                                    )}

                                    {/* ==== Step 3: 제품 선택 ==== */}
                                    {proxyStep === 3 && (
                                        <div>
                                            <p className="text-slate-400 text-sm mb-4">주문할 제품을 검색하여 추가하세요.</p>
                                            <div className="relative mb-4">
                                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">inventory_2</span>
                                                <input className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50" placeholder="제품명 또는 모델 코드 검색..." value={proxyProductSearch} onChange={e => setProxyProductSearch(e.target.value)} autoFocus />
                                            </div>
                                            {/* 검색 결과 */}
                                            {filteredProducts.length > 0 && (
                                                <div className="max-h-48 overflow-y-auto space-y-1 mb-4 border border-white/10 rounded-xl p-2">
                                                    {filteredProducts.map(p => (
                                                        <div key={p.id} onClick={() => addToProxyCart(p)} className="p-3 rounded-lg bg-white/5 hover:bg-amber-500/10 cursor-pointer flex items-center gap-3 transition-all">
                                                            <img src={p.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-800" onError={e => { e.target.style.display='none'; }} />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-white text-xs font-semibold truncate">{p.title}</p>
                                                                <p className="text-slate-500 text-[10px]">{p.model_id || '-'} · {p.subCategory || ''}</p>
                                                            </div>
                                                            <p className="text-amber-400 text-xs font-bold">₩{(p.price||0).toLocaleString()}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {/* 장바구니 */}
                                            {proxyCart.length > 0 && (
                                                <div className="mb-4">
                                                    <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-1"><span className="material-symbols-outlined text-amber-400 text-[16px]">shopping_cart</span> 주문 목록 ({proxyCart.length})</h4>
                                                    <div className="space-y-2">
                                                        {proxyCart.map((c, i) => (
                                                            <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-white text-xs font-semibold truncate">{c.product.title}</p>
                                                                    <p className="text-slate-500 text-[10px]">{c.product.model_id || ''}</p>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <button onClick={() => setProxyCart(prev => prev.map((x, j) => j===i ? {...x, qty: Math.max(1, x.qty-1)} : x))} className="w-7 h-7 rounded-lg bg-white/10 text-slate-300 flex items-center justify-center text-sm hover:bg-white/20">-</button>
                                                                    <span className="text-white text-sm font-bold w-6 text-center">{c.qty}</span>
                                                                    <button onClick={() => setProxyCart(prev => prev.map((x, j) => j===i ? {...x, qty: x.qty+1} : x))} className="w-7 h-7 rounded-lg bg-white/10 text-slate-300 flex items-center justify-center text-sm hover:bg-white/20">+</button>
                                                                </div>
                                                                <p className="text-amber-400 text-xs font-bold w-20 text-right">₩{((c.product.price||0)*c.qty).toLocaleString()}</p>
                                                                <button onClick={() => setProxyCart(prev => prev.filter((_, j) => j!==i))} className="material-symbols-outlined text-red-400 text-[16px] hover:text-red-300">delete</button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex justify-between items-center">
                                                        <span className="text-slate-300 text-sm">합계 (VAT 포함)</span>
                                                        <span className="text-amber-400 text-lg font-black">₩{proxyFinal.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex gap-3">
                                                <button onClick={() => setProxyStep(2)} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 font-semibold hover:bg-white/10 transition-all">이전</button>
                                                <button onClick={() => { if (proxyCart.length === 0) { addToast('제품을 1개 이상 추가해주세요.', 'error'); return; } setProxyStep(4); }} className="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold transition-all">다음: 주문 확인</button>
                                            </div>
                                        </div>
                                    )}

                                    {/* ==== Step 4: 주문 확인 ==== */}
                                    {proxyStep === 4 && (
                                        <div>
                                            <p className="text-slate-400 text-sm mb-4">주문 내용을 최종 확인하세요.</p>
                                            {/* 고객 정보 */}
                                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
                                                <h4 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">person</span> 고객 정보</h4>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div><span className="text-slate-500">이름:</span> <span className="text-white font-semibold">{proxyDelivery.name}</span></div>
                                                    <div><span className="text-slate-500">연락처:</span> <span className="text-white font-semibold">{proxyDelivery.phone}</span></div>
                                                    <div className="col-span-2"><span className="text-slate-500">주소:</span> <span className="text-white font-semibold">{proxyDelivery.address} {proxyDelivery.addressDetail}</span></div>
                                                    {proxyDelivery.memo && <div className="col-span-2"><span className="text-slate-500">메모:</span> <span className="text-white">{proxyDelivery.memo}</span></div>}
                                                </div>
                                            </div>
                                            {/* 주문 제품 */}
                                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
                                                <h4 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">shopping_cart</span> 주문 제품 ({proxyCart.length}개)</h4>
                                                <div className="space-y-2">
                                                    {proxyCart.map((c, i) => (
                                                        <div key={i} className="flex justify-between text-sm">
                                                            <span className="text-white">{c.product.title} × {c.qty}</span>
                                                            <span className="text-amber-400 font-semibold">₩{((c.product.price||0)*c.qty).toLocaleString()}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="border-t border-white/10 mt-3 pt-3 flex justify-between">
                                                    <span className="text-slate-400 text-sm">상품 합계</span><span className="text-white font-semibold">₩{proxyTotal.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-400">VAT (10%)</span><span className="text-white">₩{proxyTax.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-base font-black mt-2 pt-2 border-t border-amber-500/20">
                                                    <span className="text-amber-400">최종 결제액</span><span className="text-amber-400">₩{proxyFinal.toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <button onClick={() => setProxyStep(3)} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 font-semibold hover:bg-white/10 transition-all">이전</button>
                                                <button onClick={handleProxySubmit} className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all flex items-center justify-center gap-2">
                                                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                                    주문 등록
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ); })()}

                </div>
            )}

            {/* ===================== 상담·문의 관리 탭 ===================== */}
            {activeTab === 'consultations' && (() => {
                const filtered = consultations.filter(c => {
                    const matchFilter = consultFilter === 'all' || c.status === consultFilter;
                    const q = consultSearch.toLowerCase();
                    const matchSearch = !q || (c.name || '').toLowerCase().includes(q) || (c.phone || '').includes(q) || (c.email || '').toLowerCase().includes(q);
                    return matchFilter && matchSearch;
                });

                const statusLabel = (s) => {
                    if (s === 'REQUESTED') return { text: '접수됨', cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
                    if (s === 'IN_PROGRESS') return { text: '처리중', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
                    if (s === 'COMPLETED') return { text: '완료', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
                    return { text: s, cls: 'bg-slate-500/20 text-slate-400 border-slate-500/30' };
                };

                return (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-white">상담·문의 관리</h2>
                                <p className="text-slate-400 text-sm mt-1">총 {consultations.length}건의 상담 신청</p>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                                    {[{ v: 'all', label: '전체' }, { v: 'REQUESTED', label: '접수됨' }, { v: 'IN_PROGRESS', label: '처리중' }, { v: 'COMPLETED', label: '완료' }].map(f => (
                                        <button key={f.v} onClick={() => setConsultFilter(f.v)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${consultFilter === f.v ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>{f.label}</button>
                                    ))}
                                </div>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                                    <input type="text" placeholder="이름, 연락처 검색..." value={consultSearch} onChange={e => setConsultSearch(e.target.value)}
                                        className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm w-52" />
                                </div>
                                <button onClick={fetchConsultations} className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all" title="새로고침">
                                    <span className="material-symbols-outlined text-slate-400 text-[20px]">refresh</span>
                                </button>
                            </div>
                        </div>

                        {filtered.length === 0 ? (
                            <div className="rounded-3xl border border-white/10 bg-white/5 p-16 text-center text-slate-500">
                                접수된 상담 신청이 없습니다.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filtered.map((c, i) => {
                                    const sl = statusLabel(c.status);
                                    return (
                                        <div key={c.id || i} className="rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col lg:flex-row lg:items-start gap-5">
                                            {/* 왼쪽 기본 정보 */}
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${sl.cls}`}>{sl.text}</span>
                                                    <span className="text-slate-400 text-xs">{c.date ? new Date(c.date).toLocaleString('ko-KR') : ''}</span>
                                                    {c.type === 'quantity_inquiry' && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-400 border border-violet-500/30">물량문의</span>}
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div>
                                                        <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">신청자</p>
                                                        <p className="text-white font-semibold text-sm">{c.name || '-'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">연락처</p>
                                                        <p className="text-white font-semibold text-sm">{c.phone || '-'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">이메일</p>
                                                        <p className="text-slate-300 text-sm">{c.email || '-'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">상담 유형</p>
                                                        <p className="text-slate-300 text-sm">{c.consultType || c.type === 'quantity_inquiry' ? '현장 물량문의' : c.productType || '-'}</p>
                                                    </div>
                                                </div>
                                                {/* 추가 정보 그리드 */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    {c.productType && (
                                                        <div>
                                                            <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">관심 제품</p>
                                                            <p className="text-slate-300 text-sm">{c.productType === 'sheet' ? '시트 (장판)' : c.productType === 'tile' ? '타일' : c.productType === 'editon' ? '에디톤' : c.productType === 'lvt' ? 'LVT' : c.productType}</p>
                                                        </div>
                                                    )}
                                                    {c.areaSize && (
                                                        <div>
                                                            <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">예상 평수</p>
                                                            <p className="text-slate-300 text-sm">{c.areaSize}평</p>
                                                        </div>
                                                    )}
                                                    {c.productInfo && (
                                                        <div>
                                                            <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">문의 제품/모델</p>
                                                            <p className="text-slate-300 text-sm">{c.productInfo}</p>
                                                        </div>
                                                    )}
                                                    {c.expectedDate && (
                                                        <div>
                                                            <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">시공 희망일</p>
                                                            <p className="text-slate-300 text-sm">{c.expectedDate}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                {c.addressMain && (
                                                    <div>
                                                        <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">주소</p>
                                                        <p className="text-slate-300 text-sm">{c.addressMain} {c.addressDetail || ''}</p>
                                                    </div>
                                                )}
                                                {/* 상담 요청 내용 (details 또는 message) */}
                                                {(c.details || c.message) && (
                                                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                                        <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                            <span className="material-symbols-outlined text-[14px]">chat_bubble</span>
                                                            신청자 작성 내용
                                                        </p>
                                                        <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{c.details || c.message}</p>
                                                    </div>
                                                )}
                                            </div>
                                            {/* 오른쪽 상태 변경 */}
                                            <div className="flex lg:flex-col gap-2 shrink-0">
                                                {['REQUESTED', 'IN_PROGRESS', 'COMPLETED'].map(s => {
                                                    const l = statusLabel(s);
                                                    return (
                                                        <button
                                                            key={s}
                                                            disabled={c.status === s}
                                                            onClick={async () => {
                                                                try {
                                                                    if (c.firestoreId) {
                                                                        const { doc: fsDoc, updateDoc: fsUpdate } = await import('firebase/firestore');
                                                                        await fsUpdate(fsDoc(db, 'consultations', c.firestoreId), { status: s });
                                                                    }
                                                                    await fetchConsultations();
                                                                    addToast('상태가 변경되었습니다.', 'success');
                                                                } catch (error) {
                                                                    console.error('❌ 상담 상태 변경 실패:', error);
                                                                    addToast('상태 변경에 실패했습니다.', 'error');
                                                                }
                                                            }}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all disabled:opacity-30 ${c.status === s ? l.cls : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                                                        >
                                                            {l.text}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })()}

            {/* ===================== 홈페이지 관리 (CMS) 탭 ===================== */}
            {activeTab === 'cms' && (
                <div className="space-y-6">

                    {/* CMS 섹션 공통 스타일 헬퍼 */}
                    {(() => {
                        const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm";
                        const labelCls = "block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider";
                        const SaveBtn = ({ onClick }) => (
                            <button disabled={cmsSaving} onClick={onClick} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all disabled:opacity-50 shrink-0">
                                {cmsSaving ? '저장 중...' : '저장'}
                            </button>
                        );

                        // 기본값
                        const defaultStrengths = [
                            { title: 'LX Z:IN 공식 유통', desc: '검증된 공식 유통 채널을 통해 정품만을 취급합니다. 품질 보증과 A/S까지 책임집니다.' },
                            { title: '전문 시공 지원', desc: '15년 이상 경력의 시공 전문가가 현장 방문 측정부터 시공 완료까지 동행합니다.' },
                            { title: '당일 견적 · 빠른 배송', desc: '문의 당일 맞춤 견적을 제공하며, 수도권 기준 3일 이내 배송을 보장합니다.' },
                            { title: '사업자 전용 특가', desc: '사업자 인증 시 일반가 대비 최대 40% 할인된 B2B 전용 단가를 적용받으실 수 있습니다.' },
                        ];
                        const defaultB2b = {
                            title1: '사업자라면,', title2: '지금 바로 파트너가 되세요',
                            desc: '사업자등록증 인증 한 번으로 B2B 전용 특가를 만나보세요. 전담 매니저가 프로젝트별 맞춤 견적과 시공 지원을 제공합니다.',
                            features: [
                                { text: 'B2B 전용 단가 최대 40% 할인', sub: '사업자 인증 즉시 적용' },
                                { text: '전담 매니저 1:1 배정', sub: '견적부터 시공까지 원스톱' },
                                { text: '대량 주문 무료 배송', sub: '수도권 3일 이내 도착' },
                                { text: '정품 보증 & A/S 지원', sub: 'LX Z:IN 공식 품질 보증' },
                            ]
                        };
                        const defaultContact = { phone: '031-409-5556', email: 'timbach@naver.com', address: '서울특별시 강남구 테헤란로 123', hours: '평일 09:00 – 18:00' };

                        const strengths = cmsContent?.strengths?.length > 0 ? cmsContent.strengths : defaultStrengths;
                        const b2b = cmsContent?.b2b || defaultB2b;
                        const contact = cmsContent?.contact || defaultContact;

                        return (
                            <>
                                {/* Row 1: 히어로 + 통계 */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-lg font-bold flex items-center gap-2"><span>🎭</span> 히어로 섹션</h2>
                                            <SaveBtn onClick={() => handleCmsUpdate('hero', cmsContent.hero)} />
                                        </div>
                                        <div className="space-y-4">
                                            <div><label className={labelCls}>메인 타이틀 (상단)</label><input className={inputCls} value={cmsContent?.hero?.title_top || ''} onChange={e => setCmsContent({ ...cmsContent, hero: { ...cmsContent.hero, title_top: e.target.value } })} /></div>
                                            <div><label className={labelCls}>메인 타이틀 (하단 강조)</label><textarea rows="2" className={inputCls} value={cmsContent?.hero?.title_bottom || ''} onChange={e => setCmsContent({ ...cmsContent, hero: { ...cmsContent.hero, title_bottom: e.target.value } })} /></div>
                                            <div><label className={labelCls}>체크포인트 1</label><input className={inputCls} value={cmsContent?.hero?.subtitle1 || ''} onChange={e => setCmsContent({ ...cmsContent, hero: { ...cmsContent.hero, subtitle1: e.target.value } })} /></div>
                                            <div><label className={labelCls}>체크포인트 2</label><input className={inputCls} value={cmsContent?.hero?.subtitle2 || ''} onChange={e => setCmsContent({ ...cmsContent, hero: { ...cmsContent.hero, subtitle2: e.target.value } })} /></div>
                                        </div>
                                    </div>

                                    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-lg font-bold flex items-center gap-2"><span>📊</span> 통계 바</h2>
                                            <SaveBtn onClick={() => handleCmsUpdate('stats', cmsContent.stats)} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {cmsContent?.stats?.map((stat, idx) => (
                                                <div key={idx} className="p-3 rounded-2xl bg-white/5 border border-white/10">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="material-symbols-outlined text-indigo-400 text-[16px]">{stat.icon}</span>
                                                        <input className="bg-transparent text-white font-bold focus:outline-none w-full text-xs" value={stat.label} onChange={e => { const ns = [...cmsContent.stats]; ns[idx].label = e.target.value; setCmsContent({ ...cmsContent, stats: ns }); }} />
                                                    </div>
                                                    <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-indigo-300 font-mono focus:outline-none text-sm" value={stat.value} onChange={e => { const ns = [...cmsContent.stats]; ns[idx].value = e.target.value; setCmsContent({ ...cmsContent, stats: ns }); }} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Row 2: 연락처 */}
                                <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-lg font-bold flex items-center gap-2"><span>📞</span> 연락처 정보 <span className="text-xs text-slate-400 font-normal ml-1">(헤더·푸터 자동 반영)</span></h2>
                                        <SaveBtn onClick={() => handleCmsUpdate('contact', contact)} />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div><label className={labelCls}>전화번호</label><input className={inputCls} placeholder="031-409-5556" value={contact.phone || ''} onChange={e => setCmsContent({ ...cmsContent, contact: { ...contact, phone: e.target.value } })} /></div>
                                        <div><label className={labelCls}>이메일</label><input className={inputCls} placeholder="contact@..." value={contact.email || ''} onChange={e => setCmsContent({ ...cmsContent, contact: { ...contact, email: e.target.value } })} /></div>
                                        <div><label className={labelCls}>영업시간</label><input className={inputCls} placeholder="평일 09:00 – 18:00" value={contact.hours || ''} onChange={e => setCmsContent({ ...cmsContent, contact: { ...contact, hours: e.target.value } })} /></div>
                                        <div><label className={labelCls}>주소</label><input className={inputCls} placeholder="서울특별시..." value={contact.address || ''} onChange={e => setCmsContent({ ...cmsContent, contact: { ...contact, address: e.target.value } })} /></div>
                                    </div>
                                </div>

                                {/* Row 3: 강점 카드 */}
                                <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-lg font-bold flex items-center gap-2"><span>💪</span> 강점 카드 (왜 데일리하우징인가)</h2>
                                        <SaveBtn onClick={() => handleCmsUpdate('strengths', strengths)} />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {strengths.map((item, idx) => (
                                            <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                                                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">카드 {idx + 1}</div>
                                                <div><label className={labelCls}>제목</label><input className={inputCls} value={item.title || ''} onChange={e => { const ns = [...strengths]; ns[idx] = { ...ns[idx], title: e.target.value }; setCmsContent({ ...cmsContent, strengths: ns }); }} /></div>
                                                <div><label className={labelCls}>설명</label><textarea rows="2" className={inputCls} value={item.desc || ''} onChange={e => { const ns = [...strengths]; ns[idx] = { ...ns[idx], desc: e.target.value }; setCmsContent({ ...cmsContent, strengths: ns }); }} /></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Row 4: B2B 섹션 */}
                                <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-lg font-bold flex items-center gap-2"><span>🤝</span> B2B 파트너 섹션</h2>
                                        <SaveBtn onClick={() => handleCmsUpdate('b2b', b2b)} />
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div><label className={labelCls}>제목 1줄</label><input className={inputCls} value={b2b.title1 || ''} onChange={e => setCmsContent({ ...cmsContent, b2b: { ...b2b, title1: e.target.value } })} /></div>
                                            <div><label className={labelCls}>제목 2줄 (강조색)</label><input className={inputCls} value={b2b.title2 || ''} onChange={e => setCmsContent({ ...cmsContent, b2b: { ...b2b, title2: e.target.value } })} /></div>
                                            <div><label className={labelCls}>설명 문구</label><textarea rows="3" className={inputCls} value={b2b.desc || ''} onChange={e => setCmsContent({ ...cmsContent, b2b: { ...b2b, desc: e.target.value } })} /></div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className={labelCls}>혜택 리스트 (4개)</label>
                                            {(b2b.features || []).map((feat, idx) => (
                                                <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                                                    <input className={inputCls + ' !py-2'} placeholder="혜택 제목" value={feat.text || ''} onChange={e => { const nf = [...b2b.features]; nf[idx] = { ...nf[idx], text: e.target.value }; setCmsContent({ ...cmsContent, b2b: { ...b2b, features: nf } }); }} />
                                                    <input className={inputCls + ' !py-2'} placeholder="부가 설명" value={feat.sub || ''} onChange={e => { const nf = [...b2b.features]; nf[idx] = { ...nf[idx], sub: e.target.value }; setCmsContent({ ...cmsContent, b2b: { ...b2b, features: nf } }); }} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-5 flex items-start gap-3">
                                    <span className="text-xl">💡</span>
                                    <p className="text-sm text-slate-400 leading-relaxed">저장 즉시 홈페이지에 실시간 반영됩니다. 연락처는 헤더와 푸터에도 자동 적용됩니다.</p>
                                </div>
                            </>
                        );
                    })()}
                </div>
            )}
            {/* ===== 세금계산서 / 현금영수증 발급 모달 (글로벌) ===== */}
            {taxInvoiceModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setTaxInvoiceModal(null)}>
                    <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-400">{taxInvoiceModal.type === 'tax_invoice' ? 'receipt' : 'request_quote'}</span>
                            {taxInvoiceModal.type === 'tax_invoice' ? '세금계산서 발급' : '현금영수증 발급'}
                        </h3>
                        <p className="text-slate-400 text-sm mb-6">
                            <strong className="text-white">{taxInvoiceModal.user?.displayName}</strong>님
                            {taxInvoiceModal.user?.role === 'business' && taxInvoiceModal.user?.businessInfo
                                ? ` (${taxInvoiceModal.user.businessInfo.businessName})`
                                : ''}
                        </p>
                        <div className="space-y-4 mb-6">
                            {taxInvoiceModal.type === 'tax_invoice' && taxInvoiceModal.user?.businessInfo && (
                                <>
                                    <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                                        <p className="text-xs text-blue-400 font-bold mb-1">사업자명</p>
                                        <p className="text-white text-sm">{taxInvoiceModal.user.businessInfo.businessName || '-'}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                                        <p className="text-xs text-blue-400 font-bold mb-1">사업자등록번호</p>
                                        <p className="text-white text-sm font-mono">{taxInvoiceModal.user.businessInfo.businessNumber || '-'}</p>
                                    </div>
                                </>
                            )}
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                <p className="text-xs text-slate-500 font-bold mb-1">이메일</p>
                                <p className="text-white text-sm">{taxInvoiceModal.user?.email || '-'}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setTaxInvoiceModal(null)} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 font-semibold hover:bg-white/10 transition-all">취소</button>
                            <button
                                onClick={() => {
                                    addToast(`${taxInvoiceModal.type === 'tax_invoice' ? '세금계산서' : '현금영수증'}가 발급되었습니다.`, 'success');
                                    setTaxInvoiceModal(null);
                                }}
                                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">print</span>
                                발급하기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===================== 사이트 설정 탭 ===================== */}
            {activeTab === 'siteSettings' && (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white">⚙️ 사이트 설정</h2>
                        <p className="text-slate-400 text-sm mt-1">사업자 정보를 관리합니다. 수정 즉시 Footer 및 주문서에 반영됩니다.</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-indigo-400">business</span>
                            사업자 정보
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {[
                                { key: 'companyName', label: '상호명', placeholder: '데일리하우징', icon: 'store' },
                                { key: 'ceoName', label: '대표자명', placeholder: '홍길동', icon: 'person' },
                                { key: 'bizNumber', label: '사업자등록번호', placeholder: '123-45-67890', icon: 'badge' },
                                { key: 'ecomNumber', label: '통신판매업 신고번호', placeholder: '2026-서울강남-12345', icon: 'verified' },
                                { key: 'bankAccount', label: '입금 계좌', placeholder: '국민은행 123-456-789012 (예금주: 데일리하우징)', icon: 'account_balance', full: true },
                            ].map(field => (
                                <div key={field.key} className={field.full ? 'md:col-span-2' : ''}>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[16px] text-slate-500">{field.icon}</span>
                                        {field.label}
                                    </label>
                                    <input
                                        type="text"
                                        value={bizSettings[field.key]}
                                        onChange={e => setBizSettings(prev => ({ ...prev, [field.key]: e.target.value }))}
                                        placeholder={field.placeholder}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end pt-2">
                            <button
                                onClick={async () => {
                                    setBizSaving(true);
                                    try {
                                        await updateSiteContent('business', bizSettings);
                                        addToast('사업자 정보가 저장되었습니다. Footer에 즉시 반영됩니다.', 'success');
                                    } catch {
                                        addToast('저장 중 오류가 발생했습니다.', 'error');
                                    } finally {
                                        setBizSaving(false);
                                    }
                                }}
                                disabled={bizSaving}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-[18px]">{bizSaving ? 'hourglass_empty' : 'save'}</span>
                                {bizSaving ? '저장 중...' : '사업자 정보 저장'}
                            </button>
                        </div>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
                        <p className="text-amber-300 text-sm flex items-start gap-2">
                            <span className="material-symbols-outlined text-[18px] mt-0.5">info</span>
                            <span><strong>6월 사업자 전환 안내:</strong> 위 정보를 변경하면 홈페이지 하단(Footer), 주문서, 무통장입금 안내 등에 즉시 반영됩니다. 코드 수정이나 개발자 도움 없이 1분 만에 전환이 가능합니다.</span>
                        </p>
                    </div>
                </div>
            )}

            {/* ===================== 발주서 양식 모달 ===================== */}
            {purchaseOrderModal && (
                <PurchaseOrderForm
                    order={purchaseOrderModal === 'new' ? null : purchaseOrderModal}
                    onClose={() => setPurchaseOrderModal(null)}
                    products={products}
                    onComplete={async (orderId, deliveryInfo) => {
                        try {
                            setPurchaseOrderModal(null);
                            const updatedInfo = {
                                status: 'DELIVERING',
                                statusLabel: '배송중',
                                deliveryCompany: deliveryInfo.deliveryCompany,
                                trackingNumber: deliveryInfo.trackingNumber,
                                updatedAt: new Date().toISOString(),
                                firestoreId: purchaseOrderModal.firestoreId
                            };
                            await saveOrder(orderId, updatedInfo);
                            
                            // 로컬 상태 즉시 업데이트
                            setProcessedOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, ...updatedInfo, delivery: { company: updatedInfo.deliveryCompany, trackingNumber: updatedInfo.trackingNumber } } : o));
                            addToast('발주가 완료되어 배송중 상태로 변경되었습니다.', 'success');
                        } catch (error) {
                            console.error('발주 업데이트 실패:', error);
                            addToast('상태 업데이트에 실패했습니다.', 'error');
                        }
                    }}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
