import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useOrderStore } from '../store/useOrderStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatOrderUnit } from '../services/adminService';
import DaumPostcode from 'react-daum-postcode';

// 에디톤 제품 박스 배송 정보
const EDITON_BOX_INFO = {
    '에디톤 스톤': { pcsPerBox: 4, label: '4매 / 1박스' },
    '에디톤 스퀘어': { pcsPerBox: 4, label: '4매 / 1박스' },
    '에디톤 우드': { pcsPerBox: 7, label: '7매 / 1박스' },
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
    const navigate = useNavigate();
    const [agreed, setAgreed] = useState(false);
    const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);

    // Derive initial delivery info from user without useEffect
    const initialDeliveryInfo = useMemo(() => ({
        name: user?.displayName || user?.name || '',
        phone: user?.phone || '',
        address: user?.address || '',
        addressDetail: ''
    }), [user]);

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

    const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.qty), 0);
    const tax = Math.floor(totalPrice * 0.1);
    const finalPrice = totalPrice + tax;

    const handleCheckout = async () => {
        if (items.length === 0) return;
        if (!agreed) {
            alert('주문 내역 확인 및 약관에 동의해 주세요.');
            return;
        }

        if (!deliveryInfo.name || !deliveryInfo.phone || !deliveryInfo.address) {
            alert('배송 정보를 모두 입력해 주세요.');
            return;
        }

        const checkoutUser = {
            name: deliveryInfo.name,
            displayName: deliveryInfo.name,
            phone: deliveryInfo.phone,
            email: user?.email || 'guest@order.com',
            address: `${deliveryInfo.address} ${deliveryInfo.addressDetail}`.trim()
        };

        await addOrder(items, finalPrice, user?.uid || 'guest', checkoutUser);
        clearCart();
        alert('결제가 완료되었습니다. 주문 확인 페이지로 이동합니다.');
        navigate('/mypage');
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
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
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
                                                            const boxInfo = getEditonBoxInfo(item);
                                                            if (boxInfo) return (
                                                                <span className="mt-1 inline-flex items-center gap-1 whitespace-nowrap text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded px-2 py-0.5">
                                                                    <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>inventory_2</span>
                                                                    📦 박스배송 · {boxInfo.label}
                                                                </span>
                                                            );
                                                            if (item.product.specifications?.packaging) return (
                                                                <span className="mt-1 inline-flex items-center gap-1 whitespace-nowrap text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded px-2 py-0.5">
                                                                    <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>inventory_2</span>
                                                                    📦 {item.product.specifications.packaging}
                                                                </span>
                                                            );
                                                            return null;
                                                        })()}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-5 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                {item.option}
                                            </td>
                                            <td className="px-3 py-5 border-transparent">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button onClick={() => updateQuantity(item.product.id, item.option, item.qty - 1)} className="w-8 h-8 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800"><span className="material-symbols-outlined text-sm">remove</span></button>
                                                    <div className="flex flex-col items-center justify-center min-w-[60px]">
                                                        <span className="font-medium whitespace-nowrap">{formatOrderUnit({ category: item.product.subCategory || item.product.category, quantity: item.qty }).displayQty}</span>
                                                    </div>
                                                    <button onClick={() => updateQuantity(item.product.id, item.option, item.qty + 1)} className="w-8 h-8 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800"><span className="material-symbols-outlined text-sm">add</span></button>
                                                </div>
                                            </td>
                                            <td className="px-3 py-5 text-right font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                                                {(item.product.price * item.qty).toLocaleString()}원
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

                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h3 className="text-lg font-bold mb-4">배송 정보 입력</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">성함</label>
                                    <input
                                        type="text"
                                        value={deliveryInfo.name}
                                        onChange={(e) => setDeliveryInfo({ ...deliveryInfo, name: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        placeholder="홍길동"
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
                                        placeholder="주소 검색을 이용해 주세요"
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
                                    placeholder="상세 주소를 입력해 주세요 (동, 호수 등)"
                                />
                            </div>
                            <p className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                                <span className="material-symbols-outlined text-sm align-middle mr-1">info</span>
                                입력하신 정보는 원활한 배송 및 주문 확인을 위해서만 사용됩니다.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h3 className="text-lg font-bold mb-4">결제 수단 선택</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <label className="relative flex flex-col p-4 border-2 border-primary rounded-xl bg-primary/5 cursor-pointer transition-all">
                                <input defaultChecked className="absolute top-4 right-4 text-primary focus:ring-primary h-4 w-4" name="payment" type="radio" />
                                <span className="material-symbols-outlined text-2xl mb-2 text-primary">credit_card</span>
                                <span className="font-bold text-sm">신용카드</span>
                                <span className="text-xs text-slate-500">일시불 및 할부 결제</span>
                            </label>
                            <label className="relative flex flex-col p-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-primary/50 cursor-pointer transition-all">
                                <input className="absolute top-4 right-4 text-primary focus:ring-primary h-4 w-4" name="payment" type="radio" />
                                <div className="w-6 h-6 mb-2 rounded bg-[#FEE500] flex items-center justify-center overflow-hidden">
                                    <span className="material-symbols-outlined text-lg text-slate-900">chat_bubble</span>
                                </div>
                                <span className="font-bold text-sm">카카오페이</span>
                                <span className="text-xs text-slate-500">간편하고 빠른 결제</span>
                            </label>
                            <label className="relative flex flex-col p-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-primary/50 cursor-pointer transition-all">
                                <input className="absolute top-4 right-4 text-primary focus:ring-primary h-4 w-4" name="payment" type="radio" />
                                <span className="material-symbols-outlined text-2xl mb-2 text-slate-400">account_balance</span>
                                <span className="font-bold text-sm">실시간 계좌이체</span>
                                <span className="text-xs text-slate-500">에스크로 안전결제 지원</span>
                            </label>
                        </div>
                    </div>

                    {/* Terms Agreement Section */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h3 className="text-lg font-bold mb-4">약관 동의</h3>
                        <div className="space-y-4">
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
                                        특히 바닥재 재단 상품의 경우 단순 변심 반품이 제한될 수 있음을 확인하였습니다.
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
                                <span className="text-slate-600 dark:text-slate-400">상품 금액</span>
                                <span className="font-medium">{totalPrice.toLocaleString()}원</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">배송비</span>
                                <span className="text-primary font-medium">무료 배송</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">부가세(10%)</span>
                                <span className="font-medium">{tax.toLocaleString()}원</span>
                            </div>
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-baseline">
                                <span className="text-lg font-bold">최종 결제 금액</span>
                                <span className="text-2xl font-black text-primary">{finalPrice.toLocaleString()}원</span>
                            </div>
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
                                    <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">안전 결제 시스템 보증</p>
                                    고객님의 결제 정보는 암호화되어 안전하게 처리되며, 개인정보 처리방침에 따라 철저히 보호됩니다.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
