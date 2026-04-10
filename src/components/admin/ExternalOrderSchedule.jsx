// 외부 주문 일정 관리 - 메인 컨테이너
// AdminDashboard의 '일정 관리' 탭에서 렌더링되는 최상위 컴포넌트
import React, { useState, useEffect, useMemo } from 'react';
import { useExternalOrderStore } from '../../store/useExternalOrderStore';
import ExternalOrderFormModal from './ExternalOrderFormModal';
import ExternalOrderListView from './ExternalOrderListView';
import ExternalOrderCalendarView from './ExternalOrderCalendarView';

// D-Day 계산 유틸
const getDday = (deliveryDate) => {
    if (!deliveryDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(deliveryDate);
    target.setHours(0, 0, 0, 0);
    return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
};

export default function ExternalOrderSchedule() {
    const { orders, loading, fetchAll, add, update, updateStatus, remove } = useExternalOrderStore();
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
    const [formOpen, setFormOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);

    // 최초 데이터 로드
    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    // 요약 통계 (미완료 건만 대상)
    const stats = useMemo(() => {
        const activeOrders = orders.filter(o => o.status !== 'delivered');
        const today = activeOrders.filter(o => getDday(o.deliveryDate) === 0).length;
        const tomorrow = activeOrders.filter(o => getDday(o.deliveryDate) === 1).length;
        const thisWeek = activeOrders.filter(o => {
            const d = getDday(o.deliveryDate);
            return d !== null && d >= 0 && d <= 7;
        }).length;
        // 이번 달: 현재 월에 해당하는 배송 예정 건수
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const thisMonth = activeOrders.filter(o => {
            if (!o.deliveryDate) return false;
            const d = new Date(o.deliveryDate);
            return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
        }).length;
        const overdue = activeOrders.filter(o => {
            const d = getDday(o.deliveryDate);
            return d !== null && d < 0;
        }).length;
        return { today, tomorrow, thisWeek, thisMonth, overdue, total: orders.length };
    }, [orders]);

    // 등록/수정 핸들러
    const handleSubmit = async (formData, editId) => {
        if (editId) {
            const result = await update(editId, formData);
            if (!result.success) throw new Error(result.error);
        } else {
            const result = await add(formData);
            if (!result.success) throw new Error(result.error);
        }
    };

    // 수정 모달 열기
    const handleEdit = (order) => {
        setEditTarget(order);
        setFormOpen(true);
    };

    // 모달 닫기
    const handleCloseForm = () => {
        setFormOpen(false);
        setEditTarget(null);
    };

    return (
        <div className="space-y-6">
            {/* 상단 헤더 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-teal-400">calendar_month</span>
                        외부 주문 일정 관리
                    </h2>
                    <p className="text-slate-500 text-xs mt-1">전화 · 카카오 · 현장방문 등 외부 경로로 접수된 주문</p>
                </div>

                <div className="flex items-center gap-2">
                    {/* 뷰 토글 */}
                    <div className="flex rounded-xl border border-white/10 overflow-hidden">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3.5 py-2 text-xs font-bold flex items-center gap-1 transition-all ${
                                viewMode === 'list'
                                    ? 'bg-teal-500/20 text-teal-300'
                                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[16px]">view_list</span>
                            리스트
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`px-3.5 py-2 text-xs font-bold flex items-center gap-1 transition-all ${
                                viewMode === 'calendar'
                                    ? 'bg-teal-500/20 text-teal-300'
                                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                            캘린더
                        </button>
                    </div>

                    {/* 새 등록 버튼 */}
                    <button
                        onClick={() => { setEditTarget(null); setFormOpen(true); }}
                        className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-teal-500/20"
                    >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        새 주문 등록
                    </button>
                </div>
            </div>

            {/* 요약 카드 */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {/* 기한 초과 */}
                {stats.overdue > 0 && (
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 col-span-2 sm:col-span-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-red-400 text-[20px]">warning</span>
                            <span className="text-red-400 text-xs font-bold">기한 초과</span>
                        </div>
                        <p className="text-2xl font-black text-red-400">{stats.overdue}건</p>
                    </div>
                )}

                {/* 오늘 */}
                <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-orange-400 text-[20px]">today</span>
                        <span className="text-orange-400 text-xs font-bold">오늘</span>
                    </div>
                    <p className="text-2xl font-black text-orange-400">{stats.today}건</p>
                </div>

                {/* 내일 */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-amber-400 text-[20px]">event_upcoming</span>
                        <span className="text-amber-400 text-xs font-bold">내일</span>
                    </div>
                    <p className="text-2xl font-black text-amber-400">{stats.tomorrow}건</p>
                </div>

                {/* 이번 주 */}
                <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-teal-400 text-[20px]">date_range</span>
                        <span className="text-teal-400 text-xs font-bold">이번 주</span>
                    </div>
                    <p className="text-2xl font-black text-teal-400">{stats.thisWeek}건</p>
                </div>

                {/* 이번 달 */}
                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-blue-400 text-[20px]">calendar_month</span>
                        <span className="text-blue-400 text-xs font-bold">이번 달</span>
                    </div>
                    <p className="text-2xl font-black text-blue-400">{stats.thisMonth}건</p>
                </div>
            </div>

            {/* 로딩 */}
            {loading && (
                <div className="text-center py-10">
                    <span className="material-symbols-outlined text-teal-400 text-4xl animate-spin">progress_activity</span>
                    <p className="text-slate-500 text-sm mt-2">데이터 불러오는 중...</p>
                </div>
            )}

            {/* 뷰 영역 */}
            {!loading && viewMode === 'list' && (
                <ExternalOrderListView
                    orders={orders}
                    onEdit={handleEdit}
                    onDelete={remove}
                    onStatusChange={updateStatus}
                />
            )}

            {!loading && viewMode === 'calendar' && (
                <ExternalOrderCalendarView
                    orders={orders}
                    onEdit={handleEdit}
                    onStatusChange={updateStatus}
                />
            )}

            {/* 등록/수정 모달 */}
            <ExternalOrderFormModal
                isOpen={formOpen}
                onClose={handleCloseForm}
                onSubmit={handleSubmit}
                editData={editTarget}
            />
        </div>
    );
}
