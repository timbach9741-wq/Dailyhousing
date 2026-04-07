import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { handleMiraeHousingOrder, getAdminStats, saveOrder, getHomepageContent, updateSiteContent } from '../services/adminService';
import { downloadPurchaseOrder } from '../services/excelService';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { useProductStore } from '../store/useProductStore';
import { useConsultationStore } from '../store/useConsultationStore';
import { useOrderStore } from '../store/useOrderStore';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, updateDoc, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import DaumPostcode from 'react-daum-postcode';

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

const calcRevenueStats = (orders) => {
    if (!orders.length) return { daily: 0, weekly: 0, monthly: 0, yearly: 0, avgDaily: 0, avgMonthly: 0 };
    const now = new Date();
    const today = filterByDateRange(orders, 'today');
    const week = filterByDateRange(orders, 'week');
    const month = filterByDateRange(orders, 'month');
    const year = filterByDateRange(orders, 'year');
    const sum = (arr) => arr.reduce((s, o) => s + (o.totalPrice || 0), 0);
    
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
        yearCount: year.length
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

    // 기간별 필터
    const [dateFilter, setDateFilter] = useState('all');
    const [revenueView, setRevenueView] = useState('monthly');

    // 제품 관리 상태
    const [productSearch, setProductSearch] = useState('');
    const [editingProduct, setEditingProduct] = useState(null);
    const [productSaving, setProductSaving] = useState(false);
    const [productCategory, setProductCategory] = useState('all');
    const [newProductModal, setNewProductModal] = useState(false);
    const [newProduct, setNewProduct] = useState({
        title: '', model_id: '', categoryId: 'residential', subCategory: '',
        price: 0, businessPrice: 0, imageUrl: '', thickness: 5,
        patterns: [], tags: [], priceUnit: 'm²',
        specifications: { size: '', material: '' }
    });

    // 사용자 관리 상태
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [userSearch, setUserSearch] = useState('');
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
    const revenueStats = useMemo(() => calcRevenueStats(processedOrders), [processedOrders]);

    // 회원 상세 조회
    const handleUserDetail = async (u) => {
        setSelectedUser(u);
        try {
            const q2 = query(collection(db, 'orders'), where('uid', '==', u.id));
            const snap = await getDocs(q2);
            const list = snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
            list.sort((a, b) => new Date(b.date) - new Date(a.date));
            setSelectedUserOrders(list);
        } catch {
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
        if (!userSearch.trim()) return true;
        const q = userSearch.toLowerCase();
        return (u.email || '').toLowerCase().includes(q) ||
            (u.displayName || '').toLowerCase().includes(q) ||
            (u.phone || '').includes(q);
    });

    // 사용자 목록 불러오기
    const fetchUsers = useCallback(async () => {
        setUsersLoading(true);
        try {
            const snap = await getDocs(collection(db, 'users'));
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setUsers(list);
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
    };

    // 제품 저장 (Firestore + Store 즉시 반영)
    const handleProductSave = async () => {
        if (!editingProduct) return;
        setProductSaving(true);
        try {
            const updateData = {
                title: editingProduct.title,
                model_id: editingProduct.model_id,
                imageUrl: editingProduct.imageUrl,
                subCategory: editingProduct.subCategory,
                price: Number(editingProduct.price),
                businessPrice: Number(editingProduct.businessPrice),
                tags: editingProduct.tags || [],
                updatedAt: new Date().toISOString()
            };
            await setDoc(doc(db, 'products', editingProduct.id), updateData, { merge: true });
            // Store에 즉시 반영 → 홈페이지 바로 업데이트
            updateProduct(editingProduct.id, updateData);
            addToast(`${editingProduct.title} 저장 완료! 홈페이지에 즉시 반영됩니다.`, 'success');
            setEditingProduct(null);
        } catch {
            addToast('저장에 실패했습니다.', 'error');
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
                price: 0, businessPrice: 0, imageUrl: '', thickness: 5,
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
        if (u.banned) return { text: '퇴출', cls: 'bg-red-500/20 text-red-400 border-red-500/30' };
        if (u.role === 'admin') return { text: '관리자', cls: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
        if (u.role === 'business') return { text: '사업자', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
        if (u.isGuest || u.role === 'guest') return { text: '비회원', cls: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
        return { text: '일반회원', cls: 'bg-slate-500/20 text-slate-400 border-slate-500/30' };
    };

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        </div>
    );

    const tabs = [
        { id: 'orders', label: '📦 주문 관리' },
        { id: 'revenue', label: '📊 매출 통계' },
        { id: 'products', label: '🏷️ 제품 관리' },
        { id: 'users', label: '👤 회원 관리' },
        { id: 'consultations', label: '💬 상담·문의' },
        { id: 'cms', label: '🌐 홈페이지 관리' },
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
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                                            <tr>
                                                <th className="px-6 md:px-8 py-4">주문번호 / 고객</th>
                                                <th className="px-6 md:px-8 py-4">품목</th>
                                                <th className="px-6 md:px-8 py-4 hidden md:table-cell">이메일</th>
                                                <th className="px-6 md:px-8 py-4">상태</th>
                                                <th className="px-6 md:px-8 py-4 text-center">관리</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/10">
                                            {filteredOrders.length > 0 ? filteredOrders.map((order, i) => (
                                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-6 md:px-8 py-5">
                                                        <div className="font-semibold text-white text-sm">{order.id}</div>
                                                        <div className="text-xs text-slate-500 mt-0.5">{order.customer}</div>
                                                    </td>
                                                    <td className="px-6 md:px-8 py-5">
                                                        <div className="space-y-1">
                                                            {order.items.map((item, idx) => (
                                                                <div key={idx} className="flex items-center gap-2 text-xs">
                                                                    <span className="text-slate-300 truncate max-w-[80px]">{item.title}</span>
                                                                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/30">{item.displayQty}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 md:px-8 py-5 hidden md:table-cell">
                                                        <div className="text-xs font-mono text-slate-400">{order.vendorEmail}</div>
                                                    </td>
                                                    <td className="px-6 md:px-8 py-5">
                                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.status === 'pending' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : order.status === 'completed' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-500 border border-blue-500/30'}`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 md:px-8 py-5">
                                                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                                            <button onClick={() => handleSave(order)} className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-emerald-500/20 hover:border-emerald-500/30 transition-all" title="저장">
                                                                <svg className="w-4 h-4 text-slate-400 hover:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                                                            </button>
                                                            <button onClick={() => handleDownload(order)} className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-blue-500/20 hover:border-blue-500/30 transition-all" title="발주서 다운로드">
                                                                <svg className="w-4 h-4 text-slate-400 hover:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                            </button>
                                                            <button
                                                                onClick={() => setTaxInvoiceModal({ type: 'tax_invoice', user: { displayName: order.customer, email: order.vendorEmail } })}
                                                                className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all"
                                                                title="세금계산서 발급"
                                                            >
                                                                <span className="material-symbols-outlined text-slate-400 hover:text-indigo-400 text-[16px]">receipt</span>
                                                            </button>
                                                            <button
                                                                onClick={() => setTaxInvoiceModal({ type: 'cash_receipt', user: { displayName: order.customer, email: order.vendorEmail } })}
                                                                className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-violet-500/20 hover:border-violet-500/30 transition-all"
                                                                title="현금영수증 발급"
                                                            >
                                                                <span className="material-symbols-outlined text-slate-400 hover:text-violet-400 text-[16px]">request_quote</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan="5" className="px-8 py-16 text-center text-slate-500">해당 조건의 주문 내역이 없습니다.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
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
                                    <div className="grid grid-cols-2 gap-4">
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
                                    </div>
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
                                    <div className="grid grid-cols-2 gap-4">
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
                                    </div>
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
                                        <th className="px-6 py-4">일반가</th>
                                        <th className="px-6 py-4">사업자가</th>
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
                                                <span className="text-white text-sm font-mono">{product.price?.toLocaleString()}원</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[#d4a853] text-sm font-mono">{product.businessPrice?.toLocaleString()}원</span>
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
                                                        <span className="text-slate-300 text-sm">{u.phone || '-'}</span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${rl.cls}`}>{rl.text}</span>
                                                    </td>
                                                    <td className="px-6 py-5 hidden md:table-cell">
                                                        <span className="text-slate-500 text-xs">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('ko-KR') : '-'}</span>
                                                    </td>
                                                    <td className="px-6 py-5" onClick={e => e.stopPropagation()}>
                                                        <div className="flex items-center justify-center gap-2">
                                                            {isSelf ? (
                                                                <span className="text-slate-600 text-xs">본인</span>
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
                                            <tr><td colSpan="5" className="px-8 py-16 text-center text-slate-500">
                                                {userSearch ? '검색 결과가 없습니다.' : 'Firestore에 등록된 회원이 없습니다.'}
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
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm text-white flex-1">{selectedUser.password ? (selectedUser._showPw ? selectedUser.password : '••••••••') : '조회 불가'}</p>
                                            {selectedUser.password && (
                                                <button onClick={() => setSelectedUser(prev => ({ ...prev, _showPw: !prev._showPw }))} className="text-slate-400 hover:text-white transition-colors">
                                                    <span className="material-symbols-outlined text-[16px]">{selectedUser._showPw ? 'visibility_off' : 'visibility'}</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">📞 연락처</p>
                                        <p className="text-sm text-white">{selectedUser.phone || '-'}</p>
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
                                                                } catch {
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
                        const defaultContact = { phone: '02-1234-5678', email: 'contact@dailyhousing.co.kr', address: '서울특별시 강남구 테헤란로 123', hours: '평일 09:00 – 18:00' };

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
                                        <div><label className={labelCls}>전화번호</label><input className={inputCls} placeholder="02-1234-5678" value={contact.phone || ''} onChange={e => setCmsContent({ ...cmsContent, contact: { ...contact, phone: e.target.value } })} /></div>
                                        <div><label className={labelCls}>이메일</label><input className={inputCls} placeholder="contact@..." value={contact.email || ''} onChange={e => setCmsContent({ ...cmsContent, contact: { ...contact, email: e.target.value } })} /></div>
                                        <div><label className={labelCls}>영업시간</label><input className={inputCls} placeholder="평일 09:00 – 18:00" value={contact.hours || ''} onChange={e => setCmsContent({ ...cmsContent, contact: { ...contact, hours: e.target.value } })} /></div>
                                        <div><label className={labelCls}>주소</label><input className={inputCls} placeholder="서울특별시..." value={contact.address || ''} onChange={e => setCmsContent({ ...cmsContent, contact: { ...contact, address: e.target.value } })} /></div>
                                    </div>
                                </div>

                                {/* Row 3: 강점 카드 */}
                                <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-lg font-bold flex items-center gap-2"><span>💪</span> 강점 카드 (왜 미래 하우징인가)</h2>
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
        </div>
    );
};

export default AdminDashboard;
