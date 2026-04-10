// 외부 주문 리스트 뷰
// D-Day 카운트다운 기반 정렬, 상태 관리, 빠른 액션
import React, { useState } from 'react';

// 상태 정보 맵
const STATUS_MAP = {
    received: { label: '접수', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: 'inbox' },
    preparing: { label: '준비중', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: 'inventory' },
    shipped: { label: '출하완료', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: 'local_shipping' },
    delivered: { label: '배송완료', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: 'check_circle' },
};

// 채널 아이콘 맵
const CHANNEL_MAP = {
    phone: { icon: '📞', label: '전화' },
    kakao: { icon: '💬', label: '카카오' },
    visit: { icon: '🏢', label: '현장' },
    email: { icon: '📧', label: '이메일' },
    other: { icon: '📋', label: '기타' },
};

// 상태 순서 (다음 단계로 빠르게 전환용)
const STATUS_ORDER = ['received', 'preparing', 'shipped', 'delivered'];

// D-Day 계산
const getDday = (deliveryDate) => {
    if (!deliveryDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(deliveryDate);
    target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return diff;
};

// D-Day 텍스트 & 색상
const getDdayDisplay = (dday) => {
    if (dday === null) return { text: '-', className: 'text-slate-500' };
    if (dday < 0) return { text: `D+${Math.abs(dday)}`, className: 'text-red-400 font-black' };
    if (dday === 0) return { text: 'D-Day', className: 'text-red-400 font-black animate-pulse' };
    if (dday === 1) return { text: 'D-1', className: 'text-orange-400 font-bold' };
    if (dday === 2) return { text: 'D-2', className: 'text-amber-400 font-bold' };
    if (dday <= 7) return { text: `D-${dday}`, className: 'text-yellow-400' };
    return { text: `D-${dday}`, className: 'text-slate-400' };
};

export default function ExternalOrderListView({ orders, onEdit, onDelete, onStatusChange }) {
    const [statusFilter, setStatusFilter] = useState('all');
    const [showStatusMenu, setShowStatusMenu] = useState(null);

    // 필터링
    const filtered = orders.filter(o => statusFilter === 'all' || o.status === statusFilter);

    // D-Day 기준 정렬 (가까운 순 + 미완료 우선)
    const sorted = [...filtered].sort((a, b) => {
        const aComplete = a.status === 'delivered';
        const bComplete = b.status === 'delivered';
        if (aComplete !== bComplete) return aComplete ? 1 : -1; // 완료는 뒤로
        const ddayA = getDday(a.deliveryDate) ?? 999;
        const ddayB = getDday(b.deliveryDate) ?? 999;
        return ddayA - ddayB;
    });

    // 빠른 상태 전환 (다음 단계로)
    const handleQuickStatus = (order) => {
        const currentIdx = STATUS_ORDER.indexOf(order.status);
        if (currentIdx < STATUS_ORDER.length - 1) {
            onStatusChange(order.id, STATUS_ORDER[currentIdx + 1]);
        }
    };

    // 날짜 포맷
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        const month = d.getMonth() + 1;
        const day = d.getDate();
        const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
        const weekday = weekdays[d.getDay()];
        return `${month}/${day} (${weekday})`;
    };

    return (
        <div>
            {/* 상태 필터 탭 */}
            <div className="flex flex-wrap gap-2 mb-5">
                {[
                    { id: 'all', label: '전체', count: orders.length },
                    ...STATUS_ORDER.map(s => ({ id: s, label: STATUS_MAP[s].label, count: orders.filter(o => o.status === s).length }))
                ].map(f => (
                    <button
                        key={f.id}
                        onClick={() => setStatusFilter(f.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                            statusFilter === f.id
                                ? 'bg-teal-500/20 border-teal-500/50 text-teal-300'
                                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                        }`}
                    >
                        {f.label} <span className="ml-1 text-[10px] opacity-70">{f.count}</span>
                    </button>
                ))}
            </div>

            {/* 주문 목록 */}
            {sorted.length === 0 ? (
                <div className="text-center py-16">
                    <span className="material-symbols-outlined text-5xl text-slate-600 mb-3 block">event_busy</span>
                    <p className="text-slate-500 text-sm">등록된 외부 주문이 없습니다.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {sorted.map(order => {
                        const dday = getDday(order.deliveryDate);
                        const ddayDisplay = getDdayDisplay(dday);
                        const status = STATUS_MAP[order.status] || STATUS_MAP.received;
                        const channel = CHANNEL_MAP[order.channel] || CHANNEL_MAP.other;
                        const isOverdue = dday !== null && dday < 0 && order.status !== 'delivered';
                        const isCompleted = order.status === 'delivered';

                        return (
                            <div
                                key={order.id}
                                className={`p-4 rounded-2xl border transition-all ${
                                    isOverdue
                                        ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                                        : isCompleted
                                            ? 'bg-white/[0.02] border-white/5 opacity-60 hover:opacity-80'
                                            : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* D-Day 뱃지 */}
                                    <div className="flex flex-col items-center min-w-[52px] pt-0.5">
                                        <span className={`text-lg ${ddayDisplay.className}`}>{ddayDisplay.text}</span>
                                        <span className="text-[10px] text-slate-500 mt-0.5">{formatDate(order.deliveryDate)}</span>
                                    </div>

                                    {/* 주문 정보 */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="text-sm">{channel.icon}</span>
                                            <span className="text-white text-sm font-bold truncate">{order.customerName}</span>
                                            <span className="text-slate-500 text-xs">{order.phone}</span>
                                            {isOverdue && <span className="text-[10px] text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded-full">기한 초과</span>}
                                        </div>
                                        {order.productName && (
                                            <p className="text-slate-300 text-xs mb-1 truncate">📦 {order.productName}{order.quantity ? ` · ${order.quantity}` : ''}</p>
                                        )}
                                        {order.totalPrice > 0 && (
                                            <p className="text-teal-400 text-xs font-bold mb-1">₩{Number(order.totalPrice).toLocaleString()}</p>
                                        )}
                                        {order.address && (
                                            <p className="text-slate-500 text-[11px] truncate">📍 {order.address}</p>
                                        )}
                                        {order.memo && (
                                            <p className="text-slate-500 text-[11px] mt-1 truncate">💬 {order.memo}</p>
                                        )}
                                    </div>

                                    {/* 우측 액션 영역 */}
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        {/* 상태 뱃지 (클릭하면 메뉴) */}
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowStatusMenu(showStatusMenu === order.id ? null : order.id)}
                                                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border flex items-center gap-1 ${status.color} hover:opacity-80 transition-all`}
                                            >
                                                <span className="material-symbols-outlined text-[14px]">{status.icon}</span>
                                                {status.label}
                                                <span className="material-symbols-outlined text-[12px]">expand_more</span>
                                            </button>
                                            {/* 상태 변경 드롭다운 */}
                                            {showStatusMenu === order.id && (
                                                <div className="absolute right-0 top-full mt-1 z-50 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl py-1 min-w-[120px]">
                                                    {STATUS_ORDER.map(s => {
                                                        const st = STATUS_MAP[s];
                                                        return (
                                                            <button
                                                                key={s}
                                                                onClick={() => { onStatusChange(order.id, s); setShowStatusMenu(null); }}
                                                                className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-white/10 transition-all ${
                                                                    order.status === s ? 'text-teal-400 font-bold' : 'text-slate-300'
                                                                }`}
                                                            >
                                                                <span className="material-symbols-outlined text-[14px]">{st.icon}</span>
                                                                {st.label}
                                                                {order.status === s && <span className="material-symbols-outlined text-[12px] ml-auto">check</span>}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* 빠른 액션 버튼 */}
                                        <div className="flex items-center gap-1">
                                            {/* 빠른 다음 단계 버튼 */}
                                            {order.status !== 'delivered' && (
                                                <button
                                                    onClick={() => handleQuickStatus(order)}
                                                    className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center hover:bg-teal-500/20 transition-all"
                                                    title="다음 단계로"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                                </button>
                                            )}
                                            <button
                                                onClick={() => onEdit(order)}
                                                className="w-7 h-7 rounded-lg bg-white/5 text-slate-400 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all"
                                                title="수정"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">edit</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm(`"${order.customerName}" 주문을 삭제하시겠습니까?`)) {
                                                        onDelete(order.id);
                                                    }
                                                }}
                                                className="w-7 h-7 rounded-lg bg-white/5 text-slate-400 flex items-center justify-center hover:bg-red-500/10 hover:text-red-400 transition-all"
                                                title="삭제"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 외부 클릭 시 드롭다운 닫기 */}
            {showStatusMenu && (
                <div className="fixed inset-0 z-40" onClick={() => setShowStatusMenu(null)} />
            )}
        </div>
    );
}
