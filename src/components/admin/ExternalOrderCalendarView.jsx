// 외부 주문 캘린더 뷰
// 순수 CSS 기반 월별 달력, 날짜별 주문 건수 표시
import React, { useState, useMemo } from 'react';

// 채널 아이콘
const CHANNEL_ICON = {
    phone: '📞', kakao: '💬', visit: '🏢', email: '📧', other: '📋',
};

// 상태 색상
const STATUS_COLORS = {
    received: 'bg-blue-400',
    preparing: 'bg-amber-400',
    shipped: 'bg-emerald-400',
    delivered: 'bg-slate-500',
};

const STATUS_LABEL = {
    received: '접수',
    preparing: '준비중',
    shipped: '출하완료',
    delivered: '배송완료',
};

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function ExternalOrderCalendarView({ orders, onEdit, onStatusChange }) {
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0-indexed
    const [selectedDate, setSelectedDate] = useState(null);

    // 이전/다음 달
    const goToPrev = () => {
        if (currentMonth === 0) {
            setCurrentYear(y => y - 1);
            setCurrentMonth(11);
        } else {
            setCurrentMonth(m => m - 1);
        }
        setSelectedDate(null);
    };

    const goToNext = () => {
        if (currentMonth === 11) {
            setCurrentYear(y => y + 1);
            setCurrentMonth(0);
        } else {
            setCurrentMonth(m => m + 1);
        }
        setSelectedDate(null);
    };

    // 달력 그리드 데이터 생성
    const calendarDays = useMemo(() => {
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const startWeekday = firstDay.getDay();
        const daysInMonth = lastDay.getDate();

        const days = [];
        // 이전 달의 빈 셀
        for (let i = 0; i < startWeekday; i++) {
            days.push({ day: null, date: null });
        }
        // 현재 달
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            days.push({ day: d, date: dateStr });
        }
        return days;
    }, [currentYear, currentMonth]);

    // 날짜별 주문 그룹핑
    const ordersByDate = useMemo(() => {
        const map = {};
        orders.forEach(o => {
            if (!o.deliveryDate) return;
            if (!map[o.deliveryDate]) map[o.deliveryDate] = [];
            map[o.deliveryDate].push(o);
        });
        return map;
    }, [orders]);

    // 선택된 날짜의 주문 목록
    const selectedOrders = selectedDate ? (ordersByDate[selectedDate] || []) : [];

    // 오늘 날짜 문자열
    const todayStr = new Date().toISOString().split('T')[0];

    return (
        <div>
            {/* 월 네비게이션 */}
            <div className="flex items-center justify-center gap-4 mb-5">
                <button
                    onClick={goToPrev}
                    className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-slate-400 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all"
                >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <h3 className="text-white text-lg font-bold min-w-[140px] text-center">
                    {currentYear}년 {currentMonth + 1}월
                </h3>
                <button
                    onClick={goToNext}
                    className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-slate-400 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all"
                >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
            </div>

            {/* 달력 그리드 */}
            <div className="rounded-2xl border border-white/10 overflow-hidden mb-5">
                {/* 요일 헤더 */}
                <div className="grid grid-cols-7 bg-white/[0.03]">
                    {WEEKDAYS.map((wd, i) => (
                        <div key={wd} className={`py-2.5 text-center text-xs font-bold ${
                            i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-slate-400'
                        }`}>
                            {wd}
                        </div>
                    ))}
                </div>

                {/* 날짜 셀 */}
                <div className="grid grid-cols-7">
                    {calendarDays.map((cell, idx) => {
                        if (!cell.date) {
                            return <div key={`empty-${idx}`} className="h-28 sm:h-32 border-t border-r border-white/5 bg-white/[0.01]" />;
                        }

                        const dateOrders = ordersByDate[cell.date] || [];
                        const isToday = cell.date === todayStr;
                        const isSelected = cell.date === selectedDate;
                        const hasOrders = dateOrders.length > 0;
                        const weekday = (idx) % 7;

                        // 긴급도 색상 결정 (미완료 건 기준)
                        const activeOrders = dateOrders.filter(o => o.status !== 'delivered');
                        let urgencyColor = '';
                        if (activeOrders.length > 0) {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const target = new Date(cell.date);
                            target.setHours(0, 0, 0, 0);
                            const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
                            if (diff <= 0) urgencyColor = 'bg-red-500';
                            else if (diff === 1) urgencyColor = 'bg-orange-500';
                            else if (diff <= 3) urgencyColor = 'bg-amber-400';
                            else urgencyColor = 'bg-teal-400';
                        }

                        // 셀 배경 색상 (주문이 있을 때 긴급도에 따라 은은하게)
                        let cellBg = '';
                        if (activeOrders.length > 0 && urgencyColor) {
                            if (urgencyColor === 'bg-red-500') cellBg = 'bg-red-500/[0.06]';
                            else if (urgencyColor === 'bg-orange-500') cellBg = 'bg-orange-500/[0.05]';
                            else if (urgencyColor === 'bg-amber-400') cellBg = 'bg-amber-400/[0.04]';
                            else cellBg = 'bg-teal-400/[0.04]';
                        }

                        return (
                            <div
                                key={cell.date}
                                onClick={() => setSelectedDate(isSelected ? null : cell.date)}
                                className={`h-28 sm:h-32 border-t border-r border-white/5 p-1.5 sm:p-2 cursor-pointer transition-all relative ${
                                    isSelected
                                        ? 'bg-teal-500/10 ring-2 ring-teal-500/40'
                                        : isToday
                                            ? 'bg-white/[0.06] ring-1 ring-teal-500/30'
                                            : hasOrders
                                                ? cellBg + ' hover:bg-white/[0.06]'
                                                : 'hover:bg-white/[0.03]'
                                }`}
                            >
                                {/* 날짜 숫자 */}
                                <span className={`text-sm font-bold ${
                                    isToday
                                        ? 'bg-teal-500 text-black w-7 h-7 rounded-full flex items-center justify-center text-sm'
                                        : weekday === 0 ? 'text-red-400' : weekday === 6 ? 'text-blue-400' : 'text-slate-300'
                                }`}>
                                    {cell.day}
                                </span>

                                {/* 주문 건수 표시 - 배지 스타일 */}
                                {hasOrders && (
                                    <div className="mt-1 space-y-1">
                                        {/* 건수 배지 */}
                                        <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md ${
                                            urgencyColor === 'bg-red-500' ? 'bg-red-500/20 text-red-300'
                                            : urgencyColor === 'bg-orange-500' ? 'bg-orange-500/20 text-orange-300'
                                            : urgencyColor === 'bg-amber-400' ? 'bg-amber-400/20 text-amber-300'
                                            : 'bg-teal-400/20 text-teal-300'
                                        }`}>
                                            {urgencyColor && activeOrders.length > 0 && (
                                                <span className={`w-2 h-2 rounded-full ${urgencyColor} animate-pulse`} />
                                            )}
                                            <span className="text-xs font-bold">
                                                {dateOrders.length}건
                                            </span>
                                        </div>

                                        {/* 고객명 목록 (최대 2명) */}
                                        <div className="space-y-0.5">
                                            {dateOrders.slice(0, 2).map((o, i) => (
                                                <div key={i} className="flex items-center gap-1 truncate">
                                                    <span className="text-[11px] leading-none">{CHANNEL_ICON[o.channel] || '📋'}</span>
                                                    <span className="text-[11px] text-slate-300 font-medium truncate">
                                                        {o.customerName}
                                                    </span>
                                                </div>
                                            ))}
                                            {dateOrders.length > 2 && (
                                                <span className="text-[10px] text-slate-500 font-medium">+{dateOrders.length - 2}건 더</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 선택된 날짜 상세 */}
            {selectedDate && (
                <div className="rounded-2xl border border-teal-500/20 bg-teal-500/[0.03] p-4">
                    <h4 className="text-white text-sm font-bold mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-teal-400 text-[18px]">event</span>
                        {(() => {
                            const d = new Date(selectedDate);
                            return `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAYS[d.getDay()]})`;
                        })()}
                        <span className="text-teal-400 text-xs font-normal ml-1">{selectedOrders.length}건</span>
                    </h4>

                    {selectedOrders.length === 0 ? (
                        <p className="text-slate-500 text-sm text-center py-4">이 날짜에 등록된 주문이 없습니다.</p>
                    ) : (
                        <div className="space-y-2">
                            {selectedOrders.map(order => {
                                const status = STATUS_LABEL[order.status] || '접수';
                                const statusColor = STATUS_COLORS[order.status] || 'bg-blue-400';
                                return (
                                    <div
                                        key={order.id}
                                        className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-3 hover:border-white/20 transition-all cursor-pointer"
                                        onClick={() => onEdit(order)}
                                    >
                                        <span className="text-lg">{CHANNEL_ICON[order.channel] || '📋'}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm font-semibold truncate">
                                                {order.customerName}
                                                <span className="text-slate-500 text-xs font-normal ml-2">{order.phone}</span>
                                            </p>
                                            {order.productName && (
                                                <p className="text-slate-400 text-xs truncate">{order.productName}{order.quantity ? ` · ${order.quantity}` : ''}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className={`w-2 h-2 rounded-full ${statusColor}`} />
                                            <span className="text-[11px] text-slate-400 font-medium">{status}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
