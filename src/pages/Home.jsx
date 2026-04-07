import { Link } from 'react-router-dom';
import { useProductStore } from '../store/useProductStore';
import { useAuthStore } from '../store/useAuthStore';
import { useState, useEffect } from 'react';
import { getHomepageContent } from '../services/adminService';

export default function Home() {
    const { products, initProducts } = useProductStore();
    const { user, isAuthenticated } = useAuthStore();
    const isBusiness = user?.role === 'business';
    const featuredProducts = products.filter(p => p.tags?.includes('인기')).length > 0 
        ? products.filter(p => p.tags?.includes('인기')).slice(0, 8)
        : products.slice(0, 8);

    const [cmsData, setCmsData] = useState(null);

    useEffect(() => {
        initProducts(); // Ensure products are loaded
        const fetchCMS = async () => {
            try {
                const data = await getHomepageContent();
                setCmsData(data);
            } catch (error) {
                console.error("Failed to load CMS content:", error);
            }
        };
        fetchCMS();
    }, [initProducts]);

    // 기본값 설정 (Fallback)
    const hero = cmsData?.hero || {
        title_top: "데일리하우징",
        title_bottom: "압도적 대량 매입으로 최상의 가격 경쟁력",
        subtitle1: "품질로 증명하고 가격으로 응답합니다. 바닥재 전문 파트너 데일리하우징",
        subtitle2: "대한민국 바닥재 유통의 기준, 데일리하우징이 함께합니다."
    };

    const stats = cmsData?.stats?.length > 0 ? cmsData.stats : [
        { value: '1,200+', label: '시공 완료', icon: 'construction' },
        { value: '350+', label: '파트너 업체', icon: 'handshake' },
        { value: '15년+', label: '업계 경력', icon: 'workspace_premium' },
        { value: '98%', label: '고객 만족도', icon: 'thumb_up' },
    ];

    const defaultStrengths = [
        { icon: 'verified', title: 'LX Z:IN 공식 유통', desc: '검증된 공식 유통 채널을 통해 정품만을 취급합니다. 품질 보증과 A/S까지 책임집니다.', accent: 'from-[#d4a853] to-[#b8923e]' },
        { icon: 'engineering', title: '전문 시공 지원', desc: '15년 이상 경력의 시공 전문가가 현장 방문 측정부터 시공 완료까지 동행합니다.', accent: 'from-[#6366f1] to-[#4f46e5]' },
        { icon: 'local_shipping', title: '당일 견적 · 빠른 배송', desc: '문의 당일 맞춤 견적을 제공하며, 수도권 기준 3일 이내 배송을 보장합니다.', accent: 'from-[#10b981] to-[#059669]' },
        { icon: 'payments', title: '사업자 전용 특가', desc: '사업자 인증 시 일반가 대비 최대 40% 할인된 B2B 전용 단가를 적용받으실 수 있습니다.', accent: 'from-[#f59e0b] to-[#d97706]' },
    ];
    const strengths = (cmsData?.strengths?.length > 0 ? cmsData.strengths : defaultStrengths).map((s, i) => ({ ...defaultStrengths[i], ...s }));

    const defaultB2b = {
        title1: '사업자라면,',
        title2: '지금 바로 파트너가 되세요',
        desc: '사업자등록증 인증 한 번으로 B2B 전용 특가를 만나보세요. 전담 매니저가 프로젝트별 맞춤 견적과 시공 지원을 제공합니다.',
        features: [
            { icon: 'sell', text: 'B2B 전용 단가 최대 40% 할인', sub: '사업자 인증 즉시 적용' },
            { icon: 'person_pin', text: '전담 매니저 1:1 배정', sub: '견적부터 시공까지 원스톱' },
            { icon: 'local_shipping', text: '대량 주문 무료 배송', sub: '수도권 3일 이내 도착' },
            { icon: 'security', text: '정품 보증 & A/S 지원', sub: 'LX Z:IN 공식 품질 보증' },
        ]
    };
    const b2b = cmsData?.b2b ? { ...defaultB2b, ...cmsData.b2b, features: cmsData.b2b.features?.length > 0 ? cmsData.b2b.features : defaultB2b.features } : defaultB2b;

    return (
        <main className="flex-1 bg-white">

            {/* =============================================
                SECTION 1: Hero Banner
            ============================================= */}
            <section className="relative min-h-[480px] sm:min-h-[680px] lg:min-h-[900px] w-full overflow-hidden bg-black flex flex-col">
                {/* Background Image Container - keeps image across whole section */}
                <div className="absolute inset-0 h-full w-full">
                    <img
                        src="/assets/images/hero_banner_2.png"
                        alt="Bright Premium Flooring Interior"
                        className="h-full w-full object-cover opacity-100"
                        loading="lazy"
                    />
                </div>

                {/* Main Content Area */}
                <div className="relative z-10 flex-1 flex items-start pt-6 sm:pt-12 lg:pt-24 px-3 sm:px-6 lg:px-16 xl:px-24">
                    <div className="w-full max-w-2xl rounded-xl sm:rounded-2xl lg:rounded-[32px] bg-white/40 backdrop-blur-xl p-3.5 sm:p-8 lg:p-10 border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)] ring-1 ring-white/10 mb-4 sm:mb-12">
                        {/* Badge */}
                        <div className="mb-3 sm:mb-5 inline-flex items-center gap-2 rounded-full bg-slate-900/5 px-3 sm:px-4 py-1 sm:py-1.5 border border-slate-900/10">
                            <span className="h-2 w-2 rounded-full bg-[#d4a853] animate-pulse shadow-sm"></span>
                            <span className="text-[12px] sm:text-[13px] font-semibold tracking-tight text-slate-700">LX <span className="text-red-600">Z:IN</span> 공식 유통 파트너</span>
                        </div>

                        {/* Headline */}
                        <h1 className="mb-4 sm:mb-6 font-black tracking-normal break-keep flex flex-col gap-2 sm:gap-4" style={{ lineHeight: 1.3 }}>
                            <span className="text-[36px] sm:text-6xl lg:text-7xl text-slate-900 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent pb-1 drop-shadow-sm">
                                {(hero.title_top || "데일리하우징").split('하우징').map((part, i, arr) => (
                                    <span key={i}>
                                        {part}
                                        {i < arr.length - 1 && <span className="text-[#d4a853]">하우징</span>}
                                    </span>
                                ))}
                            </span>
                            <span className="text-[18px] sm:text-3xl lg:text-[42px] text-slate-800 mt-0.5 sm:mt-1 leading-snug sm:leading-tight break-keep">
                                {hero.title_bottom || "압도적 대량 매입으로 최상의 가격 경쟁력"}
                            </span>
                        </h1>

                        {/* Subtext */}
                        <div className="flex flex-col gap-2.5 sm:gap-3 mt-3 sm:mt-5">
                            <div className="group flex items-center gap-2.5 sm:gap-3 bg-gradient-to-r from-white/70 to-white/50 backdrop-blur-md px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-white/70 shadow-lg shadow-black/5 hover:from-white/90 hover:to-white/70 hover:shadow-xl transition-all duration-300">
                                <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-[#d4a853] to-[#b8923e] flex items-center justify-center shadow-md shadow-[#d4a853]/20">
                                    <span className="material-symbols-outlined text-white text-[14px] sm:text-[16px] font-bold">check</span>
                                </div>
                                <p className="text-[13px] sm:text-[16px] lg:text-[17px] font-semibold text-slate-700 leading-snug break-keep tracking-tight">
                                    {hero.subtitle1.split('하우징').map((part, i, arr) => i < arr.length - 1 ? <span key={i}>{part}<span className="text-[#d4a853] font-bold">하우징</span></span> : part)}
                                </p>
                            </div>
                            <div className="group flex items-center gap-2.5 sm:gap-3 bg-gradient-to-r from-white/70 to-white/50 backdrop-blur-md px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-white/70 shadow-lg shadow-black/5 hover:from-white/90 hover:to-white/70 hover:shadow-xl transition-all duration-300">
                                <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-[#d4a853] to-[#b8923e] flex items-center justify-center shadow-md shadow-[#d4a853]/20">
                                    <span className="material-symbols-outlined text-white text-[14px] sm:text-[16px] font-bold">check</span>
                                </div>
                                <p className="text-[13px] sm:text-[16px] lg:text-[17px] font-semibold text-slate-700 leading-snug break-keep tracking-tight lg:whitespace-nowrap">
                                    {hero.subtitle2.split('하우징').map((part, i, arr) => i < arr.length - 1 ? <span key={i}>{part}<span className="text-[#d4a853] font-bold">하우징</span></span> : part)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Stats Bar - Static Positioning within flex-col to avoid overlap */}
                <div className="relative z-20 w-full bg-white/80 backdrop-blur-xl border-t border-slate-200 shadow-sm mt-auto">
                    <div className="px-4 sm:px-6 lg:px-16 xl:px-24 py-3 sm:py-6 grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-3 sm:gap-8">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="flex items-center gap-2 sm:gap-3">
                                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-[#d4a853]/10 shrink-0">
                                    <span className="material-symbols-outlined text-[17px] sm:text-[20px] text-[#d4a853]">{stat.icon}</span>
                                </div>
                                <div>
                                    <p className="text-base sm:text-xl font-bold text-slate-900 leading-none">{stat.value}</p>
                                    <p className="text-[11px] sm:text-[13px] font-medium text-slate-500 mt-0.5">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* =============================================
                SECTION 2: Category Showcase
            ============================================= */}
            <section className="bg-white py-12 sm:py-16 lg:py-32">
                <div className="px-4 sm:px-6 lg:px-16 xl:px-24">
                    <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                        <div className="section-divider mx-auto mb-4 sm:mb-5"></div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 lg:text-[44px] mb-3 sm:mb-5 break-keep" style={{ lineHeight: 1.5 }}>
                            제품 카테고리
                        </h2>
                        <p className="text-[15px] sm:text-[17px] lg:text-[19px] text-slate-500 font-normal max-w-2xl mx-auto leading-relaxed break-keep">
                            주거부터 상업 공간까지, 용도에 맞는 최적의 바닥재를 찾아보세요.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                        {/* Residential Card */}
                        <Link to="/category/residential" className="group relative overflow-hidden rounded-2xl sm:rounded-3xl h-[260px] sm:h-[380px] lg:h-[500px] bg-slate-100 border border-slate-200">
                            <img
                                src="/assets/images/products/res-001.jpg"
                                alt="주거용 바닥재"
                                className="absolute inset-0 h-full w-full object-cover opacity-80 mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/50 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 lg:p-12">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-1 sm:py-1.5 text-[12px] sm:text-[13px] font-medium text-slate-700 mb-2 sm:mb-4 border border-slate-300 shadow-sm">
                                    <span className="material-symbols-outlined text-[14px] sm:text-[16px] text-[#d4a853]">home</span>
                                    주거용
                                </span>
                                <h3 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 mb-1.5 sm:mb-3">주거용 바닥재</h3>
                                <p className="text-slate-600 font-normal text-[13px] sm:text-[16px] mb-3 sm:mb-6 max-w-md leading-relaxed hidden sm:block">에디톤 우드, 시트, 타일 등 LX Z:IN의 주거용 라인업을 만나보세요.</p>
                                <span className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-slate-900 text-white font-semibold text-[13px] sm:text-[15px] group-hover:bg-[#d4a853] transition-all shadow-lg group-hover:shadow-[#d4a853]/30">
                                    카탈로그 보기
                                    <span className="material-symbols-outlined text-[16px] sm:text-[18px]">arrow_forward</span>
                                </span>
                            </div>
                        </Link>

                        {/* Commercial Card */}
                        <Link to="/category/commercial" className="group relative overflow-hidden rounded-2xl sm:rounded-3xl h-[260px] sm:h-[380px] lg:h-[500px] bg-slate-100 border border-slate-200">
                            <img
                                src="/assets/images/products/com-001.jpg"
                                alt="상업용 바닥재"
                                className="absolute inset-0 h-full w-full object-cover opacity-80 mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/50 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 lg:p-12">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-1 sm:py-1.5 text-[12px] sm:text-[13px] font-medium text-slate-700 mb-2 sm:mb-4 border border-slate-300 shadow-sm">
                                    <span className="material-symbols-outlined text-[14px] sm:text-[16px] text-[#d4a853]">apartment</span>
                                    상업용
                                </span>
                                <h3 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 mb-1.5 sm:mb-3">상업용 바닥재 (LVT)</h3>
                                <p className="text-slate-600 font-normal text-[13px] sm:text-[16px] mb-3 sm:mb-6 max-w-md leading-relaxed hidden sm:block">프레스티지, 보타닉, 에코노플러스 — 상업 공간의 격을 높이는 LVT 컬렉션.</p>
                                <span className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-slate-900 text-white font-semibold text-[13px] sm:text-[15px] group-hover:bg-[#d4a853] transition-all shadow-lg group-hover:shadow-[#d4a853]/30">
                                    카탈로그 보기
                                    <span className="material-symbols-outlined text-[16px] sm:text-[18px]">arrow_forward</span>
                                </span>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* =============================================
                SECTION 3: Why Us — Core Strengths
            ============================================= */}
            <section className="bg-slate-50 py-12 sm:py-16 lg:py-32">
                <div className="px-4 sm:px-6 lg:px-16 xl:px-24">
                    {/* Section Header */}
                    <div className="text-center mb-8 sm:mb-12 lg:mb-20">
                        <div className="section-divider mx-auto mb-4 sm:mb-5"></div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 lg:text-[44px] mb-3 sm:mb-5 break-keep" style={{ lineHeight: 1.5 }}>
                            왜 <span className="text-[#d4a853]">데일리하우징</span>인가
                        </h2>
                        <p className="text-[15px] sm:text-[17px] lg:text-[19px] text-slate-500 font-normal max-w-2xl mx-auto leading-relaxed break-keep">
                            15년간 축적된 바닥재 유통 노하우로 사업자 고객에게 최적의 솔루션을 드립니다.
                        </p>
                    </div>

                    {/* Strength Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                        {strengths.map((item, idx) => (
                            <div key={idx} className="group relative bg-white rounded-2xl p-5 sm:p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-[#d4a853]/10 border border-slate-100 hover:border-[#d4a853]/30">
                                {/* Icon */}
                                <div className={`flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-gradient-to-br ${item.accent} mb-4 sm:mb-6 shadow-lg transition-transform group-hover:scale-110`}>
                                    <span className="material-symbols-outlined text-[22px] sm:text-[26px] text-white">{item.icon}</span>
                                </div>
                                <h3 className="text-[17px] sm:text-[20px] font-bold text-slate-900 mb-2 sm:mb-3">{item.title}</h3>
                                <p className="text-[14px] sm:text-[15px] leading-[1.7] text-slate-500 font-normal">{item.desc}</p>
                                {/* Decorative */}
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#d4a853]/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* =============================================
                SECTION 4: Featured / Best Products
            ============================================= */}
            <section className="bg-slate-50 py-12 sm:py-16 lg:py-32">
                <div className="px-4 sm:px-6 lg:px-16 xl:px-24">
                    <div className="flex items-end justify-between mb-8 sm:mb-12 lg:mb-16">
                        <div>
                            <div className="section-divider mb-3 sm:mb-5"></div>
                            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 lg:text-[44px] mb-2 sm:mb-3 break-keep" style={{ lineHeight: 1.5 }}>인기 제품</h2>
                            <p className="text-[14px] sm:text-[16px] font-normal text-slate-500 break-keep">가장 많은 사업자가 선택한 데일리하우징 추천 라인업</p>
                        </div>
                        <Link to="/category/residential" className="hidden md:flex items-center gap-2 text-[15px] font-semibold text-[#d4a853] hover:gap-3 px-5 py-2.5 rounded-lg bg-white shadow-sm border border-slate-200 transition-all hover:border-[#d4a853]">
                            전체 보기
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                        {featuredProducts.slice(0, 4).map((product) => (
                            <Link
                                key={product.id}
                                to={`/product/${product.id}`}
                                className="group block bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-[#d4a853] transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-[#d4a853]/10"
                            >
                                <div className="aspect-[4/3] w-full overflow-hidden bg-slate-50 relative">
                                    <img
                                        src={product.imageUrl}
                                        alt={product.title}
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                    <div className="absolute top-4 left-4 flex gap-1.5 text-[10px] md:text-[12px]">
                                        {product.tags?.slice(0, 2).map((tag, idx) => (
                                            <span key={idx} className="px-2 md:px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full font-semibold text-slate-700 shadow-sm border border-slate-200">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-4 md:p-5">
                                    <p className="text-[11px] md:text-[12px] font-semibold text-[#d4a853] tracking-wide mb-1 md:mb-1.5">{product.subCategory}</p>
                                    <h3 className="text-[15px] md:text-[17px] font-bold text-slate-900 group-hover:text-[#d4a853] transition-colors mb-1 md:mb-1.5 line-clamp-1">{product.title}</h3>

                                    {/* 재고 상태 뱃지 */}
                                    <div className="flex flex-wrap gap-1 mt-1 mb-2">
                                        {product.salesStatus === '일시 품절' ? (
                                            <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-[11px] font-bold border border-red-100 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[12px]">schedule</span>
                                                일시품절 {product.expectedDate ? `(입고예정: ${product.expectedDate})` : ''}
                                            </span>
                                        ) : product.salesStatus === '단종' ? (
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[11px] font-bold border border-gray-200">
                                                단종
                                            </span>
                                        ) : product.stock !== undefined ? (
                                            <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-[11px] font-bold border border-green-100 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[12px]">inventory_2</span>
                                                재고: {product.stock.toLocaleString()}개
                                            </span>
                                        ) : null}
                                    </div>

                                    {/* 가격 표시 추가 */}
                                    <div className="mt-3">
                                        <div className="flex flex-col gap-1.5 bg-slate-50 p-2.5 md:p-3 rounded-xl border border-slate-100 group-hover:border-red-100 transition-colors">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[11px] md:text-[12px] text-slate-500 font-medium">일반가</span>
                                                <div className="flex items-baseline gap-0.5">
                                                    <span className={`text-[12px] md:text-[13px] ${isAuthenticated && isBusiness ? 'line-through text-slate-400' : 'font-bold text-slate-900'}`}>
                                                        {product.price != null && product.price !== 0 ? `${product.price.toLocaleString()}원` : '별도 문의'}
                                                    </span>
                                                </div>
                                            </div>
                                            {product.businessPrice && product.price !== 0 && (
                                                <div className={`flex justify-between items-center p-1.5 md:p-2 rounded-lg border ${isAuthenticated && isBusiness ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200 group-hover:bg-red-50 group-hover:border-red-100 transition-colors'}`}>
                                                    <div className="flex items-center gap-1">
                                                        <span className={`text-[11px] md:text-[12px] font-bold ${isAuthenticated && isBusiness ? 'text-[#c0392b]' : 'text-slate-600 group-hover:text-[#c0392b]'}`}>사업자가</span>
                                                        <span className={`text-[10px] font-black px-1 rounded ${isAuthenticated && isBusiness ? 'text-white bg-[#c0392b]' : 'text-[#c0392b] bg-red-100 group-hover:bg-[#c0392b] group-hover:text-white transition-colors'}`}>
                                                            {isAuthenticated && isBusiness ? `${Math.round((1 - product.businessPrice / product.price) * 100)}% ↓` : '?% ↓'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-baseline gap-0.5">
                                                        {isAuthenticated && isBusiness ? (
                                                            <>
                                                                <span className="text-[13px] md:text-[15px] font-black text-[#c0392b]">
                                                                    {product.businessPrice.toLocaleString()}원
                                                                </span>
                                                                {product.priceUnit && <span className="text-[10px] text-slate-400">/{product.priceUnit}</span>}
                                                            </>
                                                        ) : (
                                                            <Link to="/register" className="text-[10px] md:text-[11px] font-bold text-[#d4a853] hover:underline">회원 전용</Link>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-slate-100">
                                        <span className="text-[12px] md:text-[14px] font-medium text-slate-400">{product.model_id}</span>
                                        <span className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400 border border-slate-200 group-hover:bg-[#d4a853] group-hover:border-[#d4a853] group-hover:text-white transition-all">
                                            <span className="material-symbols-outlined text-[14px] md:text-[16px] font-bold">arrow_forward</span>
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* =============================================
                SECTION 5: B2B Partner CTA
            ============================================= */}
            <section className="relative overflow-hidden bg-[#fafafa] py-16 sm:py-24 lg:py-36 border-y border-slate-100">
                {/* Modern Abstract Aurora Backgrounds */}
                <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] bg-gradient-to-br from-[#d4a853]/20 via-[#e9c67b]/10 to-transparent rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }}></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-sky-200/20 via-blue-100/10 to-transparent rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s' }}></div>
                
                <div className="relative z-10 px-4 sm:px-6 lg:px-16 xl:px-24">
                    <div className="flex flex-col lg:flex-row items-center gap-10 sm:gap-16 lg:gap-24">
                        {/* Text Content Area */}
                        <div className="flex-1 text-center lg:text-left relative">
                            {/* Decorative Sparkle */}
                            <div className="absolute -top-10 -left-10 w-20 h-20 bg-amber-100/60 blur-[30px] rounded-full hidden lg:block"></div>
                            
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/60 backdrop-blur-md px-4 py-2 border border-slate-200/60 mb-6 shadow-sm">
                                <span className="material-symbols-outlined text-[18px] text-[#d4a853]">workspace_premium</span>
                                <span className="text-[13px] sm:text-[14px] font-bold text-slate-700 tracking-wide">프리미엄 B2B 파트너십</span>
                            </div>
                            
                            <h2 className="text-3xl sm:text-4xl lg:text-[52px] font-black text-slate-900 mb-6 sm:mb-8 break-keep tracking-tight" style={{ lineHeight: 1.3 }}>
                                {b2b.title1}<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4a853] to-[#a37c35] drop-shadow-sm">{b2b.title2}</span>
                            </h2>
                            <p className="text-[16px] sm:text-[18px] lg:text-[20px] text-slate-500 font-medium mb-8 sm:mb-12 max-w-xl leading-[1.8] break-keep mx-auto lg:mx-0">
                                {b2b.desc}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center lg:justify-start">
                                <Link to="/register" className="relative group w-full sm:w-auto flex items-center justify-center gap-2.5 bg-slate-900 text-white px-8 sm:px-9 py-4 sm:py-4 rounded-full text-[16px] font-bold shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)] hover:scale-[1.02] transition-all duration-300">
                                    <span className="material-symbols-outlined text-[20px] text-[#d4a853]">badge</span>
                                    <span>무료 사업자 등록</span>
                                    {/* Hover Shine Effect */}
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700"></div>
                                </Link>
                                <Link to="/consultations/new" className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-white/80 backdrop-blur-sm text-slate-700 px-8 sm:px-9 py-4 sm:py-4 rounded-full text-[16px] font-bold border border-slate-200/80 shadow-sm hover:bg-white hover:shadow-md transition-all duration-300">
                                    <span className="material-symbols-outlined text-[20px] text-slate-400">support_agent</span>
                                    전화 상담
                                </Link>
                            </div>
                        </div>

                        {/* Trendy Bento Grid Features */}
                        <div className="flex-1 w-full relative">
                            {/* Grid container */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                {b2b.features.map((item, idx) => {
                                    // 완벽한 비율의 깔끔한 Material Solid Icon 세팅
                                    const icons = ['payments', 'support_agent', 'local_shipping', 'verified'];
                                    
                                    // Apple 스타일의 은은하고 세련된 아이콘 배경색
                                    const cardThemes = [
                                        { bg: 'bg-amber-50/80', iconBg: 'bg-gradient-to-br from-amber-400 to-amber-600', ring: 'ring-amber-100', text: 'text-amber-600' },
                                        { bg: 'bg-indigo-50/80', iconBg: 'bg-gradient-to-br from-indigo-400 to-indigo-600', ring: 'ring-indigo-100', text: 'text-indigo-600' },
                                        { bg: 'bg-emerald-50/80', iconBg: 'bg-gradient-to-br from-emerald-400 to-emerald-600', ring: 'ring-emerald-100', text: 'text-emerald-600' },
                                        { bg: 'bg-rose-50/80', iconBg: 'bg-gradient-to-br from-rose-400 to-rose-600', ring: 'ring-rose-100', text: 'text-rose-600' }
                                    ];

                                    const theme = cardThemes[idx % cardThemes.length];

                                    return (
                                        <div 
                                            key={idx} 
                                            className={`relative overflow-hidden group bg-white/70 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all duration-500`}
                                        >
                                            {/* Decorative Background Element */}
                                            <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full blur-[40px] opacity-40 ${theme.iconBg}`}></div>
                                            
                                            <div className="relative z-10 flex flex-col h-full">
                                                {/* Icon Box with Inner Glow & Solid Symbol */}
                                                <div className={`relative flex shrink-0 h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-[22px] shadow-lg ring-4 ${theme.ring} border border-white/20 mb-5 sm:mb-6 ${theme.iconBg} overflow-hidden group-hover:scale-[1.03] transition-transform duration-500`}>
                                                    {/* Inner Highlight Light */}
                                                    <div className="absolute top-0 right-0 w-10 h-10 bg-white/40 blur-[10px] rounded-full translate-x-2 -translate-y-2"></div>
                                                    {/* Material Symbol Solid (FILL 1) */}
                                                    <span 
                                                        className="material-symbols-outlined text-white drop-shadow-md relative z-10 text-[32px] sm:text-[38px]" 
                                                        style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}
                                                    >
                                                        {icons[idx]}
                                                    </span>
                                                </div>
                                                
                                                {/* Text Info */}
                                                <div>
                                                    <h3 className="text-[17px] sm:text-[19px] font-black text-slate-800 mb-2 leading-tight">
                                                        {item.text}
                                                    </h3>
                                                    <p className="text-[14px] sm:text-[15px] font-medium text-slate-500 leading-relaxed break-keep">
                                                        {item.sub}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =============================================
                SECTION 6: Trust & Statistics
            ============================================= */}
            <section className="bg-slate-50 py-10 sm:py-14 lg:py-24 border-t border-slate-200">
                <div className="px-4 sm:px-6 lg:px-16 xl:px-24">
                    <div className="text-center mb-8 sm:mb-12">
                        <h3 className="text-lg sm:text-xl font-bold text-slate-400 mb-2">Trusted by Professionals</h3>
                        <p className="text-[13px] sm:text-[15px] font-normal text-slate-400 break-keep">전국 350개 이상의 시공 파트너가 데일리하우징을 선택했습니다.</p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 lg:gap-20 opacity-30">
                        {['LX Z:IN', 'LX HAUSYS', 'KCC', 'HANSSEM', 'HYUNDAI L&C'].map((brand, idx) => (
                            <span key={idx} className="text-base sm:text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">{brand}</span>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
