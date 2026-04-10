import { useNavigate, useSearchParams } from 'react-router-dom';

export default function PaymentFail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const message = searchParams.get('message') || '알 수 없는 이유로 결제가 실패했습니다.';
    const code = searchParams.get('code') || 'UNKNOWN_ERROR';

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
            <span className="material-symbols-outlined text-red-500 text-6xl mb-4">cancel</span>
            <h2 className="text-2xl font-bold mb-2">결제 실패</h2>
            <div className="bg-red-50 text-red-600 p-4 rounded-xl my-6 max-w-md w-full border border-red-100">
                <p className="font-semibold">{message}</p>
                <p className="text-sm mt-1 opacity-80">에러 코드: {code}</p>
            </div>
            <button 
                onClick={() => navigate('/cart', { replace: true })} 
                className="px-8 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-lg"
            >
                다시 결제 시도하기
            </button>
        </div>
    );
}
