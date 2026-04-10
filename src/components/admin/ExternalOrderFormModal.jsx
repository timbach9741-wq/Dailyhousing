// 외부 주문 등록/수정 모달
// 제품 자동완성(DB 연동) + 직접 입력 하이브리드 방식
// 전화 받으면서 빠르게 입력할 수 있도록 최적화된 폼
import React, { useState, useEffect, useRef, useMemo } from 'react';
import DaumPostcode from 'react-daum-postcode';
import { useProductStore } from '../../store/useProductStore';

// 주문 채널 목록
const CHANNELS = [
    { id: 'phone', label: '전화', icon: '📞' },
    { id: 'kakao', label: '카카오', icon: '💬' },
    { id: 'visit', label: '현장방문', icon: '🏢' },
    { id: 'email', label: '이메일', icon: '📧' },
    { id: 'other', label: '기타', icon: '📋' },
];

// 기본 배송일: 3일 후
const getDefaultDeliveryDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
};
const getPackagingLabel = (p) => {
    if (p?.specifications?.packaging) {
        return p.specifications.packaging;
    }
    if (p?.subCategory && (p.subCategory.includes('시트') || p.subCategory.includes('엑스컴포트'))) {
        return '롤';
    }
    return '박스';
};

const INITIAL_FORM = {
    customerName: '',
    phone: '',
    productName: '',
    quantity: '',
    unitPrice: '',
    totalPrice: '',
    deliveryDate: getDefaultDeliveryDate(),
    channel: 'phone',
    address: '',
    memo: '',
    // 제품 DB 연동 필드
    selectedProductId: null, // DB 제품 선택 시 ID 저장
    isCustomProduct: false,  // true면 직접 입력 모드
};

export default function ExternalOrderFormModal({ isOpen, onClose, onSubmit, editData }) {
    const [form, setForm] = useState(INITIAL_FORM);
    const [postcodeOpen, setPostcodeOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const nameRef = useRef(null);

    // 제품 자동완성 관련 상태
    const [productSearchText, setProductSearchText] = useState('');
    const [showProductDropdown, setShowProductDropdown] = useState(false);
    const productInputRef = useRef(null);
    const dropdownRef = useRef(null);

    // 제품 스토어에서 데이터 가져오기
    const { products, initProducts, isLoaded } = useProductStore();

    // 제품 데이터 초기 로드
    useEffect(() => {
        if (!isLoaded) initProducts();
    }, [isLoaded, initProducts]);

    const isEdit = !!editData;

    // 제품 검색 결과 (이름 또는 모델 코드로 검색, 최대 10개)
    const productSearchResults = useMemo(() => {
        if (!productSearchText.trim() || productSearchText.trim().length < 1) return [];
        const keyword = productSearchText.toLowerCase();
        return products.filter(p => {
            const title = (p.title || '').toLowerCase();
            const modelId = (p.model_id || '').toLowerCase();
            const subCat = (p.subCategory || '').toLowerCase();
            return title.includes(keyword) || modelId.includes(keyword) || subCat.includes(keyword);
        }).slice(0, 10);
    }, [productSearchText, products]);

    // 수정 모드일 때 기존 데이터 로드
    useEffect(() => {
        if (editData) {
            setForm({
                customerName: editData.customerName || '',
                phone: editData.phone || '',
                productName: editData.productName || '',
                quantity: editData.quantity || '',
                unitPrice: editData.unitPrice || '',
                totalPrice: editData.totalPrice || '',
                deliveryDate: editData.deliveryDate || getDefaultDeliveryDate(),
                channel: editData.channel || 'phone',
                address: editData.address || '',
                memo: editData.memo || '',
                selectedProductId: editData.selectedProductId || null,
                isCustomProduct: editData.isCustomProduct || false,
            });
            setProductSearchText(editData.productName || '');
        } else {
            setForm({ ...INITIAL_FORM, deliveryDate: getDefaultDeliveryDate() });
            setProductSearchText('');
        }
    }, [editData]);

    // 모달 열릴 때 이름 필드에 자동 포커스
    useEffect(() => {
        if (isOpen && nameRef.current) {
            setTimeout(() => nameRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // 외부 클릭 시 드롭다운 닫기
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
                productInputRef.current && !productInputRef.current.contains(e.target)) {
                setShowProductDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleChange = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    // 수량 변경 시 자동 총액 계산 (단가가 있을 경우)
    const handleQuantityChange = (value) => {
        const newForm = { ...form, quantity: value };
        // 수량이 숫자이고 단가가 있으면 총액 자동 계산
        const numQty = parseFloat(value);
        const numPrice = parseFloat(form.unitPrice);
        if (!isNaN(numQty) && !isNaN(numPrice) && numQty > 0 && numPrice > 0) {
            newForm.totalPrice = Math.round(numQty * numPrice);
        }
        setForm(newForm);
    };

    // 단가 변경 시 자동 총액 계산
    const handleUnitPriceChange = (value) => {
        const newForm = { ...form, unitPrice: value };
        const numQty = parseFloat(form.quantity);
        const numPrice = parseFloat(value);
        if (!isNaN(numQty) && !isNaN(numPrice) && numQty > 0 && numPrice > 0) {
            newForm.totalPrice = Math.round(numQty * numPrice);
        }
        setForm(newForm);
    };

    // DB 제품 선택 시 폼에 자동 반영
    const handleSelectProduct = (product) => {
        setForm(prev => ({
            ...prev,
            productName: product.title || '',
            unitPrice: product.price ? Math.round(product.price * 1.1) : '',
            selectedProductId: product.id,
            isCustomProduct: false,
            // 수량이 이미 있으면 총액 자동 계산
            totalPrice: (() => {
                const numQty = parseFloat(prev.quantity);
                const numPrice = product.price ? Math.round(product.price * 1.1) : 0;
                if (!isNaN(numQty) && !isNaN(numPrice) && numQty > 0 && numPrice > 0) {
                    return Math.round(numQty * numPrice);
                }
                return prev.totalPrice;
            })(),
        }));
        setProductSearchText(product.title || '');
        setShowProductDropdown(false);
    };

    // 직접 입력 모드로 전환 (DB에 없는 제품)
    const handleCustomProduct = () => {
        setForm(prev => ({
            ...prev,
            productName: productSearchText,
            selectedProductId: null,
            isCustomProduct: true,
        }));
        setShowProductDropdown(false);
    };

    // 제품 입력 텍스트 변경
    const handleProductSearchChange = (value) => {
        setProductSearchText(value);
        setShowProductDropdown(true);
        // 검색 중엔 선택 해제 (사용자가 직접 수정했으므로)
        setForm(prev => ({
            ...prev,
            productName: value,
            selectedProductId: null,
            isCustomProduct: false,
        }));
    };

    const handlePostcodeComplete = (data) => {
        let fullAddress = data.address;
        let extraAddress = '';
        if (data.addressType === 'R') {
            if (data.bname) extraAddress += data.bname;
            if (data.buildingName) extraAddress += extraAddress ? `, ${data.buildingName}` : data.buildingName;
            fullAddress += extraAddress ? ` (${extraAddress})` : '';
        }
        handleChange('address', `[${data.zonecode}] ${fullAddress}`);
        setPostcodeOpen(false);
    };

    const handleSubmit = async () => {
        if (!form.customerName.trim()) {
            alert('고객명을 입력해주세요.');
            nameRef.current?.focus();
            return;
        }
        if (!form.phone.trim()) {
            alert('연락처를 입력해주세요.');
            return;
        }
        if (!form.deliveryDate) {
            alert('배송 희망일을 선택해주세요.');
            return;
        }

        setSaving(true);
        try {
            await onSubmit(form, editData?.id);
            setForm({ ...INITIAL_FORM, deliveryDate: getDefaultDeliveryDate() });
            setProductSearchText('');
            onClose();
        } catch (err) {
            console.error('submit error:', err);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                {/* 헤더 */}
                <div className="sticky top-0 bg-[#0f172a] border-b border-white/10 rounded-t-3xl px-6 py-4 flex items-center justify-between z-10">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-teal-400">{isEdit ? 'edit_note' : 'add_circle'}</span>
                        {isEdit ? '외부 주문 수정' : '새 외부 주문 등록'}
                    </h3>
                    <button onClick={onClose} className="material-symbols-outlined text-slate-400 hover:text-white transition-colors">close</button>
                </div>

                <div className="p-6 space-y-5">
                    {/* 주문 채널 선택 */}
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-2">주문 채널</label>
                        <div className="flex flex-wrap gap-2">
                            {CHANNELS.map(ch => (
                                <button
                                    key={ch.id}
                                    onClick={() => handleChange('channel', ch.id)}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                                        form.channel === ch.id
                                            ? 'bg-teal-500/20 border-teal-500/50 text-teal-300'
                                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                                    }`}
                                >
                                    <span>{ch.icon}</span> {ch.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 고객명 + 연락처 */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                고객명 <span className="text-red-400">*</span>
                            </label>
                            <input
                                ref={nameRef}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                                value={form.customerName}
                                onChange={e => handleChange('customerName', e.target.value)}
                                placeholder="홍길동"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                연락처 <span className="text-red-400">*</span>
                            </label>
                            <input
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                                value={form.phone}
                                onChange={e => handleChange('phone', e.target.value)}
                                placeholder="010-0000-0000"
                            />
                        </div>
                    </div>

                    {/* ====== 제품 검색 + 자동완성 영역 ====== */}
                    <div className="relative">
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">
                            제품명 / 제품 코드
                            {form.selectedProductId && (
                                <span className="ml-2 text-teal-400 text-[10px] font-bold bg-teal-500/10 px-2 py-0.5 rounded-full">DB 연동</span>
                            )}
                            {form.isCustomProduct && (
                                <span className="ml-2 text-amber-400 text-[10px] font-bold bg-amber-500/10 px-2 py-0.5 rounded-full">직접 입력</span>
                            )}
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">search</span>
                            <input
                                ref={productInputRef}
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                                value={productSearchText}
                                onChange={e => handleProductSearchChange(e.target.value)}
                                onFocus={() => { if (productSearchText.trim()) setShowProductDropdown(true); }}
                                placeholder="제품명 또는 모델 코드 입력 (예: 에디톤, QUIR512)"
                            />
                            {/* 선택된 제품 초기화 버튼 */}
                            {(form.selectedProductId || form.isCustomProduct) && (
                                <button
                                    onClick={() => {
                                        setProductSearchText('');
                                        setForm(prev => ({ ...prev, productName: '', unitPrice: '', totalPrice: '', selectedProductId: null, isCustomProduct: false }));
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 hover:text-white text-[16px] transition-colors"
                                >
                                    close
                                </button>
                            )}
                        </div>

                        {/* 자동완성 드롭다운 */}
                        {showProductDropdown && productSearchText.trim().length >= 1 && (
                            <div ref={dropdownRef} className="absolute left-0 right-0 top-full mt-1 z-50 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl max-h-64 overflow-y-auto">
                                {productSearchResults.length > 0 ? (
                                    <>
                                        {productSearchResults.map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => handleSelectProduct(p)}
                                                className="w-full p-3 text-left hover:bg-teal-500/10 transition-all flex items-center gap-3 border-b border-white/5 last:border-b-0"
                                            >
                                                {/* 제품 이미지 썸네일 */}
                                                <img
                                                    src={p.imageUrl}
                                                    alt=""
                                                    className="w-10 h-10 rounded-lg object-cover bg-slate-800 shrink-0"
                                                    onError={e => { e.target.style.display = 'none'; }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white text-xs font-semibold truncate">{p.title}</p>
                                                    <p className="text-slate-500 text-[10px]">
                                                        {p.model_id || '-'} · {p.subCategory || ''}
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-teal-400 text-xs font-bold">₩{Math.round((p.price || 0) * 1.1).toLocaleString()}</p>
                                                    <p className="text-slate-500 text-[10px]">/ {getPackagingLabel(p)} (VAT포함)</p>
                                                </div>
                                            </button>
                                        ))}
                                        {/* 직접 입력 옵션 (항상 하단에 표시) */}
                                        <button
                                            onClick={handleCustomProduct}
                                            className="w-full p-3 text-left hover:bg-amber-500/10 transition-all flex items-center gap-2 border-t border-white/10 bg-white/[0.02]"
                                        >
                                            <span className="material-symbols-outlined text-amber-400 text-[18px]">edit_note</span>
                                            <span className="text-amber-400 text-xs font-bold">"{productSearchText}" 직접 입력</span>
                                        </button>
                                    </>
                                ) : (
                                    /* 검색 결과 없을 때 직접 입력 유도 */
                                    <div className="p-4">
                                        <p className="text-slate-500 text-xs text-center mb-3">일치하는 제품이 없습니다.</p>
                                        <button
                                            onClick={handleCustomProduct}
                                            className="w-full py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">edit_note</span>
                                            "{productSearchText}" (으)로 직접 입력
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 선택된 제품 정보 카드 (DB 제품 선택 시) */}
                    {form.selectedProductId && (() => {
                        const selected = products.find(p => p.id === form.selectedProductId);
                        if (!selected) return null;
                        return (
                            <div className="p-3 rounded-xl bg-teal-500/5 border border-teal-500/20 flex items-center gap-3">
                                <img
                                    src={selected.imageUrl}
                                    alt=""
                                    className="w-12 h-12 rounded-lg object-cover bg-slate-800"
                                    onError={e => { e.target.style.display = 'none'; }}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-semibold truncate">{selected.title}</p>
                                    <p className="text-slate-400 text-[11px]">{selected.model_id || ''} · {selected.subCategory || ''}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-teal-400 text-sm font-bold">₩{Math.round((selected.price || 0) * 1.1).toLocaleString()}</p>
                                    <p className="text-slate-500 text-[10px]">/ {getPackagingLabel(selected)} (VAT포함)</p>
                                </div>
                            </div>
                        );
                    })()}

                    {/* 수량 + 단가 + 총액 (자동 계산) */}
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">수량</label>
                            <input
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                                value={form.quantity}
                                onChange={e => handleQuantityChange(e.target.value)}
                                placeholder="30"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                단가
                                {form.selectedProductId && <span className="text-teal-400 text-[10px] ml-1">자동</span>}
                            </label>
                            <input
                                type="number"
                                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 ${
                                    form.selectedProductId
                                        ? 'bg-teal-500/5 border-teal-500/20 text-teal-300'
                                        : 'bg-white/5 border-white/10 text-white'
                                }`}
                                value={form.unitPrice}
                                onChange={e => handleUnitPriceChange(e.target.value)}
                                placeholder="45,000"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                총액
                                {(form.unitPrice && form.quantity) && <span className="text-teal-400 text-[10px] ml-1">자동</span>}
                            </label>
                            <input
                                type="number"
                                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 ${
                                    form.unitPrice && form.quantity
                                        ? 'bg-teal-500/5 border-teal-500/20 text-teal-300 font-bold'
                                        : 'bg-white/5 border-white/10 text-white'
                                }`}
                                value={form.totalPrice}
                                onChange={e => handleChange('totalPrice', e.target.value)}
                                placeholder="1,350,000"
                            />
                        </div>
                    </div>

                    {/* 자동 계산 안내 */}
                    {form.unitPrice && form.quantity && form.totalPrice && (
                        <div className="flex items-center gap-2 px-1">
                            <span className="material-symbols-outlined text-teal-400 text-[14px]">calculate</span>
                            <p className="text-[11px] text-slate-500">
                                {Number(form.quantity).toLocaleString()} × ₩{Number(form.unitPrice).toLocaleString()} = <span className="text-teal-400 font-bold">₩{Number(form.totalPrice).toLocaleString()}</span>
                            </p>
                        </div>
                    )}

                    {/* 배송 희망일 */}
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">
                            배송 희망일 <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="date"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                            value={form.deliveryDate}
                            onChange={e => handleChange('deliveryDate', e.target.value)}
                        />
                    </div>

                    {/* 주소 */}
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">배송 주소</label>
                        <div className="flex gap-2">
                            <input
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none cursor-pointer"
                                value={form.address}
                                readOnly
                                onClick={() => setPostcodeOpen(true)}
                                placeholder="주소 검색"
                            />
                            <button
                                onClick={() => setPostcodeOpen(!postcodeOpen)}
                                className="px-4 py-3 rounded-xl bg-teal-500/20 border border-teal-500/30 text-teal-400 text-sm font-semibold hover:bg-teal-500/30 transition-all whitespace-nowrap"
                            >
                                {postcodeOpen ? '닫기' : '검색'}
                            </button>
                        </div>
                        {postcodeOpen && (
                            <div className="mt-2 rounded-xl overflow-hidden border border-white/10">
                                <DaumPostcode onComplete={handlePostcodeComplete} style={{ height: '300px' }} />
                            </div>
                        )}
                    </div>

                    {/* 메모 */}
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">메모</label>
                        <textarea
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 resize-none"
                            rows={3}
                            value={form.memo}
                            onChange={e => handleChange('memo', e.target.value)}
                            placeholder="특이사항, 요청사항 등"
                        />
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 font-semibold hover:bg-white/10 transition-all"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="flex-1 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-[18px]">
                                {saving ? 'hourglass_empty' : 'check_circle'}
                            </span>
                            {saving ? '저장 중...' : isEdit ? '수정 완료' : '등록'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
