import { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useProductStore } from '../store/useProductStore';
import { useCartStore } from '../store/useCartStore';
import { useToastStore } from '../store/useToastStore';
import { useAuthStore } from '../store/useAuthStore';
import { useSimilarProducts } from '../hooks/useSimilarProducts';
import EditonStoneFeature from '../components/product/EditonStoneFeature';
import EditonWoodFeature from '../components/product/EditonWoodFeature';
import SheetFeature from '../components/product/SheetFeature';
import TileFeature from '../components/product/TileFeature';
import TileStandardFeature from '../components/product/TileStandardFeature';
import CommercialBotanicFeature from '../components/product/CommercialBotanicFeature';
import CommercialEconoFeature from '../components/product/CommercialEconoFeature';
import CommercialPrestigeFeature from '../components/product/CommercialPrestigeFeature';
import MaruPremiumFeature from '../components/product/MaruPremiumFeature';
import SheetStandard18Feature from '../components/product/SheetStandard18Feature';
import SheetStandard20Feature from '../components/product/SheetStandard20Feature';

// 에디톤 마루 상세 이미지 목록 (문서참조 - 실제 다운로드 제공 파일)
const MARU_LAYERS = [
    { id: 'surface', num: '01', title: '무광 효과 표면층', desc: '무광 UV 코팅으로 반사광을 줄여 눈의 피로를 덜고 고급스러운 질감을 제공합니다.', color: 'bg-[#E5E7EB]' },
    { id: 'transparent', num: '02', title: '고내구 투명층', desc: '고강도 투명 필름이 디자인층을 보호하며 스크래치와 찍힘을 방지합니다.', color: 'bg-[#F3F4F6]/80' },
    { id: 'design', num: '03', title: '고해상 디자인층', desc: 'TrueView 인쇄 기술로 천연 소재의 섬세한 패턴을 구현합니다.', color: 'bg-[#D2B48C]' },
    { id: 'nsc', num: '04', title: 'NSC(T&G)', numLabel: 'NSC(Natural Stone Core)', desc: '석재를 분쇄 후 고분자 수지와 고온 고압으로 압축한 고강도 보드판입니다.', color: 'bg-[#8B7355]' },
    { id: 'adhesive', num: '05', title: '전용 접착제', desc: '친환경 전용 접착제를 사용하여 안정적인 시공 품질을 보장합니다.', color: 'bg-[#4A5D4E]' }
];

// 시공사례 이미지
const INTERIOR_IMAGES = [
    { src: '/assets/lxzin/maru_detail/interior-01.png', title: '강릉시 강릉교동롯데캐슬1단지', desc: '우드 톤의 강마루로 따뜻함을 더한 58평' },
    { src: '/assets/lxzin/maru_detail/interior-02.png', title: '하남시 신장동 명지캐럿108(주상복합)', desc: '에디톤 마루로 차분함을 더한 34평' },
    { src: '/assets/lxzin/maru_detail/interior-03.png', title: '성남시 백현동 판교푸르지오그랑블', desc: '화이트 우드 톤으로 화사함을 더한 33평' },
    { src: '/assets/lxzin/maru_detail/interior-04.png', title: '과천시 별양동 과천래미안슈르', desc: '한쪽 벽면의 답답함을 걷어내 개방감을 살린 25평' },
    { src: '/assets/lxzin/maru_detail/interior-05.jpg', title: '용인시 상현동 수지센트럴아이파크', desc: '취향을 위해 고급스러운 마감재로 완성한 32평' },
    { src: '/assets/lxzin/maru_detail/interior-06.jpg', title: '과천시 주암동 트레보빌', desc: '유행보다 실용성과 수납에 집중한 4인 가족의 화이트우드 41평' },
    { src: '/assets/lxzin/maru_detail/interior-07.jpg', title: '경기도 광주시 삼동 우미린아파트', desc: '폴딩도어 시공으로 개방감을 더한 33평' },
];

// 에디톤 스톤 스펙
const STONE_SPEC = {
    '두께': '6.0 mm',
    '규격': '150(W) × 800(L) mm',
    '포장 단위': '10 pcs / box (1.2 m²)',
    '재질': 'SPC (Stone Polymer Composite) + IXPE',
    '시공 방식': '클릭형 무본드 시공',
    '품질 보증': '주거용 10년 품질 보증',
};

const formatSpecSize = (size, thickness) => {
    if (!size) return '';
    if (size.includes('mm(T)') && size.includes('mm(W)')) return size;
    if (size.includes('(W)') && !size.includes('주문수량')) return size;
    if (/\d+(\.\d+)?T\s*\*\s*\d+W\s*\*\s*\d+L/i.test(size)) return size;
    if (/\d+(\.\d+)?T\s*X\s*[\d,]+W/i.test(size)) {
        const tMatch = size.match(/([\d.]+)T/i);
        const wMatch = size.match(/([\d,]+)W/i);
        const lMatch = size.match(/X\s*([\d]+m\(L\))/i);
        if (tMatch && wMatch) {
            let result = `${tMatch[1]}mm(T) × ${wMatch[1]}mm(W)`;
            if (lMatch) result += ` × ${lMatch[1]}`;
            return result;
        }
        return size;
    }
    if (size.includes('주문수량')) {
        const wMatch = size.match(/([\d,]+)\s*mm/i);
        const w = wMatch ? wMatch[1] : '1,830';
        const tStr = thickness ? `${parseFloat(thickness).toFixed(1)}mm(T) × ` : '';
        return `${tStr}${w}mm(W)`;
    }
    const parts = size.toLowerCase().split('x').map(p => p.trim());
    if (parts.length === 2) {
        const w = Number(parts[0].replace(/mm/gi, '').replace(/,/g, '')).toLocaleString();
        const l = Number(parts[1].replace(/mm/gi, '').replace(/,/g, '')).toLocaleString();
        const tStr = thickness ? `${parseFloat(thickness).toFixed(1)}mm(T) × ` : '';
        return `${tStr}${w}mm(W) × ${l}mm(L)`;
    }
    return size;
};

const getColorFromTitle = (title) => {
    if (!title) return { name: '다양한 색상', hex: null };
    const t = title;
    if (t.includes('라이트브라운') || t.includes('라이트')) return { name: '라이트브라운', hex: '#c4a482' };
    if (t.includes('쉬폰') || t.includes('브리즈')) return { name: '라이트브라운', hex: '#c4a482' };
    if (t.includes('허니') || t.includes('너트')) return { name: '허니브라운', hex: '#c9a96e' };
    if (t.includes('블론드')) return { name: '라이트베이지', hex: '#d4c4a8' };
    if (t.includes('미들톤')) return { name: '미디엄브라운', hex: '#9a7b5b' };
    if (t.includes('스모크')) return { name: '다크브라운', hex: '#6b5344' };
    if (t.includes('클래식오크')) return { name: '내추럴우드', hex: '#b08d6e' };
    if (t.includes('플린트')) return { name: '라이트그레이', hex: '#c8c0b8' };
    if (t.includes('오트밀')) return { name: '웜그레이', hex: '#a89e94' };
    if (t.includes('솔티 애쉬') || t.includes('솔티애쉬')) return { name: '애쉬그레이', hex: '#b0a89e' };
    if (t.includes('솔티 크림') || t.includes('솔티크림')) return { name: '크림화이트', hex: '#f0ece4' };
    if (t.includes('솔티 브라운') || t.includes('솔티브라운')) return { name: '웜브라운', hex: '#8e7260' };
    if (t.includes('보태닉 화이트')) return { name: '화이트', hex: '#f5f4ef' };
    if (t.includes('아라베스카토')) return { name: '마블화이트', hex: '#eae6de' };
    if (t.includes('맨하탄') || t.includes('쿼츠')) return { name: '다크그레이', hex: '#5a5550' };
    if (t.includes('프로스트')) return { name: '프로스트그레이', hex: '#c4bfb8' };
    if (t.includes('모데나 라이트')) return { name: '라이트그레이', hex: '#c0b8ae' };
    if (t.includes('모데나 그레이')) return { name: '미디엄그레이', hex: '#908880' };
    if (t.includes('모데나 다크')) return { name: '다크그레이', hex: '#5e5650' };
    if (t.includes('라임')) return { name: '라임베이지', hex: '#d8ccb8' };
    if (t.includes('샌드 아이보리') || t.includes('샌드아이보리')) return { name: '아이보리', hex: '#e8e0d0' };
    if (t.includes('샌드 그레이') || t.includes('샌드그레이')) return { name: '샌드그레이', hex: '#b0a698' };
    if (t.includes('콘크리트 라이트')) return { name: '라이트콘크리트', hex: '#c4bcb0' };
    if (t.includes('콘크리트 그레이') || t.includes('콘크리트그레이')) return { name: '콘크리트그레이', hex: '#908a82' };
    if (t.includes('화이트') || t.includes('크림') || t.includes('아이보리')) return { name: '화이트', hex: '#f5f4ef' };
    if (t.includes('그레이') || t.includes('애쉬') || t.includes('콘크리트')) return { name: '그레이', hex: '#aca7a1' };
    if (t.includes('브라운') || t.includes('우드') || t.includes('오크') || t.includes('메이플')) return { name: '브라운', hex: '#a0785a' };
    if (t.includes('블랙') || t.includes('다크')) return { name: '다크', hex: '#424242' };
    if (t.includes('베이지') || t.includes('샌드')) return { name: '베이지', hex: '#d3c5b5' };
    if (t.includes('골드') || t.includes('브론즈')) return { name: '골드', hex: '#b8986e' };
    if (t.includes('내추럴')) return { name: '내추럴', hex: '#c4b498' };
    if (t.includes('파인')) return { name: '내추럴우드', hex: '#c8a878' };
    if (t.includes('펄')) return { name: '펄그레이', hex: '#b8b0a8' };
    if (t.includes('메탈')) return { name: '메탈릭', hex: '#9e9690' };
    if (t.includes('비안코')) return { name: '화이트마블', hex: '#ede8e2' };
    return { name: '다양한 색상', hex: null };
};

const renderColor = (product) => {
    if (product.colorText) {
        const hexes = product.colorHex ? product.colorHex.split(',').map(h => h.trim()) : [];
        return (
            <div className="flex items-center gap-3">
                <span>{product.colorText}</span>
                {hexes.length > 0 && (
                    <div className="flex gap-1">
                        {hexes.map((hex, idx) => (
                            <div key={idx} className="w-[24px] h-[24px] rounded-full border border-gray-300 shadow-sm" style={{ backgroundColor: hex }}></div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    if (product.specifications?.color) {
        return (
            <div className="flex items-center gap-3">
                <span>{product.specifications.color}</span>
            </div>
        );
    }

    const { name, hex } = getColorFromTitle(product.title);

    return (
        <div className="flex items-center gap-3">
            <span>{name}</span>
            {hex && <div className="w-[24px] h-[24px] rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: hex }}></div>}
        </div>
    );
};

const TAB_ACTIVE = 'px-6 py-4 text-[16px] font-bold border-b-2 border-slate-900 whitespace-nowrap';
const TAB_INACTIVE = 'px-6 py-4 text-[16px] font-medium text-slate-400 hover:text-slate-900 transition-colors whitespace-nowrap';

const getProductUnit = (product) => {
    if (!product) return { unit: '개', packaging: '', label: '수량' };
    const sub = (product.subCategory || '').toLowerCase();
    const packaging = product.specifications?.packaging || '';

    if (sub.includes('타일') || sub.includes('lvt') || sub.includes('에디톤') || sub.includes('pst') || sub.includes('데코타일')) {
        if (sub.includes('프레스티지')) {
            const sheetsMatch = packaging.match(/(\d+)\s*장/);
            const sheetsPerBox = sheetsMatch ? parseInt(sheetsMatch[1]) : 0;
            if (sheetsPerBox > 0) {
                return { unit: 'Box', packaging, label: `수량 (Box · ${sheetsPerBox}장/Box)`, sheetsPerBox };
            }
            return { unit: 'Box', packaging, label: '수량 (Box)' };
        }
        if (sub.includes('에디톤')) {
            let sheetsPerBox = 4, areaPerBox = 1.62;
            if (sub.includes('스퀘어')) { sheetsPerBox = 4; areaPerBox = 1.44; }
            else if (sub.includes('우드')) { sheetsPerBox = 4; areaPerBox = 1.54; }
            else { sheetsPerBox = 4; areaPerBox = 1.62; }
            return { unit: 'Box', packaging, label: `수량 (Box · ${sheetsPerBox}장 · ${areaPerBox}m²)`, sheetsPerBox, areaPerBox };
        }
        const sheetsMatch = packaging.match(/(\d+)\s*장/);
        const sheetsPerBox = sheetsMatch ? parseInt(sheetsMatch[1]) : 0;
        if (sheetsPerBox > 0) {
            return { unit: 'Box', packaging, label: `수량 (Box · ${sheetsPerBox}장/Box)`, sheetsPerBox };
        }
        return { unit: 'Box', packaging, label: '수량 (Box)' };
    }
    if (sub.includes('시트') || sub.includes('프리미엄') || sub.includes('스탠다드') || sub.includes('엑스컴포트')) {
        const rollMatch = packaging.match(/(\d+)M/i);
        if (rollMatch) {
            return { unit: 'R', packaging, label: `수량 (롤 · ${packaging})`, rollLength: parseInt(rollMatch[1]) };
        }
        return { unit: 'M', packaging, label: '수량 (M)' };
    }
    if (sub.includes('마루')) {
        const title = (product.title || '').toLowerCase();
        let sheetsPerBox = 0, areaPerBox = 0;
        if (title.includes('600')) { sheetsPerBox = 9; areaPerBox = 3.21; }
        else if (title.includes('400')) { sheetsPerBox = 10; areaPerBox = 3.12; }
        else if (title.includes('우드')) { sheetsPerBox = 16; areaPerBox = 3.17; }
        if (sheetsPerBox > 0) {
            return { unit: 'Box', packaging, label: `수량 (Box · ${sheetsPerBox}장 · ${areaPerBox}m²)`, sheetsPerBox, areaPerBox };
        }
        return { unit: 'Box', packaging, label: '수량 (Box)' };
    }
    return { unit: '개', packaging, label: '수량' };
};

export default function FlooringProductDetailView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const product = useProductStore((state) => state.getProductById(id || 'res-001'));
    const initProducts = useProductStore((state) => state.initProducts);
    const { user, isAuthenticated } = useAuthStore();
    const setCartItem = useCartStore((state) => state.setCartItem);
    const { addToast } = useToastStore();
    const products = useProductStore(state => state.products);
    const recentProductIds = useProductStore(state => state.recentProducts);
    const recentProducts = useMemo(() =>
        recentProductIds.map(id => products.find(p => p.id === id)).filter(Boolean)
        , [recentProductIds, products]);

    const { similarProducts, isOutOfStock: _isOutOfStock, isLowStock } = useSimilarProducts(id);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [qty, setQty] = useState(1);
    const [prevId, setPrevId] = useState(id);
    const isBusiness = user?.role === 'business';

    if (prevId !== id) {
        setPrevId(id);
        setQty(1);
    }

    useEffect(() => {
        initProducts();
    }, [initProducts]);

    useEffect(() => {
        if (product && id) {
            useProductStore.getState().addRecentProduct(id);
        }
    }, [id, product]);

    useEffect(() => {
        if (product) {
            document.title = `${product.title} | 데일리하우징`;
            document.querySelector('meta[property="og:title"]')
                ?.setAttribute('content', product.title);
            document.querySelector('meta[property="og:description"]')
                ?.setAttribute('content', `${product.title} - ${product.subtitle || '프리미엄 바닥재'}`);
            document.querySelector('meta[property="og:image"]')
                ?.setAttribute('content', product.imageUrl || '/og-image.jpg');
        }
        return () => {
            document.title = '데일리하우징 - 프리미엄 바닥재 전문';
            document.querySelector('meta[property="og:title"]')
                ?.setAttribute('content', '데일리하우징 - 프리미엄 바닥재 전문');
            document.querySelector('meta[property="og:description"]')
                ?.setAttribute('content', '데일리하우징에서 주거용, 상업용 프리미엄 바닥재를 만나보세요');
            document.querySelector('meta[property="og:image"]')
                ?.setAttribute('content', '/og-image.jpg');
        };
    }, [product]);

    if (!product) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center py-20">
                <h2 className="text-2xl font-bold mb-4">상품을 찾을 수 없습니다.</h2>
                <button onClick={() => navigate(-1)} className="px-6 py-2 bg-slate-900 text-white hover:bg-slate-800 transition-colors">뒤로 가기</button>
            </div>
        );
    }

    const isCommercial = product.categoryId === 'commercial';
    const isCommercialBotanic = isCommercial && product.subCategory?.includes('베이직');
    const isCommercialEcono = isCommercial && product.subCategory?.includes('스탠다드');
    const isCommercialPrestige = isCommercial && product.subCategory?.includes('프리미엄');
    const isTile = !isCommercial && (product.subCategory?.includes('타일') || product.subtitle?.includes('타일') || product.title?.includes('타일'));
    const isTileStandard = isTile && product.subCategory?.includes('스탠다드');
    const isMaru = !isCommercial && !isTile && (product.subCategory?.includes('우드') || product.subCategory?.includes('마루') || product.subtitle?.includes('마루') || product.title?.includes('마루'));
    const isStone = !isCommercial && !isTile && (product.subCategory?.includes('스톤') || product.subCategory?.includes('스퀘어') || product.subtitle?.includes('스톤') || product.title?.includes('스톤'));
    const isSheet = !isCommercial && !isTile && (product.subCategory?.includes('시트') || product.subCategory?.includes('프리미엄') || product.subCategory?.includes('스탠다드') || product.subCategory?.includes('엑스컴포트') || product.subtitle?.includes('시트') || product.title?.includes('시트'));
    const isMaruPremium = product.subtitle?.includes('프리미엄 합판');
    const isNuchungmak = product.subtitle?.includes('뉴청맥') || product.subtitle?.includes('스탠다드 1.8') || product.subCategory?.includes('스탠다드 1.8');
    const isEunhaengmok = product.subtitle?.includes('은행목') || product.subtitle?.includes('스탠다드 2.0') || product.subCategory?.includes('스탠다드 2.0');

    return (
        <main className="flex-1 w-full pb-40 lg:pb-32">
            {/* 뒤로가기 및 브레드크럼 */}
            <div className="max-w-7xl mx-auto px-4 md:px-10 pt-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (window.history.length <= 1) {
                            navigate(isCommercial ? "/category/commercial" : "/category/residential");
                        } else {
                            navigate(-1);
                        }
                    }}
                    className="flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors font-bold text-[15px] group w-fit"
                >
                    <span className="material-symbols-outlined text-[22px] transition-transform group-hover:-translate-x-1">chevron_left</span>
                    뒤로 가기
                </button>

                <div className="flex items-center justify-center gap-2 text-[14px] text-slate-400">
                    <Link className="hover:underline" to="/">홈</Link>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <Link className="hover:underline" to={isCommercial ? "/category/commercial" : "/category/residential"}>
                        {isCommercial ? "바닥재(상업용)" : "바닥재(주거용)"}
                    </Link>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <span className="text-slate-500">{product.subCategory || product.subtitle?.split(' | ')[0]}</span>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <span className="text-slate-900 font-semibold">{product.title}</span>
                </div>
            </div>

            {/* 상단 상품 섹션 - 이미지 좌측 / 정보 우측 그리드 */}
            <div className="max-w-[1280px] mx-auto px-4 md:px-10 pt-8 pb-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* 좌측: 메인 이미지 */}
                    <div className="flex flex-col items-center">
                        <button
                            onClick={() => setIsImageModalOpen(true)}
                            className="bg-[#f5f5f3] w-full aspect-[4/3] overflow-hidden group relative cursor-zoom-in rounded-2xl shadow-sm border border-slate-100"
                            aria-label="상세 이미지 보기"
                        >
                            <img
                                alt={product.title}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                                src={product.imageUrl || '/assets/lxzin/no-image.png'}
                                onError={(e) => {
                                    e.target.src = '/assets/lxzin/no-image.png';
                                    e.target.onerror = null;
                                }}
                            />
                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            </div>
                        </button>
                    </div>

                    {/* 우측: 상품 정보 */}
                    <div className="flex flex-col justify-center">
                        <p className="text-[13px] text-[#888888] font-medium mb-1">{product.subCategory || product.subtitle?.split(' | ')[0]}</p>
                        <h1 className="text-[28px] md:text-[34px] font-black text-[#222222] tracking-tight leading-tight mb-1">
                            {product.model_id || product.id}
                        </h1>
                        <p className="text-[16px] md:text-[18px] font-semibold text-[#555555] mb-6">
                            {product.title}
                        </p>

                        {/* 가격 정보 */}
                        <div className="flex flex-col gap-1.5 mb-6 pb-6 border-b border-slate-100">
                            <div className="flex items-baseline gap-2 w-full">
                                {isAuthenticated && isBusiness ? (
                                    <div className="flex flex-col gap-2 w-full">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-[14px] text-slate-400 font-semibold line-through">
                                                {product.priceLabel || '일반 회원가:'} {(product.price || 0).toLocaleString()}원
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 mt-1 py-3 px-4 bg-red-50 border border-red-200 rounded-lg">
                                            <span className="text-[13px] font-bold text-[#c8221f]">내 사업자 특별가:</span>
                                            <span className="text-[18px] md:text-[20px] font-black text-[#c8221f]">
                                                {(product.businessPrice || 0).toLocaleString()}원
                                            </span>
                                            <span className="text-[11px] bg-[#c8221f] text-white px-2 py-0.5 rounded font-bold ml-1">
                                                일반가 대비 {Math.round((1 - product.businessPrice / product.price) * 100)}% 혜택 적용됨
                                            </span>
                                            <span className="ml-auto text-[12px] font-bold text-red-600 flex items-center gap-0.5">
                                                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                                인증 완료
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2 w-full">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-[14px] text-[#888888] font-semibold mr-2">{product.priceLabel || '일반 회원가:'}</span>
                                            <span className="text-[26px] md:text-[30px] font-black text-[#222222]">
                                                {(product.price === 0) ? "별도 문의" : `${(product.price || 0).toLocaleString()}원`}
                                            </span>
                                            {product.price !== 0 && product.priceUnit && (
                                                <span className="text-[14px] text-[#888888] font-semibold ml-1">/{product.priceUnit}</span>
                                            )}
                                        </div>
                                        {/* 비회원 가격 할인 홍보 문구 */}
                                        {product.price !== 0 && product.businessPrice && (
                                            <div className="flex flex-wrap items-center gap-2 mt-1 py-3 px-4 bg-slate-50 border border-slate-200 rounded-lg shadow-sm">
                                                <span className="text-[13px] font-bold text-slate-700">사업자 전용 혜택가:</span>
                                                <span className="text-[18px] md:text-[20px] font-black text-[#c8221f]">
                                                    사업자 회원 전용
                                                </span>
                                                <span className="text-[11px] bg-red-100 text-[#c8221f] px-1.5 py-0.5 rounded font-black ml-1 border border-red-200">
                                                    사업자 가입 시 최대 {Math.round((1 - product.businessPrice / product.price) * 100)}% 할인
                                                </span>
                                                <Link to="/register" className="ml-auto text-[12px] font-bold text-slate-500 hover:text-[#c8221f] transition-all flex items-center gap-1 border border-slate-300 hover:border-[#c8221f] hover:bg-red-50 bg-white px-2.5 py-1 rounded">
                                                    <span className="material-symbols-outlined text-[14px]">lock</span>
                                                    가입하고 할인받기
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <p className="text-[13px] text-rose-600 font-bold bg-rose-50 w-fit px-3 py-1 rounded-md border border-rose-100 mt-1">
                                {product.price === 0 ? "※ 시공 면적 및 조건에 따라 가격이 상이하오니 별도 문의 바랍니다." : "※ 부가세(VAT) 10% 별도 금액입니다."}
                            </p>
                        </div>

                        {/* 간략 스펙 */}
                        <div className="mb-6 bg-[#fafafa] rounded-lg border border-[#e8e8e8] overflow-hidden">
                            {/* 재고 정보 영역 */}
                            <div className="flex items-center px-4 py-3 border-b border-[#eeeeee] bg-slate-50/50">
                                <span className="w-20 text-[#222222] font-black text-[13px] shrink-0 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[15px] text-slate-400">inventory_2</span>
                                    재고현황
                                </span>
                                <div className="text-[13px] tracking-tight">
                                    {product.inventory != null ? (
                                        product.inventory > 0 ? (
                                            <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]"></span>
                                                현재 {product.inventory} (구매 가능)
                                            </span>
                                        ) : (
                                            <span className="font-bold text-rose-600 flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_4px_rgba(244,63,94,0.5)]"></span>
                                                일시 품절 (재고 0)
                                                {product.restockDate ? (
                                                    <span className="text-slate-600 font-medium ml-1.5 bg-white px-2 py-0.5 rounded border border-rose-100 shadow-sm text-[12px]">
                                                        입고 예정일: <span className="text-rose-600 font-black">{product.restockDate}</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 font-medium ml-1.5 text-[12px]">
                                                        입고 일정 미정 (문의 바람)
                                                    </span>
                                                )}
                                            </span>
                                        )
                                    ) : (
                                        <span className="font-medium text-slate-500 flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                                            재고 현황 확인 중
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center px-4 py-3 border-b border-[#eeeeee]">
                                <span className="w-20 text-[#888888] font-semibold text-[13px] shrink-0">사이즈</span>
                                <span className="text-[#222222] font-bold text-[13px] tracking-tight">{formatSpecSize(product.specifications?.size, product.thickness) || '-'}</span>
                            </div>
                            <div className="flex items-center px-4 py-3 border-b border-[#eeeeee]">
                                <span className="w-20 text-[#888888] font-semibold text-[13px] shrink-0">색상</span>
                                <div className="text-[#222222] font-bold text-[13px] tracking-tight">
                                    {renderColor(product)}
                                </div>
                            </div>
                            <div className="flex items-center px-4 py-3 border-b border-[#eeeeee]">
                                <span className="w-20 text-[#888888] font-semibold text-[13px] shrink-0">제품코드</span>
                                <span className="text-[#222222] font-bold text-[13px] tracking-tight">{product.model_id || '-'}</span>
                            </div>
                            {product.specifications?.packaging && (
                                <div className="flex items-center px-4 py-3">
                                    <span className="w-20 text-[#888888] font-semibold text-[13px] shrink-0">포장단위</span>
                                    <span className="text-[#222222] font-bold text-[13px] tracking-tight">{product.specifications.packaging}</span>
                                </div>
                            )}
                        </div>

                        {/* 품절 시 추가 경고 안내 */}
                        {product.inventory === 0 && (
                            <div className="mb-4 p-4 bg-rose-50 border border-rose-100 rounded-lg flex items-start gap-3 shadow-sm">
                                <span className="material-symbols-outlined text-rose-500 text-xl font-bold mt-0.5">error</span>
                                <div>
                                    <p className="text-rose-800 font-black text-[14px] mb-1">현재 품절되어 예약 구매만 가능합니다.</p>
                                    <p className="text-rose-700 text-[12px] leading-relaxed">
                                        장바구니에 담고 결제를 진행하실 수 있으며, {product.restockDate ? `입고 예정일(${product.restockDate})` : '새고 입고'} 이후부터 배송 및 수령이 가능합니다. 결제 화면에서 날짜를 지정해주세요.
                                    </p>
                                    {product.restockDate && (
                                        <p className="text-rose-700 text-[12px] mt-1.5 font-bold flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                            입고 예정일: {product.restockDate}
                                        </p>
                                    )}
                                    <p className="text-slate-600 text-[12px] mt-1 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">call</span>
                                        재고 문의: 070-4193-1234
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* 재고 부족 경고 */}
                        {isLowStock && (
                            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3 shadow-sm">
                                <span className="material-symbols-outlined text-amber-600 text-xl font-bold mt-0.5">warning</span>
                                <div>
                                    <p className="text-amber-800 font-black text-[14px] mb-1">⚠️ 재고가 부족합니다 (현재 {product.inventory}개 남음)</p>
                                    <p className="text-amber-700 text-[12px] leading-relaxed">
                                        필요한 수량이 부족할 수 있습니다. 아래 유사 상품도 함께 확인해보세요.
                                    </p>
                                    <p className="text-slate-600 text-[12px] mt-1 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">call</span>
                                        재고 문의: 070-4193-1234
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* 유사 상품 추천 섹션 */}
                        {similarProducts.length > 0 && (
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="material-symbols-outlined text-[20px] text-blue-600">recommend</span>
                                    <h3 className="text-[14px] font-black text-slate-900">📦 지금 바로 구매 가능한 유사 상품</h3>
                                </div>
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                    {similarProducts.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                navigate(`/product/${item.id}`);
                                                window.scrollTo(0, 0);
                                            }}
                                            className="flex-shrink-0 w-[140px] bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-blue-400 hover:shadow-md transition-all group text-left"
                                        >
                                            {/* 상품 이미지 */}
                                            <div className="relative w-full aspect-square bg-[#f5f5f3] overflow-hidden">
                                                <img
                                                    src={item.imageUrl || '/assets/lxzin/no-image.png'}
                                                    alt={item.title}
                                                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                                    onError={(e) => {
                                                        e.target.src = '/assets/lxzin/no-image.png';
                                                        e.target.onerror = null;
                                                    }}
                                                />
                                                <div className="absolute top-1.5 right-1.5 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
                                                    유사도 {item.similarityPercent}%
                                                </div>
                                                <div className="absolute bottom-1.5 left-1.5 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-sm flex items-center gap-0.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                                                    재고 {item.inventory}개
                                                </div>
                                            </div>
                                            {/* 상품 정보 */}
                                            <div className="p-2.5">
                                                <p className="text-[10px] text-slate-400 truncate mb-0.5">{item.subCategory}</p>
                                                <p className="text-[12px] font-bold text-slate-800 truncate mb-1">{item.title}</p>
                                                <p className="text-[13px] font-black text-[#c8221f]">
                                                    {item.price?.toLocaleString()}원
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 수량 선택 */}
                        {product.price !== 0 && (() => {
                            const unitInfo = getProductUnit(product);
                            const effectivePrice = (isAuthenticated && isBusiness && product.businessPrice) ? product.businessPrice : product.price;

                            const isRollUnit = unitInfo.unit === 'R' && unitInfo.rollLength;
                            const isPrestigeUnit = unitInfo.isPrestigeUnit;
                            
                            const packagingArea = parseFloat(unitInfo.packaging || "1");
                            
                            let totalMetersOrArea = qty;
                            if (isRollUnit) totalMetersOrArea = qty * unitInfo.rollLength;
                            else if (isPrestigeUnit) totalMetersOrArea = Number((qty * packagingArea).toFixed(2));

                            let totalPrice = effectivePrice * qty;
                            if (isRollUnit || isPrestigeUnit) {
                                totalPrice = effectivePrice * totalMetersOrArea;
                            }

                            return (
                                <div className="mb-4 bg-[#fafafa] rounded-lg border border-[#e8e8e8] p-4">
                                    {(unitInfo.unit === 'R' || unitInfo.unit === 'M') && (
                                        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[#e8e8e8]">
                                            <span className="material-symbols-outlined text-[16px] text-amber-600">straighten</span>
                                            <span className="text-[12px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                                                M당 가격: {effectivePrice.toLocaleString()}원/M
                                            </span>
                                            {isRollUnit && (
                                                <span className="text-[11px] text-[#888888]">
                                                    (1롤 = {unitInfo.rollLength}M)
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    {isPrestigeUnit && (
                                        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[#e8e8e8]">
                                            <span className="material-symbols-outlined text-[16px] text-amber-600">straighten</span>
                                            <span className="text-[12px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                                                ㎡당 가격: {effectivePrice.toLocaleString()}원/㎡
                                            </span>
                                            <span className="text-[11px] text-[#888888]">
                                                (1박스 = {unitInfo.packaging})
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[13px] font-semibold text-[#555555]">{unitInfo.label}</span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setQty(prev => Math.max(1, prev - 1))}
                                                className="w-9 h-9 rounded-lg border border-[#ddd] flex items-center justify-center hover:bg-slate-100 transition-colors text-[#555] active:scale-95"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">remove</span>
                                            </button>
                                            <input
                                                type="number"
                                                min="1"
                                                value={qty}
                                                onChange={(e) => {
                                                    const v = parseInt(e.target.value);
                                                    if (!isNaN(v) && v >= 1) setQty(v);
                                                }}
                                                className="w-16 h-9 text-center text-[14px] font-bold border border-[#ddd] rounded-lg outline-none focus:border-[#c8221f] transition-colors bg-white [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                            />
                                            <button
                                                onClick={() => setQty(prev => prev + 1)}
                                                className="w-9 h-9 rounded-lg border border-[#ddd] flex items-center justify-center hover:bg-slate-100 transition-colors text-[#555] active:scale-95"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">add</span>
                                            </button>
                                        </div>
                                    </div>
                                    {isRollUnit && (
                                        <div className="flex items-center justify-between mb-2 px-1">
                                            <span className="text-[12px] text-blue-600 font-semibold">
                                                수량 {qty}롤 × {unitInfo.rollLength}M = {totalMetersOrArea}M
                                            </span>
                                        </div>
                                    )}
                                    {isPrestigeUnit && (
                                        <div className="flex items-center justify-between mb-2 px-1">
                                            <span className="text-[12px] text-blue-600 font-semibold">
                                                수량 {qty}박스 × {unitInfo.packaging} = {totalMetersOrArea}m²
                                            </span>
                                        </div>
                                    )}
                                    {unitInfo.sheetsPerBox > 0 && (
                                        <div className="flex items-center justify-between mb-2 px-1">
                                            <span className="text-[12px] text-blue-600 font-semibold">
                                                수량 {qty}Box × {unitInfo.sheetsPerBox}장 = {qty * unitInfo.sheetsPerBox}장{unitInfo.areaPerBox ? ` (${(qty * unitInfo.areaPerBox).toFixed(2)}m²)` : ''}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between pt-3 border-t border-[#e8e8e8]">
                                        <span className="text-[13px] text-[#888888]">
                                            합계 ({isRollUnit ? `${qty}롤 · ${totalMetersOrArea}M` : isPrestigeUnit ? `${qty}박스 · ${totalMetersOrArea}m²` : unitInfo.sheetsPerBox > 0 ? `${qty} Box · ${qty * unitInfo.sheetsPerBox}장${unitInfo.areaPerBox ? ` · ${(qty * unitInfo.areaPerBox).toFixed(2)}m²` : ''}` : `${qty} ${unitInfo.unit}`})
                                        </span>
                                        <span className="text-[20px] font-black text-[#c8221f]">
                                            {totalPrice.toLocaleString()}원
                                        </span>
                                    </div>
                                    {isAuthenticated && isBusiness && product.businessPrice && (
                                        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold">
                                            <span className="material-symbols-outlined text-[14px]">verified</span>
                                            사업자 회원가 적용 됨 (일반가 대비 {Math.round((1 - product.businessPrice / product.price) * 100)}% 할인)
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                        {/* 구매/장바구니 버튼 */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    const unitInfo = getProductUnit(product);
                                    const isRollUnit = unitInfo.unit === 'R' && unitInfo.rollLength;
                                    const cartQty = isRollUnit ? qty * unitInfo.rollLength : qty;
                                    setCartItem(product, cartQty);
                                    addToast(`장바구니에 ${isRollUnit ? `${qty}롤(${cartQty}M)` : `${qty}${unitInfo.unit}`} 담겼습니다.`);
                                }}
                                className="flex-1 py-3 bg-[#c8221f] text-white font-bold text-[13px] hover:bg-[#a51b18] transition-colors rounded-lg active:scale-[0.98]"
                            >
                                장바구니
                            </button>
                            <button
                                onClick={() => {
                                    const unitInfo = getProductUnit(product);
                                    const isRollUnit = unitInfo.unit === 'R' && unitInfo.rollLength;
                                    const cartQty = isRollUnit ? qty * unitInfo.rollLength : qty;
                                    setCartItem(product, cartQty);
                                    setQty(1);
                                    if (!isAuthenticated) {
                                        navigate('/login', { state: { from: { pathname: '/cart' } } });
                                    } else {
                                        navigate('/cart');
                                    }
                                }}
                                className="flex-1 py-3 bg-white border border-[#c8221f] text-[#c8221f] font-bold text-[13px] hover:bg-red-50 transition-colors rounded-lg active:scale-[0.98]"
                            >
                                바로구매
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 에디톤 스톤 용 상세 피처링 */}
            {isStone && !isSheet && (
                <div className="w-full">
                    <EditonStoneFeature />
                </div>
            )}

            {/* 시트 스탠다드 1.8(뉴청맥) 용 상세 피처링 */}
            {isSheet && isNuchungmak && (
                <div className="w-full">
                    <SheetStandard18Feature />
                </div>
            )}

            {/* 시트 스탠다드 2.0(은행목) 용 상세 피처링 */}
            {isSheet && isEunhaengmok && (
                <div className="w-full">
                    <SheetStandard20Feature />
                </div>
            )}

            {/* 시트 용 상세 피처링 (뉴청맥/은행목 외) */}
            {isSheet && !isNuchungmak && !isEunhaengmok && (
                <div className="w-full">
                    <SheetFeature subtitle={product.subtitle} />
                </div>
            )}

            {/* 타일 용 상세 피처링 */}
            {isTile && !isTileStandard && (
                <div className="w-full">
                    <TileFeature />
                </div>
            )}

            {/* 타일 스탠다드 용 상세 피처링 */}
            {isTileStandard && (
                <div className="w-full">
                    <TileStandardFeature />
                </div>
            )}

            {/* 상업용 LVT 용 상세 피처링 */}
            {isCommercialBotanic && (
                <div className="w-full">
                    <CommercialBotanicFeature />
                </div>
            )}
            {isCommercialEcono && (
                <div className="w-full">
                    <CommercialEconoFeature />
                </div>
            )}
            {isCommercialPrestige && (
                <div className="w-full">
                    <CommercialPrestigeFeature />
                </div>
            )}

            {/* 강마루 프리미엄 합판 용 상세 피처링 */}
            {isMaru && isMaruPremium && !isStone && !isSheet && (
                <div className="w-full">
                    <MaruPremiumFeature />
                </div>
            )}

            {/* 에디톤 마루 용 상세 피처링 */}
            {isMaru && !isMaruPremium && !isStone && !isSheet && (
                <div className="w-full">
                    <EditonWoodFeature />
                </div>
            )}

            {/* 하단 고정 최근 본 상품 바 */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-3 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
                <div className="max-w-7xl mx-auto flex items-center gap-6">
                    <div className="flex-shrink-0 hidden md:block">
                        <p className="text-[14px] font-bold text-slate-900 border-l-4 border-[#c8221f] pl-3">최근 본 상품</p>
                        <p className="text-[11px] text-slate-400 pl-3">방문하신 상품 목록</p>
                    </div>

                    <div className="flex-1 overflow-x-auto scrollbar-hide">
                        <div className="flex gap-4 items-center min-w-max px-2">
                            {recentProducts.map((item) => {
                                const itemOutOfStock = item.inventory != null && item.inventory <= 0;
                                return (
                                    <div key={item.id} className="relative group">
                                        <button
                                            onClick={() => {
                                                navigate(`/product/${item.id}`);
                                                window.scrollTo(0, 0);
                                            }}
                                            className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-[#f7f7f7] rounded-lg overflow-hidden border transition-all group-hover:scale-105 active:scale-95 shadow-sm ${
                                                itemOutOfStock ? 'border-rose-300 opacity-75' : 'border-slate-100 group-hover:border-[#c8221f]'
                                            }`}
                                            title={item.title}
                                        >
                                            <img
                                                src={item.imageUrl || '/assets/lxzin/no-image.png'}
                                                alt={item.title}
                                                className={`w-full h-full object-cover mix-blend-multiply ${itemOutOfStock ? 'grayscale-[40%]' : ''}`}
                                                onError={(e) => {
                                                    e.target.src = '/assets/lxzin/no-image.png';
                                                    e.target.onerror = null;
                                                }}
                                            />
                                            {itemOutOfStock && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                    <span className="text-[10px] font-black text-white bg-rose-600 px-2 py-0.5 rounded shadow">품절</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-x-0 bottom-0 bg-black/40 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-[9px] text-white text-center truncate px-1">{item.title}</p>
                                            </div>
                                        </button>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                useProductStore.getState().removeRecentProduct(item.id);
                                            }}
                                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-[#c8221f] hover:border-[#c8221f] shadow-sm z-10 transition-colors"
                                            title="제거"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* 메인 이미지 확대 모달 */}
            {isImageModalOpen && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-10 cursor-zoom-out backdrop-blur-sm"
                    onClick={() => setIsImageModalOpen(false)}
                >
                    <button
                        className="absolute top-4 right-4 md:top-8 md:right-8 text-white/50 hover:text-white transition-colors p-2"
                        onClick={(e) => { e.stopPropagation(); setIsImageModalOpen(false); }}
                        aria-label="닫기"
                    >
                        <span className="material-symbols-outlined text-4xl md:text-5xl">close</span>
                    </button>
                    <img
                        src={product.imageUrl || '/assets/lxzin/no-image.png'}
                        alt={product.title}
                        className="max-w-full max-h-full object-contain shadow-2xl cursor-default"
                        onClick={(e) => e.stopPropagation()}
                        onError={(e) => {
                            e.target.src = '/assets/lxzin/no-image.png';
                            e.target.onerror = null;
                        }}
                    />
                </div>
            )}
        </main>
    );
}
