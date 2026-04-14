import { useState, useEffect } from 'react';

export default function EmergencyNoticeModal() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // 오늘 하루 보지 않기 체크
        const hideNoticeUntil = localStorage.getItem('hideEmergencyNoticeUntil');
        if (!hideNoticeUntil || new Date().getTime() > parseInt(hideNoticeUntil, 10)) {
            setIsOpen(true);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleHideToday = () => {
        // 24시간(86400000ms) 동안 숨김
        const hideUntil = new Date().getTime() + 86400000;
        localStorage.setItem('hideEmergencyNoticeUntil', hideUntil.toString());
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-all transform origin-center scale-100">
                {/* Header */}
                <div className="bg-red-600 px-6 py-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-white text-[24px]">warning</span>
                        <h2 className="text-white text-lg font-bold tracking-tight">긴급 공지</h2>
                    </div>
                    {/* 우측 상단 X 닫기 버튼 추가 */}
                    <button onClick={handleClose} className="text-white hover:text-red-200 transition-colors">
                        <span className="material-symbols-outlined text-[24px]">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8 overflow-y-auto flex-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 break-keep leading-snug">
                        [긴급] 중동 지역 전쟁 여파로 인한<br className="hidden sm:block" /> 원자재 수급 불안정 및 배송 지연 안내
                    </h3>
                    
                    <p className="text-slate-700 text-[15px] leading-relaxed mb-6 break-keep">
                        안녕하세요, 데일리하우징입니다.<br/>
                        현재 중동 지역의 급격한 정세 악화로 인해 바닥재 핵심 원자재 수급과 수입 물류 상황이 매우 불안정합니다.<br className="hidden sm:block" /> 이에 따라 부득이하게 아래와 같이 운영 방침을 안내드립니다.
                    </p>

                    <div className="space-y-4 mb-6">
                        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                            <h4 className="font-bold text-red-800 mb-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                                재고 확인 후 주문 안내
                            </h4>
                            <p className="text-[14px] text-red-700 break-keep">
                                일부 품목의 경우 현재 재고가 급격히 소진되어 '품절' 처리 중입니다.<br className="hidden sm:block" /> 주문 전 반드시 재고 현황을 통해 재고 유무를 먼저 확인해 주시기 바랍니다.
                            </p>
                        </div>
                        
                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                            <h4 className="font-bold text-orange-800 mb-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[18px]">cancel</span>
                                주문 취소 가능성
                            </h4>
                            <p className="text-[14px] text-orange-700 break-keep">
                                재고가 없는 상태에서 결제된 주문은 부득이하게<br className="hidden sm:block" /> 사전 안내 후 자동 취소될 수 있음을 양해 부탁드립니다.
                            </p>
                        </div>

                        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                            <h4 className="font-bold text-yellow-800 mb-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[18px]">payments</span>
                                단가 변동 예고
                            </h4>
                            <p className="text-[14px] text-yellow-700 break-keep">
                                수입 단가 상승으로 인해 예고 없이 제품 가격이 인상될 수 있습니다.
                            </p>
                        </div>
                    </div>

                    <p className="text-slate-600 text-[14px] leading-relaxed font-medium break-keep text-center sm:text-left">
                        고객님들의 넓은 양해 부탁드리며, 최대한 빠르게 물량을 확보할 수 있도록 최선을 다하겠습니다.<br />감사합니다.
                    </p>
                </div>

                {/* Footer Checkbox & Buttons */}
                <div className="bg-slate-50 border-t border-slate-100 flex items-center justify-between px-6 py-4 shrink-0">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            onChange={(e) => {
                                if (e.target.checked) {
                                    handleHideToday();
                                }
                            }}
                            className="w-5 h-5 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                        />
                        <span className="text-[14px] font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                            오늘 하루 보지 않기
                        </span>
                    </label>
                    <button 
                        onClick={handleClose}
                        className="px-6 py-2 bg-slate-800 text-white text-[15px] font-bold rounded-lg hover:bg-slate-900 transition-colors shadow-sm"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}
