import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useConsultationStore } from '../store/useConsultationStore';
import { useToastStore } from '../store/useToastStore';
import SEO from '../components/SEO';
import { regionCaseStudies } from '../data/regionCaseStudies';

// 지역 슬러그 매핑 정보
const SIDO_MAP = {
    seoul: "서울", gyeonggi: "경기", incheon: "인천", busan: "부산",
    daegu: "대구", gwangju: "광주", daejeon: "대전", ulsan: "울산",
    sejong: "세종", gangwon: "강원", chungbuk: "충북", chungnam: "충남",
    jeonbuk: "전북", jeonnam: "전남", gyeongbuk: "경북", gyeongnam: "경남", jeju: "제주"
};

const GU_MAP = {
    gangnam: "강남구", seocho: "서초구", songpa: "송파구", mapo: "마포구", yongsan: "용산구",
    seongdong: "성동구", gangdong: "강동구", nowon: "노원구", yeongdeungpo: "영등포구",
    bundang: "분당구", suwon: "수원시", ilsan: "일산동구", gimpo: "김포시",
    hwaseong: "화성시", yongin: "용인시", hanami: "하남시", namyangju: "남양주시",
    anyang: "안양시", bucheon: "부천시", gwangmyeong: "광명시",
    yeonsu: "연수구", bupyeong: "부평구", junggu: "중구", haeundae: "해운대구",
    suyeong: "수영구", dongnae: "동래구", suseong: "수성구", yuseong: "유성구",
    yangcheon: "양천구", siheung: "시흥시", gwangju: "광주시", asan: "아산시"
};

export default function LocalFlooringSEO() {
    // 라우트가 "/:regionKey-flooring"이라 리액트 라우터가 하이픈까지 파라미터 이름에
    // 포함시켜 실제 키는 "regionKey"가 아니라 "regionKey-flooring"으로 등록됨(URL은 그대로 두고
    // 여기서만 올바른 키로 꺼내옴 — 8/10 발견, 지금까지 모든 지역 페이지가 "수도권"만 보여주던 원인)
    const { 'regionKey-flooring': regionKey } = useParams();
    const navigate = useNavigate();
    const { addConsultation } = useConsultationStore();
    const { addToast } = useToastStore();

    // 실제 시공 사례가 있는 지역인지 확인 (없으면 검색엔진에는 noindex 처리)
    const cleanRegionKey = regionKey ? regionKey.replace('-flooring', '') : '';
    const realCase = regionCaseStudies[cleanRegionKey];

    // 지역명 판별
    const [regionName, setRegionName] = useState("수도권");
    useEffect(() => {
        if (regionKey) {
            // regionKey가 'seoul-gangnam-flooring' 또는 'seoul-gangnam' 형태인지 확인
            const cleanKey = regionKey.replace('-flooring', '');
            const parts = cleanKey.split('-');
            if (parts.length >= 2) {
                const sido = SIDO_MAP[parts[0]] || "";
                const gu = GU_MAP[parts[1]] || parts[1];
                setRegionName(`${sido} ${gu}`);
            } else {
                setRegionName("수도권");
            }
        }
    }, [regionKey]);

    // 상담 신청 처리
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        details: '',
        privacy: false
    });

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!formData.privacy) {
            addToast('개인정보 수집 및 이용에 동의해주세요.', 'error');
            return;
        }

        const submissionData = {
            name: formData.name,
            phone: formData.phone,
            addressMain: `[시공 지역] ${regionName}`,
            details: `[지역 SEO 신청] ${regionName} 바닥재 견적 요청. 추가 요구사항: ${formData.details}`,
        };

        try {
            await addConsultation(submissionData);
            addToast(`${regionName} 지역 무료 견적 상담 신청이 완료되었습니다!`);
            setFormData({ name: '', phone: '', details: '', privacy: false });
        } catch (err) {
            addToast('오류가 발생했습니다. 잠시 후 다시 시도해 주세요.', 'error');
        }
    };

    return (
        <main className="flex-1 bg-white">
            <SEO 
                title={`${regionName} LX Z:IN 장판 마루 시공 견적 가격 1위`} 
                description={`${regionName} 지역 LX Z:IN 엑스컴포트, 지아소리잠, 에디톤 공식 유통 및 평당 시공비 무료 가이드 제공. 데일리하우징에서 무료 방문 실측 및 견적 피드백을 받아보세요.`} 
                url={`https://데일리하우징.kr/${regionKey}/`}
                imageUrl="https://데일리하우징.kr/assets/images/hero_banner_2.png"
                noindex={!realCase}
            />

            {/* =============================================
                1. HERO SECTION
            ============================================= */}
            <section className="relative bg-slate-950 text-white overflow-hidden py-16 sm:py-24 lg:py-32 border-b border-slate-900">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="/assets/images/hero_banner_2.png" 
                        alt={`${regionName} 프리미엄 마루 장판 인테리어`} 
                        className="w-full h-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/80 to-slate-950"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 border border-white/20 mb-6 backdrop-blur-sm">
                        <span className="h-2 w-2 rounded-full bg-[#d4a853] animate-pulse"></span>
                        <span className="text-xs sm:text-sm font-semibold tracking-tight text-white/90">
                            {regionName} 지역 LX지인 바닥재 최우수 시공 보증
                        </span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight break-keep">
                        {regionName} <span className="text-[#d4a853]">LX Z:IN 바닥재</span><br className="sm:hidden" />
                        시공 가격 · 무료 실측 견적
                    </h1>
                    <p className="text-base sm:text-xl text-slate-400 font-medium max-w-3xl mx-auto leading-relaxed mb-10 break-keep">
                        대량 유통망을 통해 단가를 낮췄습니다. 15년 이상 베테랑 시공 전문가가 {regionName} 지역 어디든 직접 방문하여 완벽한 바닥 환경을 제안해 드립니다.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a href="#consultation" className="bg-[#d4a853] hover:bg-[#b8923e] text-slate-950 font-bold px-8 py-4 rounded-xl shadow-lg shadow-[#d4a853]/20 transition-all hover:-translate-y-1">
                            무료 현장실측 신청
                        </a>
                    </div>
                </div>
            </section>

            {/* =============================================
                2. LOCAL CASES SECTION
            ============================================= */}
            {realCase ? (
                <section className="py-16 sm:py-24 bg-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <span className="text-xs font-bold uppercase tracking-widest text-[#d4a853] bg-[#d4a853]/10 px-3 py-1 rounded-full">Portfolio</span>
                            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 mt-3 mb-4">
                                {regionName} 실제 시공 사례
                            </h2>
                            <p className="text-slate-500 max-w-xl mx-auto break-keep">
                                데일리하우징이 {regionName}에서 직접 완료한 실제 현장 사진입니다.
                            </p>
                        </div>

                        <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200/50 md:flex">
                            <div className="md:w-1/2 aspect-[4/3] md:aspect-auto bg-slate-200">
                                <img src={realCase.image} alt={`${realCase.complex} 바닥재 시공`} className="w-full h-full object-cover" />
                            </div>
                            <div className="p-6 sm:p-8 md:w-1/2 flex flex-col justify-center">
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded w-fit">시공 완료</span>
                                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-3 mb-1">{realCase.complex}</h3>
                                {realCase.unit && <p className="text-sm text-slate-400 mb-3">{realCase.unit}</p>}
                                <p className="text-sm sm:text-base text-slate-600 font-medium">{realCase.material}</p>
                                <p className="text-sm text-slate-500 mt-3 break-keep">{realCase.note}</p>
                            </div>
                        </div>
                    </div>
                </section>
            ) : (
                <section className="py-16 sm:py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <span className="text-xs font-bold uppercase tracking-widest text-[#d4a853] bg-[#d4a853]/10 px-3 py-1 rounded-full">Portfolio</span>
                            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 mt-3 mb-4">
                                최근 {regionName} 인근 시공 사례
                            </h2>
                            <p className="text-slate-500 max-w-xl mx-auto break-keep">
                                데일리하우징 직영 전문팀이 {regionName} 전역의 아파트, 상가, 오피스텔에 성공적으로 마친 실제 시공 정보입니다.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200/50">
                                <div className="aspect-[4/3] w-full bg-slate-200">
                                    <img src="/assets/images/hero_banner_2.png" alt={`${regionName} 아파트 장판 시공`} className="w-full h-full object-cover opacity-90" />
                                </div>
                                <div className="p-5">
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded">시공 완료</span>
                                    <h3 className="text-lg font-bold text-slate-900 mt-2 mb-1">{regionName} 아파트 34평형</h3>
                                    <p className="text-sm text-slate-500">LX 지아소리잠 4.5T (소프트 포세린) 전체 시공</p>
                                    <div className="mt-4 pt-4 border-t border-slate-200/60 flex justify-between text-xs font-medium text-slate-400">
                                        <span>시공기간: 1일</span>
                                        <span>만족도: ⭐⭐⭐⭐⭐</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200/50">
                                <div className="aspect-[4/3] w-full bg-slate-200">
                                    <img src="/assets/images/hero_banner_2.png" alt={`${regionName} 주택 마루 시공`} className="w-full h-full object-cover opacity-90" />
                                </div>
                                <div className="p-5">
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded">시공 완료</span>
                                    <h3 className="text-lg font-bold text-slate-900 mt-2 mb-1">{regionName} 빌라 24평형</h3>
                                    <p className="text-sm text-slate-500">LX 강그린 프로 강마루 (크림 오크) 시공</p>
                                    <div className="mt-4 pt-4 border-t border-slate-200/60 flex justify-between text-xs font-medium text-slate-400">
                                        <span>시공기간: 1일</span>
                                        <span>만족도: ⭐⭐⭐⭐⭐</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200/50">
                                <div className="aspect-[4/3] w-full bg-slate-200">
                                    <img src="/assets/images/hero_banner_2.png" alt={`${regionName} 상가 데코타일 시공`} className="w-full h-full object-cover opacity-90" />
                                </div>
                                <div className="p-5">
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded">시공 완료</span>
                                    <h3 className="text-lg font-bold text-slate-900 mt-2 mb-1">{regionName} 오피스 상가 48평</h3>
                                    <p className="text-sm text-slate-500">LX 에코노플러스 데코타일 바닥재 전체 시공</p>
                                    <div className="mt-4 pt-4 border-t border-slate-200/60 flex justify-between text-xs font-medium text-slate-400">
                                        <span>시공기간: 2일</span>
                                        <span>만족도: ⭐⭐⭐⭐⭐</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* =============================================
                3. CONSULTATION FORM SECTION
            ============================================= */}
            <section className="py-16 sm:py-24 bg-slate-50 border-t border-slate-200/60" id="consultation">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 p-8 sm:p-12 border border-slate-100">
                        <div className="mb-10 text-center">
                            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">
                                {regionName} 무료 견적 &amp; 실측 신청
                            </h3>
                            <p className="text-slate-400 leading-relaxed max-w-md mx-auto break-keep">
                                상세 조건(평형, 제품군)을 남겨주시면 바닥재 전문 매니저가 24시간 이내에 맞춤 견적 전화를 드립니다. (현장 실측은 무료로 진행됩니다)
                            </p>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-slate-700">고객 성함</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:border-[#d4a853] outline-none"
                                        placeholder="성함을 입력해주세요"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-slate-700">연락처</label>
                                    <input 
                                        type="tel" 
                                        required 
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:border-[#d4a853] outline-none"
                                        placeholder="010-0000-0000"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-slate-700">시공 희망 내용</label>
                                <textarea 
                                    value={formData.details}
                                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                    className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:border-[#d4a853] outline-none resize-none"
                                    placeholder="상세 아파트명, 시공 일정, 선호하는 디자인 등 특이사항을 적어주시면 정확한 견적에 도움이 됩니다."
                                    rows={4}
                                ></textarea>
                            </div>

                            {/* 개인정보 이용 동의 */}
                            <div className="p-5 bg-slate-50 rounded-2xl">
                                <div className="flex items-start gap-3">
                                    <div className="flex items-center h-5 mt-0.5">
                                        <input 
                                            id="privacy"
                                            type="checkbox" 
                                            checked={formData.privacy}
                                            onChange={(e) => setFormData({ ...formData, privacy: e.target.checked })}
                                            className="w-5 h-5 rounded border-slate-300 text-[#d4a853] focus:ring-[#d4a853]"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label htmlFor="privacy" className="text-sm font-medium text-slate-900">
                                            개인정보 수집 및 이용 동의 (필수)
                                        </label>
                                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                            전화 견적 상담 제공 및 무료 현장 실측 매칭을 위해 성함, 연락처 정보를 수집하고 완료 시까지 보관합니다.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="w-full py-5 bg-[#d4a853] text-slate-950 font-black text-lg rounded-2xl shadow-xl shadow-[#d4a853]/20 hover:bg-[#b8923e] transition-all">
                                무료 상담 및 현장 실측 신청 완료
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </main>
    );
}
