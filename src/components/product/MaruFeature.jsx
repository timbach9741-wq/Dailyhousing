import React from 'react';
import { Leaf, Award, Wand2, Shield, MousePointer2 } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   에디톤 마루 상세 데이터
   ═══════════════════════════════════════════════════════════ */

const MARU_DATA = {
    introTitle: "LX Z:IN 바닥재 에디톤 마루",
    introDesc: "자연의 디자인과 광택을 담아 원목 고유의 포근함을 선사하는 프리미엄 바닥재, LX Z:IN 에디톤 마루입니다.",
    // 구조도와 상세 이미지 URL을 확인 가능한 공개된 URL로 대체하거나, 스타일로 보완
    features: [
        { icon: "shield", sub: "찍힘과 긁힘에 강한", title: "고내구 바닥재" },
        { icon: "leaf", sub: "안심하고 사용할 수 있는", title: "친환경 인증" },
        { icon: "wand", sub: "디지털 인쇄로 구현한", title: "리얼한 디자인" },
    ],
    structure: {
        title: "제품 구조도",
        desc: "에디톤 마루는 무광 효과 표면층, 고내구 투명층, 고해상 디자인층, NSC(T&G), 전용 접착제 총 5단계로 구성되어 있습니다.",
        // 공식 사이트 이미지 대신 설명력이 있는 다른 이미지를 시도하거나 로컬 에셋 확인 필요
        image: "https://www.lxzin.com/zin/assets/images/product/editon_maru_structure.png", // 추정 경로
        note: "※ NSC(Natural Stone Core) : 석재를 분쇄 후, 고분자 수지와 고온 고압으로 압축한 고강도 보드판"
    },
    detailFeatures: [
        {
            title: "디지털 인쇄 적용",
            desc: "고해상도 디지털 프린팅 기술을 통해 나무 고유의 색감과 결을\n더욱 정교하고 선명하게 표현했습니다.",
            image: "https://www.lxzin.com/zin/assets/images/product/editon_maru_feature01.jpg"
        },
        {
            title: "내추럴 텍스처 구현",
            desc: "실제 원목과 같은 입체감을 살린 엠보 기술로\n맨발에 닿는 촉감까지 자연스럽게 완성했습니다.",
            image: "https://www.lxzin.com/zin/assets/images/product/editon_maru_feature02.jpg"
        }
    ],
    certs: [
        { src: "https://octapi.lxzin.com/imageResource/file/202504/18/6872a3fe-7c28-463d-803e-30eabdf37305.jpg", alt: "1위", width: "120px", label: "가정용 바닥재 1위" },
        { src: "https://octapi.lxzin.com/imageResource/file/202511/21/e8f7f262-222b-42fa-84ed-533e946597b8.png", alt: "환경표지", width: "120px", label: "환경표지인증" },
    ]
};

const ICON_MAP = {
    leaf: Leaf,
    award: Award,
    wand: Wand2,
    shield: Shield,
    mouse: MousePointer2
};

function MaruFeature() {
    return (
        <div className="w-full flex flex-col items-center bg-white">
            {/* 상단 히어로 섹션 */}
            <div className="w-full bg-[#f8f9fa] py-24 flex flex-col items-center px-6">
                <div className="max-w-[800px] text-center">
                    <h2 className="text-[14px] md:text-[15px] font-extrabold text-[#222222] mb-4 tracking-tight">
                        {MARU_DATA.introTitle}
                    </h2>
                    <p className="text-[14px] md:text-[14px] text-[#666666] leading-relaxed font-medium">
                        {MARU_DATA.introDesc}
                    </p>
                </div>
            </div>

            {/* 핵심 가치 섹션 */}
            <div className="max-w-[960px] w-full py-20 px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {MARU_DATA.features.map((feat, idx) => {
                        const IconComp = ICON_MAP[feat.icon];
                        return (
                            <div key={idx} className="flex flex-col items-center p-10 bg-white border border-[#eee] rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-16 h-16 rounded-2xl bg-[#826a5d] flex items-center justify-center mb-6">
                                    {IconComp && <IconComp className="w-8 h-8 text-white" />}
                                </div>
                                <span className="text-sm text-[#888] mb-2 font-semibold uppercase tracking-wider">{feat.sub}</span>
                                <h3 className="text-[15px] text-[#222] font-bold">{feat.title}</h3>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 고도화된 제품 구조 섹션 (이미지 대신 텍스트 기반 시각화) */}
            <div className="w-full bg-[#222] py-24 px-6 text-white flex flex-col items-center">
                <div className="max-w-[800px] w-full">
                    <div className="text-center mb-4">
                        <h3 className="text-3xl md:text-[14px] font-bold mb-6 tracking-tight">{MARU_DATA.structure.title}</h3>
                        <p className="text-[#aaa] text-[14px] leading-relaxed max-w-2xl mx-auto">
                            {MARU_DATA.structure.desc}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:p-8 items-center">
                        <div className="space-y-4">
                            {[
                                { n: "01", t: "무광 효과 표면층", d: "빛 반사를 최소화하여 원목의 사실적인 질감을 표현" },
                                { n: "02", t: "고내구 투명층", d: "찍힘과 긁힘으로부터 바닥재를 강력하게 보호" },
                                { n: "03", t: "고해상 디자인층", d: "디지털 프린팅으로 완성한 리얼한 나무 패턴" },
                                { n: "04", t: "NSC 코어 (T&G)", d: "천연석 분말 함유로 열전도율과 치수 안정성 극대화" },
                                { n: "05", t: "전용 접착제", d: "친환경 황토 접착제로 안심 시공" }
                            ].map((s, i) => (
                                <div key={i} className="flex items-start gap-5 p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                    <span className="text-[#826a5d] font-black text-[14px] italic">{s.n}</span>
                                    <div>
                                        <h4 className="font-bold text-[14px] mb-1">{s.t}</h4>
                                        <p className="text-[#888] text-sm leading-relaxed">{s.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-[#333] p-10 rounded-3xl border border-white/5 flex items-center justify-center aspect-square">
                            <div className="text-center">
                                <Shield className="w-24 h-24 text-[#826a5d] mx-auto mb-6 opacity-50" />
                                <p className="text-[#666] text-sm">에디톤 마루의 5중 구조는<br />내구성과 심미성을 동시에 만족시킵니다.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 기술력 섹션 */}
            <div className="max-w-[960px] w-full py-16 px-6">
                <div className="space-y-40">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                        <div>
                            <h4 className="text-3xl font-bold text-[#222] mb-6">초고해상도<br />디지털 인쇄 적용</h4>
                            <p className="text-[#666] text-[14px] leading-relaxed">
                                기존 인쇄 방식의 한계를 넘어선 고해상도 디지털 프린팅 기술을 적용했습니다.
                                나무 고유의 섬세한 색감과 옹이의 자연스러운 결을 정교하게 표현하여 공간의 깊이감을 더합니다.
                            </p>
                        </div>
                        <div className="aspect-[4/3] bg-[#f8f9fa] rounded-3xl border border-[#eee] flex items-center justify-center">
                            <Wand2 className="w-20 h-20 text-[#826a5d] opacity-20" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                        <div className="order-2 md:order-1 aspect-[4/3] bg-[#f8f9fa] rounded-3xl border border-[#eee] flex items-center justify-center">
                            <MousePointer2 className="w-20 h-20 text-[#826a5d] opacity-20" />
                        </div>
                        <div className="order-1 md:order-2">
                            <h4 className="text-3xl font-bold text-[#222] mb-6">리얼한 촉감,<br />내추럴 텍스처 구현</h4>
                            <p className="text-[#666] text-[14px] leading-relaxed">
                                시각적인 리얼함을 넘어 촉각까지 원목의 감성을 담았습니다.
                                입체적인 엠보 기술을 더해 맨발에 닿는 나무 특유의 포근하고 편안한 감촉을 완성했습니다.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 인증 섹션 */}
            <div className="w-full border-t border-[#eee] py-24 flex flex-col items-center px-6 bg-[#fcfcfc]">
                <div className="max-w-[800px] w-full">
                    <h3 className="text-[15px] font-bold text-center mb-6">엄격하게 검증된 친환경 품질</h3>
                    <div className="flex flex-wrap justify-center gap-6 md:p-8">
                        <div className="flex flex-col items-center italic text-[#888]">
                            <Award className="w-12 h-12 mb-4 text-[#826a5d]" />
                            <span>한국산업의 브랜드파워 1위</span>
                        </div>
                        <div className="flex flex-col items-center italic text-[#888]">
                            <Leaf className="w-12 h-12 mb-4 text-[#826a5d]" />
                            <span>환경표지인증 획득</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MaruFeature;
