import { useMemo, useEffect, useState } from 'react';
import { useProductStore } from '../store/useProductStore';
import { useAuthStore } from '../store/useAuthStore';
import { Link, useSearchParams } from 'react-router-dom';

export default function ResidentialSheetCategory() {
    const products = useProductStore((state) => state.products).filter(p => p.categoryId === 'residential');
    const initProducts = useProductStore((state) => state.initProducts);
    const { user, isAuthenticated } = useAuthStore();
    const isBusiness = user?.role === 'business';

    const [searchParams, setSearchParams] = useSearchParams();
    const selectedSubCategory = searchParams.get('category') || '전체';
    const selectedDetailCategory = searchParams.get('sub') || '전체';
    const [sortOrder, setSortOrder] = useState('추천순');

    useEffect(() => {
        initProducts();
    }, [initProducts]);

    const subCategories = ['전체', '에디톤', '마루', '시트', '타일'];
    const editonDetailCategories = ['전체', '에디톤 스톤', '에디톤 스퀘어', '에디톤 우드'];
    const maruDetailCategories = ['전체', '사각 400', '사각 600', '우드'];
    const sheetDetailCategories = ['전체', '엑스컴포트 5.0', '엑스컴포트 4.5(지아 소리잠)', '프리미엄 3.2/2.7(지아 사랑애)', '프리미엄 2.2(지아 자연애)', '스탠다드 2.0(은행목)', '스탠다드 1.8(뉴청맥)'];
    const tileDetailCategories = ['전체', '하우스 타일 베이직(하우스)', '하우스 타일 스탠다드(하우스 Style)'];

    let currentDetailCategories = [];
    if (selectedSubCategory === '에디톤') currentDetailCategories = editonDetailCategories;
    if (selectedSubCategory === '마루') currentDetailCategories = maruDetailCategories;
    if (selectedSubCategory === '시트') currentDetailCategories = sheetDetailCategories;
    if (selectedSubCategory === '타일') currentDetailCategories = tileDetailCategories;

    const filteredProducts = useMemo(() => {
        let result = products;

        if (selectedSubCategory === '전체') {
            // 기본: 배열 원래 순서 유지 (신제품순 = 공식 사이트 순서)
        } else if (selectedSubCategory === '에디톤') {
            result = result.filter(p => 
                (p.subtitle && p.subtitle.includes('에디톤')) || 
                (p.subCategory && p.subCategory.includes('에디톤'))
            );
            if (selectedDetailCategory !== '전체') {
                result = result.filter(p => p.subCategory === selectedDetailCategory);
            }
        } else if (selectedSubCategory === '마루') {
            result = result.filter(p => 
                p.subCategory === '마루' || 
                (p.subtitle && p.subtitle === '마루')
            );
            if (selectedDetailCategory === '사각 400') {
                result = result.filter(p => p.title.startsWith('사각 400'));
            } else if (selectedDetailCategory === '사각 600') {
                result = result.filter(p => p.title.startsWith('사각 600'));
            } else if (selectedDetailCategory === '우드') {
                result = result.filter(p => p.title.startsWith('우드'));
            }
        } else if (selectedSubCategory === '시트') {
            result = result.filter(p => 
                (p.subtitle && p.subtitle.includes('시트')) || 
                (p.subCategory && (p.subCategory.includes('프리미엄') || p.subCategory.includes('스탠다드') || p.subCategory.includes('엑스컴포트')))
            );
            if (selectedDetailCategory !== '전체') {
                result = result.filter(p => p.subCategory === selectedDetailCategory);
            }
        } else if (selectedSubCategory === '타일') {
            result = result.filter(p => p.subtitle.includes('타일'));
            if (selectedDetailCategory !== '전체') {
                result = result.filter(p => p.subCategory === selectedDetailCategory);
            }
        } else {
            result = result.filter(p => p.subCategory === selectedSubCategory);
        }

        // 정렬 적용
        let sorted = result.slice();
        if (sortOrder === '추천순') {
            // 마루 카테고리: 사각 400 > 사각 600 > 우드 순서
            if (selectedSubCategory === '마루') {
                const maruOrder = (title) => {
                    if (title.startsWith('사각 400')) return 0;
                    if (title.startsWith('사각 600')) return 1;
                    return 2; // 우드
                };
                sorted.sort((a, b) => maruOrder(a.title) - maruOrder(b.title));
            }
        } else if (sortOrder === '낮은가격순') {
            sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (sortOrder === '높은가격순') {
            sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        }
        return sorted;
    }, [products, selectedSubCategory, selectedDetailCategory, sortOrder]);

    const handleMainCategoryChange = (cat) => {
        if (cat === '전체') {
            setSearchParams({});
        } else {
            setSearchParams({ category: cat });
        }
    }

    const handleDetailCategoryChange = (sub) => {
        if (sub === '전체') {
            setSearchParams({ category: selectedSubCategory });
        } else {
            setSearchParams({ category: selectedSubCategory, sub: sub });
        }
    }

    return (
        <main className="w-full bg-white pb-24">
            {/* Minimalist Premium Banner */}
            <section className="relative h-[280px] sm:h-[350px] lg:h-[400px] w-full overflow-hidden bg-slate-50 flex items-center justify-center">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/assets/images/products/res-001.jpg"
                        alt="Residential Banner"
                        className="h-full w-full object-cover opacity-50 scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/90 to-white/40"></div>
                </div>
                <div className="relative z-10 text-center text-slate-900 px-4 mt-4 sm:mt-6">
                    <span className="inline-block px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-white shadow-sm text-[11px] sm:text-[12px] font-bold text-[#d4a853] mb-4 sm:mb-6 tracking-[0.2em] sm:tracking-[0.3em] uppercase border border-slate-200">LX Z:IN Residential</span>
                    <h2 className="text-2xl sm:text-4xl lg:text-6xl font-black mb-3 sm:mb-6 leading-tight tracking-tight text-slate-900">
                        가장 완벽한<br />주거 공간의 완성
                    </h2>
                    <p className="text-[13px] sm:text-base lg:text-lg font-medium text-slate-600 max-w-xl mx-auto leading-relaxed">
                        프리미엄 에디톤부터 친환경 시트까지,<br />
                        라이프스타일에 맞춘 최적의 바닥재를 만나보세요.
                    </p>
                </div>
            </section>

            <div className="mx-auto w-full px-4 xl:px-8 -mt-8 sm:-mt-10 relative z-20 flex flex-col items-center">
                {/* Modern Tab Menu - Main Categories */}
                <div className={`bg-white rounded-2xl sm:rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-2 sm:p-4 ${selectedSubCategory === '전체' ? 'mb-10 sm:mb-16' : 'mb-4 sm:mb-6'} border border-slate-100 w-full lg:w-auto overflow-x-auto scrollbar-hide transition-all`}>
                    <div className="flex gap-1.5 sm:gap-2 min-w-max lg:min-w-0 lg:flex-wrap lg:justify-center">
                        {subCategories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => handleMainCategoryChange(cat)}
                                className={`flex-shrink-0 px-5 sm:px-10 py-3 sm:py-5 rounded-xl sm:rounded-[2rem] text-[14px] sm:text-[18px] font-bold transition-all duration-300 whitespace-nowrap ${selectedSubCategory === cat
                                    ? 'bg-gradient-to-r from-[#d4a853] to-[#b8923e] text-white shadow-lg shadow-[#d4a853]/20 transform sm:-translate-y-1'
                                    : 'text-slate-500 hover:text-[#d4a853] hover:bg-slate-50'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Second Level Tab Menu - Sub Categories */}
                {selectedSubCategory !== '전체' && currentDetailCategories.length > 0 && (
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-lg shadow-slate-200/30 p-2 sm:p-3 mb-8 sm:mb-16 border border-slate-200 w-full lg:w-auto overflow-x-auto scrollbar-hide relative z-10 lg:max-w-4xl animate-fade-in-up">
                        <div className="flex gap-1.5 sm:gap-2 min-w-max lg:min-w-0 lg:flex-wrap lg:justify-center">
                            {currentDetailCategories.map(sub => (
                                <button
                                    key={sub}
                                    onClick={() => handleDetailCategoryChange(sub)}
                                    className={`flex-shrink-0 px-4 sm:px-8 min-h-[44px] sm:min-h-[56px] py-2 flex flex-col items-center justify-center rounded-xl sm:rounded-2xl text-[13px] sm:text-[16px] font-bold transition-all duration-300 whitespace-nowrap ${selectedDetailCategory === sub
                                        ? 'bg-slate-800 text-white shadow-md'
                                        : 'text-slate-500 hover:text-[#d4a853] hover:bg-slate-50 border border-transparent'
                                        }`}
                                >
                                    {sub.includes(' 5x') ? (
                                        <>
                                            <span className="text-[14px] sm:text-[18px] lg:text-[20px] font-black leading-tight mb-1">{sub.split(' 5x')[0]}</span>
                                            <span className={`text-[11px] sm:text-[13px] font-bold tracking-wider ${selectedDetailCategory === sub ? 'text-white/80' : 'text-slate-400'}`}>
                                                (5x{sub.split(' 5x')[1]})
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-[14px] sm:text-[18px] lg:text-[20px] font-black">{sub}</span>
                                    )}
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
                            className="appearance-none bg-transparent border-none text-[14px] font-bold text-slate-600 focus:ring-0 cursor-pointer hover:text-[#d4a853] transition-colors"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                        >
                            <option>추천순</option>
                            <option>낮은가격순</option>
                            <option>높은가격순</option>
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
                                    className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${product.inventory === 0 ? 'grayscale opacity-60' : ''}`}
                                    loading="lazy"
                                />

                                {/* 재고 상태 뱃지 */}
                                <div className="absolute top-3 left-3 z-20 flex flex-col gap-1">
                                    {product.salesStatus === '일시 품절' ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-[11px] sm:text-[12px] font-black shadow-lg shadow-red-600/30">
                                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                                            일시품절 {product.expectedDate ? `(입고예정: ${product.expectedDate})` : ''}
                                        </span>
                                    ) : product.salesStatus === '단종' ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-600 text-white text-[11px] sm:text-[12px] font-black shadow-lg shadow-gray-600/30">
                                            단종
                                        </span>
                                    ) : product.stock !== undefined ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600/90 text-white text-[10px] sm:text-[11px] font-bold shadow-md">
                                            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
                                            재고 {product.stock.toLocaleString()}개
                                        </span>
                                    ) : null}
                                </div>

                                {/* 품절 오버레이 */}
                                {product.inventory === 0 && (
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-5">
                                        <span className="text-white/80 text-lg sm:text-2xl font-black tracking-widest">SOLD OUT</span>
                                    </div>
                                )}

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
