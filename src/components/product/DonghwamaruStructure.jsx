import React from 'react';
import { DONGHWAMARU_LINE_DETAILS } from './donghwamaruLineDetails';

// 동화자연마루 라인별 제품구조(번호 목록) + 사이즈 + 10년 보증 배지
// '강' 브랜드 라인(강 오리진/포레/텍스쳐/스퀘어)은 공식 사이트에도 제품구조 섹션이 없어 생략됨.
function DonghwamaruStructure({ line }) {
    const detail = DONGHWAMARU_LINE_DETAILS[line];
    if (!detail) return null;

    return (
        <div className="w-full bg-[#f7faf7] border-t border-slate-100">
            <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-12">
                {detail.warranty && (
                    <div className="mb-8 inline-flex items-center gap-2 bg-[#2e7d32]/10 text-[#2e7d32] text-[13px] font-bold px-4 py-2 rounded-full">
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                        10년 보증 혜택 — 시공 후 1개월 이내 품질보증 등록 시 최대 10년까지 보증
                    </div>
                )}

                <div className="mb-4 text-[14px] text-[#555555] leading-relaxed">
                    {detail.sizes.map((s, i) => <p key={i}>{s}</p>)}
                </div>

                {detail.structure?.length > 0 && (
                    <div>
                        <h2 className="text-[20px] font-black text-[#222222] mb-6 tracking-wide">제품구조</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {detail.structure.map((layer, i) => (
                                <div key={i} className="flex gap-4 bg-white rounded-xl border border-[#e5ede5] p-5">
                                    <span className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#2e7d32] text-white text-[13px] font-bold">
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <div>
                                        <p className="text-[14px] font-bold text-[#222222] mb-1">{layer.title}</p>
                                        {layer.desc && <p className="text-[13px] text-[#666666] leading-relaxed">{layer.desc}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DonghwamaruStructure;
