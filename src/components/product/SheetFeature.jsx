import React from 'react';
import { Leaf, Award, Wand2 } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   시트 라인별 상세 데이터 (원본 LX Z:IN 사이트에서 추출)
   ═══════════════════════════════════════════════════════════ */

const SHEET_LINE_DATA = {
    // ── 시트 스탠다드 1.8 (뉴청맥) ──
    "시트 스탠다드 1.8(뉴청맥)": {
        introTitle: "LX Z:IN 바닥재 시트 스탠다드 1.8",
        introDesc: "실용적이고 합리적인 가격의 시트바닥재, LX Z:IN 바닥재 시트 스탠다드 1.8입니다.",
        mainImage: "https://octapi.lxzin.com/imageResource/file/202403/20/fe9448cb-88c7-449a-991c-3caa75cef84e.png",
        features: [
            { icon: "leaf", sub: "안심하고 사용할 수 있는", title: "친환경 바닥재" },
            { icon: "award", sub: "경제적인 가격대", title: "우수한 기본 품질" },
            { icon: "wand", sub: "소재 본연의 디자인을 표현한", title: "다양한 디자인" },
        ],
        structureDesc: "LX Z:IN 바닥재 시트 스탠다드 1.8는 UV코팅/투명필름층, 디자인 인쇄층, 치수안정층, 쿠션층\n총 4단계로 구성되어 있습니다.",
        structureImage: "https://octapi.lxzin.com/imageResource/file/202403/20/3ba51bc7-dd4f-45ee-8e41-9209cce45729.png",
        detailFeatures: [
            {
                image: "https://octapi.lxzin.com/imageResource/file/202403/20/a6391248-d2b5-4bf3-b4c1-f4d66f70e6e6.png",
                title: "우수한 기본 품질",
                desc: "기본에 충실한 품질과 튼튼하고 경제적인 가격대로\n부담없이 사용할 수 있습니다.",
            },
            {
                image: "https://octapi.lxzin.com/imageResource/file/202403/19/abea5c3d-b15a-4a4a-bd3e-2d65e063df72.png",
                title: "다양한 디자인",
                desc: "넓어진 나무쪽 사이즈의 우드 디자인과\n천연 석재를 모티브로 한 스톤 디자인으로\n다양한 공간을 만들어 드립니다.",
                note: "※ Wide 디자인은 일부 패턴에만 적용되어 있음",
            },
        ],
        specs: [
            { label: "사이즈", value: "1.8mm(T) X 1,830mm(W)" },
            { label: "포장 단위", value: "1Roll" },
        ],
        certs: [
            { src: "https://octapi.lxzin.com/imageResource/file/202504/18/6872a3fe-7c28-463d-803e-30eabdf37305.jpg", alt: "2025 한국산업의 브랜드파워(K-BPI) 조사 가정용 바닥재 부문 1위", width: "152px", label: "2025 한국산업의 브랜드파워(K-BPI) 조사\n가정용 바닥재 부문 1위" },
            { src: "https://octapi.lxzin.com/imageResource/file/202511/21/e8f7f262-222b-42fa-84ed-533e946597b8.png", alt: "환경표지인증 한국환경산업기술원", width: "224px", label: "환경표지인증 한국환경산업기술원" },
            { src: "https://octapi.lxzin.com/imageResource/file/202512/03/d4381890-ab9e-473d-9510-c043af5049c8.png", alt: "실내표지", width: "92px", label: "실내표지" },
        ],
    },

    // ── 시트 스탠다드 2.0 (은행목) ──
    "시트 스탠다드 2.0(은행목)": {
        introTitle: "LX Z:IN 바닥재 시트 스탠다드 2.0",
        introDesc: "실용적이고 합리적인 가격의 시트바닥재, LX Z:IN 바닥재 시트 스탠다드 2.0입니다.",
        mainImage: "https://octapi.lxzin.com/imageResource/file/202403/20/fe9448cb-88c7-449a-991c-3caa75cef84e.png",
        features: [
            { icon: "leaf", sub: "안심하고 사용할 수 있는", title: "친환경 바닥재" },
            { icon: "award", sub: "경제적인 가격대", title: "우수한 기본 품질" },
            { icon: "wand", sub: "소재 본연의 디자인을 표현한", title: "다양한 디자인" },
        ],
        structureDesc: "LX Z:IN 바닥재 시트 스탠다드 2.0는 UV코팅/투명필름층, 디자인 인쇄층, 치수안정층, 쿠션층\n총 4단계로 구성되어 있습니다.",
        structureImage: "https://octapi.lxzin.com/imageResource/file/202403/20/3ba51bc7-dd4f-45ee-8e41-9209cce45729.png",
        detailFeatures: [
            {
                image: "https://octapi.lxzin.com/imageResource/file/202403/20/a6391248-d2b5-4bf3-b4c1-f4d66f70e6e6.png",
                title: "우수한 기본 품질",
                desc: "기본에 충실한 품질과 튼튼하고 경제적인 가격대로\n부담없이 사용할 수 있습니다.",
            },
            {
                image: "https://octapi.lxzin.com/imageResource/file/202403/19/abea5c3d-b15a-4a4a-bd3e-2d65e063df72.png",
                title: "다양한 디자인",
                desc: "넓어진 나무쪽 사이즈의 우드 디자인과\n천연 석재를 모티브로 한 스톤 디자인으로\n다양한 공간을 만들어 드립니다.",
                note: "※ Wide 디자인은 일부 패턴에만 적용되어 있음",
            },
        ],
        specs: [
            { label: "사이즈", value: "2.0mm(T) X 1,830mm(W)" },
            { label: "포장 단위", value: "1Roll" },
        ],
        certs: [
            { src: "https://octapi.lxzin.com/imageResource/file/202504/18/6872a3fe-7c28-463d-803e-30eabdf37305.jpg", alt: "2025 한국산업의 브랜드파워(K-BPI) 조사 가정용 바닥재 부문 1위", width: "152px", label: "2025 한국산업의 브랜드파워(K-BPI) 조사\n가정용 바닥재 부문 1위" },
            { src: "https://octapi.lxzin.com/imageResource/file/202511/21/e8f7f262-222b-42fa-84ed-533e946597b8.png", alt: "환경표지인증 한국환경산업기술원", width: "224px", label: "환경표지인증 한국환경산업기술원" },
            { src: "https://octapi.lxzin.com/imageResource/file/202512/03/d4381890-ab9e-473d-9510-c043af5049c8.png", alt: "실내표지", width: "92px", label: "실내표지" },
        ],
    },


    // ── 엑스컴포트 4.5 (지아 소리잠) ──
    "엑스컴포트 4.5(지아 소리잠)": {
        introTitle: "LX Z:IN 바닥재 엑스컴포트 4.5",
        introDesc: "천연소재의 깊이감을 담은 쿠션 시트바닥재, LX Z:IN 바닥재 엑스컴포트 4.5입니다.",
        nameChangeNotice: "※ 기존의 '지아 소리잠' 제품명이 '엑스컴포트 4.5'으로 변경되었습니다.",
        mainImage: "/assets/xcomfort/main-banner-real.png",
        features: [
            { icon: "leaf", iconImage: "/assets/xcomfort/icon-leaf.png", sub: "안심하고 사용할 수 있는", title: "친환경 바닥재" },
            { icon: "award", iconImage: "/assets/xcomfort/icon-layers.png", sub: "고탄성 쿠션층 적용", title: "우수한 보행성능" },
            { icon: "wand", iconImage: "/assets/xcomfort/icon-design.png", sub: "소재 본연의 디자인을 표현한", title: "내추럴 디자인" },
        ],
        structureDesc: "LX Z:IN 바닥재 엑스컴포트 4.5는 UV 코팅층, 고강도 투명 필름층, 디자인층, 치수안정층, 고탄성 쿠션층\n총 5단계로 구성되어 있습니다.",
        structureImage: "/assets/xcomfort/embo-tech.png",
        detailFeatures: [
            {
                title: "생활 소음 저감 기능",
                desc: "청소기 소음, 의자 끄는 소리와 같은 생활 소음과 경량충격음을 저감하여\n보다 조용한 공간을 만들어 드립니다.",
                image: "/assets/xcomfort/noise-reduction.png",
                note: "[실험실 조건에서 느끼는 경량충격음 저감량 TEST(△Db)]",
            },
            {
                title: "더 커진 디자인",
                desc: "기존 대비 1.5배 커진 우드 디자인은 고급 원목과 스톤의 크고 수려한 무늬를 그대로 표현합니다.",
                image: "/assets/xcomfort/enlarged-design.png",
            },
            {
                title: "Deep and Wide 동조엠보 기술",
                desc: "우드, 스톤의 표면 특성을 입체감 있게 사실적으로 구현하여\n소재 본연의 디자인을 표현합니다.",
                note: "※ 동조 엠보(EIR*) 기술이란 디자인 무늬와 표면엠보가 일치하여 천연소재의 질감을 사실적으로 구현하는 기술\n(*EIR : Embossed in Register)",
                image: "/assets/xcomfort/embo-tech2.png",
            },
        ],
        qualityTable: {
            title: "우수한 기본 품질",
            desc: "엄격하고 철저한 품질 관리로 안심하고 사용할 수 있는 제품입니다.",
            rows: [
                { item: "압입량", condition: "23˚C", unit: "mm", standard: "0.30 이상", result: "0.64" },
                { item: "잔류압입률", condition: "B법", unit: "%", standard: "20 이하", result: "5" },
                { item: "가열에 의한 길이 변화율", condition: "%", unit: "mm", standard: "2.0 이하", result: "0.10" },
                { item: "가열에 의한 폭의 변화율", condition: "%", unit: "mm", standard: "2.0 이하", result: "0.10" },
                { item: "내오염성", condition: "10종", unit: "", standard: "현저한 색상의 변화 및\n광택의 변화가 없어야 함", result: "변화 없음" },
                { item: "경량충격음저감량(△dB)\n(가중 바닥충격음 레벨 감쇠량)", condition: "", unit: "△dB", standard: "참고값", result: "19" },
                { item: "미끄럼저항성 (온돌, Slider 55)\n(EN 13036-4)", subItems: [
                    { condition: "건식", unit: "", standard: "제조자 제시값 이상", result: "DP5" },
                    { condition: "습식", unit: "", standard: "제조자 제시값 이상", result: "WP1" },
                ]},
                { item: "프탈레이트계가소제 (7종)", subItems: [
                    { condition: "상부", unit: "%", standard: "0.1% 이하", result: "불검출 (검출한계\n0.005)" },
                    { condition: "하부", unit: "%", standard: "0.1% 이하", result: "불검출 (검출한계\n0.005)" },
                ]},
                { item: "밀도", condition: "", unit: "kg/m3", standard: "", result: "1240.2" },
            ],
            notes: [
                "※ 시험방법 : 기본물성 KS - M 3802 : 2202 / 경량충격음저감량 – 측정 KS F 2865, 계산 KS 2863-1",
                "1) 시험바닥 : 두께 210mm의 철근 콘크리트 슬래브 / (8±1)˚C",
                "2) 표준경량충격원(태핑머신)에 대한 바닥 표면 마감재의 저감량 시험결과임 (수음실 용적 : 57.02㎥)",
                "※ 실험실 측정값으로, 실제 주거환경(바닥구조 등)에 따라 성능이 달라질 수 있음",
                "※ 상기 테스트 결과는 품질 개선을 위해 예고없이 변경될 수 있음",
            ],
        },
        specs: [
            { label: "사이즈", value: "4.5mm(T) X 1,830mm(W)" },
            { label: "포장 단위", value: "20m/Roll" },
        ],
        certs: [
            { src: "https://octapi.lxzin.com/imageResource/file/202511/21/e8f7f262-222b-42fa-84ed-533e946597b8.png", alt: "환경표지인증 한국환경산업기술원", width: "224px", label: "환경표지인증 한국환경산업기술원" },
            { src: "https://octapi.lxzin.com/imageResource/file/202512/03/d4381890-ab9e-473d-9510-c043af5049c8.png", alt: "실내표지", width: "92px", label: "실내표지" },
            { src: "https://octapi.lxzin.com/imageResource/file/202504/18/6872a3fe-7c28-463d-803e-30eabdf37305.jpg", alt: "2025 한국산업의 브랜드파워(K-BPI) 조사 가정용 바닥재 부문 1위", width: "152px", label: "2025 한국산업의 브랜드파워(K-BPI) 조사\n가정용 바닥재 부문 1위" },
        ],
    },

    // ── 엑스컴포트 5.0 ──
    "엑스컴포트 5.0": {
        introTitle: "LX Z:IN 바닥재 엑스컴포트 5.0",
        introDesc: "고탄성 2중 쿠션의 프리미엄 시트바닥재, LX Z:IN 바닥재 엑스컴포트 5.0입니다.",
        mainImage: "/assets/xcomfort50/main-banner.jpg",
        features: [
            { icon: "leaf", iconImage: "/assets/xcomfort50/icon-eco.png", sub: "안심하고 사용할 수 있는", title: "친환경 바닥재" },
            { icon: "award", iconImage: "/assets/xcomfort50/icon-walk.png", sub: "고탄성 2중 쿠션층 적용", title: "우수한 보행성능" },
            { icon: "wand", iconImage: "/assets/xcomfort50/icon-design.png", sub: "소재 본연의 디자인을 표현한", title: "내추럴 디자인" },
        ],
        structureDesc: "LX Z:IN 바닥재 엑스컴포트 5.0은 UV 코팅층, 투명 필름층, 디자인 인쇄층, 치수 안정층, 고탄성 2중 쿠션층\n총 5단계로 구성되어 있습니다.",
        structureImage: "/assets/xcomfort50/structure.png",
        detailFeatures: [
            {
                title: "우수한 보행 성능",
                desc: "고탄성 2중 쿠션층 적용으로 편안한 보행감을 느낄 수 있습니다.",
                image: "/assets/xcomfort50/walking-performance.png",
                note: "[압축 변화율(쿠션성) TEST]",
            },
            {
                title: "생활 소음 저감 기능",
                desc: "청소기 소음, 의자 끄는 소리와 같은 생활 소음과 경량충격음을 저감하여\n보다 조용한 공간을 만들어 드립니다.",
                image: "/assets/xcomfort50/noise-reduction.png",
                note: "[실험실 조건에서 느끼는 경량충격음 저감량 TEST(△dB)]",
            },
            {
                title: "미끄럼 저항",
                desc: "반려견의 미끄럼 안전 시험방법으로 미끄럼 저항 계수를 측정하여\n강마루 대비 약 30% 이상 미끄럼을 방지합니다.",
                image: "/assets/xcomfort50/slip-resistance.png",
                note: "[미끄럼 저항 계수(CSR-D : Coefficient of Slip Resistance Dog)]",
            },
            {
                title: "Big Size 디자인",
                desc: "기존보다 더 커진 Plank 디자인은 고급 원목과 스톤의 크고 수려한 무늬를 그대로 표현합니다.",
                image: "/assets/xcomfort50/bigsize-design.png",
            },
            {
                title: "고급스러운 자연 광택",
                desc: "우드, 스톤 본연의 질감 및 광택을 보다 사실적으로 구현합니다.",
                note: "※ Big Size (WIDE) 디자인은 일부 패턴에만 적용",
                images: [
                    { src: "/assets/xcomfort50/natural-gloss-wood.png", label: "원목 시공 사례\nXCF3442 | 라이트 베이지" },
                    { src: "/assets/xcomfort50/natural-gloss-stone.png", label: "스톤 시공 사례\nXCF3622 | 스페이스 그레이" },
                ],
            },
            {
                title: "Deep and Wide 동조엠보 기술",
                desc: "우드, 스톤의 표면 특성을 입체감 있게 사실적으로 구현하여\n소재 본연의 디자인을 표현합니다.",
                note: "※ 동조 엠보(EIR*) 기술이란 디자인 무늬와 표면엠보가 일치하여 천연소재의 질감을 사실적으로 구현하는 기술\n(*EIR : Embossed in Register)",
                image: "/assets/xcomfort50/embo-tech.png",
            },
            {
                title: "반려동물과 함께 하는 생활",
                desc: "반려동물의 안전과 편의를 위한 기능을 갖추고 있습니다.",
                subSections: [
                    { num: "01", subtitle: "미끄럼을 방지합니다.", desc: "높은 미끄럼 저항으로\n반려동물의 슬개골 탈구를 예방합니다.", image: "/assets/xcomfort50/pet-friendly-1.png" },
                    { num: "02", subtitle: "충격을 흡수해 관절을 보호합니다.", desc: "도톰한 쿠션층이 점프 및 착지 시\n관절에 전해지는 충격을 완화해 줍니다.", image: "/assets/xcomfort50/pet-friendly-2.png" },
                    { num: "03", subtitle: "깔끔한 이음새로 청소가 용이합니다.", desc: "이음매 틈새가 거의 없어 작은 실수(오염)에도 청소가 용이하고\n수분이 바닥 틈으로 거의 침투하지 않아 위생적입니다." },
                ],
            },
        ],
        qualityTable: {
            title: "우수한 기본 품질",
            desc: "엄격하고 철저한 품질 관리로 안심하고 사용할 수 있는 제품입니다.",
            rows: [
                { item: "압입량", condition: "23˚C", unit: "mm", standard: "0.30 이상", result: "0.72" },
                { item: "잔류압입률", condition: "B법", unit: "%", standard: "20 이하", result: "4" },
                { item: "가열에 의한 길이 변화율", condition: "%", unit: "mm", standard: "2.0 이하", result: "0.08" },
                { item: "가열에 의한 폭의 변화율", condition: "%", unit: "mm", standard: "2.0 이하", result: "0.08" },
                { item: "내오염성", condition: "10종", unit: "", standard: "현저한 색상의 변화 및\n광택의 변화가 없어야 함", result: "변화 없음" },
                { item: "경량충격음저감량(△dB)\n(가중 바닥충격음 레벨 감쇠량)", condition: "", unit: "△dB", standard: "참고값", result: "19" },
                { item: "미끄럼저항성 (온돌, Slider 55)\n(EN 13036-4)", subItems: [
                    { condition: "건식", unit: "", standard: "제조자 제시값 이상", result: "DP5" },
                    { condition: "습식", unit: "", standard: "제조자 제시값 이상", result: "WP1" },
                ]},
                { item: "프탈레이트계가소제 (7종)", subItems: [
                    { condition: "상부", unit: "%", standard: "0.1% 이하", result: "불검출 (검출한계\n0.005)" },
                    { condition: "하부", unit: "%", standard: "0.1% 이하", result: "불검출 (검출한계\n0.005)" },
                ]},
                { item: "밀도", condition: "", unit: "kg/m3", standard: "", result: "1280.5" },
            ],
            notes: [
                "※ 시험방법 : 기본물성 KS - M 3802 : 2202 / 경량충격음저감량 – 측정 KS F 2865, 계산 KS 2863-1",
                "1) 시험바닥 : 두께 210mm의 철근 콘크리트 슬래브 / (8±1)˚C",
                "2) 표준경량충격원(태핑머신)에 대한 바닥 표면 마감재의 저감량 시험결과임 (수음실 용적 : 57.02㎥)",
                "※ 실험실 측정값으로, 실제 주거환경(바닥구조 등)에 따라 성능이 달라질 수 있음",
                "※ 상기 테스트 결과는 품질 개선을 위해 예고없이 변경될 수 있음",
            ],
        },
        specs: [
            { label: "사이즈", value: "5.0mm(T) X 1,830mm(W)" },
            { label: "포장 단위", value: "20m/Roll" },
        ],
        certs: [
            { src: "https://octapi.lxzin.com/imageResource/file/202511/21/e8f7f262-222b-42fa-84ed-533e946597b8.png", alt: "환경표지인증 한국환경산업기술원", width: "224px", label: "환경표지인증 한국환경산업기술원" },
            { src: "https://octapi.lxzin.com/imageResource/file/202512/03/d4381890-ab9e-473d-9510-c043af5049c8.png", alt: "실내표지", width: "92px", label: "실내표지" },
            { src: "https://octapi.lxzin.com/imageResource/file/202504/18/6872a3fe-7c28-463d-803e-30eabdf37305.jpg", alt: "2025 한국산업의 브랜드파워(K-BPI) 조사 가정용 바닥재 부문 1위", width: "152px", label: "2025 한국산업의 브랜드파워(K-BPI) 조사\n가정용 바닥재 부문 1위" },
        ],
    },

    // ── 시트 프리미엄 2.2 (지아 자연애) ──
    "시트 프리미엄 2.2(지아 자연애)": {
        introTitle: "LX Z:IN 바닥재 시트 프리미엄 2.2",
        introDesc: "감각적인 공간을 완성해줄 트렌디한 디자인 바닥재, LX Z:IN 바닥재 시트 프리미엄 2.2입니다.",
        nameChangeNotice: "※ 기존의 '지아 자연애' 제품명이 '시트 프리미엄 2.2'으로 변경되었습니다.",
        mainImage: "https://octapi.lxzin.com/interior/hImgFileSeq/202307/21/c91e6745-554f-42ad-b16d-b36db633b015.jpg",
        features: [
            { icon: "leaf", iconImage: "https://octapi.lxzin.com/imageResource/file/202403/19/cb1a2345-c054-4550-940e-d56782bb5db6.png", sub: "안심하고 사용할 수 있는", title: "친환경 바닥재" },
            { icon: "award", iconImage: "https://octapi.lxzin.com/imageResource/file/202403/18/1db54701-3e24-4375-8ba5-cb679efa5250.png", sub: "발포 쿠션층", title: "우수한 보행감" },
            { icon: "wand", iconImage: "https://octapi.lxzin.com/imageResource/file/202403/18/fec52231-f827-4349-8de9-5b27ab4d2b2a.png", sub: "소재 본연의 디자인을 표현한", title: "내추럴 디자인" },
        ],
        structureDesc: "LX Z:IN 바닥재 시트 프리미엄 2.2는 UV 코팅층, 투명 필름층, 디자인 인쇄층, 치수 안정층, 쿠션층\n총 5단계로 구성되어 있습니다.",
        structureImage: "https://octapi.lxzin.com/imageResource/file/202403/19/ac36a4b4-1190-41a5-8e7b-7811b3ca338b.png",
        detailFeatures: [
            {
                title: "Deep and Wide 동조엠보 기술",
                desc: "우드, 스톤의 표면 특성을 입체감 있게 사실적으로 구현하여 소재 본연의 디자인을 표현합니다.",
                note: "※ 동조 엠보(EIR*) 기술이란 디자인 무늬와 표면엠보가 일치하여 천연소재의 질감을 사실적으로 구현하는 기술\n(*EIR : Embossed in Register)",
                image: "https://octapi.lxzin.com/imageResource/file/202403/18/fac911e5-71d6-45f7-be46-fbfa55409a53.png",
            },
        ],
        qualityTable: {
            title: "우수한 기본 품질",
            desc: "엄격하고 철저한 품질 관리로 안심하고 사용할 수 있는 제품입니다.",
            rows: [
                { item: "압입량", condition: "23˚C", unit: "mm", standard: "0.30 이상", result: "0.95" },
                { item: "잔류압입률", condition: "B법", unit: "%", standard: "20 이하", result: "3" },
                { item: "가열에 의한 길이 변화율", condition: "%", unit: "mm", standard: "2.0 이하", result: "0.10" },
                { item: "가열에 의한 폭의 변화율", condition: "%", unit: "mm", standard: "2.0 이하", result: "0.10" },
                { item: "내오염성", condition: "10종", unit: "", standard: "현저한 색상의 변화 및\n광택의 변화가 없어야 함", result: "변화 없음" },
                { item: "경량충격음저감량(△dB)\n(가중 바닥충격음 레벨 감쇠량)", condition: "", unit: "△dB", standard: "참고값", result: "17" },
                { item: "미끄럼저항성 (온돌, Slider 55)\n(EN 13036-4)", subItems: [
                    { condition: "건식", unit: "", standard: "제조자 제시값 이상", result: "DP5" },
                    { condition: "습식", unit: "", standard: "제조자 제시값 이상", result: "WP1" },
                ]},
                { item: "프탈레이트계가소제 (7종)", subItems: [
                    { condition: "상부", unit: "%", standard: "0.1% 이하", result: "불검출 (검출한계\n0.005)" },
                    { condition: "하부", unit: "%", standard: "0.1% 이하", result: "불검출 (검출한계\n0.005)" },
                ]},
                { item: "밀도", condition: "", unit: "kg/m3", standard: "", result: "714.9" },
            ],
            notes: [
                "※ 시험방법 : 기본물성 KS - M 3802 : 2202 / 경량충격음저감량 – 측정 KS F 2865, 계산 KS 2863-1",
                "1) 시험바닥 : 두께 210mm의 철근 콘크리트 슬래브 / (8±1)˚C",
                "2) 표준경량충격원(태핑머신)에 대한 바닥 표면 마감재의 저감량 시험결과임 (수음실 용적 : 57.02㎥)",
                "※ 실험실 측정값으로, 실제 주거환경(바닥구조 등)에 따라 성능이 달라질 수 있음",
                "※ 상기 테스트 결과는 품질 개선을 위해 예고없이 변경될 수 있음",
            ],
        },
        specs: [
            { label: "사이즈", value: "2.2mm(T) X 1,830mm(W)" },
            { label: "포장 단위", value: "30m/Roll" },
        ],
        certs: [
            { src: "https://octapi.lxzin.com/imageResource/file/202504/18/6872a3fe-7c28-463d-803e-30eabdf37305.jpg", alt: "2025 한국산업의 브랜드파워(K-BPI) 조사 가정용 바닥재 부문 1위", width: "152px", label: "2025 한국산업의 브랜드파워(K-BPI) 조사\n가정용 바닥재 부문 1위" },
            { src: "https://octapi.lxzin.com/imageResource/file/202511/21/e8f7f262-222b-42fa-84ed-533e946597b8.png", alt: "환경표지인증 한국환경산업기술원", width: "224px", label: "환경표지인증 한국환경산업기술원" },
            { src: "https://octapi.lxzin.com/imageResource/file/202512/03/d4381890-ab9e-473d-9510-c043af5049c8.png", alt: "실내표지", width: "92px", label: "실내표지" },
        ],
    },

    // ── 시트 프리미엄 3.2/2.7 (지아 사랑애) ── 통합
    "시트 프리미엄 3.2/2.7(지아사랑애)": {
        introTitle: "LX Z:IN 바닥재 시트 프리미엄 3.2/2.7",
        introDesc: "가족과 함께하는 우리 집 생활 공간을 위한 바닥재, LX Z:IN 바닥재 시트 프리미엄 3.2/2.7입니다.",
        nameChangeNotice: "※ 기존의 '지아사랑애' 제품명이 '시트 프리미엄 3.2/2.7'으로 변경되었습니다.",
        mainImage: "https://octapi.lxzin.com/imageResource/file/202403/19/3b5ef140-7d67-4b5c-8d65-0ba3f9332828.png",
        features: [
            { icon: "leaf", sub: "안심하고 사용할 수 있는", title: "친환경 바닥재", iconImage: "https://octapi.lxzin.com/imageResource/file/202403/18/1db54701-3e24-4375-8ba5-cb679efa5250.png" },
            { icon: "award", sub: "도톰한 쿠션층", title: "우수한 보행감", iconImage: "https://octapi.lxzin.com/imageResource/file/202403/18/fec52231-f827-4349-8de9-5b27ab4d2b2a.png" },
            { icon: "wand", sub: "소재 본연의 디자인을 표현한", title: "내추럴 디자인", iconImage: "https://octapi.lxzin.com/imageResource/file/202403/18/d4fb4596-d1e5-4155-a850-f744302d85ee.png" },
        ],
        structureDesc: "LX Z:IN 바닥재 시트 프리미엄 3.2/2.7은 UV 코팅층, 투명 필름층, 디자인 인쇄층, 치수 안정층, 쿠션층\n총 5단계로 구성되어 있습니다.",
        structureImage: "https://octapi.lxzin.com/imageResource/file/202403/19/915b7c06-627d-4e70-aaad-43fc9cb642c3.png",
        detailFeatures: [
            {
                title: "더 커진 디자인",
                desc: "기존 대비 1.5배 커진 우드 디자인은 고급 원목과 스톤의 크고 수려한 무늬를 그대로 표현합니다.",
                note: "※ Big Size(Wide) 디자인은 일부 패턴에만 적용되어 있음",
                images: [
                    { src: "https://octapi.lxzin.com/imageResource/file/202403/19/455da22e-77f2-49e0-b7ca-b1a81d726b05.png", label: "[우드]" },
                    { src: "https://octapi.lxzin.com/imageResource/file/202403/19/027aeb94-67b2-4fc6-8bb2-b1ff202270e1.png", label: "[스톤]" },
                ],
            },
            {
                image: "https://octapi.lxzin.com/imageResource/file/202403/18/fac911e5-71d6-45f7-be46-fbfa55409a53.png",
                title: "Deep and Wide 동조엠보 기술",
                desc: "우드, 스톤의 표면 특성을 입체감 있게 사실적으로 구현하여\n소재 본연의 디자인을 표현합니다.",
                note: "※ 동조 엠보(EIR*) 기술이란 디자인 무늬와 표면엠보가 일치하여 천연소재의 질감을 사실적으로 구현하는 기술\n(*EIR : Embossed in Register)",
            },
            {
                image: "https://octapi.lxzin.com/imageResource/file/202403/19/37684a8b-e714-4dbf-b709-37e8657d6b76.png",
                title: "우리 집 반려동물도 편안한 바닥재",
                desc: "덜 미끄러운 바닥재로 편안하고 안전한 보행이 가능하며,\n도톰한 쿠션 층이 점프 및 착지 시 관절에 전해지는 충격을 흡수해줍니다.\n이음매 틈새가 거의 없어 작은 실수(오염)에도 청소가 용이하고\n수분이 바닥 틈으로 거의 침투하지 않아 위생적이며, 청소기 소음, 의자 끄는 소리와 같은 생활 소음을 저감시켜줍니다.",
                note: "※ 미끄럼 저항성 테스트(KS M 3802 : 2022) Slider 55 기준 : 건식(Dry) DP5, 습식(Wet) WP2\n※ 실험실 측정 결과로, 실 생활 환경에 따라 달라질 수 있음",
            },
        ],
        specs: [
            { label: "LX Z:IN 바닥재\n시트 프리미엄 3.2 사이즈", value: "3.2mm(T) X 1,830mm(W)" },
            { label: "LX Z:IN 바닥재\n시트 프리미엄 2.7 사이즈", value: "2.7mm(T) X 1,830mm(W)" },
            { label: "LX Z:IN 바닥재\n시트 프리미엄 3.2 포장 단위", value: "23m/Roll" },
            { label: "LX Z:IN 바닥재\n시트 프리미엄 2.7 포장 단위", value: "25m/Roll" },
        ],
        certs: [
            { src: "https://octapi.lxzin.com/imageResource/file/202504/18/6872a3fe-7c28-463d-803e-30eabdf37305.jpg", alt: "2025 한국산업의 브랜드파워(K-BPI) 조사 가정용 바닥재 부문 1위", width: "152px", label: "2025 한국산업의 브랜드파워(K-BPI) 조사\n가정용 바닥재 부문 1위" },
            { src: "https://octapi.lxzin.com/imageResource/file/202511/21/e8f7f262-222b-42fa-84ed-533e946597b8.png", alt: "환경표지인증 한국환경산업기술원", width: "224px", label: "환경표지인증 한국환경산업기술원" },
            { src: "https://octapi.lxzin.com/imageResource/file/202512/03/d4381890-ab9e-473d-9510-c043af5049c8.png", alt: "실내표지", width: "92px", label: "실내표지" },
        ],
    },
};

/* ═══ 공통 주의사항 (공식 사이트 순서: 사용 시 → 안전관리 시 → 시공 시) ═══ */
const PRECAUTIONS = [
    {
        title: "사용 시 주의사항",
        items: [
            "시공 직후 과도한 고열 난방시 제품의 변형이나 들뜸이 발생할 수 있으니, 주의하시기 바랍니다.",
            "물로 제거되지 않는 오염은 빠른 시간 내 오염정도에 따라 중성 세제 또는 알코올 등으로 제거해 주십시오.",
            "색소를 함유하고 있거나, 침투성이 강한 물질에 장시간 접촉시 제품 표면이 오염될 수 있으니, 즉시 제거해 주십시오.",
            "Ex) 카레, 커피, 김치국물, 칼라 클레이, 색소 첨가된 과자류, 락스, 신나 등",
            "가구, 의자 등 중량물(무거운 물품) 이동시 밀거나 끌어서는 절대 안됩니다. (표면손상, 제품 밀림)",
            "무거운 집기 등에 장시간 눌렸을 때 표면 눌림 자국이 발생할 수 있으니, 주의하시기 바랍니다.",
            "스팀 청소기 사용시 한곳을 집중적으로 스팀에 노출 시키면 제품표면이 손상 될 수 있습니다.",
            "의자, 식탁 등 가구의 다릿발 하부에 사용하는 보호 패드는 반드시 무색 계열(투명 또는 백색)을 사용하십시오.",
            "유색 패드(부직포, 고무, 천 등) 사용시 염료 등의 오염물이 시트 표면에 이염 될 수 있습니다.",
            "전기장판, 매트 류 등을 한 자리에 장시간 고정하여 사용시 제품 표면에 변색이 발생할 수 있습니다.",
            "환기나 채광이 되지 않는 사용환경은 제품의 변색의 원인이 될 수 있습니다.",
            "직사광선에 지나치게 노출 시, 제품표면이 변색 될 수 있으므로 주의 바랍니다."
        ]
    },
    {
        title: "안전관리 시 주의사항",
        items: [
            "물을 흘렸을 경우 미끄러질 수 있으니, 즉시 제거하여 주십시오.",
            "양말을 신은 상태나 젖은 발의 경우에도 미끄러질 수 있으므로 주의하시기 바랍니다.",
            "제품 표면에 피부나 섬유(의류) 등 이 과도하게 마찰될 경우 손상될 수 있으니 주의하십시오."
        ]
    },
    {
        title: "시공 시 주의사항",
        items: [
            "시공 전 반드시 『LX하우시스 바닥재 시공가이드』를 숙지해 주십시오.",
            "(시공가이드에 명시된 시공법을 따르지 않고 임의로 시공한 경우, 이에 따른 하자에 대해서는 당사가 책임지지 않습니다.)",
            "생산 LOT별로 구분하여 시공해 주십시오.",
            "시공 초기에 제품 특유의 냄새가 있을 수 있으니 충분히 환기해 주십시오.",
            "접착제 및 용착제를 사용할 때는 먼저 환기를 한 후 보호장갑과 마스크를 반드시 착용 작업하십시오.",
            "본 제품은 롤(Roll)당 100kg 내외의 중량물(무거운)이므로, 취급 시 주의해 주십시오.",
            "제품이 세워져 있는 공간에서 작업을 금합니다. 제품이 쓰러져 다칠 수가 있습니다."
        ]
    }
];

/* ═══ 아이콘 맵 ═══ */
const ICON_MAP = {
    leaf: Leaf,
    award: Award,
    wand: Wand2,
};

/* ═══ 라인명 매칭 헬퍼 ═══ */
function getLineData(subtitle) {
    if (!subtitle) return null;
    const lineName = subtitle.split(' | ')[1]?.trim();
    if (!lineName) return null;
    // 라인명에 앞뒤 공백이 있을 수 있으므로 trim 하고 매칭
    return SHEET_LINE_DATA[lineName] || null;
}

/* ═══ 메인 컴포넌트 ═══ */
function SheetFeature({ subtitle }) {
    const data = getLineData(subtitle);

    // 데이터가 없으면 기본값(뉴청맥)으로 폴백
    const d = data || SHEET_LINE_DATA["시트 스탠다드 1.8(뉴청맥)"];

    return (
        <div className="w-full flex flex-col items-center bg-white py-10">
            <div className="max-w-[960px] w-full bg-white shadow-sm flex flex-wrap justify-center items-center py-6">

                {/* 제품명 변경 안내 */}
                {d.nameChangeNotice && (
                    <div className="w-full px-6 md:px-12 pt-10 pb-4">
                        <p className="text-[15px] text-[#888888] leading-relaxed">{d.nameChangeNotice}</p>
                    </div>
                )}

                {/* 제품 인트로 섹션 */}
                <div className="w-full flex flex-col items-center justify-center pt-16 pb-12 px-6">
                    <h2 className="text-[14px] md:text-[15px] font-extrabold text-[#222222] mb-6 tracking-tight text-center">{d.introTitle}</h2>
                    <p className="text-[14px] md:text-[14px] text-[#555555] text-center leading-relaxed">
                        {d.introDesc}
                    </p>
                </div>

                {/* 메인 비주얼 이미지 */}
                {d.mainImage && (
                    <div className="w-full px-6 md:px-12 mb-6">
                        <img src={d.mainImage} alt={`${d.introTitle} 메인 이미지`} className="w-full h-auto block m-0 rounded-xl shadow-sm" />
                    </div>
                )}

                {/* 특장점 요약 */}
                <div className="w-full max-w-[800px] grid grid-cols-1 md:grid-cols-3 gap-4 px-6 md:px-0 mb-6">
                    {d.features.map((feat, idx) => {
                        const IconComp = ICON_MAP[feat.icon];
                        return (
                            <div key={idx} className="flex items-center p-6 md:p-8 border border-[#e9e9e9] bg-[#f7f7f7] flex-row">
                                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-[#e8e8e8] flex items-center justify-center mr-5 overflow-hidden">
                                    {feat.iconImage ? (
                                        <img src={feat.iconImage} alt={feat.title} className="w-full h-full object-cover" />
                                    ) : (
                                        IconComp && <IconComp className="w-8 h-8 text-[#555555]" />
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[15px] text-[#555555] mb-1 font-medium tracking-tight">{feat.sub}</span>
                                    <strong className="text-[15px] text-[#222222] font-extrabold tracking-tight">{feat.title}</strong>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 제품 구조도 */}
                <div className="w-full mt-24 px-6 md:px-12 bg-[#f4f4f4] flex flex-col items-center justify-center py-20">
                    <h3 className="text-3xl md:text-[43px] text-[#222222] font-bold text-center mb-6 tracking-tight">제품 구조도</h3>
                    <p className="text-center text-[#555555] text-[17px] md:text-[14px] mb-6 leading-[1.6] tracking-tight">
                        {d.structureDesc.split('\n').map((line, i) => (
                            <React.Fragment key={i}>
                                {i > 0 && <br className="hidden md:block" />}
                                {line}
                            </React.Fragment>
                        ))}
                    </p>
                    {d.structureImage && (
                    <div className="w-full max-w-[800px] mb-6 flex justify-center">
                        <img src={d.structureImage} alt="제품 구조도" className="w-full h-auto block object-contain mix-blend-multiply" />
                    </div>
                    )}
                </div>

                {/* 추가 특장점 (우수한 기본 품질, 다양한 디자인 등) */}
                {d.detailFeatures.length > 0 && (
                    <div className="w-full px-6 md:px-12 bg-white flex flex-col items-center pb-[200px]">
                        <div className="w-full max-w-[970px] flex flex-wrap justify-center items-start my-[45px] -mx-[5px]">
                            {d.detailFeatures.map((feat, idx) => (
                                <div key={idx} className="flex flex-col items-center my-[45px] mx-[5px] w-full">
                                    {/* 타이틀 + 설명 (이미지보다 위에) */}
                                    <div className="pb-[40px] flex flex-col items-center w-full">
                                        <p className="m-0 text-[30px] font-bold text-center text-[#222222] tracking-tight">{feat.title}</p>
                                        <p className="m-0 pt-[20px] text-[14px] text-center text-[#555555] leading-[1.6] tracking-tight">
                                            {feat.desc.split('\n').map((line, i) => (
                                                <React.Fragment key={i}>
                                                    {i > 0 && <br className="hidden md:block" />}
                                                    {line}
                                                </React.Fragment>
                                            ))}
                                        </p>
                                        {feat.note && (
                                            <>
                                                <p className="my-[30px] mx-auto w-[20px] h-[1px] bg-[#000000] p-0"></p>
                                                <p className="m-0 text-[14px] text-center text-[#555555]">
                                                    {feat.note.split('\n').map((line, j) => (
                                                        <React.Fragment key={j}>
                                                            {j > 0 && <br />}
                                                            {line}
                                                        </React.Fragment>
                                                    ))}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                    {/* 단일 이미지 */}
                                    {feat.image && (
                                        <img src={feat.image} alt={feat.title} className="block w-full h-auto mix-blend-multiply m-0" />
                                    )}
                                    {feat.image2 && (
                                        <img src={feat.image2} alt={`${feat.title} 2`} className="block max-w-full mix-blend-multiply m-0 mt-4" />
                                    )}
                                    {/* 다중 이미지 (자연광택 등) */}
                                    {feat.images && (
                                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '20px', width: '100%', maxWidth: '800px' }}>
                                            {feat.images.map((img, imgIdx) => (
                                                <div key={imgIdx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                    <img src={img.src} alt={img.label} style={{ display: 'block', width: '100%', height: 'auto', mixBlendMode: 'multiply', margin: 0, borderRadius: '8px' }} />
                                                    {img.label && (
                                                        <p style={{ marginTop: '10px', fontSize: '14px', color: '#555555', textAlign: 'center', whiteSpace: 'pre-line' }}>{img.label}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {/* 서브 섹션 (반려동물 친화 등) */}
                                    {feat.subSections && (
                                        <div className="w-full max-w-[970px] mt-12">
                                            {feat.subSections.map((sub, sIdx) => (
                                                <div key={sIdx} className={`flex flex-col md:flex-row items-center gap-8 py-12 ${sIdx % 2 === 1 ? 'md:flex-row-reverse' : ''}`} style={{ backgroundColor: '#f4f4f4', borderRadius: '16px', padding: '20px', marginBottom: '12px' }}>
                                                    {sub.image && (
                                                        <div className="flex-shrink-0 w-[180px] h-[180px] md:w-[220px] md:h-[220px] rounded-full bg-[#e8e8e8] flex items-center justify-center overflow-hidden">
                                                            <img src={sub.image} alt={sub.subtitle} className="w-full h-full object-contain mix-blend-multiply" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 text-center md:text-left">
                                                        <p className="text-[15px] font-bold text-[#222222] mb-3">{sub.num} / {sub.subtitle}</p>
                                                        <p className="text-[14px] text-[#555555] leading-[1.7] whitespace-pre-line">{sub.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 품질 테스트 테이블 */}
                {d.qualityTable && (
                    <div className="w-full px-6 md:px-12 bg-white flex flex-col items-center pb-[100px]">
                        <div className="w-full max-w-[970px]">
                            <div className="mb-[30px]">
                                <p className="m-0 text-[43px] font-bold text-center">{d.qualityTable.title}</p>
                            </div>
                            <p className="m-0 text-[14px] text-center text-[#555555] mb-[40px] leading-[1.6]">{d.qualityTable.desc}</p>
                            <div className="mb-[20px] overflow-x-auto">
                                <table className="mt-[20px] w-full border-collapse box-border min-w-[700px]">
                                    <thead>
                                        <tr className="bg-[#fbfbfb]">
                                            <th className="py-[15px] px-[15px] text-[#555] font-bold text-[15px] border border-[#e5e5e5] text-center" colSpan={2}>성능항목</th>
                                            <th className="py-[15px] px-[15px] text-[#555] font-bold text-[15px] border border-[#e5e5e5] text-center">단위</th>
                                            <th className="py-[15px] px-[15px] text-[#555] font-bold text-[15px] border border-[#e5e5e5] text-center">기준</th>
                                            <th className="py-[15px] px-[15px] text-[#555] font-bold text-[15px] border border-[#e5e5e5] text-center">결과값</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {d.qualityTable.rows.map((row, idx) => {
                                            if (row.subItems) {
                                                return row.subItems.map((sub, si) => (
                                                    <tr key={`${idx}-${si}`}>
                                                        {si === 0 && (
                                                            <td className="py-[15px] px-[15px] text-[#555] text-[14px] border border-[#e5e5e5] text-center whitespace-pre-line" rowSpan={row.subItems.length}>
                                                                {row.item}
                                                            </td>
                                                        )}
                                                        <td className="py-[15px] px-[15px] text-[#555] text-[14px] border border-[#e5e5e5] text-center">{sub.condition}</td>
                                                        <td className="py-[15px] px-[15px] text-[#555] text-[14px] border border-[#e5e5e5] text-center">{sub.unit}</td>
                                                        <td className="py-[15px] px-[15px] text-[#555] text-[14px] border border-[#e5e5e5] text-center whitespace-pre-line">{sub.standard}</td>
                                                        <td className="py-[15px] px-[15px] text-[#222] text-[14px] font-semibold border border-[#e5e5e5] text-center whitespace-pre-line">{sub.result}</td>
                                                    </tr>
                                                ));
                                            }
                                            return (
                                                <tr key={idx}>
                                                    <td className="py-[15px] px-[15px] text-[#555] text-[14px] border border-[#e5e5e5] text-center whitespace-pre-line">{row.item}</td>
                                                    <td className="py-[15px] px-[15px] text-[#555] text-[14px] border border-[#e5e5e5] text-center">{row.condition}</td>
                                                    <td className="py-[15px] px-[15px] text-[#555] text-[14px] border border-[#e5e5e5] text-center">{row.unit}</td>
                                                    <td className="py-[15px] px-[15px] text-[#555] text-[14px] border border-[#e5e5e5] text-center whitespace-pre-line">{row.standard}</td>
                                                    <td className="py-[15px] px-[15px] text-[#222] text-[14px] font-semibold border border-[#e5e5e5] text-center whitespace-pre-line">{row.result}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            {d.qualityTable.notes && (
                                <div className="mt-[20px] space-y-1">
                                    {d.qualityTable.notes.map((note, i) => (
                                        <p key={i} className="m-0 text-[13px] text-[#999] leading-[1.5]">{note}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 스펙 */}
                {d.specs.length > 0 && (
                    <div className="w-full px-6 md:px-12 bg-white flex flex-col items-center pb-[200px]">
                        <div className="w-full max-w-[970px]">
                            <div className="mb-[50px]">
                                <p className="m-0 text-[43px] font-bold text-center">스펙</p>
                            </div>
                            <div className="mb-[20px]">
                                <table className="mt-[20px] w-full border-collapse box-border">
                                    <colgroup>
                                        <col width="20%" />
                                        <col width="30%" />
                                        <col width="20%" />
                                        <col width="30%" />
                                    </colgroup>
                                    <tbody>
                                        {Array.from({ length: Math.ceil(d.specs.length / 2) }, (_, rowIdx) => {
                                            const left = d.specs[rowIdx * 2];
                                            const right = d.specs[rowIdx * 2 + 1];
                                            return (
                                                <tr key={rowIdx}>
                                                    <th className="py-[25px] px-[20px] text-[#ababab] font-normal text-left bg-[#fbfbfb] border border-[#f1f1f1] whitespace-pre-line">{left.label}</th>
                                                    <td className="py-[25px] px-[20px] text-[#000000] text-[14px] border border-[#f1f1f1]">{left.value}</td>
                                                    {right ? (
                                                        <>
                                                            <th className="py-[25px] px-[20px] text-[#ababab] font-normal text-left bg-[#fbfbfb] border border-[#f1f1f1] whitespace-pre-line">{right.label}</th>
                                                            <td className="py-[25px] px-[20px] text-[#000000] text-[14px] border border-[#f1f1f1]">{right.value}</td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <th className="py-[25px] px-[20px] bg-[#fbfbfb] border border-[#f1f1f1]"></th>
                                                            <td className="py-[25px] px-[20px] border border-[#f1f1f1]"></td>
                                                        </>
                                                    )}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* 인증 & 수상 */}
                {d.certs.length > 0 && (
                    <div className="w-full px-6 md:px-12 bg-white flex flex-col items-center pb-[200px]">
                        <div className="w-full max-w-[970px]">
                            <div className="mb-[50px]">
                                <p className="m-0 text-[43px] font-bold text-center">인증 &amp; 수상</p>
                            </div>
                            <div className="mb-[20px]">
                                <table className="mt-[20px] w-full border-collapse box-border">
                                    <tbody>
                                        <tr>
                                            {d.certs.map((cert, i) => (
                                                <td key={i} className="py-[25px] px-[20px] bg-white border border-[#f1f1f1]" style={{ width: `${100 / d.certs.length}%` }}>
                                                    <img src={cert.src} alt={cert.alt} className="block mx-auto" style={{ width: cert.width }} />
                                                </td>
                                            ))}
                                        </tr>
                                        <tr>
                                            {d.certs.map((cert, i) => (
                                                <td key={i} className="py-[25px] px-[20px] text-[#ababab] text-[14px] text-center bg-[#fbfbfb] border border-[#f1f1f1]">
                                                    {cert.label.split('\n').map((line, j) => (
                                                        <React.Fragment key={j}>
                                                            {j > 0 && <br />}
                                                            {line}
                                                        </React.Fragment>
                                                    ))}
                                                </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* 주의사항 */}
                <div className="w-full px-6 md:px-12 bg-white flex flex-col items-center mb-[100px]">
                    <div className="w-full max-w-[960px]">
                        <div className="mb-[60px]">
                            <p className="m-0 text-[48px] font-black text-center text-[#222]">주의사항</p>
                        </div>
                        <div className="grid grid-cols-1 gap-6 md:p-8">
                            {PRECAUTIONS.map((section, idx) => (
                                <div key={idx} className="bg-[#f7f7f7] p-6 md:p-8 rounded-2xl border border-[#e5e5e5] shadow-sm">
                                    <p className="m-0 pb-[30px] text-[30px] font-black text-[#222222] flex items-center">
                                        <span className="mr-4 text-[14px] text-[#c8221f]">!</span> {section.title}
                                    </p>
                                    <ul className="space-y-5">
                                        {section.items.map((item, i) => (
                                            <li key={i} className={`text-[14px] md:text-[14px] leading-relaxed flex items-start ${item.startsWith('Ex)') || item.startsWith('(시공가이드') ? 'text-[#c8221f]' : 'text-[#444]'}`}>
                                                <span className="mr-3 text-[#c8221f] font-black mt-[4px]">•</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default SheetFeature;
