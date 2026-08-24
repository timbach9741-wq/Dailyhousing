import React from 'react';
import { KUJUNGMARU_WOOD_LINE_DETAILS } from './kujungmaruWoodLineDetails';

// 구정마루 원목마루 라인별 STRUCTURE(층 구조) + 사이즈.
// 노블레스 디 앤티크는 패턴(제품명)별로 실제 사이즈가 달라 product.title 기준으로 조회한다.
function KujungmaruWoodStructure({ line, productTitle }) {
    const detail = KUJUNGMARU_WOOD_LINE_DETAILS[line];
    if (!detail) return null;

    const size = detail.sizeByTitle ? (detail.sizeByTitle[productTitle] || Object.values(detail.sizeByTitle)[0]) : detail.size;

    return (
        <div className="w-full bg-[#fafaf8] border-t border-slate-100">
            <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-12">
                <h2 className="text-[20px] font-black text-[#222222] mb-6 tracking-wide">STRUCTURE</h2>

                {detail.structure?.length > 0 && (
                    <div className="flex flex-col gap-4 mb-8">
                        {detail.structure.map((layer, i) => (
                            <div key={i} className="flex gap-4 bg-white rounded-lg border border-[#e8e2d5] p-5">
                                <span className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#8a6d3b] text-white text-[13px] font-bold">
                                    {String.fromCharCode(65 + i)}
                                </span>
                                <div>
                                    <p className="text-[14px] font-bold text-[#3a2f1f] mb-1">{layer.title}</p>
                                    <p className="text-[13px] text-[#666666] leading-relaxed">{layer.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {size && <p className="text-[14px] text-[#555555]">규격 &nbsp;|&nbsp; {size}</p>}
            </div>
        </div>
    );
}

export default KujungmaruWoodStructure;
