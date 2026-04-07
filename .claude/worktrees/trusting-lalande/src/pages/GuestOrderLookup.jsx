import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useOrderStore } from '../store/useOrderStore';
import { useToastStore } from '../store/useToastStore';
import { formatOrderUnit } from '../services/adminService';

const GuestOrderLookup = () => {
    const [customerName, setCustomerName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const { fetchGuestOrder, orders, cancelOrder } = useOrderStore();
    const { addToast } = useToastStore();

    const navigate = useNavigate();

    const handleLookup = async (e) => {
        e.preventDefault();
        if (!customerName || !phone) {
            addToast('성함과 연락처를 모두 입력해 주세요.');
            return;
        }

        setLoading(true);
        const result = await fetchGuestOrder(customerName.trim(), phone.trim());
        setLoading(false);

        if (result.success) {
            addToast('주문 내역을 성공적으로 불러왔습니다.');
        } else {
            addToast(result.error);
        }
    };

    const handleCancelClick = async (oid) => {
        if (confirm('정말 주문을 취소하시겠습니까?')) {
            await cancelOrder(oid);
            addToast('주문이 취소되었습니다.');
        }
    };

    return (
        <main className="max-w-4xl mx-auto px-4 py-8 mb-20 min-h-[60vh]">
            <div className="flex flex-col gap-4 mb-10">
                <nav className="flex items-center gap-2 text-sm text-slate-500">
                    <Link to="/" className="hover:text-primary transition-colors">홈</Link>
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                    <span className="text-slate-900 font-medium">비회원 주문 조회</span>
                </nav>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors w-fit"
                >
                    <span className="material-symbols-outlined text-xl">arrow_back</span>
                    <span className="font-bold text-sm">뒤로가기</span>
                </button>
            </div>

            <div className="mb-10 text-center">
                <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">비회원 주문 조회</h2>
                <p className="text-slate-500">주문 시 입력하신 성함과 연락처를 입력해 주세요.</p>
            </div>

            <div className="max-w-md mx-auto mb-16 bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                <form onSubmit={handleLookup} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">성함</label>
                        <input
                            type="text"
                            placeholder="주문 시 입력한 성함"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">연락처</label>
                        <input
                            type="tel"
                            placeholder="010-0000-0000"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-[0.98] disabled:bg-slate-300 disabled:cursor-not-allowed shadow-lg shadow-slate-200"
                    >
                        {loading ? '조회 중...' : '주문 내역 조회하기'}
                    </button>
                </form>
            </div>

            {orders.length > 0 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-primary font-bold">receipt_long</span>
                        <h3 className="text-xl font-bold">조회된 주문 내역</h3>
                    </div>

                    {orders.map((order) => (
                        <div key={order.orderId} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                            <div className="bg-slate-50 p-6 border-b border-slate-200 flex flex-wrap justify-between items-center gap-4">
                                <div className="flex items-center gap-6">
                                    <div>
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">주문일자</span>
                                        <p className="text-sm font-bold">{new Date(order.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="w-px h-8 bg-slate-200"></div>
                                    <div>
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">주문번호</span>
                                        <p className="text-sm font-bold">#{order.orderId}</p>
                                    </div>
                                    <div className="w-px h-8 bg-slate-200"></div>
                                    <div>
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">상태</span>
                                        <p className="text-sm font-bold text-primary">{order.statusLabel}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {order.status !== 'CANCELED' && (
                                        <button
                                            onClick={() => handleCancelClick(order.orderId)}
                                            className="bg-white border border-slate-200 text-slate-700 text-sm font-bold px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                                        >
                                            주문 취소
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="p-6">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex flex-col md:flex-row gap-8 mb-6 last:mb-0">
                                        <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-100">
                                            <img className="w-full h-full object-cover" src={item.imageUrl} alt={item.productName} />
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="font-bold text-lg mb-1">{item.productName}</h4>
                                            <p className="text-slate-500 text-sm">
                                                {item.option} | {formatOrderUnit({ category: item.subCategory || item.category, quantity: item.qty }).displayQty}
                                            </p>
                                            <p className="text-slate-900 font-bold mt-2">{(item.totalPrice || 0).toLocaleString()}원</p>
                                        </div>
                                        <div className="md:text-right flex flex-col justify-center">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full inline-block ${order.status === 'CANCELED' ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'}`}>
                                                {order.statusLabel}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="px-6 py-4 bg-amber-50/30 border-t border-amber-100 flex items-center gap-4">
                                <span className="material-symbols-outlined text-amber-500 text-sm">local_shipping</span>
                                <p className="text-[12px] text-slate-600">
                                    배송 준비가 완료되면 등록하신 연락처({order.phone})로 안내 문자가 발송됩니다.
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!orders.length && !loading && (
                <div className="mt-12 text-center p-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-3 block">search_off</span>
                    <p className="text-slate-500 text-sm">아직 조회된 내역이 없습니다. 정보를 입력해 주세요.</p>
                </div>
            )}

            <div className="mt-12 text-center">
                <Link to="/login" className="text-sm font-bold text-slate-400 hover:text-primary transition-colors flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    로그인 페이지로 돌아가기
                </Link>
            </div>

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
        </main>
    );
};

export default GuestOrderLookup;
