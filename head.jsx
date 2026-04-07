import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore, getEffectivePrice } from '../store/useCartStore';
import { useOrderStore } from '../store/useOrderStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatOrderUnit } from '../services/adminService';
import DaumPostcode from 'react-daum-postcode';

// ?�디???�품 박스 배송 ?�보
const EDITON_BOX_INFO = {
    '?�디???�톤': { pcsPerBox: 4, label: '4??/ 1박스' },
    '?�디???�퀘어': { pcsPerBox: 4, label: '4??/ 1박스' },
    '?�디???�드': { pcsPerBox: 7, label: '7??/ 1박스' },
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

    // 최소 배송??기본 3?�후 (?�바구니 ??�� �??�고 부족이�??�고 ?�정???�는 경우, 가????? ?�짜 ?�용)
    const minDeliveryDate = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() + 3);
        let minDateStr = d.toISOString().split('T')[0];

        items.forEach(item => {
            const prod = item.product;
            if (prod && prod.inventory != null && prod.restockDate) {
                // ?�량???�재 ?�고보다 많�? 경우 (?�절 ?�는 ?�량 부�? ?�고?�정??체크
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
        address: '', // ?�장?� 매번 ?��? ???�으므�?주소???�동?�로 불러?��? ?�음
        addressDetail: '',
        deliveryDate: minDeliveryDate,
        unloadCondition: '',
        siteManagerPhone: ''
    }), [user, minDeliveryDate]);

    const [deliveryInfo, setDeliveryInfo] = useState(initialDeliveryInfo);

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

    const handleCheckout = async () => {
        if (items.length === 0) return;
        if (!agreed) {
            alert('주문 ?�역 ?�인 �??�의???�의?�주?�요.');
            return;
        }

        if (!deliveryInfo.name || !deliveryInfo.phone || !deliveryInfo.address) {
            alert('배송 ?�보�?모두 ?�력?�주?�요.');
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

        await addOrder(items, finalPrice, user?.uid || 'guest', checkoutUser, isBusiness);
        clearCart();
        if (user) {
            alert('결제가 ?�료?�었?�니?? 주문 ?�인 ?�이지�??�동?�니??');
            navigate('/mypage');
        } else {
            alert('결제가 ?�료?�었?�니?? 비회??주문 조회 ?�이지�??�동?�니??');
            navigate('/order-lookup');
        }
    };

    return (
        <main className="flex-1 px-3 sm:px-4 md:px-20 py-6 sm:py-8 max-w-[1280px] mx-auto w-full mb-12 sm:mb-20">
            {/* ?�편번호 검??모달 */}
            {isPostcodeOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setIsPostcodeOpen(false)}>
                    <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">location_on</span>
                                주소 검??                            </h3>
                            <button type="button" onClick={() => setIsPostcodeOpen(false)} className="material-symbols-outlined text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">close</button>
                        </div>
                        <DaumPostcode onComplete={handlePostcodeComplete} style={{ height: '450px' }} />
                    </div>
                </div>
            )}

            <nav className="flex items-center gap-2 mb-4 sm:mb-6 text-sm">
                <Link className="text-slate-500 hover:text-primary" to="/">??/Link>
                <span className="material-symbols-outlined text-sm text-slate-400">chevron_right</span>
                <span className="text-slate-900 dark:text-slate-100 font-medium">?�바구니</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-black mb-6 sm:mb-8 tracking-tight">?�바구니 �??�전 결제</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* ?�스?�탑: ?�이�??�이?�웃 */}
                    <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50">
                                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">?�품?�보</th>
                                    <th className="px-3 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">?�션</th>
                                    <th className="px-3 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">?�량</th>
                                    <th className="px-3 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">금액</th>
                                    <th className="px-3 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center whitespace-nowrap">??��</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">
                                            ?�바구니???�긴 ?�품???�습?�다.
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
                                                            const isTileOrBox = sub.toLowerCase().includes('?�??) || sub.toLowerCase().includes('lvt') || sub.toLowerCase().includes('?�디??) || sub.toLowerCase().includes('pst') || sub.toLowerCase().includes('?�코??);
                                                            const isPrestige = sub.includes('?�레?�티지');
                                                            
                                                            let packagingText = item.product.specifications?.packaging || '';

                                                            const boxInfo = getEditonBoxInfo(item);
                                                            if (boxInfo) {
                                                                packagingText = boxInfo.label;
                                                            } else {
                                                                if (!packagingText) return null;
                                                                if (packagingText.includes('??) && packagingText.includes('박스') && !packagingText.includes('/')) {
                                                                    packagingText = packagingText.replace(' ', ' / ');
                                                                }
                                                                if (!isTileOrBox && !isPrestige && !packagingText.includes('�?)) {
                                                                    packagingText = `${packagingText} / 1�?;
                                                                }
                                                            }

                                                            const prefix = isTileOrBox ? '박스배송' : '롤배??;
                                                            const iconEmoji = isTileOrBox ? '?��' : '?��';
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
                                                        const isSheet = cat.includes('?�트') || cat.includes('?�리미엄') || cat.includes('?�탠?�드') || cat.includes('?�스컴포??) || cat.includes('?�판');
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
                                                            {(item.product.price * item.qty).toLocaleString()}??                                                        </span>
                                                        <span className="text-[#c8221f]">
                                                            {(item.product.businessPrice * item.qty).toLocaleString()}??                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span>{(item.product.price * item.qty).toLocaleString()}??/span>
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

                    {/* 모바??카드 ?�이?�웃 */}
                    <div className="block md:hidden space-y-3">
                        {items.length === 0 ? (
                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-12 text-center text-slate-500 font-medium shadow-sm">
                                ?�바구니???�긴 ?�품???�습?�다.
                            </div>
                        ) : (
                            items.map((item, index) => {
                                const cat = item.product.subCategory || item.product.category || '';
                                const pkg = item.product.specifications?.packaging || item.product.packaging || '';
                                const isSheet = cat.includes('?�트') || cat.includes('?�리미엄') || cat.includes('?�탠?�드') || cat.includes('?�스컴포??) || cat.includes('?�판');
                                const rollMatch = pkg.match(/(\d+)M/i);
                                const step = isSheet && rollMatch ? parseInt(rollMatch[1]) : 1;
                                const minQty = step;
                                const effectivePrice = getEffectivePrice(item.product, isBusiness);

                                return (
                                    <div key={`mobile-${item.product.id}-${index}`} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
                                        <div className="flex gap-3">
                                            {/* ?�품 ?��?지 */}
                                            <div className="w-20 h-20 rounded-lg bg-cover bg-center border border-slate-100 dark:border-slate-800 shrink-0" style={{ backgroundImage: `url('${item.product.imageUrl}')` }}></div>
                                            {/* ?�품 ?�보 */}
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
                                                {item.option !== '기본 ?�션' && (
                                                    <p className="text-[11px] text-slate-500 mt-0.5">?�션: {item.option}</p>
                                                )}
                                                {/* 배송 ?�보 뱃�? */}
                                                {(() => {
                                                    const sub = item.product?.subCategory || item.product?.category || '';
                                                    const isTileOrBox = sub.toLowerCase().includes('?�??) || sub.toLowerCase().includes('lvt') || sub.toLowerCase().includes('?�디??) || sub.toLowerCase().includes('pst') || sub.toLowerCase().includes('?�코??);
                                                    const isPrestige = sub.includes('?�레?�티지');
                                                    let packagingText = item.product.specifications?.packaging || '';
                                                    const boxInfo = getEditonBoxInfo(item);
                                                    if (boxInfo) {
                                                        packagingText = boxInfo.label;
                                                    } else {
                                                        if (!packagingText) return null;
                                                        if (packagingText.includes('??) && packagingText.includes('박스') && !packagingText.includes('/')) {
                                                            packagingText = packagingText.replace(' ', ' / ');
                                                        }
                                                        if (!isTileOrBox && !isPrestige && !packagingText.includes('�?)) {
                                                            packagingText = `${packagingText} / 1�?;
                                                        }
                                                    }
                                                    const prefix = isTileOrBox ? '?��' : '?��';
                                                    return (
                                                        <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded px-1.5 py-0.5">
                                                            {prefix} {packagingText}
                                                        </span>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                        {/* ?�량 & 금액 */}
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
                                                        <span className="text-[11px] text-slate-400 line-through">{(item.product.price * item.qty).toLocaleString()}??/span>
                                                        <span className="font-bold text-[#c8221f]">{(item.product.businessPrice * item.qty).toLocaleString()}??/span>
                                                    </div>
                                                ) : (
                                                    <span className="font-bold text-slate-900 dark:text-slate-100">{(effectivePrice * item.qty).toLocaleString()}??/span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h3 className="text-lg font-bold mb-4">배송 ?�보 ?�력</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">?�름</label>
                                    <input
                                        type="text"
                                        value={deliveryInfo.name}
                                        onChange={(e) => setDeliveryInfo({ ...deliveryInfo, name: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        placeholder="?�름???�력?�주?�요"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">?�락�?/label>
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
                                        placeholder="주소 검?�을 ?�용?�주?�요"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setIsPostcodeOpen(true)}
                                        className="px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white font-bold rounded-lg hover:bg-slate-700 transition-colors whitespace-nowrap"
                                    >
                                        주소 검??                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={deliveryInfo.addressDetail}
                                    onChange={(e) => setDeliveryInfo({ ...deliveryInfo, addressDetail: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="?�세 주소�??�력?�주?�요 (?? ?�수 ?�력)"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">?�장 관리인 ?�락�?<span className="text-slate-400 font-normal ml-1">(?�택)</span></label>
                                    <input
                                        type="tel"
                                        value={deliveryInfo.siteManagerPhone}
                                        onChange={(e) => setDeliveryInfo({ ...deliveryInfo, siteManagerPhone: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all mb-4"
                                        placeholder="010-0000-0000 (?�장 관리자 번호)"
                                    />
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">?�차 조건 <span className="text-slate-400 font-normal ml-1">(?�택)</span></label>
                                    <input
                                        type="text"
                                        value={deliveryInfo.unloadCondition}
                                        onChange={(e) => setDeliveryInfo({ ...deliveryInfo, unloadCondition: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        placeholder="?? 지게차 ?�차, 까�?�?기�? ?�의?�항 ?�력"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">배송 ?�망??/label>
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
                                        ? `?�절 ?�품(?�는 ?�고 부�????�고 ?�정??${minDeliveryDate}) ?�후로만 ?�택 가?�합?�다.` 
                                        : '배송 주문 최소 3?�후'}
                                </p>
                            </div>
                            <p className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                                <span className="material-symbols-outlined text-sm align-middle mr-1">info</span>
                                ?�력?�신 ?�보???�활??배송 �?주문 ?�인???�해?�만 ?�용?�니??
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h3 className="text-lg font-bold mb-4">결제 ?�단 ?�택</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <label className="relative flex flex-col p-4 border-2 border-primary rounded-xl bg-primary/5 cursor-pointer transition-all">
                                <input defaultChecked className="absolute top-4 right-4 text-primary focus:ring-primary h-4 w-4" name="payment" type="radio" />
                                <span className="material-symbols-outlined text-2xl mb-2 text-primary">credit_card</span>
                                <span className="font-bold text-sm">?�용카드</span>
                                <span className="text-xs text-slate-500">?�시�?�??��? 결제</span>
                            </label>
                            <label className="relative flex flex-col p-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-primary/50 cursor-pointer transition-all">
                                <input className="absolute top-4 right-4 text-primary focus:ring-primary h-4 w-4" name="payment" type="radio" />
                                <div className="w-6 h-6 mb-2 rounded bg-[#FEE500] flex items-center justify-center overflow-hidden">
                                    <span className="material-symbols-outlined text-lg text-slate-900">chat_bubble</span>
                                </div>
                                <span className="font-bold text-sm">카카?�페??/span>
                                <span className="text-xs text-slate-500">간편?�고 빠른 결제</span>
                            </label>
                            <label className="relative flex flex-col p-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-primary/50 cursor-pointer transition-all">
                                <input className="absolute top-4 right-4 text-primary focus:ring-primary h-4 w-4" name="payment" type="radio" />
                                <span className="material-symbols-outlined text-2xl mb-2 text-slate-400">account_balance</span>
                                <span className="font-bold text-sm">?�시�?계좌?�체</span>
                                <span className="text-xs text-slate-500">?�스?�로 ?�전결제 지??/span>
                            </label>
                        </div>
                    </div>

                    {/* Terms Agreement Section */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h3 className="text-lg font-bold mb-4">?��? ?�의</h3>
                        <div className="space-y-4">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                    className="mt-1 w-5 h-5 text-primary focus:ring-primary rounded border-slate-300"
                                />
                                <div className="text-sm">
                                    <p className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">주문 ?�역 ?�인 �??�의?�항 ?�의 (?�수)</p>
                                    <p className="text-slate-500 mt-1 leading-relaxed">
                                        ?�품??주문 ?�량, ?�션, 결제 금액???�인?��??�며, ?�핑�??�용?��? �?개인?�보 처리방침???�의?�니??
                                        ?�히 바닥???�단 ?�품??경우 ?�순 변??반품???�한?????�음???�인?��??�니??
                                        <Link to="/shopping-guide" className="text-primary hover:underline ml-1 font-medium">[?�세??보기]</Link>
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm sticky top-24">
                        <h3 className="text-xl font-bold mb-6">결제 ?�약</h3>
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">?�품 금액{isBusiness ? ' (?�업?��?)' : ''}</span>
                                <span className="font-medium">{totalPrice.toLocaleString()}??/span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">부가??10%)</span>
                                <span className="font-medium">{tax.toLocaleString()}??/span>
                            </div>
                            {/* 배송�??�내 - ?�체 착불 */}
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">배송�?/span>
                                <span className="font-bold text-red-500">착불</span>
                            </div>
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-baseline">
                                <span className="text-lg font-bold">최종 결제 금액</span>
                                <span className="text-2xl font-black text-primary">{finalPrice.toLocaleString()}??/span>
                            </div>

                            {/* ?�업???�인 ?�택 ?�약 */}
                            {isBusiness && discountAmount > 0 && (
                                <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="material-symbols-outlined text-[18px] text-[#c8221f]">savings</span>
                                        <span className="text-[14px] font-black text-[#c8221f]">?�업???�인 ?�택</span>
                                        <span className="ml-auto text-[11px] bg-[#c8221f] text-white px-2 py-0.5 rounded-full font-bold">�?{discountRate}% ?�감</span>
                                    </div>
                                    <div className="space-y-2 text-[13px]">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">?�반가 ?�계</span>
                                            <span className="text-slate-400 line-through">{originalTotal.toLocaleString()}??/span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">?�업?��? ?�용</span>
                                            <span className="font-bold text-slate-700">{totalPrice.toLocaleString()}??/span>
                                        </div>
                                        <div className="flex justify-between pt-2 border-t border-red-200">
                                            <span className="font-bold text-[#c8221f] flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                                                �??�감 금액
                                            </span>
                                            <span className="font-black text-[#c8221f] text-[15px]">-{discountAmount.toLocaleString()}??/span>
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
                                {agreed ? '결제?�기' : '?��? ?�의 ?�요'}
                            </button>
                            <button onClick={() => navigate(-1)} className="w-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-lg transition-colors">
                                ?�핑 계속?�기
                            </button>
                        </div>
                        <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-primary text-xl">verified_user</span>
                                <div className="text-xs text-slate-500 leading-relaxed">
                                    <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">?�전 결제 ?�스??보증</p>
                                    고객?�의 결제 ?�보??보호?�어 ?�전?�게 처리?�며, 개인?�보 처리방침???�라 철�???보호?�니??
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}