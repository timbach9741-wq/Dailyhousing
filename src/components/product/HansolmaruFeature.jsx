import React from 'react';
import { HANSOLMARU_LINE_DETAILS } from './hansolmaruLineDetails';

// 특장점 제목 키워드로 Material Symbols 아이콘을 고른다(동화자연마루 컴포넌트와 동일한 방식).
const ICON_RULES = [
    [/물|수분|내수/, 'water_drop'],
    [/친환경|E0|eco/i, 'eco'],
    [/유지관리|관리|clean/i, 'cleaning_services'],
    [/강화|내구|스크래치|충격/, 'shield'],
    [/소나무|원목/, 'park'],
    [/디자인|톤|컬러|v홈/i, 'palette'],
];

function pickIcon(title) {
    const rule = ICON_RULES.find(([pattern]) => pattern.test(title));
    return rule ? rule[1] : 'check_circle';
}

function HansolmaruFeature({ line }) {
    const detail = HANSOLMARU_LINE_DETAILS[line];
    if (!detail) return null;

    return (
        <div className="w-full bg-white border-t border-slate-100">
            <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-12">
                <div className="text-center mb-10">
                    <h2 className="text-[20px] font-black text-[#222222] mb-2">특징</h2>
                    {detail.tagline && <p className="text-[14px] text-[#777777]">{detail.tagline}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
                    {detail.features.map((f, i) => (
                        <div key={i} className="flex flex-col items-center text-center px-4">
                            <div className="w-[84px] h-[84px] rounded-full bg-[#e8f0fb] flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-[36px] text-[#1a5fb4]">{pickIcon(f.title)}</span>
                            </div>
                            <h3 className="text-[15px] font-bold text-[#222222] mb-2">{f.title}</h3>
                            <p className="text-[13px] text-[#666666] leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default HansolmaruFeature;
