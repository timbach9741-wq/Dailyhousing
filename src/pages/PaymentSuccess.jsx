import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useOrderStore } from '../store/useOrderStore';
import { useAuthStore } from '../store/useAuthStore';

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { items, clearCart } = useCartStore();
    const { addOrder } = useOrderStore();
    const { user } = useAuthStore();
    const [isConfirming, setIsConfirming] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const confirmPayment = async () => {
            const paymentKey = searchParams.get('paymentKey');
            const orderId = searchParams.get('orderId');
            const amount = searchParams.get('amount');

            if (!paymentKey || !orderId || !amount) {
                setErrorMsg('잘못된 접근입니다. 파라미터가 누락되었습니다.');
                setIsConfirming(false);
                return;
            }

            try {
                // [모의 승인] 클라이언트 로직 (실제로는 여기서 Node.js / Firebase Functions API를 호출해야 함)
                // axios.post('https://api.tosspayments.com/v1/payments/confirm', ...) 
                // 우리는 클라이언트 연동 테스트 목적이므로 승인을 생략하고 바로 DB 처리합니다.
                
                console.log(`(Mock) 토스 승인 진행: paymentKey=${paymentKey}, orderId=${orderId}, amount=${amount}`);
                
                // 세션 스토리지에서 배송 정보 복원
                const checkoutUserStr = sessionStorage.getItem('pendingOrderDeliveryInfo');
                const isBusinessStr = sessionStorage.getItem('pendingOrderIsBusiness');
                if (!checkoutUserStr || !items || items.length === 0) {
                    throw new Error('장바구니 정보가 없거나 세션이 만료되었습니다. 장바구니로 돌아갑니다.');
                }
                
                const checkoutUser = JSON.parse(checkoutUserStr);
                const isBusiness = isBusinessStr === 'true';

                // 주문 DB 생성 (Mock 승인 완료로 간주하고 생성)
                await addOrder(items, parseInt(amount), user?.uid || 'guest', checkoutUser, isBusiness);
                
                clearCart();
                sessionStorage.removeItem('pendingOrderDeliveryInfo');
                sessionStorage.removeItem('pendingOrderIsBusiness');
                
                setIsConfirming(false);
                
                // 안전한 UI 렌더링 후 안내
                setTimeout(() => {
                    alert('결제가 성공적으로 완료되었습니다.');
                    if (user) navigate('/mypage', { replace: true });
                    else navigate('/order-lookup', { replace: true });
                }, 500);
                
            } catch (error) {
                console.error('승인 처리 중 오류:', error);
                setErrorMsg(error.message);
                setIsConfirming(false);
            }
        };

        confirmPayment();
    }, [searchParams, items, clearCart, addOrder, user, navigate]);

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

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
             {isConfirming ? (
                 <>
                     <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                     <h2 className="text-xl font-bold mb-2">결제 승인 중입니다...</h2>
                     <p className="text-slate-500">창을 닫거나 새로고침하지 마세요.</p>
                 </>
             ) : (
                 <>
                     <span className="material-symbols-outlined text-green-500 text-6xl mb-4">check_circle</span>
                     <h2 className="text-2xl font-bold mb-2">결제 완료</h2>
                     <p className="text-slate-500">주문 내역으로 이동합니다...</p>
                 </>
             )}
        </div>
    );
}
