import { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useProductStore } from '../store/useProductStore';
import { useCartStore } from '../store/useCartStore';
import { useToastStore } from '../store/useToastStore';
import { useAuthStore } from '../store/useAuthStore';
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

// 에디톤 마루 상세 이미지 목록 (순서대로) - 실제 다운로드 성공 파일만 포함
const MARU_LAYERS = [
    { id: 'surface', num: '01', title: '무광 효과 표면층', desc: '무광 UV 코팅으로 반사광을 줄여 눈의 피로도를 낮추고 고급스러운 질감을 제공합니다.', color: 'bg-[#E5E7EB]' },
    { id: 'transparent', num: '02', title: '고내구 투명층', desc: '고강도 투명 레이어가 디자인층을 보호하며 스크래치와 찍힘을 방지합니다.', color: 'bg-[#F3F4F6]/80' },
    { id: 'design', num: '03', title: '고해상 디자인층', desc: 'TrueView 디지털 인쇄 기술로 천연 소재의 섬세한 패턴을 구현합니다.', color: 'bg-[#D2B48C]' },
    { id: 'nsc', num: '04', title: 'NSC(T&G)', numLabel: 'NSC(Natural Stone Core)', desc: '석재를 분쇄 후, 고분자 수지와 고온 고압으로 압축한 고강도 보드판입니다.', color: 'bg-[#8B7355]' },
    { id: 'adhesive', num: '05', title: '전용 접착제', desc: '친환경 전용 접착제를 사용하여 안정적인 시공 품질을 보장합니다.', color: 'bg-[#4A5D4E]' }
];

// 시공사례 이미지
const INTERIOR_IMAGES = [
    { src: '/assets/lxzin/maru_detail/interior-01.png', title: '강릉시 강릉교동롯데캐슬1단지', desc: '우드 톤의 강마루로 따스함을 더한 58평' },
    { src: '/assets/lxzin/maru_detail/interior-02.png', title: '하남시 신장동 명지캐럿108(주상복합)', desc: '에디톤 마루로 따스함을 더한 34평' },
    { src: '/assets/lxzin/maru_detail/interior-03.png', title: '하남시 덕풍동 하남더샵센트럴뷰', desc: '화이트&우드 톤으로 따스함을 더한 33평' },
    { src: '/assets/lxzin/maru_detail/interior-04.png', title: '평창군 대관령면 메이힐스', desc: '한쪽 벽면의 상부장을 걷어내 개방감을 살린 25평' },
    { src: '/assets/lxzin/maru_detail/interior-05.jpg', title: '용인시 래미안수지이스트파크', desc: '취미를 위해 고급스러운 홈카페를 완성한 32평' },
    { src: '/assets/lxzin/maru_detail/interior-06.jpg', title: '서대문 센트레빌', desc: '유행보다 실용성과 수납에 집중한 4인 가족의 화이트우드 41평' },
    { src: '/assets/lxzin/maru_detail/interior-07.jpg', title: '경기도 광주시 양벌동 대주파크빌', desc: '슬림한 뷰프레임 창호로 교체 시공한 33평' },
];

// 에디톤 스톤 스펙
const STONE_SPEC = {
    '총 두께': '6.0 mm',
    '규격': '150(W) × 800(L) mm',
    '포장 단위': '10 pcs / box (1.2 m²)',
    '재질': 'SPC (Stone Polymer Composite) + IXPE',
    '시공 방식': '클릭형 무본드 시공',
    '품질 보증': '주거용 10년 품질 보증',
};

const formatSpecSize = (size, thickness) => {
    if (!size) return '';
    // 이미 "mm(T) × mm(W)" 형식이면 그대로 반환
    if (size.includes('mm(T)') && size.includes('mm(W)')) return size;
    if (size.includes('(W)') && !size.includes('주문수량')) return size;
    // "7.5T * 125W * 1200L" 형식 (T, W, L 모두 포함) → 완전한 규격이므로 그대로 반환
    if (/\d+(\.\d+)?T\s*\*\s*\d+W\s*\*\s*\d+L/i.test(size)) return size;
    // "1.8T X 1,830W X 35m(L)" 형식 → mm 추가 + 35m(L) 유지
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
    // "1,830mm x 주문수량" → "2.2mm(T) × 1,830mm(W)"
    if (size.includes('주문수량')) {
        const wMatch = size.match(/([\d,]+)\s*mm/i);
        const w = wMatch ? wMatch[1] : '1,830';
        const tStr = thickness ? `${parseFloat(thickness).toFixed(1)}mm(T) × ` : '';
        return `${tStr}${w}mm(W)`;
    }
    // "1830 x 920" 같은 일반 형식
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
    if (t.includes('허니') || t.includes('위트')) return { name: '허니브라운', hex: '#c9a96e' };
    if (t.includes('블론드')) return { name: '라이트베이지', hex: '#d4c4a8' };
    if (t.includes('새들러')) return { name: '미디엄브라운', hex: '#9a7b5b' };
    if (t.includes('스모크')) return { name: '다크브라운', hex: '#6b5344' };
    if (t.includes('유러피안')) return { name: '내추럴우드', hex: '#b08d6e' };
    if (t.includes('클린')) return { name: '라이트그레이', hex: '#c8c0b8' };
    if (t.includes('밀')) return { name: '웜그레이', hex: '#a89e94' };
    if (t.includes('솔티 애쉬') || t.includes('솔티애쉬')) return { name: '애쉬그레이', hex: '#b0a89e' };
    if (t.includes('솔티 크림') || t.includes('솔티크림')) return { name: '크림화이트', hex: '#f0ece4' };
    if (t.includes('솔티 브라운') || t.includes('솔티브라운')) return { name: '웜브라운', hex: '#8e7260' };
    if (t.includes('오닉스')) return { name: '화이트', hex: '#f5f4ef' };
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
    if (t.includes('솔트')) return { name: '내추럴', hex: '#c4b498' };
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

    // specifications.color가 있으면 우선 사용
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

export default function FlooringProductDetailView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const product = useProductStore((state) => state.getProductById(id || 'res-001'));
    const initProducts = useProductStore((state) => state.initProducts);
    const { user, isAuthenticated } = useAuthStore();
    const addToCart = useCartStore((state) => state.addToCart);
    const { addToast } = useToastStore();
    const products = useProductStore(state => state.products);
    const recentProductIds = useProductStore(state => state.recentProducts);
    const recentProducts = useMemo(() =>
        recentProductIds.map(id => products.find(p => p.id === id)).filter(Boolean)
        , [recentProductIds, products]);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const isBusiness = user?.role === 'business';

    useEffect(() => {
        initProducts();
    }, [initProducts]);

    // 최근 본 상품 추가
    useEffect(() => {
        if (product && id) {
            useProductStore.getState().addRecentProduct(id);
        }
    }, [id, product]);

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
                    뒤로가기
                </button>

                <div className="flex items-center justify-center gap-2 text-[14px] text-slate-400">
                    <Link className="hover:underline" to="/">홈</Link>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <Link className="hover:underline" to={isCommercial ? "/category/commercial" : "/category/residential"}>
                        {isCommercial ? "바닥재(상업)" : "바닥재(주거)"}
                    </Link>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <span className="text-slate-500">{product.subCategory || product.subtitle?.split(' | ')[0]}</span>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <span className="text-slate-900 font-semibold">{product.title}</span>
                </div>
            </div>

            {/* 상단 제품 섹션 - 이미지 좌측 / 정보 우측 그리드 */}
            <div className="max-w-[1280px] mx-auto px-4 md:px-10 pt-8 pb-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* 좌측: 메인 이미지 */}
                    <div className="flex flex-col items-center">
                        <button
                            onClick={() => setIsImageModalOpen(true)}
                            className="bg-[#f5f5f3] w-full aspect-[4/3] overflow-hidden group relative cursor-zoom-in rounded-2xl shadow-sm border border-slate-100"
                            aria-label="큰 이미지 보기"
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

                    {/* 우측: 제품 정보 */}
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
                            <div className="flex items-baseline gap-2">
                                {isAuthenticated && isBusiness ? (
                                    <>
                                        <span className="text-[14px] text-slate-400 line-through">
                                            {(product.price || 0).toLocaleString()}원
                                        </span>
                                        <span className="text-[26px] md:text-[30px] font-black text-[#c8221f]">
                                            {(product.businessPrice || 0).toLocaleString()}원
                                        </span>
                                        <span className="text-[12px] font-bold text-[#c8221f] bg-red-50 px-2 py-0.5 rounded">
                                            사업자 회원가
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-[14px] text-[#888888] font-semibold mr-2">{product.priceLabel || '판매금액:'}</span>
                                        <span className="text-[26px] md:text-[30px] font-black text-[#222222]">
                                            {(product.price === 0) ? "별도 문의" : `${(product.price || 0).toLocaleString()}원`}
                                        </span>
                                        {product.price !== 0 && product.priceUnit && (
                                            <span className="text-[14px] text-[#888888] font-semibold ml-1">/{product.priceUnit}</span>
                                        )}
                                    </>
                                )}
                            </div>
                            <p className="text-[13px] text-rose-600 font-bold bg-rose-50 w-fit px-3 py-1 rounded-md border border-rose-100 mt-1">
                                {product.price === 0 ? "※ 시공 면적 및 조건에 따라 가격이 상이하오니 별도 문의 바랍니다." : "※ 부가세(VAT) 10% 별도 금액입니다."}
                            </p>
                        </div>

                        {/* 간략 스펙 */}
                        <div className="mb-6 bg-[#fafafa] rounded-lg border border-[#e8e8e8] overflow-hidden">
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
                            <div className="flex items-center px-4 py-3">
                                <span className="w-20 text-[#888888] font-semibold text-[13px] shrink-0">제품코드</span>
                                <span className="text-[#222222] font-bold text-[13px] tracking-tight">{product.model_id || '-'}</span>
                            </div>
                        </div>

                        {/* 구매/장바구니 버튼 */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => { addToCart(product); addToast('장바구니에 담겼습니다.'); }}
                                className="flex-1 py-3 bg-[#c8221f] text-white font-bold text-[13px] hover:bg-[#a51b18] transition-colors rounded-lg"
                            >
                                장바구니
                            </button>
                            <button
                                onClick={() => {
                                    addToCart(product);
                                    if (!isAuthenticated) {
                                        navigate('/login', { state: { from: { pathname: '/cart' } } });
                                    } else {
                                        navigate('/cart');
                                    }
                                }}
                                className="flex-1 py-3 bg-white border border-[#c8221f] text-[#c8221f] font-bold text-[13px] hover:bg-red-50 transition-colors rounded-lg"
                            >
                                바로구매
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ 에디톤 스톤 전용 상세 렌더링 (통이미지) ═══ */}
            {isStone && (
                <div className="w-full">
                    <EditonStoneFeature />
                </div>
            )}

            {/* ═══ 시트 스탠다드 1.8(뉴청맥) 전용 상세 렌더링 ═══ */}
            {isSheet && isNuchungmak && (
                <div className="w-full">
                    <SheetStandard18Feature />
                </div>
            )}

            {/* ═══ 시트 스탠다드 2.0(은행목) 전용 상세 렌더링 ═══ */}
            {isSheet && isEunhaengmok && (
                <div className="w-full">
                    <SheetStandard20Feature />
                </div>
            )}

            {/* ═══ 시트 전용 상세 렌더링 (뉴청맥/은행목 외) ═══ */}
            {isSheet && !isNuchungmak && !isEunhaengmok && (
                <div className="w-full">
                    <SheetFeature subtitle={product.subtitle} />
                </div>
            )}

            {/* ═══ 타일 전용 상세 렌더링 ═══ */}
            {isTile && !isTileStandard && (
                <div className="w-full">
                    <TileFeature />
                </div>
            )}

            {/* ═══ 타일 스탠다드 전용 상세 렌더링 ═══ */}
            {isTileStandard && (
                <div className="w-full">
                    <TileStandardFeature />
                </div>
            )}

            {/* ═══ 상업용 LVT 전용 상세 렌더링 ═══ */}
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

            {/* ═══ 강마루 프리미엄 합판 전용 상세 렌더링 ═══ */}
            {isMaru && isMaruPremium && !isStone && !isSheet && (
                <div className="w-full">
                    <MaruPremiumFeature />
                </div>
            )}

            {/* ═══ 에디톤 마루 전용 상세 렌더링 ═══ */}
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
                            {recentProducts.map((item) => (
                                <div key={item.id} className="relative group">
                                    <button
                                        onClick={() => {
                                            navigate(`/product/${item.id}`);
                                            window.scrollTo(0, 0);
                                        }}
                                        className="relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-[#f7f7f7] rounded-lg overflow-hidden border border-slate-100 group-hover:border-[#c8221f] transition-all group-hover:scale-105 active:scale-95 shadow-sm"
                                        title={item.title}
                                    >
                                        <img
                                            src={item.imageUrl || '/assets/lxzin/no-image.png'}
                                            alt={item.title}
                                            className="w-full h-full object-cover mix-blend-multiply"
                                            onError={(e) => {
                                                e.target.src = '/assets/lxzin/no-image.png';
                                                e.target.onerror = null;
                                            }}
                                        />
                                        <div className="absolute inset-x-0 bottom-0 bg-black/40 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <p className="text-[9px] text-white text-center truncate px-1">{item.title}</p>
                                        </div>
                                    </button>

                                    {/* 삭제 버튼 */}
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
                            ))}
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
