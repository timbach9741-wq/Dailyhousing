import React from 'react';

// 구정마루 타일마루(마뷸러스) 공통 상세정보 콘텐츠(공식 사이트 제품 상세페이지 기준, 라인 공통)
// 아이콘 이미지는 구정마루 측 자산을 그대로 쓰지 않고, 사이트에서 이미 쓰고 있는
// Material Symbols 아이콘으로 동일한 의미를 표현함.
const FEATURES = [
    {
        icon: 'eco',
        title: ['속부터 다르다', '친환경 최고 등급 나무', '합판 베이스'],
        desc: '전 세계 우수 산지의 친환경 최고 등급의 SE0 나무 합판을 베이스로 구정마루의 높은 기술력을 더해 마루 속까지 차별화하여 마루의 격을 높였습니다.',
    },
    {
        icon: 'humidity_mid',
        title: ['품질이 다르다', '열과 습기에 가장', '안전한 마루'],
        desc: '국내 환경 및 고객 라이프스타일에 최적화된 구정마루 5겹 특수 직결 목재 합판을 사용하여 열과 습기에 가장 안전한 마루로 품질의 격을 높였습니다.',
    },
    {
        icon: 'diamond',
        title: ['디테일이 다르다', '시선을 사로잡는', '독보적인 디자인'],
        desc: '대리석 질감을 자연 그대로 살린 정교한 디테일로 고객의 시선을 사로잡고 공간의 격을 높입니다.',
    },
    {
        icon: 'directions_walk',
        title: ['편안함이 다르다', '편안하고 안정한', '보행감'],
        desc: '스톤 바닥재가 갖는 단점을 완벽하게 커버, 가족과 반려견 등에 최적화하여 편안하고 안전한 보행감으로 생활의 격을 높였습니다.',
    },
    {
        icon: 'verified',
        title: ['AS가 다르다', '업계 최장 기간', '15년 워런티'],
        desc: '구정마루의 전문 마루 관리 시스템으로 업계 최장 기간 총 15년의 워런티(무상 AS 1년 / 유상 AS 15년)을 지원으로 고객 만족의 격을 높였습니다.',
    },
];

function KujungmaruTileFeature() {
    return (
        <div className="w-full bg-white">
            <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-12">
                <h2 className="text-[20px] font-black text-[#222222] mb-10 text-center">상세 정보</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
                    {FEATURES.map((f, i) => (
                        <div key={i} className="flex flex-col items-center text-center px-4">
                            <div className="w-[110px] h-[110px] rounded-full border border-[#d8cdb8] flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-[44px] text-[#8a6d3b]">{f.icon}</span>
                            </div>
                            <h3 className="text-[17px] font-black text-[#3a2f1f] leading-relaxed mb-3">
                                {f.title.map((line, li) => (
                                    <span key={li} className="block">{line}</span>
                                ))}
                            </h3>
                            <p className="text-[14px] text-[#666666] leading-relaxed max-w-[320px]">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default KujungmaruTileFeature;
