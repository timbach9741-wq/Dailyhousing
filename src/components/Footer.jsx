import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const getSiteContact = () => {
    try {
        const d = JSON.parse(localStorage.getItem('homepage_cms_content') || '{}');
        return d.contact || {};
    } catch (error) { console.warn('⚠️ getSiteContact - localStorage 파싱 실패:', error); return {}; }
};

const getSiteBusiness = () => {
    try {
        const d = JSON.parse(localStorage.getItem('homepage_cms_content') || '{}');
        return d.business || {};
    } catch (error) { console.warn('⚠️ getSiteBusiness - localStorage 파싱 실패:', error); return {}; }
};

export default function Footer() {
    const [contact, setContact] = useState(getSiteContact());
    const [biz, setBiz] = useState(getSiteBusiness());

    useEffect(() => {
        const handleCmsUpdate = () => {
            setContact(getSiteContact());
            setBiz(getSiteBusiness());
        };
        window.addEventListener('cmsUpdated', handleCmsUpdate);
        window.addEventListener('storage', handleCmsUpdate);
        return () => {
            window.removeEventListener('cmsUpdated', handleCmsUpdate);
            window.removeEventListener('storage', handleCmsUpdate);
        };
    }, []);
    return (
        <footer className="bg-white border-t border-slate-200">
            {/* Main Footer */}
            <div className="px-4 sm:px-6 lg:px-16 xl:px-24 pt-10 sm:pt-14 lg:pt-20 pb-8 sm:pb-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-16">
                    {/* Brand Column */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="flex items-center gap-4">
                            <img src="/assets/images/daily_housing_icon.svg" alt="데일리하우징 로고" className="h-14 w-14" />
                            <div className="flex flex-col justify-center">
                                <h2 className="text-[24px] font-extrabold tracking-tight leading-none">
                                    <span className="text-[#002D5A]">데일리</span><span className="text-[#BFA169]">하우징</span>
                                </h2>
                                <span className="text-[13px] font-bold tracking-wide text-slate-500 mt-1">B2B 바닥재 & 건축자재 유통 전문</span>
                            </div>
                        </div>
                        <p className="text-[15px] leading-[1.8] text-slate-500 font-normal max-w-xs">
                            LX Z:IN 공식 유통 파트너로서 주거·상업용 프리미엄 바닥재를 사업자 전용 특가로 제공합니다.
                        </p>
                        <div className="flex gap-3">
                            <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 border border-slate-200 hover:border-[#d4a853] hover:text-[#d4a853] transition-all text-slate-400">
                                <span className="material-symbols-outlined text-[20px]">share</span>
                            </button>
                            <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 border border-slate-200 hover:border-[#d4a853] hover:text-[#d4a853] transition-all text-slate-400">
                                <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                            </button>
                            <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 border border-slate-200 hover:border-[#d4a853] hover:text-[#d4a853] transition-all text-slate-400">
                                <span className="material-symbols-outlined text-[20px]">chat</span>
                            </button>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="text-[15px] font-bold text-[#d4a853] mb-6">제품</h4>
                        <ul className="space-y-3">
                            <li><Link to="/category/residential" className="text-[15px] font-normal text-slate-500 hover:text-[#d4a853] transition-colors">주거용 바닥재</Link></li>
                            <li><Link to="/category/commercial" className="text-[15px] font-normal text-slate-500 hover:text-[#d4a853] transition-colors">상업용 바닥재 (LVT)</Link></li>
                            <li><Link to="/category/residential?category=에디톤" className="text-[15px] font-normal text-slate-500 hover:text-[#d4a853] transition-colors">에디톤 우드 / 스톤 / 스퀘어</Link></li>
                            <li><Link to="/category/residential?category=시트" className="text-[15px] font-normal text-slate-500 hover:text-[#d4a853] transition-colors">시트 & 타일</Link></li>
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div>
                        <h4 className="text-[15px] font-bold text-[#d4a853] mb-6">고객 지원</h4>
                        <ul className="space-y-3">
                            <li><Link to="/consultations/new" className="text-[15px] font-normal text-slate-500 hover:text-[#d4a853] transition-colors">시공 상담 신청</Link></li>
                            <li><Link to="/quality-assurance" className="text-[15px] font-normal text-slate-500 hover:text-[#d4a853] transition-colors">품질 보증 안내</Link></li>
                            <li><Link to="/faq" className="text-[15px] font-normal text-slate-500 hover:text-[#d4a853] transition-colors">자주 묻는 질문</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-[15px] font-bold text-[#d4a853] mb-6">연락처</h4>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-[20px] text-slate-400 mt-0.5">call</span>
                                <div>
                                    <p className="text-[16px] font-bold text-slate-900">{contact.phone || '031-409-5556'}</p>
                                    <p className="text-[13px] font-normal text-slate-500">{contact.hours || '평일 09:00 – 18:00'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-[20px] text-slate-400 mt-0.5">mail</span>
                                <p className="text-[15px] font-normal text-slate-500">{contact.email || 'timbach@naver.com'}</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-[20px] text-slate-400 mt-0.5">location_on</span>
                                <p className="text-[15px] font-normal text-slate-500 leading-relaxed">{contact.address || '서울특별시 강남구 테헤란로 123'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 lg:px-16 xl:px-24 py-5 sm:py-6 mt-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-[13px] font-normal text-slate-400 text-center md:text-left leading-relaxed">
                        <p>대표: {biz.ceoName || '(미설정)'} | 사업자등록번호: {biz.bizNumber || '(미설정)'} | 통신판매업 신고번호: {biz.ecomNumber || '(미설정)'}</p>
                        <p className="mt-1">© 2026 {biz.companyName || '데일리하우징'}. All rights reserved.</p>

                    </div>
                    <div className="flex items-center gap-6 text-[13px] font-medium text-slate-400">
                        <Link to="/terms" className="hover:text-slate-900 cursor-pointer transition-colors">이용약관</Link>
                        <Link to="/privacy" className="hover:text-slate-900 cursor-pointer transition-colors text-slate-600">개인정보처리방침</Link>
                        <Link to="/shopping-guide" className="hover:text-slate-900 cursor-pointer transition-colors">쇼핑 가이드</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
