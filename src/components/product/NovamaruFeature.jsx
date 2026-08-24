import React from 'react';
import { NOVAMARU_LINE_DETAILS } from './novamaruLineDetails';

// 특장점 제목 키워드로 Material Symbols 아이콘을 고른다.
const ICON_RULES = [
    [/표면보호|스크래치|충격|내충격/, 'shield'],
    [/친환경|인증|eco/i, 'eco'],
    [/열전도|온돌/, 'device_thermostat'],
    [/습기|건축자재|변형/, 'water_drop'],
    [/uv코팅|코팅|광택/, 'auto_awesome'],
    [/sawing|재단|뒤틀림|휨/i, 'carpenter'],
    [/원목|질감|보행감/, 'park'],
];

function pickIcon(title) {
    const rule = ICON_RULES.find(([pattern]) => pattern.test(title));
    return rule ? rule[1] : 'check_circle';
}

function NovamaruFeature({ line }) {
    const detail = NOVAMARU_LINE_DETAILS[line];
    if (!detail) return null;

    return (
        <div className="w-full bg-white border-t border-slate-100">
            <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-12">
                <div className="text-center mb-4">
                    {detail.tagline.map((line2, i) => (
                        <p key={i} className={i === 0 ? 'text-[18px] font-black text-[#222222] mb-3' : 'text-[14px] text-[#666666] leading-relaxed'}>
                            {line2}
                        </p>
                    ))}
                </div>

                {detail.whyNova && (
                    <div className="mt-12 pt-12 border-t border-slate-100">
                        <h2 className="text-[20px] font-black text-[#222222] text-center mb-2">WHY NOVA?</h2>
                        <p className="text-[15px] font-bold text-[#333333] text-center mb-2">{detail.whyNova.intro}</p>
                        <p className="text-[13px] text-[#777777] text-center max-w-3xl mx-auto mb-10 leading-relaxed">{detail.whyNova.lead}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
                            {detail.whyNova.items.map((f, i) => (
                                <div key={i} className="flex flex-col items-center text-center px-4">
                                    <div className="w-[84px] h-[84px] rounded-full bg-[#f0f0f0] flex items-center justify-center mb-4">
                                        <span className="material-symbols-outlined text-[36px] text-[#333333]">{pickIcon(f.title)}</span>
                                    </div>
                                    <h3 className="text-[15px] font-bold text-[#222222] mb-2">{f.title}</h3>
                                    <p className="text-[13px] text-[#666666] leading-relaxed">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default NovamaruFeature;
