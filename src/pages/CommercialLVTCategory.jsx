import { useMemo, useEffect, useState } from 'react';
import { useProductStore } from '../store/useProductStore';
import { useAuthStore } from '../store/useAuthStore';
import { Link, useSearchParams } from 'react-router-dom';

// model_id 코드 기반 분류 헬퍼: 세 번째 문자로 타일(T)/우드(W) 구분
const isWoodProduct = (p) => {
    const code = p.model_id || '';
    // DBW(보타닉 우드), DEW(에코노 우드), PTW(프레스티지 우드)
    return code.length >= 3 && code[2] === 'W';
};
const isTileProduct = (p) => {
    const code = p.model_id || '';
    // DBT(보타닉 타일), DET(에코노 타일), PTT(프레스티지 타일)
    return code.length >= 3 && code[2] === 'T';
};
const is600Size = (p) => {
    const size = p.specifications?.size || '';
    return size.includes('600') && isTileProduct(p);
};
const is450Size = (p) => {
    const size = p.specifications?.size || '';
    return size.includes('450') && isTileProduct(p);
};

export default function CommercialLVTCategory() {
    const products = useProductStore((state) => state.products).filter(p => p.categoryId === 'commercial');
    const initProducts = useProductStore((state) => state.initProducts);
    const { user, isAuthenticated } = useAuthStore();
    const isBusiness = user?.role === 'business';

    const [searchParams, setSearchParams] = useSearchParams();
    const [sortOrder, setSortOrder] = useState('추천순');
    const activeTab = searchParams.get('tab') || '전체';
    const detailTab = searchParams.get('sub') || '전체';

    useEffect(() => {
        initProducts();
    }, [initProducts]);

    const tabs = [
        '전체',
        'LVT 베이직 3T(보타닉)',
        'LVT 스탠다드 3T(에코노플러스)',
        'LVT 프리미엄 5T(프레스티지)'
    ];

    const detailTabsList = useMemo(() => {
        if (activeTab === 'LVT 프리미엄 5T(프레스티지)') {
            return ['전체', '사각600각', '사각', '우드'];
        }
        return ['전체', '사각600각', '사각450각', '우드'];
    }, [activeTab]);


    const filteredProducts = useMemo(() => {
        let result = products;

        if (activeTab !== '전체') {
            result = result.filter(p => p.subCategory === activeTab);
        }

        if (detailTab === '전체') {
            // no sub-filter
        } else if (['LVT 베이직 3T(보타닉)', 'LVT 스탠다드 3T(에코노플러스)'].includes(activeTab)) {
            if (detailTab === '사각600각') {
                result = result.filter(p => is600Size(p));
            } else if (detailTab === '사각450각') {
                result = result.filter(p => is450Size(p));
            } else if (detailTab === '우드') {
                result = result.filter(p => isWoodProduct(p));
            }
        } else if (activeTab === 'LVT 프리미엄 5T(프레스티지)') {
            if (detailTab === '사각600각') {
                result = result.filter(p => is600Size(p));
            } else if (detailTab === '사각') {
                result = result.filter(p => isTileProduct(p) && !is600Size(p));
            } else if (detailTab === '우드') {
                result = result.filter(p => isWoodProduct(p));
            }
        }

        if (sortOrder === '가격순') {
            result = [...result].sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (sortOrder === '최신순') {
            result = [...result].sort((a, b) => (b.id || '').localeCompare(a.id || ''));
        }

        return result;
    }, [products, activeTab, detailTab, sortOrder]);

    const handleTabChange = (tab) => {
        if (tab === '전체') {
            setSearchParams({});
        } else {
            setSearchParams({ tab });
        }
    };

    const handleSubTabChange = (sub) => {
        if (sub === '전체') {
            setSearchParams({ tab: activeTab });
        } else {
            setSearchParams({ tab: activeTab, sub: sub });
        }
    };

    return (
        <main className="w-full bg-white pb-24">
            {/* Minimalist Premium Banner */}
            <section className="relative h-[280px] sm:h-[350px] lg:h-[400px] w-full overflow-hidden bg-slate-50 flex items-center justify-center">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/assets/images/products/com-001.jpg"
                        alt="Commercial Banner"
                        className="h-full w-full object-cover opacity-50 scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/90 to-white/40"></div>
                </div>
                <div className="relative z-10 text-center text-slate-900 px-4 mt-4 sm:mt-6">
                    <span className="inline-block px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-white shadow-sm text-[11px] sm:text-[12px] font-bold text-[#d4a853] mb-4 sm:mb-6 tracking-[0.2em] sm:tracking-[0.3em] uppercase border border-slate-200">LX Z:IN Commercial</span>
                    <h2 className="text-2xl sm:text-4xl lg:text-6xl font-black mb-3 sm:mb-6 leading-tight tracking-tight text-slate-900">
                        비즈니스를 위한<br />완벽한 바닥재 솔루션
                    </h2>
                    <p className="text-[13px] sm:text-base lg:text-lg font-medium text-slate-600 max-w-xl mx-auto leading-relaxed">
                        최고급 사양의 프레스티지부터 실용적인 에코노까지,<br />
                        공간의 성격에 최적화된 라인업을 제공합니다.
                    </p>
                </div>
            </section>

            <div className="mx-auto w-full px-4 xl:px-8 -mt-8 sm:-mt-10 relative z-20 flex flex-col items-center">
                {/* Modern Tab Menu */}
                <div className={`bg-white rounded-2xl sm:rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-2 sm:p-4 ${activeTab === 'LVT 베이직 3T(보타닉)' ? 'mb-4 sm:mb-6' : 'mb-10 sm:mb-16'} border border-slate-100 w-full lg:w-auto overflow-x-auto scrollbar-hide transition-all`}>
                    <div className="flex gap-1.5 sm:gap-2 min-w-max lg:min-w-0 lg:flex-wrap lg:justify-center">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => handleTabChange(tab)}
                                className={`flex-shrink-0 px-4 sm:px-10 py-3 sm:py-5 rounded-xl sm:rounded-[2rem] text-[13px] sm:text-[18px] font-bold transition-all duration-300 whitespace-nowrap ${activeTab === tab
                                    ? 'bg-gradient-to-r from-[#d4a853] to-[#b8923e] text-white shadow-lg shadow-[#d4a853]/20 transform sm:-translate-y-1'
                                    : 'text-slate-500 hover:text-[#d4a853] hover:bg-slate-50'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Second Level Tab Menu - Sub Categories */}
                {['LVT 베이직 3T(보타닉)', 'LVT 스탠다드 3T(에코노플러스)', 'LVT 프리미엄 5T(프레스티지)'].includes(activeTab) && (
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-lg shadow-slate-200/30 p-2 sm:p-3 mb-8 sm:mb-16 border border-slate-200 w-full lg:w-auto overflow-x-auto scrollbar-hide relative z-10 lg:max-w-4xl animate-fade-in-up">
                        <div className="flex gap-1.5 sm:gap-2 min-w-max lg:min-w-0 lg:flex-wrap lg:justify-center">
                            {detailTabsList.map(sub => (
                                <button
                                    key={sub}
                                    onClick={() => handleSubTabChange(sub)}
                                    className={`flex-shrink-0 px-5 sm:px-8 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl text-[13px] sm:text-[16px] font-bold transition-all duration-300 whitespace-nowrap ${detailTab === sub
                                        ? 'bg-slate-800 text-white shadow-md'
                                        : 'text-slate-500 hover:text-[#d4a853] hover:bg-slate-50 border border-transparent'
                                        }`}
                                >
                                    {sub}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="mx-auto w-full px-4 xl:px-8 relative z-10">
                {/* Grid Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between mb-10 border-b border-slate-100 pb-8 gap-4">
                    <p className="text-[15px] font-bold text-slate-900">
                        총 <span className="text-[#d4a853]">{filteredProducts.length}</span>개의 제품
                    </p>
                    <div className="flex items-center gap-4">
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="appearance-none bg-transparent border-none text-[14px] font-bold text-slate-600 focus:ring-0 cursor-pointer hover:text-[#d4a853] transition-colors"
                        >
                            <option>추천순</option>
                            <option>최신순</option>
                            <option>가격순</option>
                        </select>
                        <span className="material-symbols-outlined text-slate-300">sort</span>
                    </div>
                </div>

                {/* Product Multi-Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                    {filteredProducts.map(product => (
                        <div key={product.id} className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-[#d4a853]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#d4a853]/10">
                            {/* Visual Asset Container */}
                            <div className="relative aspect-[5/4] overflow-hidden bg-slate-50">
                                <img
                                    src={product.imageUrl}
                                    alt={product.title}
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute top-5 left-5 flex flex-wrap gap-2">
                                    {product.tags?.map(tag => (
                                        <span key={tag} className="px-3.5 py-1.5 bg-white shadow-md rounded-full text-[11px] font-black text-slate-800 uppercase border border-slate-100">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                {/* Hover Overlays */}
                                <div className="absolute inset-0 bg-[#d4a853]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <Link to={`/product/${product.id}`} className="absolute inset-0 z-10"></Link>
                            </div>

                            {/* Essential Data Content */}
                            <div className="p-3 sm:p-6 flex flex-col flex-1">
                                <div className="mb-5 flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-[#d4a853]"></span>
                                        <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">{product.subCategory}</span>
                                    </div>
                                    <h4 className="text-base sm:text-lg xl:text-xl font-black text-slate-900 leading-tight group-hover:text-[#d4a853] transition-colors line-clamp-2">{product.title}</h4>
                                    <p className="text-[13px] text-slate-500 mt-2 font-medium line-clamp-1">{product.subtitle}</p>

                                    {/* 가격 표시 추가 */}
                                    <div className="mt-4">
                                        <div className="flex flex-col gap-1.5 bg-slate-50 p-2.5 md:p-3 rounded-xl border border-slate-100 group-hover:border-red-100 transition-colors">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[11px] md:text-[12px] text-slate-500 font-medium">일반가</span>
                                                <div className="flex items-baseline gap-0.5">
                                                    <span className={`text-[12px] md:text-[13px] ${isAuthenticated && isBusiness ? 'line-through text-slate-400' : 'font-bold text-slate-900'}`}>
                                                        {product.price != null && product.price !== 0 && product.price !== '0' ? `${product.price.toLocaleString()}원` : '별도 문의'}
                                                    </span>
                                                </div>
                                            </div>
                                            {product.businessPrice && product.price !== 0 && product.price !== '0' && (
                                                <div className={`flex justify-between items-center p-1.5 md:p-2 rounded-lg border ${isAuthenticated && isBusiness ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200 group-hover:bg-red-50 group-hover:border-red-100 transition-colors'}`}>
                                                    <div className="flex items-center gap-1">
                                                        <span className={`text-[11px] md:text-[12px] font-bold ${isAuthenticated && isBusiness ? 'text-[#c0392b]' : 'text-slate-600 group-hover:text-[#c0392b]'}`}>사업자가</span>
                                                        <span className={`text-[10px] font-black px-1 rounded ${isAuthenticated && isBusiness ? 'text-white bg-[#c0392b]' : 'text-[#c0392b] bg-red-100 group-hover:bg-[#c0392b] group-hover:text-white transition-colors'}`}>
                                                            {isAuthenticated && isBusiness ? `${product.price && product.price !== 0 && Math.round((1 - product.businessPrice / product.price) * 100)}% ↓` : '?% ↓'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-baseline gap-0.5">
                                                        {isAuthenticated && isBusiness ? (
                                                            <>
                                                                <span className="text-[13px] md:text-[15px] font-black text-[#c0392b]">
                                                                    {product.businessPrice.toLocaleString()}원
                                                                </span>
                                                                {product.priceUnit && (
                                                                    <span className="text-[10px] text-slate-400">/{product.priceUnit}</span>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <Link to="/register" className="text-[10px] md:text-[11px] font-bold text-[#d4a853] hover:underline">회원 전용</Link>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-5 border-t border-slate-100 mt-auto">
                                    <span className="text-[15px] sm:text-[17px] font-black text-[#d4a853] tracking-wide">{product.model_id}</span>
                                    <Link
                                        to={`/product/${product.id}`}
                                        className="h-10 w-10 shrink-0 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-gradient-to-r group-hover:from-[#d4a853] group-hover:to-[#b8923e] group-hover:text-white group-hover:border-transparent transition-all duration-300 relative z-20"
                                    >
                                        <span className="material-symbols-outlined text-[20px] font-bold">arrow_forward</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>


            </div>
        </main>
    );
}
