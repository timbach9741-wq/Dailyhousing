import React from 'react';
import { DONGHWAMARU_LINE_DETAILS } from './donghwamaruLineDetails';

// 특장점 제목에 등장하는 핵심 키워드로 Material Symbols 아이콘을 고른다.
// 라인마다 특장점 이름이 제각각이라 구정마루처럼 고정 아이콘 배열을 쓸 수 없어
// 키워드 매칭 방식으로 처리 — 새 키워드가 나오면 이 목록에 추가하면 된다.
const ICON_RULES = [
    [/내수|내습|물기|습기/, 'water_drop'],
    [/내구|내충격|내마모|강도/, 'shield'],
    [/친환경|E0|eco/i, 'eco'],
    [/따뜻|열전도|열성능|열 전달|잠열/, 'device_thermostat'],
    [/시가렛|담뱃/, 'smoke_free'],
    [/오염|clean|청소/i, 'cleaning_services'],
    [/소음/, 'volume_off'],
    [/슬립|미끄럼/, 'health_and_safety'],
    [/color|컬러/i, 'palette'],
    [/wide|long|규격|공간감|비례/i, 'aspect_ratio'],
    [/texture|질감|엠보|터치/i, 'texture'],
    [/소나무|원목/, 'park'],
    [/반려동물|pet/i, 'pets'],
    [/가격/, 'sell'],
    [/duo|코어|core/i, 'layers'],
    [/시공|고정|beveling|v-sys|혀|홈/i, 'construction'],
    [/은이온|세라믹/, 'science'],
    [/에너지/, 'bolt'],
    [/직배|배송/, 'local_shipping'],
    [/디자인|match|통일감/i, 'design_services'],
    [/황토|접착제/, 'compost'],
    [/lacquer|도장/i, 'brush'],
];

function pickIcon(title) {
    const rule = ICON_RULES.find(([pattern]) => pattern.test(title));
    return rule ? rule[1] : 'check_circle';
}

function DonghwamaruFeature({ line }) {
    const detail = DONGHWAMARU_LINE_DETAILS[line];
    if (!detail || detail.features?.length === 0) return null;

    return (
        <div className="w-full bg-white">
            <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-12">
                <div className="text-center mb-10">
                    <h2 className="text-[20px] font-black text-[#222222] mb-2">특장점</h2>
                    {detail.tagline && <p className="text-[14px] text-[#777777]">{detail.tagline}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
                    {detail.features.map((f, i) => (
                        <div key={i} className="flex flex-col items-center text-center px-4">
                            <div className="w-[84px] h-[84px] rounded-full bg-[#eef6ee] flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-[36px] text-[#2e7d32]">{pickIcon(f.title)}</span>
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

export default DonghwamaruFeature;
