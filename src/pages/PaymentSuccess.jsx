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
                console.log(`토스 승인 요청 진행: paymentKey=${paymentKey}, orderId=${orderId}, amount=${amount}`);
                
                // Cloud Function API 호출 (firebase.json rewrites를 통해 프록시 처리)
                const apiHost = import.meta.env.MODE === 'development' 
                    ? 'http://127.0.0.1:5001/project-dog-1-51759630-ea08b/us-central1/confirmTossPayment' // 개발환경 로컬 에뮬레이터 주소 (포트는 환경에 맞게 변경)
                    : '/api/confirmTossPayment'; // 운영 환경 (Firebase Hosting rewrites)

                // 실제 운영 환경에서는 개발 환경 체크 후 fetch 라우트 조정 필요
                // 여기서는 우선 Hosting Rewrites를 사용한다고 가정하고 /api/confirmTossPayment 사용
                let fetchUrl = '/api/confirmTossPayment';
                
                // 만약 Vite 내장 dev 서버로 돌리는 중이라면 직접 로컬 / 운영 URL을 바라보게 분기할 수 있음
                if (import.meta.env.DEV) {
                    // 개발 서버에서는 배포된 함수(혹은 에뮬레이터)를 직접 가리켜야 함.
                    // 현재는 테스트 편의를 위해 직접 배포 주소 또는 에뮬 주소를 하드코딩할 수도 있으나,
                    // 일단은 백엔드를 타는 공통 로직으로 구현.
                    // 만약 CORS가 난다면 이 주소를 자신의 Firebase 프로젝트 API 주소로 직접 명시해야 함.
                    // fetchUrl = 'https://us-central1-[projectId].cloudfunctions.net/confirmTossPayment'; 
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
                
                console.log('결제 승인 성공:', data.data);
                
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
