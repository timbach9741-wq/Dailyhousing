import React from 'react';

const EDITON_STONE_DETAIL_IMAGES = [
    "https://octapi.lxzin.com/imageResource/file/202510/01/8eb58d91-cf47-44f7-9ab2-24f3b3aabe54.jpg", // Banner (EDT7725)
    "https://octapi.lxzin.com/imageResource/file/202309/11/9b483af6-0d5e-4bb7-bb5e-e086426245e5.png", // Icon 1
    "https://octapi.lxzin.com/imageResource/file/202309/11/59aa1561-a679-47b7-9e0d-17bfed592711.png", // Icon 2
    "https://octapi.lxzin.com/imageResource/file/202309/11/3098db9d-e056-4b58-8da0-cbba64cd4598.png", // Icon 3
    "https://octapi.lxzin.com/imageResource/file/202309/11/92fe4a0a-287f-4a57-bfe9-5fc625f3963e.png", // Structure
    "https://octapi.lxzin.com/imageResource/file/202309/11/7bd9cabc-1a28-46a3-b856-37c4cfb3a004.png", // Feature 1 (Wall & Floor)
    "https://octapi.lxzin.com/imageResource/file/202309/11/75960b45-bd1b-47b1-aa55-7d9f30537a50.png", // Feature 2 (Size & Emboss)
    "https://octapi.lxzin.com/imageResource/file/202309/11/b52a9cf1-e04b-43d8-a0db-1eff2f0ae6ac.png", // Feature 3 (Digital Print)
    "https://octapi.lxzin.com/imageResource/file/202309/11/daa016f2-b9b1-43c0-9106-610782c47d8e.png", // Extra
];

const CERT_ROW1 = [
    {
        img: "https://octapi.lxzin.com/imageResource/file/202504/18/6872a3fe-7c28-463d-803e-30eabdf37305.jpg",
        alt: "2025 한국산업의 브랜드파워(K-BPI) 조사",
        title: "2025 한국산업의 브랜드파워(K-BPI) 조사",
        desc: "가정용 바닥재 부문 1위",
        width: "150px"
    },
    {
        img: "https://octapi.lxzin.com/imageResource/file/202412/17/3b0893c4-bd14-452e-81fa-3bb18c9cb8eb.jpg",
        alt: "반려동물제품인증서",
        title: "반려동물제품인증서",
        width: "200px"
    }
];

const CERT_ROW2 = [
    {
        img: "https://octapi.lxzin.com/imageResource/file/202507/17/4ad1b535-90d7-4484-9951-bf23d6a3a446.png",
        alt: "25년 올해의 녹색상품",
        title: "25년 올해의 녹색상품",
        width: "150px"
    },
    {
        img: "https://octapi.lxzin.com/imageResource/file/202511/21/e8f7f262-222b-42fa-84ed-533e946597b8.png",
        alt: "환경표지인증",
        title: "환경표지인증",
        width: "150px"
    },
    {
        img: "https://octapi.lxzin.com/imageResource/file/202512/03/d4381890-ab9e-473d-9510-c043af5049c8.png",
        alt: "실내표지",
        title: "실내표지",
        width: "120px"
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

function EditonStoneFeature() {
    return (
        <div className="w-full flex flex-col items-center bg-white pb-16 font-sans overflow-hidden">
            {/* 1. 타이틀 섹션 (White Header) */}
            <div className="w-full py-12 px-6 text-center bg-white">
                <h2 className="text-[28px] md:text-[36px] font-black text-[#222] mb-4 tracking-tight">
                    LX Z:IN 바닥재 에디톤 스톤
                </h2>
                <p className="text-[15px] md:text-[17px] text-[#666] font-medium max-w-3xl mx-auto leading-relaxed break-keep">
                    LX Z:IN 바닥재 에디톤 스톤은 남들과 똑같은 제품이 아닌<br className="hidden md:block" />
                    나의 취향과 우리 집 분위기에 맞춰주는 프리미엄 제품입니다.
                </p>
            </div>

            {/* 2. 메인 히어로 이미지 (Clean View) */}
            <div className="max-w-[960px] w-full px-4 md:px-0 mb-12">
                <div className="relative rounded-xl md:rounded-2xl overflow-hidden shadow-lg group">
                    <img 
                        src={EDITON_STONE_DETAIL_IMAGES[0]} 
                        alt="에디톤 스톤 메인" 
                        className="w-full h-auto transform group-hover:scale-105 transition-transform duration-1000" 
                    />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-700"></div>
                </div>
            </div>

            {/* 3. 특장점 아이콘 카드 (Premium Flex) */}
            <div className="max-w-[960px] w-full px-6 mb-12 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 카드 1 */}
                    <div className="flex items-center gap-4 p-6 bg-white border border-[#eee] rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="w-16 h-16 shrink-0 bg-[#8b735b] rounded-full flex items-center justify-center">
                            <img src={EDITON_STONE_DETAIL_IMAGES[1]} alt="감각적인 공간" className="w-9 h-9 object-contain" />
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="text-[13px] text-[#666] mb-0.5 font-medium">벽 바닥 일체형</span>
                            <h3 className="text-[17px] font-bold text-[#000] leading-tight">감각적인 공간 제안</h3>
                            <span className="text-[12px] text-[#666] mt-1 font-medium">(5컬러 한정)</span>
                        </div>
                    </div>

                    {/* 카드 2 */}
                    <div className="flex items-center gap-4 p-6 bg-white border border-[#eee] rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="w-16 h-16 shrink-0 bg-[#8b735b] rounded-full flex items-center justify-center">
                            <img src={EDITON_STONE_DETAIL_IMAGES[2]} alt="다양한 디자인" className="w-9 h-9 object-contain" />
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="text-[13px] text-[#666] mb-0.5 font-medium">대형화된 규격</span>
                            <h3 className="text-[17px] font-bold text-[#000] leading-tight">다양한 디자인</h3>
                        </div>
                    </div>

                    {/* 카드 3 */}
                    <div className="flex items-center gap-4 p-6 bg-white border border-[#eee] rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="w-16 h-16 shrink-0 bg-[#8b735b] rounded-full flex items-center justify-center">
                            <img src={EDITON_STONE_DETAIL_IMAGES[3]} alt="디지털 인쇄" className="w-9 h-9 object-contain" />
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="text-[13px] text-[#666] mb-0.5 font-medium">자연스러운 패턴 구현</span>
                            <h3 className="text-[17px] font-bold text-[#000] leading-tight">디지털 인쇄 적용</h3>
                            <span className="text-[12px] text-[#666] mt-1 font-medium">(컬러 별도 표기)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 제품 구조도 섹션 */}
            <div className="w-full bg-[#f4f4f4] py-16 px-6 flex flex-col items-center">
                <div className="max-w-[800px] w-full text-center">
                    <h3 className="text-2xl md:text-3xl font-black text-[#222] mb-4">제품 구조도</h3>
                    <p className="text-[#555] text-[14px] md:text-[15px] mb-10 leading-relaxed font-medium">
                        LX Z:IN 바닥재 에디톤 스톤은 고내구 투명층, 고해상 디자인층,<br />
                        NSC(T&G), 전용 접착제 총 4단계로 구성되어 있습니다.
                    </p>
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm">
                        <img src={EDITON_STONE_DETAIL_IMAGES[4]} alt="구조도 이미지" className="w-full h-auto mx-auto" />
                    </div>
                </div>
            </div>

            {/* 상세 특장점 섹션 1 */}
            <div className="max-w-[960px] w-full py-16 px-6">
                <div className="text-center mb-10">
                    <h3 className="text-2xl md:text-3xl font-black text-[#222] mb-4 tracking-tight">감각적인 공간 제안</h3>
                    <p className="text-[14px] md:text-[15px] text-[#444] leading-relaxed max-w-3xl mx-auto font-medium">
                        벽 바닥 일체형 디자인을 통해 개인의 취향과 우리집 분위기를 맞춰주는 프리미엄 제품입니다.
                        <span className="text-[#006E51] text-[13px] mt-2 block">
                            ※ 5컬러로 운영됩니다. (프로스트, 모데나 그레이, 콘크리트 라이트, 솔티 애쉬, 솔티 브라운)
                        </span>
                    </p>
                </div>
                <img src={EDITON_STONE_DETAIL_IMAGES[5]} alt="디자인 제안" className="w-full rounded-2xl shadow-lg" />
            </div>

            {/* 상세 특장점 섹션 2 (트렌디한 공간 구현) */}
            <div style={{ width: '100%', background: '#fff', padding: '40px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ maxWidth: '960px', width: '100%', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 900, color: '#222', marginBottom: '12px', letterSpacing: '-1px' }}>트렌디한 공간 구현</h3>
                    <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.9', marginBottom: '48px' }}>
                        타일 규격의 대형 사이즈와<br />
                        패턴과 어울러지는 스톤&마블 텍스쳐 엠보로<br />
                        나만의 새로운 공간을 만들어보세요.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                        {/* 왼쪽: 대형 사이즈 */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#222', marginBottom: '12px' }}>대형 사이즈</h4>
                            <img src={EDITON_STONE_DETAIL_IMAGES[6]} alt="대형 사이즈" style={{ width: '100%', maxWidth: '420px', height: 'auto' }} />
                        </div>
                        {/* 오른쪽: 스톤 & 마블 텍스쳐 엠보 */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#222', marginBottom: '12px' }}>스톤 & 마블 텍스쳐 엠보</h4>
                            <img src={EDITON_STONE_DETAIL_IMAGES[7]} alt="스톤 마블 텍스쳐 엠보" style={{ width: '100%', maxWidth: '420px', height: 'auto' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* 자연스러운 패턴 구현 섹션 */}
            <div style={{ width: '100%', background: '#fff', padding: '40px 16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ maxWidth: '960px', width: '100%', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 900, color: '#222', marginBottom: '12px', letterSpacing: '-1px' }}>자연스러운 패턴 구현</h3>
                    <div style={{ position: 'relative', marginBottom: '32px' }}>
                        <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.9' }}>
                            디지털 프린팅 인쇄 적용을 통해 반복무늬를<br />
                            최소화하고 컬러를 더욱 섬세하게 표현하였습니다.
                        </p>
                        {/* EDT7727 컬러칩 */}
                        <div style={{ position: 'absolute', right: '0', top: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <div style={{ width: '40px', height: '40px', background: '#e8e5e0', border: '1px solid #ddd' }}></div>
                            <span style={{ fontSize: '11px', color: '#999' }}>EDT7727</span>
                        </div>
                    </div>
                    <img src={EDITON_STONE_DETAIL_IMAGES[8]} alt="자연스러운 패턴 구현" style={{ width: '100%', height: 'auto' }} />
                </div>
            </div>

            {/* 인증 & 수상 섹션 */}
            <div style={{ width: '100%', background: '#f7f7f7', padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ maxWidth: '960px', width: '100%' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#222', textAlign: 'center', marginBottom: '12px' }}>인증 & 수상</h3>
                    {/* 1행: 2열 */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        {CERT_ROW1.map((cert, idx) => (
                            <div key={idx} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                                    <img src={cert.img} alt={cert.alt} style={{ maxWidth: cert.width, maxHeight: '140px', objectFit: 'contain' }} />
                                </div>
                                <div style={{ padding: '16px', borderTop: '1px solid #eee', width: '100%', textAlign: 'center' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>{cert.title}</span>
                                    {cert.desc && <><br /><span style={{ fontSize: '13px', color: '#888' }}>{cert.desc}</span></>}
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* 2행: 3열 */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                        {CERT_ROW2.map((cert, idx) => (
                            <div key={idx} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                                    <img src={cert.img} alt={cert.alt} style={{ maxWidth: cert.width, maxHeight: '140px', objectFit: 'contain' }} />
                                </div>
                                <div style={{ padding: '16px', borderTop: '1px solid #eee', width: '100%', textAlign: 'center' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>{cert.title}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* 안내 문구 */}
                    <div style={{ fontSize: '12px', color: '#999', lineHeight: '1.8' }}>
                        <p>※ 상기 이미지컷은 색상 및 무늬가 차이가 날 수 있으며, 조명의 종류 및 각도에 따라 달라 보일 수 있습니다.</p>
                        <p>※ 인덱스 색상은 실제 제품 색상과 차이가 있을 수 있으니, 반드시 원장 샘플을 확인하십시오.(부분별 색상 차이가 있습니다.)</p>
                    </div>
                </div>
            </div>

            {/* 주의사항 섹션 */}
            <div className="max-w-[960px] w-full py-16 px-6">
                <h3 className="text-xl font-black text-[#222] mb-8 border-l-4 border-[#006E51] pl-4 text-center">사용 및 시공 시 주의사항</h3>
                <div className="grid grid-cols-1 gap-6">
                    {PRECAUTIONS.map((item, idx) => (
                        <div key={idx} className="bg-white p-6 md:p-8 rounded-2xl border border-[#eee] shadow-sm hover:shadow-md transition-shadow">
                            <h4 className="text-lg font-black text-[#006E51] mb-4 flex items-center">
                                <span className="mr-2 text-xl">!</span> {item.title}
                            </h4>
                            <ul className="space-y-2.5">
                                {item.content.map((text, i) => (
                                    <li key={i} className="text-[#444] text-[13px] md:text-[14px] leading-relaxed flex items-start">
                                        <span className="mr-2 text-[#006E51] font-black mt-[2px]">•</span>
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

export default EditonStoneFeature;
