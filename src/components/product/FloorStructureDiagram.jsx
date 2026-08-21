import React from 'react';

// 강마루 5겹 구조 단면도(구정마루 등 강마루 공통 구조) - 원본 일러스트를 복제하지 않고
// 동일한 정보(층 구성)를 우리 자체 SVG로 재구성함. 라인마다 층 이름이 조금씩 달라서 props로 받는다.
const DEFAULT_LAYERS = [
    { label: '고강도 표면 보호층', color: '#f3ede0' },
    { label: '살아있는 질감이 돋보이는 엠보 기술', color: '#e6d9bd' },
    { label: 'HPL 수종패턴지', color: '#d9bd8f' },
    { label: '1급 내수 합판', sub: '(친환경 SE0급)', color: '#b98a55' },
    { label: 'Micro-Beveling', sub: '(V커팅)', color: '#8a6238' },
];
const COLORS = ['#f3ede0', '#e6d9bd', '#d9bd8f', '#b98a55', '#8a6238'];

function FloorStructureDiagram({ layers }) {
    const LAYERS = (layers || DEFAULT_LAYERS.map(({ label, sub }) => ({ label, sub }))).map((l, i) => ({ ...l, color: COLORS[i] || COLORS[COLORS.length - 1] }));
    const layerHeight = 22;
    const width = 260;
    const skew = 34;

    return (
        <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-14 py-4">
            <svg width={width + skew} height={layerHeight * LAYERS.length + skew + 10} viewBox={`0 0 ${width + skew} ${layerHeight * LAYERS.length + skew + 10}`}>
                {LAYERS.map((layer, i) => {
                    const y = skew + i * layerHeight;
                    const points = [
                        [skew, y],
                        [skew + width, y],
                        [width, y + layerHeight],
                        [0, y + layerHeight],
                    ].map(p => p.join(',')).join(' ');
                    const topPoints = [
                        [skew, y],
                        [skew + width, y],
                        [width, y + layerHeight],
                        [0, y + layerHeight],
                    ];
                    return (
                        <polygon key={i} points={points} fill={layer.color} stroke="#ffffff" strokeWidth="1" />
                    );
                })}
            </svg>
            <ul className="flex flex-col gap-[22px]">
                {LAYERS.map((layer, i) => (
                    <li key={i} className="flex items-center gap-2 text-[14px] text-[#333333]">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#8a6d3b] text-white text-[11px] font-bold shrink-0">
                            {String.fromCharCode(65 + i)}
                        </span>
                        <span>
                            {layer.label}
                            {layer.sub && <span className="block text-[12px] text-[#999999]">{layer.sub}</span>}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default FloorStructureDiagram;
