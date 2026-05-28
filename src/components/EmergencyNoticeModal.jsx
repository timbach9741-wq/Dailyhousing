import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function EmergencyNoticeModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [popupData, setPopupData] = useState(null);

    useEffect(() => {
        const docRef = doc(db, 'site_config', 'homepage');
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data && data.popup) {
                    const popup = data.popup;
                    setPopupData(popup);
                    
                    // 오늘 하루 보지 않기 체크
                    const hideNoticeUntil = localStorage.getItem('hideEmergencyNoticeUntil');
                    const isTimePassed = !hideNoticeUntil || new Date().getTime() > parseInt(hideNoticeUntil, 10);
                    
                    if (popup.enabled && isTimePassed) {
                        setIsOpen(true);
                    } else {
                        setIsOpen(false);
                    }
                } else {
                    setIsOpen(false);
                }
            } else {
                setIsOpen(false);
            }
        }, (error) => {
            console.error("Failed to fetch real-time popup data:", error);
        });

        return () => unsubscribe();
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

    if (!isOpen || !popupData) return null;

    const isWarning = popupData.theme === 'warning';
    const headerBg = isWarning ? 'bg-red-600' : 'bg-slate-800';
    const iconName = isWarning ? 'warning' : 'campaign';
    const closeHover = isWarning ? 'hover:text-red-200' : 'hover:text-slate-200';
    const checkboxCls = isWarning 
        ? 'w-5 h-5 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer' 
        : 'w-5 h-5 rounded border-slate-300 text-slate-800 focus:ring-slate-700 cursor-pointer';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-all transform origin-center scale-100">
                {/* Header */}
                <div className={`${headerBg} px-6 py-4 flex items-center justify-between shrink-0`}>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-white text-[24px]">{iconName}</span>
                        <h2 className="text-white text-lg font-bold tracking-tight">
                            {popupData.headerText || (isWarning ? '긴급 공지' : '공지사항')}
                        </h2>
                    </div>
                    <button onClick={handleClose} className={`text-white ${closeHover} transition-colors`}>
                        <span className="material-symbols-outlined text-[24px]">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8 overflow-y-auto flex-1">
                    {popupData.title && (
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 break-keep leading-snug">
                            {popupData.title}
                        </h3>
                    )}
                    
                    {popupData.content && (
                        <p className="text-slate-700 text-[15px] leading-relaxed break-keep whitespace-pre-wrap">
                            {popupData.content}
                        </p>
                    )}
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
                            className={checkboxCls}
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
