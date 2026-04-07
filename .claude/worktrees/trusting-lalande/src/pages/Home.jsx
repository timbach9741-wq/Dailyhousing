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
        title_top: "데일리 하우징",
        title_bottom: "압도적 대량 매입으로 최상의 가격 경쟁력",
        subtitle1: "품질로 증명하고 가격으로 응답합니다. 바닥재 전문 파트너 데일리 하우징",
        subtitle2: "대한민국 바닥재 유통의 기준, 데일리 하우징이 함께합니다."
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
                                {(hero.title_top || "데일리 하우징").split(' ').map((word, i) => (
                                    <span key={i} className={word === '하우징' ? 'text-[#d4a853]' : ''}>
                                        {word}{' '}
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
                            왜 <span className="text-[#d4a853]">데일리 하우징</span>인가
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
                            <p className="text-[14px] sm:text-[16px] font-normal text-slate-500 break-keep">가장 많은 사업자가 선택한 데일리 하우징 추천 라인업</p>
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

                                    {/* 가격 표시 추가 */}
                                    <div className="mb-4">
                                        <div className="flex items-baseline gap-1.5">
                                            {isAuthenticated && isBusiness ? (
                                                <span className="text-[16px] md:text-[18px] font-black text-[#c0392b]">
                                                    {product.businessPrice != null ? `${product.businessPrice.toLocaleString()}원~` : '문의'}
                                                </span>
                                            ) : (
                                                <span className="text-[16px] md:text-[18px] font-black text-slate-900">
                                                    {product.price != null ? `${product.price.toLocaleString()}원~` : '문의'}
                                                </span>
                                            )}
                                            {product.priceUnit && <span className="text-[12px] text-slate-400 font-medium">/{product.priceUnit}</span>}
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
            <section className="relative overflow-hidden bg-white py-12 sm:py-16 lg:py-32 border-y border-slate-200">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03]">
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                </div>
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#d4a853]/10 rounded-full blur-[120px]"></div>

                <div className="relative z-10 px-4 sm:px-6 lg:px-16 xl:px-24">
                    <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-12 lg:gap-24">
                        <div className="flex-1 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 rounded-full bg-[#d4a853]/10 px-3 sm:px-4 py-1 sm:py-1.5 border border-[#d4a853]/30 mb-4 sm:mb-6 bg-white shadow-sm">
                                <span className="material-symbols-outlined text-[15px] sm:text-[16px] text-[#d4a853]">handshake</span>
                                <span className="text-[12px] sm:text-[13px] font-semibold text-[#d4a853]">B2B 파트너십</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl lg:text-[44px] font-extrabold text-slate-900 mb-4 sm:mb-6 break-keep" style={{ lineHeight: 1.5 }}>
                                {b2b.title1}<br />
                                <span className="text-[#d4a853]">{b2b.title2}</span>
                            </h2>
                            <p className="text-[15px] sm:text-[17px] lg:text-[19px] text-slate-500 font-normal mb-6 sm:mb-10 max-w-xl leading-relaxed break-keep">
                                {b2b.desc}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center lg:items-start">
                                <Link to="/register" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-[#d4a853] to-[#b8923e] text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-[15px] sm:text-[16px] font-semibold shadow-xl shadow-[#d4a853]/20 hover:shadow-2xl hover:shadow-[#d4a853]/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                    <span className="material-symbols-outlined text-[20px]">badge</span>
                                    무료 사업자 등록
                                </Link>
                                <Link to="/consultations/new" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-slate-700 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-[15px] sm:text-[16px] font-semibold border border-slate-200 shadow-sm hover:bg-slate-50 transition-all">
                                    <span className="material-symbols-outlined text-[20px] text-slate-500">call</span>
                                    전화 상담
                                </Link>
                            </div>
                        </div>

                        {/* Feature List */}
                        <div className="w-full lg:max-w-md space-y-3 sm:space-y-4">
                            {b2b.features.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3 sm:gap-4 bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:border-[#d4a853]/50 hover:shadow-md transition-all group">
                                    <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg bg-[#d4a853]/10 border border-[#d4a853]/20">
                                        <span className="material-symbols-outlined text-[20px] sm:text-[22px] text-[#d4a853] group-hover:scale-110 transition-transform">{item.icon}</span>
                                    </div>
                                    <div>
                                        <p className="text-[14px] sm:text-[16px] font-semibold text-slate-800">{item.text}</p>
                                        <p className="text-[12px] sm:text-[14px] font-normal text-slate-500 mt-0.5">{item.sub}</p>
                                    </div>
                                </div>
                            ))}
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
                        <p className="text-[13px] sm:text-[15px] font-normal text-slate-400 break-keep">전국 350개 이상의 시공 파트너가 데일리 하우징을 선택했습니다.</p>
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
