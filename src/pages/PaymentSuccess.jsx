import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useOrderStore } from '../store/useOrderStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatOrderUnit } from '../services/adminService';

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { items, clearCart } = useCartStore();
    const { addOrder } = useOrderStore();
    const { user } = useAuthStore();
    
    const [isConfirming, setIsConfirming] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [receiptData, setReceiptData] = useState(null);
    const processedRef = useRef(false);

    useEffect(() => {
        const confirmPayment = async () => {
            if (processedRef.current) return;
            processedRef.current = true;

            const paymentKey = searchParams.get('paymentKey');
            const orderId = searchParams.get('orderId');
            const amount = searchParams.get('amount');

            if (!paymentKey || !orderId || !amount) {
                setErrorMsg('잘못된 접근입니다. 파라미터가 누락되었습니다.');
                setIsConfirming(false);
                return;
            }

            try {
                if (paymentKey === 'bank_transfer') {
                    console.log('무통장 입금 승인: API 호출 생략');
                } else {
                    console.log(`토스 승인 요청 진행: paymentKey=${paymentKey}, orderId=${orderId}, amount=${amount}`);
                    
                    let fetchUrl = '/api/confirmTossPayment';
                    if (import.meta.env.DEV) {
                        // fetchUrl = 'http://127.0.0.1:5001/.../confirmTossPayment';
                    }

                    const response = await fetch(fetchUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ paymentKey, orderId, amount: parseInt(amount) })
                    });

                    const data = await response.json();

                    if (!response.ok || !data.success) {
                        throw new Error(data.error?.message || data.error || '결제 승인에 실패했습니다.');
                    }
                }
                
                // 세션 스토리지에서 배송 정보 복원
                const checkoutUserStr = sessionStorage.getItem('pendingOrderDeliveryInfo');
                const isBusinessStr = sessionStorage.getItem('pendingOrderIsBusiness');
                if (!checkoutUserStr || !items || items.length === 0) {
                    throw new Error('장바구니 정보가 없거나 세션이 만료되었습니다. 장바구니로 돌아갑니다.');
                }
                
                const checkoutUser = JSON.parse(checkoutUserStr);
                const isBusiness = isBusinessStr === 'true';

                // 주문 DB 생성
                const finalOrderId = await addOrder(items, parseInt(amount), user?.uid || 'guest', checkoutUser, isBusiness);
                
                // 영수증 UI용 데이터 세팅
                setReceiptData({
                    orderId: finalOrderId || orderId,
                    items: [...items],
                    amount: parseInt(amount),
                    customer: checkoutUser,
                    isBusiness,
                    paymentKey,
                    date: new Date().toLocaleString('ko-KR')
                });

                clearCart();
                sessionStorage.removeItem('pendingOrderDeliveryInfo');
                sessionStorage.removeItem('pendingOrderIsBusiness');
                
                setIsConfirming(false);
            } catch (error) {
                console.error('승인 처리 중 오류:', error);
                setErrorMsg(error.message);
                setIsConfirming(false);
            }
        };

        confirmPayment();
    }, [searchParams, items, clearCart, addOrder, user]);

    if (errorMsg) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
                 <span className="material-symbols-outlined text-red-500 text-6xl mb-4">error</span>
                 <h2 className="text-2xl font-bold mb-4">결제 처리 오류</h2>
                 <p className="text-slate-600 mb-8">{errorMsg}</p>
                 <button onClick={() => navigate('/cart', { replace: true })} className="px-6 py-2 bg-primary text-white rounded-lg font-bold">장바구니로 돌아가기</button>
            </div>
        );
    }

    if (isConfirming) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                 <h2 className="text-xl font-bold mb-2">결제 처리 중입니다...</h2>
                 <p className="text-slate-500">창을 닫거나 새로고침하지 마세요.</p>
            </div>
        );
    }

    if (!receiptData) return null;

    const printReceipt = () => {
        window.print();
    };

    return (
        <main className="flex-1 px-3 sm:px-4 md:px-20 py-8 sm:py-12 max-w-[800px] mx-auto w-full mb-12 sm:mb-20">
            {/* 상단 성공 아이콘 및 메시지 (print 시 숨김) */}
            <div className="text-center mb-8 print:hidden">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4 shadow-sm">
                    <span className="material-symbols-outlined text-4xl">check</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">주문이 정상 접수되었습니다</h1>
                <p className="text-slate-500 text-sm">
                    {receiptData.paymentKey === 'bank_transfer' 
                        ? '아래 계좌로 입금해주시면 확인 후 배송 준비가 시작됩니다.' 
                        : '결제가 성공적으로 처리되었습니다.'}
                </p>
            </div>

            {/* 영수증/발주서 본문 */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden print:border-none print:shadow-none">
                {/* 발주서 헤더 */}
                <div className="bg-slate-900 px-6 py-6 sm:py-8 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:py-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-1.5 shrink-0 shadow-sm hidden print:flex sm:flex">
                            <img src="/assets/images/daily_housing_icon.svg" alt="데일리하우징 로고" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-widest text-white mb-1">발 주 서</h2>
                            <p className="text-slate-400 text-xs tracking-wider">PURCHASE ORDER <span className="ml-2 text-[#d4a853] font-bold text-[11px] tracking-normal">데일리하우징</span></p>
                        </div>
                    </div>
                    <div className="text-left sm:text-right">
                        <p className="text-sm font-medium text-slate-300 mb-1">주문번호 <span className="text-white font-bold ml-2 tracking-wider">{receiptData.orderId}</span></p>
                        <p className="text-xs text-slate-400">주문일시 <span className="ml-2">{receiptData.date}</span></p>
                    </div>
                </div>

                <div className="p-6 sm:p-8 space-y-8">
                    {/* 무통장일 경우 입금 계좌 강조 영역 */}
                    {receiptData.paymentKey === 'bank_transfer' && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 sm:p-6 text-center">
                            <p className="text-amber-800 font-bold mb-3 flex items-center justify-center gap-1.5">
                                <span className="material-symbols-outlined text-[18px]">account_balance</span>
                                입금 계좌 안내
                            </p>
                            <p className="text-xl sm:text-3xl font-black text-amber-900 tracking-tight mb-2">
                                카카오뱅크 3333-02-0797998
                            </p>
                            <p className="text-amber-700 text-sm font-medium">예금주: 이홍석 (데일리하우징)</p>
                            
                            <div className="mt-5 pt-5 border-t border-amber-200/50 flex flex-col items-center justify-center gap-2">
                                <p className="text-xs text-amber-600">입금하실 금액 (VAT 포함)</p>
                                <p className="text-2xl font-black text-amber-900">{receiptData.amount.toLocaleString()}원</p>
                            </div>
                        </div>
                    )}

                    {/* 공급자 / 공급받는자 정보 */}
                    <div className="flex flex-col md:flex-row gap-6 mb-2 border-b border-slate-200 pb-8">
                        {/* 공급자 정보 */}
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-slate-900 border-l-4 border-slate-900 pl-2 mb-3 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[18px] text-slate-500">storefront</span>
                                공급자
                            </h3>
                            <table className="w-full text-[13px] sm:text-sm border-collapse border-t border-slate-200">
                                <tbody>
                                    <tr className="border-b border-slate-100">
                                        <th className="py-2.5 px-3 bg-slate-50 text-slate-600 font-medium text-left w-1/3">등록번호</th>
                                        <td className="py-2.5 px-3 text-slate-900 font-bold tracking-wider">650-86-02758</td>
                                    </tr>
                                    <tr className="border-b border-slate-100">
                                        <th className="py-2.5 px-3 bg-slate-50 text-slate-600 font-medium text-left">상호(법인명)</th>
                                        <td className="py-2.5 px-3 text-slate-900 font-bold">스튜디오언트 주식회사</td>
                                    </tr>
                                    <tr className="border-b border-slate-100">
                                        <th className="py-2.5 px-3 bg-slate-50 text-slate-600 font-medium text-left">대표자</th>
                                        <td className="py-2.5 px-3 text-slate-900">이홍석</td>
                                    </tr>
                                    <tr className="border-b border-slate-100">
                                        <th className="py-2.5 px-3 bg-slate-50 text-slate-600 font-medium text-left">사업장 주소</th>
                                        <td className="py-2.5 px-3 text-slate-900 text-xs">경기도 고양시 일산동구 동국로 32, 503호</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* 공급받는자 (배송 정보) */}
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-slate-900 border-l-4 border-slate-900 pl-2 mb-3 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[18px] text-slate-500">person</span>
                                공급받는자 (수령인)
                            </h3>
                            <table className="w-full text-[13px] sm:text-sm border-collapse border-t border-slate-200">
                                <tbody>
                                    <tr className="border-b border-slate-100">
                                        <th className="py-2.5 px-3 bg-slate-50 text-slate-600 font-medium text-left w-1/3">성명(상호)</th>
                                        <td className="py-2.5 px-3 text-slate-900 font-bold">{receiptData.customer.name}</td>
                                    </tr>
                                    <tr className="border-b border-slate-100">
                                        <th className="py-2.5 px-3 bg-slate-50 text-slate-600 font-medium text-left">연락처</th>
                                        <td className="py-2.5 px-3 text-slate-900">{receiptData.customer.phone}</td>
                                    </tr>
                                    <tr className="border-b border-slate-100">
                                        <th className="py-2.5 px-3 bg-slate-50 text-slate-600 font-medium text-left">배송지</th>
                                        <td className="py-2.5 px-3 text-slate-900 text-xs break-keep">{receiptData.customer.address}</td>
                                    </tr>
                                    <tr className="border-b border-slate-100">
                                        <th className="py-2.5 px-3 bg-slate-50 text-slate-600 font-medium text-left">요청/비고</th>
                                        <td className="py-2.5 px-3 text-slate-900 text-xs text-primary font-medium">
                                            {receiptData.customer.deliveryDate && `[납기희망: ${receiptData.customer.deliveryDate}] `}
                                            {receiptData.customer.siteManagerPhone && `[현장연락처: ${receiptData.customer.siteManagerPhone}] `}
                                            {receiptData.customer.unloadCondition || '-'}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 주문 품목 내역 */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 border-l-4 border-slate-900 pl-2 mb-4 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[18px] text-slate-500">inventory_2</span>
                            주문 품목 내역
                        </h3>
                        <div className="overflow-x-auto rounded-lg border border-slate-200">
                            <table className="w-full text-left text-sm border-collapse min-w-[500px]">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-4 py-3 font-bold text-slate-600 text-center w-12">No.</th>
                                        <th className="px-4 py-3 font-bold text-slate-600">품명 및 옵션</th>
                                        <th className="px-4 py-3 font-bold text-slate-600 text-center w-20">단위</th>
                                        <th className="px-4 py-3 font-bold text-slate-600 text-center w-24">수량</th>
                                        <th className="px-4 py-3 font-bold text-slate-600 text-right w-32">금액</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {receiptData.items.map((item, index) => {
                                        const cat = item.product?.subCategory || item.product?.category || '';
                                        const pkg = item.product?.specifications?.packaging || item.product?.packaging || '';
                                        
                                        // 에디톤 등 특별 단위 처리 로직 (formatOrderUnit 활용 방어코드 포함)
                                        let displayUnit = '개';
                                        let displayQty = item.qty;
                                        
                                        try {
                                            if (formatOrderUnit) {
                                                const formatted = formatOrderUnit({ category: cat, quantity: item.qty, packaging: pkg });
                                                displayUnit = formatted.unit;
                                                displayQty = formatted.displayQty;
                                            }
                                        } catch(e) {
                                            // Fallback if formatOrderUnit fails
                                            if (cat.includes('시트') || cat.includes('합판')) {
                                                displayUnit = 'R';
                                            } else {
                                                displayUnit = 'Box';
                                            }
                                        }
                                        
                                        const price = receiptData.isBusiness && item.product?.businessPrice 
                                            ? item.product.businessPrice 
                                            : item.product?.price || 0;
                                        
                                        return (
                                            <tr key={index}>
                                                <td className="px-4 py-4 text-center text-slate-400">{index + 1}</td>
                                                <td className="px-4 py-4">
                                                    <p className="font-bold text-slate-900">{item.product?.title}</p>
                                                    <div className="flex flex-col gap-0.5 mt-1">
                                                        <span className="text-xs text-slate-500">{item.product?.model_id}</span>
                                                        {item.option !== '기본 옵션' && <span className="text-[11px] text-slate-400">옵션: {item.option}</span>}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-center text-slate-700">{displayUnit}</td>
                                                <td className="px-4 py-4 text-center font-bold text-slate-900">{displayQty}</td>
                                                <td className="px-4 py-4 text-right font-medium text-slate-900">{(price * item.qty).toLocaleString()}원</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-50 border-t border-slate-200">
                                        <th colSpan="4" className="px-4 py-4 font-bold text-slate-900 text-right">총 결제 금액 (VAT 포함)</th>
                                        <td className="px-4 py-4 text-right font-black text-primary text-lg">{receiptData.amount.toLocaleString()}원</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                    
                    <div className="text-center pt-8 border-t border-slate-100 print:hidden">
                        <p className="text-slate-500 text-sm mb-6">주문 및 배송 관련 문의사항은 우측 하단 카카오톡 채팅을 이용해주세요.</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <button onClick={printReceipt} className="w-full sm:w-auto px-6 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm">
                                <span className="material-symbols-outlined text-[18px]">print</span>
                                영수증 인쇄
                            </button>
                            <Link to={user ? "/mypage" : "/order-lookup"} className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md">
                                주문 내역 상세 보기
                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
