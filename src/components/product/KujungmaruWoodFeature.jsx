import React from 'react';
import { KUJUNGMARU_WOOD_LINE_DETAILS } from './kujungmaruWoodLineDetails';

// 특장점 제목 키워드로 Material Symbols 아이콘을 고른다.
const ICON_RULES = [
    [/이탈리아|장인|제조|철학/, 'workspace_premium'],
    [/원재료|소재|나무|합판/, 'park'],
    [/가공|결합력|구조|안정성/, 'precision_manufacturing'],
    [/인증|안전|품질/, 'verified'],
    [/보행감|편안/, 'directions_walk'],
    [/트렌디|공간감|비율/, 'aspect_ratio'],
    [/친환경|eco/i, 'eco'],
];

function pickIcon(title) {
    const rule = ICON_RULES.find(([pattern]) => pattern.test(title));
    return rule ? rule[1] : 'check_circle';
}

function KujungmaruWoodFeature({ line }) {
    const detail = KUJUNGMARU_WOOD_LINE_DETAILS[line];
    if (!detail) return null;

    return (
        <div className="w-full bg-white">
            <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-12">
                <div className="text-center mb-4">
                    {detail.origin && (
                        <span className="inline-block text-[11px] font-bold tracking-widest text-[#8a6d3b] border border-[#8a6d3b]/40 rounded-full px-3 py-1 mb-4">
                            {detail.origin}
                        </span>
                    )}
                    {detail.tagline.map((line2, i) => (
                        <p key={i} className="text-[14px] text-[#555555] leading-relaxed">{line2}</p>
                    ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10 mt-10">
                    {detail.features.map((f, i) => (
                        <div key={i} className="flex gap-4 bg-[#fafaf8] border border-[#e8e2d5] rounded-2xl p-6">
                            <div className="flex-shrink-0 w-[52px] h-[52px] rounded-full bg-white border border-[#d8cdb8] flex items-center justify-center">
                                <span className="material-symbols-outlined text-[24px] text-[#8a6d3b]">{pickIcon(f.title)}</span>
                            </div>
                            <div>
                                <h3 className="text-[15px] font-black text-[#3a2f1f] mb-1">{f.title}</h3>
                                {f.subtitle && <p className="text-[13px] font-bold text-[#8a6d3b] mb-2">{f.subtitle}</p>}
                                <p className="text-[13px] text-[#666666] leading-relaxed">{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default KujungmaruWoodFeature;
