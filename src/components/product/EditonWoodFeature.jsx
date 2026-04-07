import React from 'react';

const MARU_DETAIL_IMAGES = {
    hero: '/assets/lxzin/maru_detail/hero-forest.png',
    iconTexture: '/assets/lxzin/maru_detail/icon-texture.png',
    iconDigital: '/assets/lxzin/maru_detail/icon-digital.png',
    structure: 'https://octapi.lxzin.com/imageResource/file/202405/03/f136599e-849a-4e4d-ab0d-86bc3b490e2b.png',
    texture01: 'https://octapi.lxzin.com/imageResource/file/202405/03/d8b4c92e-a8ac-40c1-9cc3-3c77f686a4b9.jpg',
    texture02: 'https://octapi.lxzin.com/imageResource/file/202405/03/30c575a9-3112-421c-a2e6-4d168177a20a.jpg',
    texture03: 'https://octapi.lxzin.com/imageResource/file/202405/03/c2b8b4a4-269e-4437-9e78-a19f23c29525.jpg',
    texture04: 'https://octapi.lxzin.com/imageResource/file/202405/03/328e2246-939d-4a56-b0c3-78606392f6b2.jpg',
    digital01: 'https://octapi.lxzin.com/imageResource/file/202405/03/030e797c-0e3c-42e4-8855-7bd529be8aca.png',
    digital02: 'https://octapi.lxzin.com/imageResource/file/202405/03/01e44d6d-9695-409d-bda9-fd3cea148c9a.png',
    heat01: 'https://octapi.lxzin.com/imageResource/file/202405/03/70b6e219-0320-440c-9ab3-7e4a09096242.jpg',
    heat02: 'https://octapi.lxzin.com/imageResource/file/202405/03/f1fde83f-c7af-4294-8ee0-0cd696009203.jpg',
    heat03: 'https://octapi.lxzin.com/imageResource/file/202405/03/365ab6f3-13fe-438f-8025-c7aa8b406053.png',
    durabilitySetup: '/assets/lxzin/maru_detail/detail-15.png',
    durability01: '/assets/lxzin/maru_detail/detail-16.jpg',
    durability02: '/assets/lxzin/maru_detail/detail-17.jpg',
    durability03: '/assets/lxzin/maru_detail/detail-18.jpg',
    safetySetup: '/assets/lxzin/maru_detail/detail-19.png',
    safety01: '/assets/lxzin/maru_detail/detail-20.jpg',
    safety02: '/assets/lxzin/maru_detail/detail-21.jpg',
    safety03: '/assets/lxzin/maru_detail/detail-22.jpg',
    petSafety: 'https://octapi.lxzin.com/imageResource/file/202405/03/9ce3660e-e3a3-477c-913d-ef9bd90693cd.png',
    eirLeft: '/assets/lxzin/maru_detail/detail-24.jpg',
    eirRight: '/assets/lxzin/maru_detail/detail-25.jpg',
    petCertDoc: '/assets/lxzin/maru_detail/detail-27.png',
    greenProduct: '/assets/lxzin/maru_detail/detail-28.png',
    productMain: 'https://octapi.lxzin.com/zinPrd/imgFileSeq/202404/30/d2272fd0-690f-423f-81ea-4c2539805a2c.jpg',
};

const CERTIFICATIONS = [
    {
        img: "https://octapi.lxzin.com/imageResource/file/202504/18/6872a3fe-7c28-463d-803e-30eabdf37305.jpg",
        alt: "2025 한국산업의 브랜드파워(K-BPI) 조사",
        title: "2025 한국산업의 브랜드파워(K-BPI) 조사",
        desc: "가정용 바닥재 부문 1위",
        width: "180px"
    },
    {
        img: MARU_DETAIL_IMAGES.petCertDoc,
        alt: "반려동물제품인증서",
        title: "반려동물제품인증서",
        width: "180px"
    },
    {
        img: MARU_DETAIL_IMAGES.greenProduct,
        alt: "25년 올해의 녹색상품",
        title: "25년 올해의 녹색상품",
        width: "180px"
    }
];

const PRECAUTIONS = [
    {
        title: "사용 시 주의사항",
        content: [
            "물, 기름 등은 미끄러울 수 있으니 즉시 제거하십시오. 특히 노약자나 임산부는 주의하십시오.",
            "시공 후 초기에는 제품 특유의 냄새가 있을 수 있으니 충분히 환기시키십시오.",
            "실제 제품 색상은 샘플 색상과 차이가 날 수 있으며 조명의 종류 및 각도에 따라 달라 보일 수 있습니다.",
            "샘플북에 수록된 인덱스 및 이미지는 실제 제품과 다소 색상 및 무늬가 차이가 날 수 있습니다.",
            "자연스러움을 구현하기 위하여 디자인적으로 제품 내 색상 차이가 있습니다. (제품 내 그라데이션 적용)",
            "손 소독제, 알코올 등이 떨어졌을 때는 즉시 제거하고, 제거되지 않는 오염은 중성세제를 묻힌 천이나 스폰지를 사용하여 제거하십시오. (자세한 사항은 시방서 참조 바랍니다.)",
            "출입구에 매트를 깔아 모래, 흙, 먼지 등의 유입을 막아 주십시오.",
            "놀이방 매트, 쿠션 매트 등을 장기간 방치 시 바닥재 표면의 변색을 유발할 수 있으니 유의바랍니다."
        ]
    },
    {
        title: "시공 시 주의사항",
        content: [
            "시공 전 LX하우시스 시공가이드를 반드시 숙지하여 주십시오. (LX하우시스 시공가이드의 시공법에 따르지 않고 임의로 시공한 제품에 대한 시공상의 하자는 책임을 지지 않습니다.)",
            "생산 LOT별로 구분하여 시공하여 주십시오.",
            "① 무거운 제품입니다. 취급할때 조심하십시오.",
            "② 제품이 세워져 있는 공간에서 작업을 금합니다. 제품이 쓰러져 다칠 수 있습니다.",
            "③ 시공 전 반드시 바닥 수평 상태를 확인하고 고르지 않으면 수평 작업 후 시공하십시오.",
            "④ 바닥에 먼지, 모래, 기름기가 없도록 청소를 철저히 한 후 시공하십시오.",
            "⑤ 표면이 더러워졌을 경우 헝겊이나 휴지로 바로 닦아 주십시오.",
            "장시간 방치 시 오염이 될 수 있습니다.",
            "* 접착제 사용 시",
            "- 인체에 유해할 수 있으니 냄새를 맡지 마시고 환기를 잘 시켜 주십시오.",
            "- 인화성이 있으므로 화재에 유의하십시오."
        ]
    }
];

function EditonWoodFeature() {
    return (
        <div className="w-full flex flex-col items-center bg-white pb-16">
            {/* 타이틀 + 설명 섹션 */}
            <div className="max-w-[960px] w-full pt-16 pb-10 px-6 text-center">
                <h2 className="text-[14px] md:text-[14px] font-black text-[#222] mb-4 tracking-tight">LX Z:IN 바닥재 에디톤 마루</h2>
                <p className="text-[14px] md:text-[14px] text-[#555] leading-relaxed max-w-3xl mx-auto font-medium">
                    LX Z:IN 바닥재 에디톤 마루는 자연의 디자인과 광택을 담아 원목 고유의 포근함을 선사하는 프리미엄 제품입니다.<br />
                    편안한 사용성으로 삶의 질을 더욱 높여주는 LX Z:IN 바닥재 에디톤 마루와 함께 나만의 공간을 만들어 보세요.
                </p>
            </div>

            {/* 메인 히어로 섹션 */}
            <div className="max-w-[960px] w-full mx-auto relative overflow-hidden rounded-xl" style={{ height: '400px' }}>
                <img
                    src={MARU_DETAIL_IMAGES.hero}
                    alt="에디톤 마루 배경"
                    className="w-full h-full object-cover"
                />
                {/* 중앙 녹색 프레임 박스 */}
                <div className="absolute inset-0 flex items-end justify-center pb-12">
                    <div className="flex flex-col border-[3px] border-[#2d4a2d]" style={{ width: '240px', height: '300px' }}>
                        {/* 상단: 투명 (배경 이미지 보임) */}
                        <div className="flex-1"></div>
                        {/* 하단: 진한 녹색 + 텍스트 */}
                        <div className="bg-[#2d4a2d] flex flex-col items-center justify-center gap-3 py-4 px-4">
                            {/* 타원 테두리 + Beyond the Maru */}
                            <div className="border border-white/60 rounded-full px-6 py-2">
                                <span className="text-white italic font-serif text-[13px] tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
                                    Beyond the Maru
                                </span>
                            </div>
                            {/* 한글 문구 */}
                            <p className="text-white/75 text-xs tracking-widest">마루보다 더 좋은 마루</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 특장점 카드 섹션 */}
            <div className="max-w-[960px] w-full py-8 px-6 flex flex-col items-center">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                    <div className="flex flex-row items-center p-5 md:p-6 bg-[#f7f7f7] rounded-xl border border-[#f0f0f0] transition-all hover:shadow-md">
                        <div className="w-[70px] h-[70px] flex-shrink-0 bg-[#826351] rounded-full flex items-center justify-center mr-5 overflow-hidden shadow-inner">
                            <img src={MARU_DETAIL_IMAGES.iconTexture} alt="고급스러운 텍스처" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col items-start text-left">
                            <span className="text-[#826351] font-bold text-[14px] mb-1">표면 질감 개선</span>
                            <h3 className="text-lg font-black text-[#222]">고급스러운 텍스처</h3>
                        </div>
                    </div>
                    <div className="flex flex-row items-center p-5 md:p-6 bg-[#f7f7f7] rounded-xl border border-[#f0f0f0] transition-all hover:shadow-md">
                        <div className="w-[70px] h-[70px] flex-shrink-0 bg-[#826351] rounded-full flex items-center justify-center mr-5 overflow-hidden shadow-inner">
                            <img src={MARU_DETAIL_IMAGES.iconDigital} alt="디지털 인쇄 적용" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col items-start text-left">
                            <span className="text-[#826351] font-bold text-[14px] mb-1">자연스러운 패턴 구현</span>
                            <h3 className="text-lg font-black text-[#222]">디지털 인쇄 적용</h3>
                            <p className="text-[#999] text-base mt-1 font-medium">(일부 컬러 한정)</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 제품 구조도 섹션 */}
            <div className="w-full bg-[#f4f4f4] py-16 px-6 flex flex-col items-center">
                <div className="max-w-[800px] w-full text-center">
                    <h3 className="text-[15px] md:text-lg font-black text-[#222] mb-6">제품 구조도</h3>
                    <p className="text-[#555] text-[14px] md:text-[14px] mb-6 leading-relaxed font-medium">
                        에디톤 마루는 무광 효과 표면층, 고내구 투명층, 고해상 디자인층,<br />
                        NSC(Natural Stone Core), 전용 접착제 총 5단계로 구성되어 있습니다.
                    </p>
                    <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm">
                        <img src={MARU_DETAIL_IMAGES.structure} alt="에디톤 마루 구조도" className="w-full h-auto mx-auto" />
                    </div>
                    <p className="text-sm text-[#999] mt-6 leading-relaxed">
                        ※ NSC(Natural Stone Core) : 석재를 분쇄 후, 고분자 수지와 고온 고압으로 압축한 고강도 보드판
                    </p>
                </div>
            </div>

            {/* 상세 특장점 섹션 1 - 고급스러운 텍스처 / TrueMatte */}
            <div className="max-w-[960px] w-full py-16 px-6">
                <div className="text-center mb-6">
                    <h3 className="text-[14px] md:text-lg font-black text-[#222] mb-6 tracking-tight">리얼한 촉감, 내추럴 텍스처</h3>
                    <p className="text-[14px] md:text-[14px] text-[#444] leading-relaxed max-w-4xl mx-auto font-medium">
                        원목 고유의 사실적인 질감을 표현하는 TrueMatte(트루매트) 기술과<br />
                        입체적인 엠보공법으로 맨발에 닿는 편안함을 더했습니다.
                    </p>
                </div>
                <div className="space-y-6">
                    <img src={MARU_DETAIL_IMAGES.texture01} alt="TrueMatte 트루매트 표면" className="w-full rounded-xl shadow-md" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col">
                            <img src={MARU_DETAIL_IMAGES.texture02} alt="Matt Texture" className="w-full rounded-2xl shadow-md mb-3" />
                            <div className="text-center">
                                <p className="font-bold text-[#222] text-[14px]">Matt Texture</p>
                                <p className="text-[#888] text-sm mt-1">부드러운 그레이의 포슬한 질감</p>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <img src={MARU_DETAIL_IMAGES.texture03} alt="EIR Texture 동조엠보" className="w-full rounded-2xl shadow-md mb-3" />
                            <div className="text-center">
                                <p className="font-bold text-[#222] text-[14px]">EIR Texture</p>
                                <p className="text-[#888] text-sm mt-1">디자인 무늬와 표면엠보 일치</p>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <img src={MARU_DETAIL_IMAGES.texture04} alt="Deep Brush Texture" className="w-full rounded-2xl shadow-md mb-3" />
                            <div className="text-center">
                                <p className="font-bold text-[#222] text-[14px]">Deep Brush Texture</p>
                                <p className="text-[#888] text-sm mt-1">단단한 원목 특유의 브러쉬 질감</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 상세 특장점 섹션 2 - 디지털 인쇄 */}
            <div className="w-full bg-[#fcfcfc] py-16 px-6 flex flex-col items-center">
                <div className="max-w-[960px] w-full">
                    <div className="text-center mb-6">
                        <h3 className="text-[14px] md:text-lg font-black text-[#222] mb-6 tracking-tight">자연스러운 패턴 구현</h3>
                        <p className="text-[14px] md:text-[14px] text-[#444] leading-relaxed max-w-4xl mx-auto font-medium">
                            디지털 인쇄 적용을 통해 반복 무늬를 최소화하고<br />
                            나무 본연의 깊은 색감을 섬세하게 표현했습니다.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="flex flex-col items-center">
                            <img src={MARU_DETAIL_IMAGES.digital01} alt="기존 강마루 패턴" className="w-full rounded-2xl shadow-md mb-4" />
                            <p className="text-[#888] font-semibold text-[14px]">기존 강마루</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <img src={MARU_DETAIL_IMAGES.digital02} alt="에디톤 마루 디지털 인쇄 패턴" className="w-full rounded-2xl shadow-md mb-4" />
                            <p className="text-[#826a5d] font-semibold text-[14px]">에디톤 마루 (디지털 인쇄 적용)</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 열전도성 섹션 */}
            <div className="max-w-[960px] w-full py-12 px-6">
                {/* 타이틀 */}
                <div className="text-center mb-6">
                    <h3 className="text-xl md:text-xl font-black text-[#222] mb-6 tracking-tight">우수한 열전도성</h3>
                    <p className="text-sm md:text-base text-[#555] leading-relaxed max-w-3xl mx-auto">
                        복합 신소재 코어를 적용하여 일반 강마루, 원목마루 대비 열전도율이 높습니다.<br />
                        원재료 추심분만 천연석과 고분자 수치 분체 추, 고온 고압으로 압출한 고강도 보드판을 적용하였습니다.
                    </p>
                </div>

                {/* 분석 테스트 레이블 */}
                <div className="flex items-center justify-center mb-4">
                    <div className="border border-[#aaa] px-5 py-2 text-sm text-[#555] tracking-wide">
                        [전면식 복합 신소재 성분 분석테스트]
                    </div>
                </div>

                {/* 2열 이미지 */}
                <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="flex flex-col">
                        <img src={MARU_DETAIL_IMAGES.heat01} alt="천연석 분말 60~70%" className="w-full object-cover" style={{ aspectRatio: '4/3' }} />
                        <p className="text-xs text-[#888] mt-2">천연석 분말 60-70%</p>
                    </div>
                    <div className="flex flex-col">
                        <img src={MARU_DETAIL_IMAGES.heat02} alt="고분자 수지 20~30%" className="w-full object-cover" style={{ aspectRatio: '4/3' }} />
                        <p className="text-xs text-[#888] mt-2">고분자 수지 20~30%</p>
                    </div>
                </div>
                <p className="text-xs text-[#aaa] mb-4">※ 한국고분자시험연구소 보유값, 시점 ('24년.3월)</p>

                {/* 테스트 결과 2열 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* 왼쪽: 열전도율 측정 테스트 */}
                    <div>
                        <p className="font-bold text-[#222] text-base mb-1">1. 열 전도율 측정 테스트[KS L 9106 준용]</p>
                        <p className="text-sm text-[#555] leading-relaxed mb-4">
                            보온재의 열 전도율 측정 방법인 평판 열류계법으로<br />
                            시험체의 열 전도율을 측정하였으며,<br />
                            시험체의 두께가 10mm 미만인 것은 겹쳐서 측정하며<br />
                            모두 동일한 조건의 측정을 위해 45mm로 적층하여 테스트를<br />
                            진행하였습니다.
                        </p>
                        <div className="relative w-full mb-2">
                            <img src={MARU_DETAIL_IMAGES.heat03} alt="열전도율 측정 테스트" className="w-full" />
                        </div>
                        <p className="text-xs text-[#888]">* A 고열판, B 열류계, C 시험체, D 저열판</p>
                    </div>
                    {/* 오른쪽: 시험체별 열 전도율 측정 결과 표 */}
                    <div>
                        <p className="font-bold text-[#222] text-base mb-1">2. 시험체별 열 전도율 측정 결과</p>
                        <p className="text-sm text-[#555] mb-4">
                            열 전도율 값 측정 시 LX Z:IN 바닥재 에디톤 마루가<br />
                            자사 강마루, 원목마루 대비 약 4배 높은 수준입니다.
                        </p>
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-[#f0f0f0]">
                                    <th className="border border-[#ddd] px-4 py-3 text-center font-semibold">시험체</th>
                                    <th className="border border-[#ddd] px-4 py-3 text-center font-semibold">열 전도율(W/mK)</th>
                                    <th className="border border-[#ddd] px-4 py-3 text-center font-semibold">적층 두께(mm)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-[#ddd] px-4 py-3 text-center text-[#888]">용도</td>
                                    <td className="border border-[#ddd] px-4 py-3 text-center">0.4615</td>
                                    <td className="border border-[#ddd] px-4 py-3 text-center">45.08</td>
                                </tr>
                                <tr>
                                    <td className="border border-[#ddd] px-4 py-3 text-center text-[#888]">강마루</td>
                                    <td className="border border-[#ddd] px-4 py-3 text-center">0.1100</td>
                                    <td className="border border-[#ddd] px-4 py-3 text-center">46.01</td>
                                </tr>
                                <tr>
                                    <td className="border border-[#ddd] px-4 py-3 text-center text-[#888]">원목마루</td>
                                    <td className="border border-[#ddd] px-4 py-3 text-center">0.1100</td>
                                    <td className="border border-[#ddd] px-4 py-3 text-center">43.26</td>
                                </tr>
                            </tbody>
                        </table>
                        <p className="text-xs text-[#888] mt-2">※ 한국 건설자재 시험연구원(KCMIC)('24.3월)</p>
                    </div>
                </div>
                <p className="text-xs text-[#888] mt-4">※ LX하우시스 자체 테스트로 자사 강마루, 원목마루와의 비교 테스트이며, 비교시료 사양 및 실험방법, 환경에 따라 차이가 날 수 있습니다.</p>
            </div>

            {/* 내충격 & 찍힘 저항 섹션 */}
            <div className="w-full bg-white py-12 px-6 flex flex-col items-center">
                <div className="max-w-[960px] w-full">
                    {/* 타이틀 */}
                    <div className="text-center mb-6">
                        <h3 className="text-xl md:text-xl font-black text-[#222] mb-6 tracking-tight">내충격과 찍힘에 강한 성능</h3>
                        <p className="text-sm md:text-base text-[#555] leading-relaxed max-w-3xl mx-auto">
                            일반 강마루, 세라믹 타일 대비 손상이 적어 사용 시 관리가 편합니다.<br />
                            나이프 등 실생활 중 바닥에 떨어졌을 시 일반 마루 제품 대비 충격 및 찍힘에 강합니다.
                        </p>
                        <p className="text-xs text-[#999] mt-4">※ LX하우시스 자체 테스트 기준이며, 비교 시료의 사양 및 실험방법, 환경에 따라 달라질 수 있습니다.('24.3월)</p>
                    </div>

                    {/* 1. 내충격성 테스트 */}
                    <div className="mb-4 mt-6">
                        <p className="font-bold text-[#222] text-base mb-1">1. 내충격성 테스트[KS F 2221 준용]</p>
                        <p className="text-sm text-[#555] mb-5">쇠구슬을 1m 높이에서 낙하시킨 후 표면 균열, 파괴 유무 및 음폭 팬 홈의 정도를 육안으로 확인합니다.</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                            {/* 테스트 기준 */}
                            <div className="flex flex-col">
                                <img src={MARU_DETAIL_IMAGES.durabilitySetup} alt="테스트 기준" className="w-full object-cover" style={{ aspectRatio: '1/1' }} />
                                <div className="pt-2">
                                    <p className="font-bold text-sm text-[#222]">테스트 기준</p>
                                    <p className="text-xs text-[#888] mt-1">쇠구슬 무게 : 286g<br />직경 : 41.2mm</p>
                                </div>
                            </div>
                            {/* 에디톤 마루 */}
                            <div className="flex flex-col">
                                <img src={MARU_DETAIL_IMAGES.durability01} alt="LX Z:IN 바닥재 에디톤 마루" className="w-full object-cover" style={{ aspectRatio: '1/1' }} />
                                <div className="pt-2">
                                    <p className="font-bold text-sm text-[#222]">LX Z:IN 바닥재 에디톤 마루</p>
                                    <p className="text-xs text-[#888] mt-1">변화 없음</p>
                                </div>
                            </div>
                            {/* 강마루 */}
                            <div className="flex flex-col">
                                <img src={MARU_DETAIL_IMAGES.durability02} alt="자사 강마루(7.5T)" className="w-full object-cover" style={{ aspectRatio: '1/1' }} />
                                <div className="pt-2">
                                    <p className="font-bold text-sm text-[#222]">자사 강마루(7.5T)</p>
                                    <p className="text-xs text-[#888] mt-1">찍힘</p>
                                </div>
                            </div>
                            {/* 세라믹 타일 */}
                            <div className="flex flex-col">
                                <img src={MARU_DETAIL_IMAGES.durability03} alt="일반 세라믹 타일(8T)" className="w-full object-cover" style={{ aspectRatio: '1/1' }} />
                                <div className="pt-2">
                                    <p className="font-bold text-sm text-[#222]">일반 세라믹 타일(8T)</p>
                                    <p className="text-xs text-[#888] mt-1">깨짐</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. 실생활 도구 난하 테스트 */}
                    <div>
                        <p className="font-bold text-[#222] text-base mb-1">2. 실생활 도구 난하 테스트[육안 검사]</p>
                        <p className="text-sm text-[#555] mb-5">나이프를 1m 높이에서 낙하시킨 후 표면 균열, 파괴 유무 및 음폭 팬 홈의 정도를 육안으로 확인합니다.</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                            {/* 테스트 기준 */}
                            <div className="flex flex-col">
                                <img src={MARU_DETAIL_IMAGES.safetySetup} alt="테스트 기준" className="w-full object-cover" style={{ aspectRatio: '1/1' }} />
                                <div className="pt-2">
                                    <p className="font-bold text-sm text-[#222]">테스트 기준</p>
                                    <p className="text-xs text-[#888] mt-1">나이프 무게: 68.2g<br />길이 : 208mm<br />폭 : 12mm</p>
                                </div>
                            </div>
                            {/* 에디톤 마루 */}
                            <div className="flex flex-col">
                                <img src={MARU_DETAIL_IMAGES.safety01} alt="LX Z:IN 바닥재 에디톤 마루" className="w-full object-cover" style={{ aspectRatio: '1/1' }} />
                                <div className="pt-2">
                                    <p className="font-bold text-sm text-[#222]">LX Z:IN 바닥재 에디톤 마루</p>
                                    <p className="text-xs text-[#888] mt-1">변화 없음</p>
                                </div>
                            </div>
                            {/* 강마루 */}
                            <div className="flex flex-col">
                                <img src={MARU_DETAIL_IMAGES.safety02} alt="자사 강마루(7.5T)" className="w-full object-cover" style={{ aspectRatio: '1/1' }} />
                                <div className="pt-2">
                                    <p className="font-bold text-sm text-[#222]">자사 강마루(7.5T)</p>
                                    <p className="text-xs text-[#888] mt-1">찍힘</p>
                                </div>
                            </div>
                            {/* 세라믹 타일 */}
                            <div className="flex flex-col">
                                <img src={MARU_DETAIL_IMAGES.durability03} alt="일반 세라믹 타일(8T)" className="w-full object-cover" style={{ aspectRatio: '1/1' }} />
                                <div className="pt-2">
                                    <p className="font-bold text-sm text-[#222]">일반 세라믹 타일(8T)</p>
                                    <p className="text-xs text-[#888] mt-1">깨짐</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pet-Safety 섹션 */}
            <div className="max-w-[960px] w-full py-16 px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                    <div>
                        <span className="text-[#826a5d] font-bold text-sm uppercase tracking-widest mb-4 block">Pet-Safety</span>
                        <h3 className="text-[14px] md:text-[14px] font-black text-[#222] mb-4 tracking-tight">반려동물도 안전하게</h3>
                        <p className="text-[14px] md:text-[14px] text-[#444] leading-relaxed mb-4">
                            반려동물제품인증(PS인증)을 획득한 에디톤 마루는<br />
                            반려동물과 함께하는 공간에서도 안심하고 사용할 수 있습니다.
                        </p>
                        <p className="text-[#666] text-base leading-relaxed">
                            덜 미끄러운 바닥재(C.S.R-D 우수)로 반려동물의 관절 건강까지 배려했습니다.
                        </p>
                    </div>
                    <div className="flex justify-center">
                        <img src={MARU_DETAIL_IMAGES.petSafety} alt="Pet-Safety 인증 마크" className="max-w-xs w-full object-contain" />
                    </div>
                </div>
            </div>

            {/* 덜 미끄러운 바닥재 섹션 */}
            <div className="max-w-[960px] w-full py-12 px-6">
                <div className="text-center mb-4">
                    <h3 className="text-xl md:text-xl font-black text-[#222] mb-6 tracking-tight">덜 미끄러운 바닥재</h3>
                    <p className="text-sm md:text-base text-[#555] leading-relaxed max-w-3xl mx-auto">
                        텍스처 엠보 적용으로 일반 강마루, 원목마루 대비 C.S.R-D 값이 높은 바닥재입니다.<br />
                        일반 강마루, 원목마루 대비 상대적으로 높은 C.S.R-D 값을 검증받았습니다.
                    </p>
                </div>

                {/* 레이블 */}
                <div className="flex items-center justify-center mb-6">
                    <div className="border border-[#aaa] px-5 py-2 text-sm text-[#555] tracking-wide">
                        [반려견의 미끄럼 안전성 시험결과]
                    </div>
                </div>
                <p className="text-xs text-[#555] mb-4">
                    LX Z:IN 바닥재 에디톤 마루 평균값은 엠보별 측정시 평균값 L방향(0.42~0.46), W방향(0.44~0.50)로<br />
                    원목마루 L방향 0.3, W방향 0.27 자사 강마루 0.28 보다 상대적으로 우수한 결과값을 나타났습니다.
                </p>

                {/* 시험결과 표 */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs text-center">
                        <thead>
                            <tr className="bg-[#f5f5f5]">
                                <th className="border border-[#ddd] px-3 py-2 text-left" rowSpan={2}>미끄럼 저항계수</th>
                                <th className="border border-[#ddd] px-3 py-2" colSpan={6}>C.S.R-D</th>
                            </tr>
                            <tr className="bg-[#f5f5f5]">
                                <th className="border border-[#ddd] px-3 py-2" colSpan={6}>dry</th>
                            </tr>
                            <tr className="bg-[#eee]">
                                <th className="border border-[#ddd] px-3 py-2 text-left">난방</th>
                                <th className="border border-[#ddd] px-3 py-2">1회</th>
                                <th className="border border-[#ddd] px-3 py-2">2회</th>
                                <th className="border border-[#ddd] px-3 py-2">3회</th>
                                <th className="border border-[#ddd] px-3 py-2">4회</th>
                                <th className="border border-[#ddd] px-3 py-2">5회</th>
                                <th className="border border-[#ddd] px-3 py-2">평균</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* No.1 EIR Texture */}
                            <tr>
                                <td className="border border-[#ddd] px-3 py-2 text-left" rowSpan={2}>(No.1)LX Z:IN 바닥재<br />에디톤 마루<br />EIR Texture 엠보</td>
                                <td className="border border-[#ddd] px-2 py-1 text-[#888]">L방향</td>
                                <td className="border border-[#ddd] px-2 py-1">0.48</td>
                                <td className="border border-[#ddd] px-2 py-1">0.46</td>
                                <td className="border border-[#ddd] px-2 py-1">0.45</td>
                                <td className="border border-[#ddd] px-2 py-1">(0.43)</td>
                                <td className="border border-[#ddd] px-2 py-1">(0.48)</td>
                                <td className="border border-[#ddd] px-2 py-1 font-bold">0.46</td>
                            </tr>
                            <tr>
                                <td className="border border-[#ddd] px-2 py-1 text-[#888]">W방향</td>
                                <td className="border border-[#ddd] px-2 py-1">(0.49)</td>
                                <td className="border border-[#ddd] px-2 py-1">(0.53)</td>
                                <td className="border border-[#ddd] px-2 py-1">0.52</td>
                                <td className="border border-[#ddd] px-2 py-1">0.49</td>
                                <td className="border border-[#ddd] px-2 py-1">0.49</td>
                                <td className="border border-[#ddd] px-2 py-1 font-bold">0.50</td>
                            </tr>
                            {/* No.2 Matt Texture */}
                            <tr className="bg-[#fafafa]">
                                <td className="border border-[#ddd] px-3 py-2 text-left" rowSpan={2}>(No.2)LX Z:IN 바닥재<br />에디톤 마루<br />Matt Texture 엠보</td>
                                <td className="border border-[#ddd] px-2 py-1 text-[#888]">L방향</td>
                                <td className="border border-[#ddd] px-2 py-1">0.46</td>
                                <td className="border border-[#ddd] px-2 py-1">0.47</td>
                                <td className="border border-[#ddd] px-2 py-1">0.46</td>
                                <td className="border border-[#ddd] px-2 py-1">(0.47)</td>
                                <td className="border border-[#ddd] px-2 py-1">(0.41)</td>
                                <td className="border border-[#ddd] px-2 py-1 font-bold">0.46</td>
                            </tr>
                            <tr className="bg-[#fafafa]">
                                <td className="border border-[#ddd] px-2 py-1 text-[#888]">W방향</td>
                                <td className="border border-[#ddd] px-2 py-1">0.45</td>
                                <td className="border border-[#ddd] px-2 py-1">0.44</td>
                                <td className="border border-[#ddd] px-2 py-1">0.45</td>
                                <td className="border border-[#ddd] px-2 py-1">(0.47)</td>
                                <td className="border border-[#ddd] px-2 py-1">(0.43)</td>
                                <td className="border border-[#ddd] px-2 py-1 font-bold">0.45</td>
                            </tr>
                            {/* No.3 Deep Brush */}
                            <tr>
                                <td className="border border-[#ddd] px-3 py-2 text-left" rowSpan={2}>(No.3)LX Z:IN 바닥재<br />에디톤 마루<br />Deep Brush 엠보</td>
                                <td className="border border-[#ddd] px-2 py-1 text-[#888]">L방향</td>
                                <td className="border border-[#ddd] px-2 py-1">(0.40)</td>
                                <td className="border border-[#ddd] px-2 py-1">(0.43)</td>
                                <td className="border border-[#ddd] px-2 py-1">0.42</td>
                                <td className="border border-[#ddd] px-2 py-1">0.42</td>
                                <td className="border border-[#ddd] px-2 py-1">0.41</td>
                                <td className="border border-[#ddd] px-2 py-1 font-bold">0.42</td>
                            </tr>
                            <tr>
                                <td className="border border-[#ddd] px-2 py-1 text-[#888]">W방향</td>
                                <td className="border border-[#ddd] px-2 py-1">(0.43)</td>
                                <td className="border border-[#ddd] px-2 py-1">0.45</td>
                                <td className="border border-[#ddd] px-2 py-1">0.44</td>
                                <td className="border border-[#ddd] px-2 py-1">(0.48)</td>
                                <td className="border border-[#ddd] px-2 py-1">0.44</td>
                                <td className="border border-[#ddd] px-2 py-1 font-bold">0.44</td>
                            </tr>
                            {/* No.4 원목마루 */}
                            <tr className="bg-[#fafafa]">
                                <td className="border border-[#ddd] px-3 py-2 text-left" rowSpan={2}>(No.4)원목마루</td>
                                <td className="border border-[#ddd] px-2 py-1 text-[#888]">L방향</td>
                                <td className="border border-[#ddd] px-2 py-1">0.32</td>
                                <td className="border border-[#ddd] px-2 py-1">(0.36)</td>
                                <td className="border border-[#ddd] px-2 py-1">0.29</td>
                                <td className="border border-[#ddd] px-2 py-1">(0.27)</td>
                                <td className="border border-[#ddd] px-2 py-1">0.30</td>
                                <td className="border border-[#ddd] px-2 py-1 font-bold">0.30</td>
                            </tr>
                            <tr className="bg-[#fafafa]">
                                <td className="border border-[#ddd] px-2 py-1 text-[#888]">W방향</td>
                                <td className="border border-[#ddd] px-2 py-1">(0.30)</td>
                                <td className="border border-[#ddd] px-2 py-1">0.28</td>
                                <td className="border border-[#ddd] px-2 py-1">0.27</td>
                                <td className="border border-[#ddd] px-2 py-1">(0.25)</td>
                                <td className="border border-[#ddd] px-2 py-1">0.27</td>
                                <td className="border border-[#ddd] px-2 py-1 font-bold">0.27</td>
                            </tr>
                            {/* No.5 원목마루 */}
                            <tr>
                                <td className="border border-[#ddd] px-3 py-2 text-left" colSpan={2}>(No.5)원목마루</td>
                                <td className="border border-[#ddd] px-2 py-1">0.28</td>
                                <td className="border border-[#ddd] px-2 py-1">(0.22)</td>
                                <td className="border border-[#ddd] px-2 py-1">0.32</td>
                                <td className="border border-[#ddd] px-2 py-1">0.25</td>
                                <td className="border border-[#ddd] px-2 py-1">(0.34)</td>
                                <td className="border border-[#ddd] px-2 py-1 font-bold">0.28</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* 주석 */}
                <div className="mt-4 text-xs text-[#888] leading-relaxed">
                    <p>※ ( ) 안의 수차는 5회 측정한 값의 최대값 및 최소값으로서 평균 산출에서 제외</p>
                    <p>※ C.S.R-D한 정적마찰 계수값을 의미하며, C.S.R-D값이 높은 바닥재일수록 미끄럼 저항이 높아져 미끄럼 및 낙상사고의 위험을 줄일 수 있음</p>
                    <p>※ 한서대학교 C.S.R-D 시험 성적 보고서('24.2월, 강마루는 '23.8월 테스트) 기준이며, 미끄럼 성능은 시험방법 및 환경에 따라 차이가 날 수 있음</p>
                </div>
            </div>

            {/* 동조엠보(EIR) 기술 섹션 */}
            <div className="w-full bg-white py-16 px-6 flex flex-col items-center border-t border-[#eee]">
                <div className="max-w-[960px] w-full text-center mb-6">
                    <h3 className="text-[14px] md:text-lg font-black text-[#222] mb-6 tracking-tight">리얼한 원목 질감 그대로, 동조엠보(EIR) 기술</h3>
                    <p className="text-[#444] text-[14px] md:text-[14px] leading-relaxed max-w-4xl mx-auto font-medium">
                        나뭇결 무늬와 표면 엠보싱을 일치시키는 고도의 기술로<br />
                        실제 원목의 깊이감과 자연스러운 촉감을 그대로 재현했습니다.
                    </p>
                </div>
                <div className="max-w-[960px] w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-2xl overflow-hidden shadow-sm border border-[#eee] transition-all hover:shadow-md">
                        <img src={MARU_DETAIL_IMAGES.eirLeft} alt="동조엠보 질감" className="w-full h-auto" />
                        <div className="p-6 bg-[#fafafa] text-center">
                            <h4 className="text-[15px] font-black text-[#222] mb-3">원목의 깊이감</h4>
                            <p className="text-[#777] text-[14px] font-medium">빛의 각도에 따라 변하는 섬세한 무늬</p>
                        </div>
                    </div>
                    <div className="rounded-2xl overflow-hidden shadow-sm border border-[#eee] transition-all hover:shadow-md">
                        <img src={MARU_DETAIL_IMAGES.eirRight} alt="초근접 EIR 텍스처" className="w-full h-auto" />
                        <div className="p-6 bg-[#fafafa] text-center">
                            <h4 className="text-[15px] font-black text-[#222] mb-3">정교한 일치 기술</h4>
                            <p className="text-[#777] text-[14px] font-medium">눈으로 본 무늬와 손 끝의 질감이 하나로</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 스펙 섹션 */}
            <div className="w-full bg-white py-16 px-6 flex flex-col items-center border-t border-[#eee]">
                <h3 className="text-xl md:text-xl font-black text-center text-[#222] mb-4 tracking-tight">스펙</h3>
                <div className="max-w-[960px] w-full overflow-hidden rounded-xl border border-[#eee]">
                    <div className="flex flex-col md:flex-row w-full border-b border-[#eee]">
                        <div className="flex flex-1 border-r border-[#eee]">
                            <div className="w-1/3 bg-[#f9f9f9] px-6 py-8 flex items-center justify-center border-r border-[#eee]">
                                <span className="text-[#888] font-bold text-base">규격(mm)</span>
                            </div>
                            <div className="w-2/3 bg-white px-8 py-8 flex items-center">
                                <span className="text-[#222] text-[14px] font-medium">5.0(T) X 180(W) X 1,220(L)</span>
                            </div>
                        </div>
                        <div className="flex flex-1">
                            <div className="w-1/3 bg-[#f9f9f9] px-6 py-8 flex items-center justify-center border-r border-[#eee]">
                                <span className="text-[#888] font-bold text-base">포장 단위</span>
                            </div>
                            <div className="w-2/3 bg-white px-8 py-8 flex items-center">
                                <span className="text-[#222] text-[14px] font-medium">7pc/박스(1.54㎡)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <div className="w-full bg-[#f4f4f4] py-16 px-6 flex flex-col items-center">
                <div className="max-w-[960px] w-full">
                    <h3 className="text-xl md:text-xl font-black text-center text-[#222] mb-4 tracking-tight">인증 & 수상</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {CERTIFICATIONS.map((cert, idx) => (
                            <div key={idx} className="flex flex-col bg-white rounded-3xl overflow-hidden border border-[#eee]">
                                <div className="h-56 flex items-center justify-center p-8 transition-all duration-500">
                                    <img src={cert.img} alt={cert.alt} style={{ width: cert.width }} className="max-h-full object-contain" />
                                </div>
                                <div className="p-8 bg-[#fafafa] flex flex-col items-center justify-center text-center min-h-[120px] border-t border-[#eee]">
                                    <span className="text-[14px] font-bold text-[#222] leading-tight break-keep">{cert.title}</span>
                                    {cert.desc && <span className="text-sm text-[#888] mt-3 italic font-medium">{cert.desc}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 주의사항 섹션 */}
            <div className="max-w-[960px] w-full py-16 px-6">
                <h3 className="text-[14px] font-black text-[#222] mb-6 border-l-4 border-[#826a5d] pl-6 uppercase tracking-wider">사용 및 시공 시 주의사항</h3>
                <div className="grid grid-cols-1 gap-6 md:p-8">
                    {PRECAUTIONS.map((item, idx) => (
                        <div key={idx} className="bg-white p-6 md:p-8 rounded-2xl border border-[#eee] shadow-sm hover:shadow-md transition-shadow">
                            <h4 className="text-lg font-black text-[#826a5d] mb-4 flex items-center">
                                <span className="mr-4 text-[14px]">!</span> {item.title}
                            </h4>
                            <ul className="space-y-5">
                                {item.content.map((text, i) => (
                                    <li key={i} className="text-[#444] text-[14px] md:text-[14px] leading-relaxed flex items-start">
                                        <span className="mr-3 text-[#826a5d] font-black mt-[4px]">•</span>
                                        {text}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default EditonWoodFeature;
