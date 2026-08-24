import React from 'react';
import FloorStructureDiagram from './FloorStructureDiagram';
import { KUJUNGMARU_TILE_LINE_DETAILS } from './kujungmaruTileLineDetails';

// 구정마루 타일마루(마뷸러스) 라인별 STRUCTURE(단면도) + 차별화 기술 + 마케팅 카피
// 라인 데이터가 아직 없으면(kujungmaruTileLineDetails.js 참고) 아무것도 렌더링하지 않는다.
function KujungmaruTileStructure({ line }) {
    const detail = KUJUNGMARU_TILE_LINE_DETAILS[line];
    if (!detail) return null;

    return (
        <div className="w-full bg-white border-t border-slate-100">
            <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-12">
                <h2 className="text-[20px] font-black text-[#222222] mb-6 tracking-wide">STRUCTURE</h2>
                <FloorStructureDiagram layers={detail.layers} />
                <div className="mt-4 mb-10 text-[14px] text-[#555555] leading-relaxed">
                    {detail.sizes.map((s, i) => <p key={i}>{s}</p>)}
                </div>

                {detail.techCallouts?.length > 0 && (
                    <div className="mb-10">
                        <h3 className="text-[18px] font-black text-[#3a2f1f] mb-4">{line}의 차별화 된 테크놀로지</h3>
                        <div className="flex flex-col gap-4">
                            {detail.techCallouts.map((c, i) => (
                                <div key={i} className="border border-[#e8e2d5] rounded-lg overflow-hidden">
                                    <div className="bg-[#5a4632] text-white font-bold text-[15px] px-5 py-3">{c.title}</div>
                                    <p className="px-5 py-4 text-[14px] text-[#555555] leading-relaxed bg-[#fafaf8]">{c.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {detail.marketing?.length > 0 && (
                    <div className="text-center text-[15px] text-[#444444] leading-loose">
                        {detail.marketing.map((textLine, i) => (
                            textLine ? <p key={i}>{textLine}</p> : <div key={i} className="h-4" />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default KujungmaruTileStructure;
