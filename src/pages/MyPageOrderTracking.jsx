import { Link, useNavigate } from 'react-router-dom';
import { useOrderStore } from '../store/useOrderStore';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { logout } from '../services/authService';
import { formatOrderUnit } from '../services/adminService';
import { useEffect } from 'react';

export default function MyPageOrderTracking() {
    const { orders, cancelOrder, fetchMyOrders } = useOrderStore();
    const { user } = useAuthStore();
    const { addToast } = useToastStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.uid) fetchMyOrders(user.uid);
    }, [user?.uid, fetchMyOrders]);

    const handleLogout = async () => {
        if (confirm('로그아웃 하시겠습니까?')) {
            await logout();
            addToast('로그아웃 되었습니다.');
            navigate('/');
        }
    };

    const stats = {
        pending: orders.filter(o => o.status === 'PENDING').length,
        preparing: orders.filter(o => o.status === 'PREPARING' || o.status === 'PAID').length,
        shipping: orders.filter(o => o.status === 'SHIPPING' || o.status === 'DELIVERING').length,
        delivered: orders.filter(o => o.status === 'DELIVERED' || o.status === 'COMPLETED').length,
    };

    return (
        <main className="max-w-5xl mx-auto px-4 py-8 mb-20">
            <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
                <Link className="hover:text-primary transition-colors" to="/">홈</Link>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <Link className="hover:text-primary transition-colors" to="/mypage">마이페이지</Link>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span className="text-slate-900 dark:text-slate-100 font-medium">주문/배송 조회</span>
            </nav>
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">마이페이지</h2>
                        <button onClick={handleLogout} className="text-xs font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full transition-colors">로그아웃</button>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">{user?.name ? `${user.name} 파트너님, ` : ''}고객님의 소중한 자재가 안전하게 배송되고 있는지 확인해보세요.</p>
                </div>
                <div className="text-sm text-slate-500 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
                    최근 6개월간의 주문 현황입니다.
                </div>
            </div>
            <section className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 mb-10 overflow-x-auto">
                <div className="flex justify-between items-start relative min-w-[700px] px-4">
                    <div className="absolute top-6 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800 z-0"></div>
                    <div className="relative z-10 flex flex-col items-center gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${stats.pending > 0 ? 'bg-primary text-slate-900 shadow-lg shadow-primary/20 ring-4 ring-primary/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'}`}>
                            <span className="material-symbols-outlined font-bold">pending_actions</span>
                        </div>
                        <div className="text-center">
                            <p className={`text-sm font-bold ${stats.pending > 0 ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}`}>입금대기</p>
                            <p className={`text-[13px] font-bold ${stats.pending > 0 ? 'text-primary' : 'text-slate-400'}`}>{stats.pending}건</p>
                        </div>
                    </div>
                    <div className="relative z-10 flex flex-col items-center gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${stats.preparing > 0 ? 'bg-primary text-slate-900 shadow-lg shadow-primary/20 ring-4 ring-primary/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'}`}>
                            <span className="material-symbols-outlined font-bold">inventory_2</span>
                        </div>
                        <div className="text-center">
                            <p className={`text-sm font-bold ${stats.preparing > 0 ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}`}>배송준비중</p>
                            <p className={`text-[13px] font-bold ${stats.preparing > 0 ? 'text-primary' : 'text-slate-400'}`}>{stats.preparing}건</p>
                        </div>
                    </div>
                    <div className="relative z-10 flex flex-col items-center gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${stats.shipping > 0 ? 'bg-primary text-slate-900 shadow-lg shadow-primary/20 ring-4 ring-primary/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'}`}>
                            <span className="material-symbols-outlined font-bold">local_shipping</span>
                        </div>
                        <div className="text-center">
                            <p className={`text-sm font-bold ${stats.shipping > 0 ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}`}>배송중</p>
                            <p className={`text-[13px] font-bold ${stats.shipping > 0 ? 'text-primary' : 'text-slate-400'}`}>{stats.shipping}건</p>
                        </div>
                    </div>
                    <div className="relative z-10 flex flex-col items-center gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${stats.delivered > 0 ? 'bg-primary text-slate-900 shadow-lg shadow-primary/20 ring-4 ring-primary/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'}`}>
                            <span className="material-symbols-outlined font-bold">task_alt</span>
                        </div>
                        <div className="text-center">
                            <p className={`text-sm font-bold ${stats.delivered > 0 ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}`}>배송완료</p>
                            <p className={`text-[13px] font-bold ${stats.delivered > 0 ? 'text-primary' : 'text-slate-400'}`}>{stats.delivered}건</p>
                        </div>
                    </div>
                </div>
            </section>
            <div className="mb-12">
                <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">receipt_long</span>
                    주문 상세 내역
                </h3>
                {orders.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
                        <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">inbox</span>
                        <p className="text-slate-500">조회된 주문 내역이 없습니다.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.orderId} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border-b border-slate-200 dark:border-slate-800 flex flex-wrap justify-between items-center gap-4">
                                    <div className="flex items-center gap-6">
                                        <div>
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">주문일자</span>
                                            <p className="text-sm font-bold">{new Date(order.date).toLocaleDateString()}</p>
                                        </div>
                                        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
                                        <div>
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">주문번호</span>
                                            <p className="text-sm font-bold">#{order.orderId}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {order.status !== 'CANCELED' && (
                                            <button onClick={() => {
                                                if (confirm('정말 주문을 취소하시겠습니까?')) {
                                                    cancelOrder(order.orderId);
                                                    addToast('주문이 정상적으로 취소되었습니다.');
                                                }
                                            }} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">주문취소</button>
                                        )}
                                        <button disabled={order.status === 'CANCELED'} className="bg-primary hover:bg-primary/90 text-slate-900 text-sm font-bold px-5 py-2 rounded-lg flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                                            <span className="material-symbols-outlined text-lg">local_shipping</span>
                                            배송 추적하기
                                        </button>
                                    </div>
                                </div>
                                <div className="p-6">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex flex-col md:flex-row gap-8 mb-6 last:mb-0">
                                            <div className="w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-100 dark:border-slate-800">
                                                <img className="w-full h-full object-cover" src={item.imageUrl} alt={item.productName} />
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
                                                    <div>
                                                        <h4 className="font-bold text-lg mb-1">{item.productName}</h4>
                                                        <p className="text-slate-500 text-sm">수량: {formatOrderUnit({ category: item.subCategory || item.category, quantity: item.qty }).displayQty} ({item.option})</p>
                                                        <p className="text-primary font-bold mt-1">{(item.totalPrice ?? item.price ?? 0).toLocaleString()}원</p>
                                                    </div>
                                                    <div className="mt-2 sm:mt-0">
                                                        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${order.status === 'CANCELED' ? 'bg-red-100 text-red-600 border-red-200 dark:bg-red-900/30 dark:border-red-800' : 'bg-primary/10 text-primary border-primary/20'}`}>
                                                            {order.statusLabel}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                                        <p className="text-[11px] text-slate-500 font-bold mb-1 uppercase tracking-tight">배송 업체</p>
                                                        <p className="text-sm font-medium">{order.delivery.company}</p>
                                                    </div>
                                                    <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                                        <p className="text-[11px] text-slate-500 font-bold mb-1 uppercase tracking-tight">운송장 번호</p>
                                                        <p className="text-sm font-medium">{order.delivery.trackingNumber}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4">
                                    <span className="material-symbols-outlined text-slate-400">info</span>
                                    <p className="text-xs text-slate-500">화물 배송의 경우 도착 전 기사님이 미리 연락을 드립니다. 수령지에 인원이 없을 경우 추가 비용이 발생할 수 있습니다.</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <section className="bg-amber-50/40 dark:bg-slate-800/40 rounded-2xl p-8 border border-amber-100 dark:border-slate-700 shadow-sm">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-slate-100">
                    <span className="material-symbols-outlined text-amber-500">verified_user</span>
                    파손 및 환불 규정 안내
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-500 text-xl">broken_image</span>
                            배송 중 파손 보상
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            전자상거래법 및 소비자분쟁해결기준에 의거하여, 배송 과정에서 발생한 자재 파손은 100% 교환 또는 환불을 보장합니다. 마루 자재 특성상 하차 시 모서리 파손이 발생할 수 있으므로, <strong>수령 즉시 외관을 확인</strong>해주시기 바랍니다. 파손 확인 시 박스 개봉 전 사진을 촬영하여 고객센터로 7일 이내에 접수해주시면 신속히 처리해 드립니다.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-500 text-xl">assignment_return</span>
                            환불 규정 및 절차
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            제품 수령 후 7일 이내에 단순 변심으로 인한 환불이 가능합니다. 단, <strong>박스가 개봉되었거나 제품 가치가 훼손된 경우</strong>에는 환불이 제한될 수 있습니다. 부피가 크고 무게가 많이 나가는 자재 특성상, 단순 변심 환불 시 왕복 배송비(화물 운임)는 고객님께서 부담하셔야 합니다. 환불 요청은 마이페이지 또는 고객센터를 통해 신청해 주세요.
                        </p>
                    </div>
                </div>
                <div className="mt-8 pt-6 border-t border-amber-100 dark:border-slate-700 flex flex-wrap gap-6 items-center justify-between">
                    <p className="text-xs text-slate-500">도움이 필요하신가요? 저희 지원 팀이 언제나 대기 중입니다.</p>
                    <div className="flex gap-4">
                        <button className="text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors">
                            <span className="material-symbols-outlined text-lg">chat_bubble</span>
                            카카오톡 상담
                        </button>
                        <button className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-primary flex items-center gap-1 transition-colors">
                            <span className="material-symbols-outlined text-lg">phone_in_talk</span>
                            1588-0000
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
}
