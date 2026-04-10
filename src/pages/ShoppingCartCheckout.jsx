import { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore, getEffectivePrice } from '../store/useCartStore';
import { useOrderStore } from '../store/useOrderStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatOrderUnit } from '../services/adminService';
import DaumPostcode from 'react-daum-postcode';
import { loadPaymentWidget } from '@tosspayments/payment-widget-sdk';

// 에디톤 제품 박스 배송 정보
const EDITON_BOX_INFO = {
    '에디톤 스톤': { pcsPerBox: 4, label: '4장 / 1박스' },
    '에디톤 스퀘어': { pcsPerBox: 4, label: '4장 / 1박스' },
    '에디톤 우드': { pcsPerBox: 7, label: '7장 / 1박스' },
};

function getEditonBoxInfo(item) {
    const sub = item.product?.subCategory;
    const info = EDITON_BOX_INFO[sub];
    if (!info) return null;
    const boxes = Math.ceil(item.qty / info.pcsPerBox);
    return { ...info, boxes, sub };
}

export default function ShoppingCartCheckout() {
    const { items, removeFromCart, updateQuantity, clearCart } = useCartStore();
    const { addOrder } = useOrderStore();
    const { user } = useAuthStore();
    const isBusiness = user?.role === 'business';
    const navigate = useNavigate();
    const [agreed, setAgreed] = useState(false);
    const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);

    // 최소 배송일 기본 3일 후 (장바구니 상품 중 재고 부족이거나 입고 예정일이 있는 경우, 가장 늦은 날짜 적용)
    const minDeliveryDate = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() + 3);
        let minDateStr = d.toISOString().split('T')[0];

        items.forEach(item => {
            const prod = item.product;
            if (prod && prod.inventory != null && prod.restockDate) {
                // 주문 수량이 현재 재고보다 많은 경우 (품절 또는 수량 부족) 입고예정일 체크
                if (item.qty > prod.inventory) {
                    if (prod.restockDate > minDateStr) {
                        minDateStr = prod.restockDate;
                    }
                }
            }
        });
        return minDateStr;
    }, [items]);

    // Derive initial delivery info from user without useEffect
    const initialDeliveryInfo = useMemo(() => ({
        name: user?.displayName || user?.name || '',
        phone: user?.phoneNumber || user?.phone || '',
        address: '', // 현장은 매번 다를 수 있으므로 주소는 자동으로 불러오지 않음
        addressDetail: '',
        deliveryDate: minDeliveryDate,
        unloadCondition: '',
        siteManagerPhone: ''
    }), [user, minDeliveryDate]);

    const [deliveryInfo, setDeliveryInfo] = useState(initialDeliveryInfo);

    // --- Toss Payments 결제 위젯 참조 ---
    const paymentWidgetRef = useRef(null);
    const paymentMethodsWidgetRef = useRef(null);
    const customerKey = useMemo(() => user?.uid || `guest_${Math.random().toString(36).slice(2)}`, [user]);

    const handlePostcodeComplete = (data) => {
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.addressType === 'R') {
            if (data.bname !== '') extraAddress += data.bname;
            if (data.buildingName !== '') extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
            fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
        }

        setDeliveryInfo({
            ...deliveryInfo,
            address: `[${data.zonecode}] ${fullAddress}`
        });
        setIsPostcodeOpen(false);
    };

    const totalPrice = items.reduce((sum, item) => sum + (getEffectivePrice(item.product, isBusiness) * item.qty), 0);
    const originalTotal = items.reduce((sum, item) => sum + ((item.product.price || 0) * item.qty), 0);
    const discountAmount = isBusiness ? originalTotal - totalPrice : 0;
    const discountRate = isBusiness && originalTotal > 0 ? Math.round((discountAmount / originalTotal) * 100) : 0;
    const tax = Math.floor(totalPrice * 0.1);
    const finalPrice = totalPrice + tax;

    // --- 토스페이먼츠 위젯 마운트 ---
    useEffect(() => {
        if (items.length === 0 || finalPrice <= 0) return;

        (async () => {
            try {
                // 테스트 클라이언트 키 (토스 문서 공식 샘플)
                const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
                const paymentWidget = await loadPaymentWidget(clientKey, customerKey);
                paymentWidgetRef.current = paymentWidget;

                const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
                    "#payment-widget", 
                    { value: finalPrice },
                    { variantKey: "DEFAULT" }
                );
                paymentMethodsWidgetRef.current = paymentMethodsWidget;

                paymentWidget.renderAgreement(
                    '#agreement', 
                    { variantKey: 'AGREEMENT' }
                );
            } catch (error) {
                console.error('결제 위젯 로딩 실패:', error);
            }
        })();
    }, [customerKey]); // 위젯 최초 로드시에만 동작

    // 가격 변경 시 위젯 금액 업데이트
    useEffect(() => {
        if (paymentMethodsWidgetRef.current && finalPrice > 0) {
            paymentMethodsWidgetRef.current.updateAmount(finalPrice);
        }
    }, [finalPrice]);

    const handleCheckout = async () => {
        if (items.length === 0) return;
        if (!agreed) {
            alert('주문 내역 확인 및 약관에 동의해주세요.');
            return;
        }

        if (!deliveryInfo.name || !deliveryInfo.phone || !deliveryInfo.address) {
            alert('배송 정보를 모두 입력해주세요.');
            return;
        }

        const checkoutUser = {
            name: deliveryInfo.name,
            displayName: deliveryInfo.name,
            phone: deliveryInfo.phone,
            email: user?.email || 'guest@order.com',
            address: `${deliveryInfo.address} ${deliveryInfo.addressDetail}`.trim(),
            unloadCondition: deliveryInfo.unloadCondition,
            siteManagerPhone: deliveryInfo.siteManagerPhone,
            deliveryDate: deliveryInfo.deliveryDate
        };

        // 승인 후 성공 처리 페이지(Success)로 데이터를 넘기기 위해 세션에 저장
        sessionStorage.setItem('pendingOrderDeliveryInfo', JSON.stringify(checkoutUser));
        sessionStorage.setItem('pendingOrderIsBusiness', isBusiness.toString());

        const generatedOrderId = `order_${new Date().getTime()}_${Math.random().toString(36).slice(2, 8)}`;
        const orderName = items.length > 1 
            ? `${items[0].product.title} 외 ${items.length - 1}건` 
            : items[0].product.title;

        try {
            await paymentWidgetRef.current?.requestPayment({
                orderId: generatedOrderId,
                orderName: orderName,
                successUrl: `${window.location.origin}/payment/success`,
                failUrl: `${window.location.origin}/payment/fail`,
                customerEmail: checkoutUser.email,
                customerName: checkoutUser.name,
                customerMobilePhone: checkoutUser.phone.replace(/[^0-9]/g, '')
            });
        } catch (error) {
            console.error('결제 요청 중단/에러:', error);
            // 에러 시 콜백으로 안 갈 수도 있음(유저가 결제창을 닫은 경우 등)
        }
    };

    return (
        <main className="flex-1 px-3 sm:px-4 md:px-20 py-6 sm:py-8 max-w-[1280px] mx-auto w-full mb-12 sm:mb-20">
            {/* 우편번호 검색 모달 */}
            {isPostcodeOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setIsPostcodeOpen(false)}>
                    <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">location_on</span>
                                주소 검색
                            </h3>
                            <button type="button" onClick={() => setIsPostcodeOpen(false)} className="material-symbols-outlined text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">close</button>
                        </div>
                        <DaumPostcode onComplete={handlePostcodeComplete} style={{ height: '450px' }} />
                    </div>
                </div>
            )}

            <nav className="flex items-center gap-2 mb-4 sm:mb-6 text-sm">
                <Link className="text-slate-500 hover:text-primary" to="/">홈</Link>
                <span className="material-symbols-outlined text-sm text-slate-400">chevron_right</span>
                <span className="text-slate-900 dark:text-slate-100 font-medium">장바구니</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-black mb-6 sm:mb-8 tracking-tight">장바구니 및 안전 결제</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* 데스크탑: 테이블 레이아웃 */}
                    <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50">
                                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">상품정보</th>
                                    <th className="px-3 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">옵션</th>
                                    <th className="px-3 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">수량</th>
                                    <th className="px-3 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">금액</th>
                                    <th className="px-3 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center whitespace-nowrap">삭제</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">
                                            장바구니에 담긴 상품이 없습니다.
                                        </td>
                                    </tr>
                                ) : (
                                    items.map((item, index) => (
                                        <tr key={`${item.product.id}-${index}`}>
                                            <td className="px-4 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-16 w-16 rounded-lg bg-cover bg-center border border-slate-100 dark:border-slate-800 shrink-0" style={{ backgroundImage: `url('${item.product.imageUrl}')` }}></div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">{item.product.title}</p>
                                                        <p className="text-xs text-slate-500">{item.product.model_id || `SKU: ${item.product.id}`}</p>
                                                        {(() => {
                                                            const sub = item.product?.subCategory || item.product?.category || '';
                                                            const isTileOrBox = sub.toLowerCase().includes('타일') || sub.toLowerCase().includes('lvt') || sub.toLowerCase().includes('에디톤') || sub.toLowerCase().includes('pst') || sub.toLowerCase().includes('에코노');
                                                            const isPrestige = sub.includes('프레스티지');
                                                            
                                                            let packagingText = item.product.specifications?.packaging || '';

                                                            const boxInfo = getEditonBoxInfo(item);
                                                            if (boxInfo) {
                                                                packagingText = boxInfo.label;
                                                            } else {
                                                                if (!packagingText) return null;
                                                                if (packagingText.includes('장') && packagingText.includes('박스') && !packagingText.includes('/')) {
                                                                    packagingText = packagingText.replace(' ', ' / ');
                                                                }
                                                                if (!isTileOrBox && !isPrestige && !packagingText.includes('장')) {
                                                                    packagingText = `${packagingText} / 1장`;
                                                                }
                                                            }

                                                            const prefix = isTileOrBox ? '박스배송' : '롤배송';
                                                            const iconEmoji = isTileOrBox ? '📦' : '📏';
                                                            const iconName = isTileOrBox ? 'inventory_2' : 'straighten';

                                                            return (
                                                                <span className="mt-1 inline-flex items-center gap-1 whitespace-nowrap text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded px-2 py-0.5">
                                                                    <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>{iconName}</span>
                                                                    {iconEmoji} {prefix} · {packagingText}
                                                                </span>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-5 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                {item.option}
                                            </td>
                                            <td className="px-3 py-5 border-transparent">
                                                <div className="flex items-center justify-center gap-3">
                                                    {(() => {
                                                        const cat = item.product.subCategory || item.product.category || '';
                                                        const pkg = item.product.specifications?.packaging || item.product.packaging || '';
                                                        const isSheet = cat.includes('시트') || cat.includes('프리미엄') || cat.includes('스탠다드') || cat.includes('엑스컴포트') || cat.includes('합판');
                                                        const rollMatch = pkg.match(/(\d+)M/i);
                                                        const step = isSheet && rollMatch ? parseInt(rollMatch[1]) : 1;
                                                        const minQty = step;
                                                        return (
                                                            <>
                                                                <button onClick={() => updateQuantity(item.product.id, item.option, Math.max(minQty, item.qty - step))} className="w-8 h-8 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800"><span className="material-symbols-outlined text-sm">remove</span></button>
                                                                <div className="flex flex-col items-center justify-center min-w-[60px]">
                                                                    <span className="font-medium whitespace-nowrap">{formatOrderUnit({ category: cat, quantity: item.qty, packaging: pkg }).displayQty}</span>
                                                                </div>
                                                                <button onClick={() => updateQuantity(item.product.id, item.option, item.qty + step)} className="w-8 h-8 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800"><span className="material-symbols-outlined text-sm">add</span></button>
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            </td>
                                            <td className="px-3 py-5 text-right font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                                                {isBusiness && item.product.businessPrice ? (
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[11px] text-slate-400 line-through">
                                                            {(item.product.price * item.qty).toLocaleString()}원
                                                        </span>
                                                        <span className="text-[#c8221f]">
                                                            {(item.product.businessPrice * item.qty).toLocaleString()}원
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span>{(item.product.price * item.qty).toLocaleString()}원</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-5 text-center">
                                                <button onClick={() => removeFromCart(item.product.id, item.option)} className="text-slate-400 hover:text-red-500 transition-colors">
                                                    <span className="material-symbols-outlined text-xl">delete</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* 모바일 카드 레이아웃 */}
                    <div className="block md:hidden space-y-3">
                        {items.length === 0 ? (
                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-12 text-center text-slate-500 font-medium shadow-sm">
                                장바구니에 담긴 상품이 없습니다.
                            </div>
                        ) : (
                            items.map((item, index) => {
                                const cat = item.product.subCategory || item.product.category || '';
                                const pkg = item.product.specifications?.packaging || item.product.packaging || '';
                                const isSheet = cat.includes('시트') || cat.includes('프리미엄') || cat.includes('스탠다드') || cat.includes('엑스컴포트') || cat.includes('합판');
                                const rollMatch = pkg.match(/(\d+)M/i);
                                const step = isSheet && rollMatch ? parseInt(rollMatch[1]) : 1;
                                const minQty = step;
                                const effectivePrice = getEffectivePrice(item.product, isBusiness);

                                return (
                                    <div key={`mobile-${item.product.id}-${index}`} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
                                        <div className="flex gap-3">
                                            {/* 상품 이미지 */}
                                            <div className="w-20 h-20 rounded-lg bg-cover bg-center border border-slate-100 dark:border-slate-800 shrink-0" style={{ backgroundImage: `url('${item.product.imageUrl}')` }}></div>
                                            {/* 상품 정보 */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">{item.product.title}</p>
                                                        <p className="text-[11px] text-slate-500">{item.product.model_id || `SKU: ${item.product.id}`}</p>
                                                    </div>
                                                    <button onClick={() => removeFromCart(item.product.id, item.option)} className="text-slate-300 hover:text-red-500 transition-colors shrink-0 -mt-0.5">
                                                        <span className="material-symbols-outlined text-[18px]">close</span>
                                                    </button>
                                                </div>
                                                {item.option !== '기본 옵션' && (
                                                    <p className="text-[11px] text-slate-500 mt-0.5">옵션: {item.option}</p>
                                                )}
                                                {/* 배송 정보 뱃지 */}
                                                {(() => {
                                                    const sub = item.product?.subCategory || item.product?.category || '';
                                                    const isTileOrBox = sub.toLowerCase().includes('타일') || sub.toLowerCase().includes('lvt') || sub.toLowerCase().includes('에디톤') || sub.toLowerCase().includes('pst') || sub.toLowerCase().includes('에코노');
                                                    const isPrestige = sub.includes('프레스티지');
                                                    let packagingText = item.product.specifications?.packaging || '';
                                                    const boxInfo = getEditonBoxInfo(item);
                                                    if (boxInfo) {
                                                        packagingText = boxInfo.label;
                                                    } else {
                                                        if (!packagingText) return null;
                                                        if (packagingText.includes('장') && packagingText.includes('박스') && !packagingText.includes('/')) {
                                                            packagingText = packagingText.replace(' ', ' / ');
                                                        }
                                                        if (!isTileOrBox && !isPrestige && !packagingText.includes('장')) {
                                                            packagingText = `${packagingText} / 1장`;
                                                        }
                                                    }
                                                    const prefix = isTileOrBox ? '📦' : '📏';
                                                    return (
                                                        <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded px-1.5 py-0.5">
                                                            {prefix} {packagingText}
                                                        </span>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                        {/* 수량 & 금액 */}
                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => updateQuantity(item.product.id, item.option, Math.max(minQty, item.qty - step))} className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 active:scale-95">
                                                    <span className="material-symbols-outlined text-sm">remove</span>
                                                </button>
                                                <span className="font-bold text-sm min-w-[50px] text-center">{formatOrderUnit({ category: cat, quantity: item.qty, packaging: pkg }).displayQty}</span>
                                                <button onClick={() => updateQuantity(item.product.id, item.option, item.qty + step)} className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 active:scale-95">
                                                    <span className="material-symbols-outlined text-sm">add</span>
                                                </button>
                                            </div>
                                            <div className="text-right">
                                                {isBusiness && item.product.businessPrice ? (
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[11px] text-slate-400 line-through">{(item.product.price * item.qty).toLocaleString()}원</span>
                                                        <span className="font-bold text-[#c8221f]">{(item.product.businessPrice * item.qty).toLocaleString()}원</span>
                                                    </div>
                                                ) : (
                                                    <span className="font-bold text-slate-900 dark:text-slate-100">{(effectivePrice * item.qty).toLocaleString()}원</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h3 className="text-lg font-bold mb-4">배송 정보 입력</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">이름</label>
                                    <input
                                        type="text"
                                        value={deliveryInfo.name}
                                        onChange={(e) => setDeliveryInfo({ ...deliveryInfo, name: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        placeholder="이름을 입력해주세요"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">연락처</label>
                                    <input
                                        type="tel"
                                        value={deliveryInfo.phone}
                                        onChange={(e) => setDeliveryInfo({ ...deliveryInfo, phone: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        placeholder="010-0000-0000"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">배송 주소</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={deliveryInfo.address}
                                        readOnly
                                        onClick={() => setIsPostcodeOpen(true)}
                                        className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none cursor-pointer"
                                        placeholder="주소 검색을 이용해주세요"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setIsPostcodeOpen(true)}
                                        className="px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white font-bold rounded-lg hover:bg-slate-700 transition-colors whitespace-nowrap"
                                    >
                                        주소 검색
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={deliveryInfo.addressDetail}
                                    onChange={(e) => setDeliveryInfo({ ...deliveryInfo, addressDetail: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="상세 주소를 입력해주세요 (동/호/층수 입력)"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">현장 관리인 연락처 <span className="text-slate-400 font-normal ml-1">(선택)</span></label>
                                    <input
                                        type="tel"
                                        value={deliveryInfo.siteManagerPhone}
                                        onChange={(e) => setDeliveryInfo({ ...deliveryInfo, siteManagerPhone: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all mb-4"
                                        placeholder="010-0000-0000 (현장 관리자 번호)"
                                    />
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">하차 조건 <span className="text-slate-400 font-normal ml-1">(선택)</span></label>
                                    <input
                                        type="text"
                                        value={deliveryInfo.unloadCondition}
                                        onChange={(e) => setDeliveryInfo({ ...deliveryInfo, unloadCondition: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        placeholder="지게차 하차, 까대기 등 주의사항 입력"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">배송 희망일</label>
                                <input
                                    type="date"
                                    value={deliveryInfo.deliveryDate}
                                    min={minDeliveryDate}
                                    onChange={(e) => setDeliveryInfo({ ...deliveryInfo, deliveryDate: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                                <p className="mt-1.5 text-xs text-red-500 font-semibold flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">schedule</span>
                                    {items.some(item => item.product?.inventory != null && item.qty > item.product?.inventory && item.product?.restockDate)
                                        ? `품절 또는 재고 부족 상품의 입고 예정일(${minDeliveryDate}) 이후로만 선택 가능합니다.` 
                                        : '배송 주문 최소 3일 후'}
                                </p>
                            </div>
                            <p className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                                <span className="material-symbols-outlined text-sm align-middle mr-1">info</span>
                                입력하신 정보는 원활한 배송 및 주문 확인을 위해서만 이용됩니다.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h3 className="text-lg font-bold border-b border-slate-100 pb-2">결제 수단</h3>
                        <div id="payment-widget" className="w-full min-h-[300px]" />
                    </div>

                    {/* Terms Agreement Section */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h3 className="text-lg font-bold">약관 동의</h3>
                        <div id="agreement" className="w-full my-2" />
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                    className="mt-1 w-5 h-5 text-primary focus:ring-primary rounded border-slate-300"
                                />
                                <div className="text-sm">
                                    <p className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">주문 내역 확인 및 유의사항 동의 (필수)</p>
                                    <p className="text-slate-500 mt-1 leading-relaxed">
                                        상품의 주문 수량, 옵션, 결제 금액을 확인하였으며, 쇼핑몰 이용약관 및 개인정보 처리방침에 동의합니다.
                                        특히 바닥재 재단 상품의 경우 단순 변심에 의한 반품이 제한될 수 있음을 확인하였습니다.
                                        <Link to="/shopping-guide" className="text-primary hover:underline ml-1 font-medium">[자세히 보기]</Link>
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm sticky top-24">
                        <h3 className="text-xl font-bold mb-6">결제 요약</h3>
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">상품 금액{isBusiness ? ' (사업자용)' : ''}</span>
                                <span className="font-medium">{totalPrice.toLocaleString()}원</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">부가세(10%)</span>
                                <span className="font-medium">{tax.toLocaleString()}원</span>
                            </div>
                            {/* 배송비 안내 - 전체 착불 */}
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">배송비</span>
                                <span className="font-bold text-red-500">착불</span>
                            </div>
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-baseline">
                                <span className="text-lg font-bold">최종 결제 금액</span>
                                <span className="text-2xl font-black text-primary">{finalPrice.toLocaleString()}원</span>
                            </div>

                            {/* 사업자 할인 혜택 요약 */}
                            {isBusiness && discountAmount > 0 && (
                                <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="material-symbols-outlined text-[18px] text-[#c8221f]">savings</span>
                                        <span className="text-[14px] font-black text-[#c8221f]">사업자 할인 혜택</span>
                                        <span className="ml-auto text-[11px] bg-[#c8221f] text-white px-2 py-0.5 rounded-full font-bold">약 {discountRate}% 절감</span>
                                    </div>
                                    <div className="space-y-2 text-[13px]">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">일반가 합계</span>
                                            <span className="text-slate-400 line-through">{originalTotal.toLocaleString()}원</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">사업자가 적용</span>
                                            <span className="font-bold text-slate-700">{totalPrice.toLocaleString()}원</span>
                                        </div>
                                        <div className="flex justify-between pt-2 border-t border-red-200">
                                            <span className="font-bold text-[#c8221f] flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                                                총 절감 금액
                                            </span>
                                            <span className="font-black text-[#c8221f] text-[15px]">-{discountAmount.toLocaleString()}원</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="space-y-3">
                            <button
                                className={`w-full font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${agreed ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200' : 'bg-slate-200 text-slate-500 animate-blink-warning border-red-200 shadow-sm'}`}
                                disabled={items.length === 0 || !agreed}
                                onClick={handleCheckout}
                            >
                                <span className="material-symbols-outlined">{agreed ? 'lock' : 'check_circle'}</span>
                                {agreed ? '결제하기' : '약관 동의 필요'}
                            </button>
                            <button onClick={() => navigate(-1)} className="w-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-lg transition-colors">
                                쇼핑 계속하기
                            </button>
                        </div>
                        <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-primary text-xl">verified_user</span>
                                <div className="text-xs text-slate-500 leading-relaxed">
                                    <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">안전 결제 에스크로 보증</p>
                                    고객님의 결제 정보는 철저히 보호되어 안전하게 처리되며, 개인정보 처리방침에 따라 관리됩니다.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}