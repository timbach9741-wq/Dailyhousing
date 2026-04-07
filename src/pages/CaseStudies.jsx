import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { caseStudies } from '../data/caseStudies';

const CaseStudies = () => {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState('all');
    const [selectedCase, setSelectedCase] = useState(null);

    const filteredCases = useMemo(() => {
        if (activeCategory === 'all') return caseStudies;
        return caseStudies.filter(c => c.category === activeCategory);
    }, [activeCategory]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (selectedCase) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        const handleEscape = (e) => {
            if (e.key === 'Escape') setSelectedCase(null);
        };
        window.addEventListener('keydown', handleEscape);

        // Cleanup on unmount or when selectedCase changes
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEscape);
        };
    }, [selectedCase]);

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative py-20 bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                    <img
                        src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1600"
                        alt="Interior Background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-transparent to-slate-900"></div>
                </div>

                <div className="relative container mx-auto px-6 lg:px-12 text-center">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-[#d4a853]/20 border border-[#d4a853]/30 text-[#d4a853] text-sm font-bold tracking-wider mb-4 animate-fade-in">
                        PORTFOLIO
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
                        공간의 가치를 만드는 <br />
                        <span className="text-[#d4a853]">데일리하우징</span> 시공 사례
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg text-slate-300 font-medium">
                        LX Z:IN 프리미엄 바닥재로 완성된 실제 시공 현장을 확인해보세요. <br />
                        전문 기술력과 감각적인 디자인이 만나 최고의 공간을 선물합니다.
                    </p>
                </div>
            </section>

            {/* Filter Section */}
            <section className="sticky top-[72px] z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 py-6">
                <div className="container mx-auto px-6 lg:px-12 flex flex-wrap items-center justify-center gap-4">
                    <button
                        onClick={() => setActiveCategory('all')}
                        className={`px-8 py-2.5 rounded-full text-[15px] font-bold transition-all duration-300 ${activeCategory === 'all'
                            ? 'bg-[#d4a853] text-white shadow-lg shadow-[#d4a853]/30'
                            : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                            }`}
                    >
                        전체보기
                    </button>
                    <button
                        onClick={() => setActiveCategory('residential')}
                        className={`px-8 py-2.5 rounded-full text-[15px] font-bold transition-all duration-300 ${activeCategory === 'residential'
                            ? 'bg-[#d4a853] text-white shadow-lg shadow-[#d4a853]/30'
                            : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                            }`}
                    >
                        주거공간
                    </button>
                    <button
                        onClick={() => setActiveCategory('commercial')}
                        className={`px-8 py-2.5 rounded-full text-[15px] font-bold transition-all duration-300 ${activeCategory === 'commercial'
                            ? 'bg-[#d4a853] text-white shadow-lg shadow-[#d4a853]/30'
                            : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                            }`}
                    >
                        상업공간
                    </button>
                </div>
            </section>

            {/* Grid Section */}
            <section className="py-20">
                <div className="container mx-auto px-6 lg:px-12">
                    {filteredCases.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                            {filteredCases.map((item) => (
                                <div
                                    key={item.id}
                                    className="group cursor-pointer"
                                    onClick={() => setSelectedCase(item)}
                                >
                                    {/* Image Card */}
                                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 mb-6 shadow-md transition-shadow duration-500 group-hover:shadow-2xl group-hover:shadow-slate-200">
                                        <img
                                            src={item.thumbnailUrl}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                                            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                                <span className="px-6 py-2.5 bg-white text-slate-900 rounded-full font-bold text-sm">
                                                    자세히 보기
                                                </span>
                                            </div>
                                        </div>
                                        {/* Badge */}
                                        <div className="absolute top-4 left-4">
                                            <span className={`px-3 py-1 rounded-md text-[11px] font-black tracking-widest text-white uppercase ${item.category === 'residential' ? 'bg-blue-600' : 'bg-[#d4a853]'
                                                }`}>
                                                {item.category === 'residential' ? 'Residential' : 'Commercial'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="space-y-3 px-1">
                                        <div className="flex items-center gap-2 text-[13px] font-bold text-[#d4a853]">
                                            <span className="material-symbols-outlined text-[16px]">location_on</span>
                                            {item.location}
                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <span>{item.completionDate}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#d4a853] transition-colors line-clamp-1">
                                            {item.title}
                                        </h3>
                                        <p className="text-[14px] text-slate-500 font-medium line-clamp-2 leading-relaxed">
                                            {item.description}
                                        </p>
                                        <div className="pt-2 flex flex-wrap gap-2">
                                            {item.tags.map((tag, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-500 text-[12px] font-semibold rounded-md">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-40">
                            <span className="material-symbols-outlined text-6xl text-slate-200 mb-4 block">gallery_thumbnail</span>
                            <p className="text-lg text-slate-400 font-medium">검색된 시공 사례가 없습니다.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-24 bg-slate-50">
                <div className="container mx-auto px-6 lg:px-12 text-center">
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-8">
                        여러분의 공간도 <span className="text-[#d4a853]">명작</span>이 될 수 있습니다.
                    </h2>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => navigate('/consultations/new')}
                            className="w-full sm:w-auto px-10 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
                        >
                            시공 상담 신청하기
                        </button>
                        <button
                            onClick={() => navigate('/inquiry')}
                            className="w-full sm:w-auto px-10 py-4 bg-[#d4a853] text-white font-bold rounded-xl hover:bg-[#c29643] transition-all shadow-xl shadow-[#d4a853]/20"
                        >
                            현장 물량 문의
                        </button>
                    </div>
                </div>
            </section>

            {/* Case Study Modal */}
            {selectedCase && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-12 animate-in fade-in duration-300"
                    onClick={() => setSelectedCase(null)}
                >
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"></div>

                    {/* Close Button */}
                    <button
                        className="absolute top-6 right-6 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCase(null);
                        }}
                    >
                        <span className="material-symbols-outlined text-3xl">close</span>
                    </button>

                    <div
                        className="relative w-full max-w-6xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row animate-in zoom-in-95 duration-500 overflow-y-auto lg:overflow-visible max-h-[90vh] lg:max-h-none"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Image Side */}
                        <div className="w-full lg:w-2/3 bg-slate-100 relative group/img aspect-video lg:aspect-auto">
                            <img
                                src={selectedCase.thumbnailUrl.replace('w=800', 'w=1600')}
                                alt={selectedCase.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/5 group-hover/img:bg-transparent transition-colors"></div>
                        </div>

                        {/* Info Side */}
                        <div className="w-full lg:w-1/3 p-8 lg:p-12 flex flex-col justify-between bg-white relative">
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <span className={`px-4 py-1.5 rounded-full text-[12px] font-black tracking-widest text-white uppercase ${selectedCase.category === 'residential' ? 'bg-blue-600' : 'bg-[#d4a853]'}`}>
                                        {selectedCase.category === 'residential' ? 'Residential' : 'Commercial'}
                                    </span>
                                    <span className="text-slate-400 font-bold text-sm">Case #{selectedCase.id.split('_')[1]}</span>
                                </div>

                                <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
                                    {selectedCase.title}
                                </h2>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-[#d4a853] mt-1">location_on</span>
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">위치</p>
                                            <p className="text-slate-700 font-bold">{selectedCase.location}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-[#d4a853] mt-1">category</span>
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">사용 제품</p>
                                            <p className="text-slate-700 font-bold">{selectedCase.productUsed}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-[#d4a853] mt-1">calendar_today</span>
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">시공 완료일</p>
                                            <p className="text-slate-700 font-bold">{selectedCase.completionDate}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100 my-8"></div>

                                <p className="text-slate-600 leading-relaxed font-medium mb-8">
                                    {selectedCase.description}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-8">
                                    {selectedCase.tags.map((tag, idx) => (
                                        <span key={idx} className="px-4 py-2 bg-slate-50 text-slate-500 text-[13px] font-bold rounded-xl border border-slate-100">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/consultations/new')}
                                className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 group shadow-xl shadow-slate-950/10"
                            >
                                유사 견적 문의하기
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CaseStudies;

