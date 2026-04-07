import React, { useState } from 'react';

const KakaoChatButton = () => {
    const [isHovered, setIsHovered] = useState(false);

    // 한국 표준시(KST) 기준 업무 시간 체크 (평일 09:00 ~ 18:00)
    const checkBusinessHours = () => {
        const now = new Date();
        // 한국 시간으로 변환 (서버 환경 고려 시 대비)
        const kstNow = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (9 * 3600000));

        const day = kstNow.getDay(); // 0(일) ~ 6(토)
        const hours = kstNow.getHours();

        const isWorkDay = day >= 1 && day <= 5; // 월~금
        const isWorkTime = hours >= 9 && hours < 18; // 09:00 ~ 17:59

        return isWorkDay && isWorkTime;
    };

    const isOnline = checkBusinessHours();

    // KAKAO_CHANNEL_URL: 실제 데일리하우징 카카오 채널 URL로 교체 필요
    const KAKAO_CHANNEL_URL = 'https://pf.kakao.com/_';

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 pointer-events-none">
            {/* 상담하기 말풍선 (데스크탑에서 호버 시 노출) */}
            <div
                className={`
                    hidden md:block 
                    bg-white text-slate-900 
                    px-5 py-3 rounded-2xl shadow-[0_15px_40px_-10px_rgba(0,0,0,0.3)] 
                    text-sm border border-slate-100 
                    transition-all duration-300 transform
                    ${isHovered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-90'}
                `}
            >
                <div className="font-bold flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                    {isOnline ? '실시간 상담 가능' : '상담 시간 종료'}
                </div>
                <p className="text-slate-500 text-xs leading-relaxed whitespace-pre-line">
                    {isOnline
                        ? '타일·장판 수량 문의 등\n남겨주시면 5분 내 답변드립니다!'
                        : '연락처를 남겨주시면\n내일 오전 중으로 연락드릴게요.'}
                </p>
                <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white rotate-45 border-r border-b border-slate-100"></div>
            </div>

            {/* 메인 버튼 */}
            <a
                href={KAKAO_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`
                    pointer-events-auto
                    w-14 h-14 md:w-16 md:h-16 
                    rounded-full 
                    flex items-center justify-center 
                    transition-all duration-300 active:scale-95
                    hover:-translate-y-1 group relative
                    ${isOnline
                        ? 'bg-[#FEE500] shadow-[0_10px_25px_-5px_rgba(254,229,0,0.4)] hover:shadow-[0_15px_35px_-5px_rgba(254,229,0,0.6)]'
                        : 'bg-slate-200 grayscale-[0.3] shadow-lg'}
                `}
                aria-label="KakaoTalk Consultation"
            >
                {/* Kakao Logo SVG */}
                <svg
                    viewBox="0 0 24 24"
                    className="w-7 h-7 md:w-8 md:h-8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M12 3C6.47715 3 2 6.48356 2 10.7801C2 13.5594 3.88417 15.9959 6.69083 17.4116L5.5 21.6441L10.2223 18.2327C10.8011 18.3377 11.3934 18.3916 12 18.3916C17.5228 18.3916 22 14.908 22 10.6115C22 6.31498 17.5228 2.83142 12 2.83142V3Z"
                        fill="#000000"
                        fillOpacity="0.85"
                    />
                </svg>

                {/* 프리미엄 강조 효과 (Subtle Glow) */}
                <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-[#FEE500] pointer-events-none group-hover:hidden"></div>
            </a>
        </div>
    );
};

export default KakaoChatButton;
