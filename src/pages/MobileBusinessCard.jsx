import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Phone, Mail, Building, MapPin, ExternalLink, Download, Share2 } from 'lucide-react';

const MobileBusinessCard = () => {
  // URL 파라미터에서 userId를 가져옵니다. 기본값은 'ceo'로 설정합니다.
  const { userId = 'ceo' } = useParams();

  // 데일리하우징 운영 도메인 (데일리하우징.kr)
  const DOMAIN = 'https://xn--2n1b71jv6ljxa69ffzy.kr';

  // 두 명의 명함 데이터를 매핑하는 객체
  const profiles = {
    ceo: {
      name: "이광연",
      title: "대표이사",
      company: "데일리하우징",
      phone: "010-7590-5522",
      officePhone: "031-409-5556",
      email: "wkwk76@naver.com",
      address: "경기도 안산시 상록구 용신로 258",
      website: DOMAIN, 
      cardUrl: `${DOMAIN}/card/ceo` 
    },
    director: {
      name: "이홍석",
      title: "대표이사", 
      company: "데일리하우징",
      phone: "010-6351-9509", 
      officePhone: "031-409-5556",
      email: "timbach@naver.com",
      address: "경기도 안산시 상록구 용신로 258",
      website: DOMAIN, 
      cardUrl: `${DOMAIN}/card/director` 
    }
  };

  const profile = profiles[userId];

  // 만약 URL 파라미터가 유효하지 않으면 기본 ceo 명함으로 리다이렉트
  if (!profile) {
    return <Navigate to="/card/ceo" replace />;
  }

  // vCard 자동 생성 및 다운로드 로직
  const downloadVCard = () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
N:${profile.name};;;;
FN:${profile.name}
ORG:${profile.company}
TITLE:${profile.title}
TEL;TYPE=CELL:${profile.phone}
TEL;TYPE=WORK,VOICE:${profile.officePhone}
EMAIL;TYPE=WORK:${profile.email}
URL:${profile.website}
END:VCARD`;

    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${profile.name}_${profile.company}.vcf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${profile.company} ${profile.name}`,
        text: '데일리하우징 모바일 명함',
        url: profile.cardUrl,
      }).catch(console.error);
    } else {
      alert('공유하기를 지원하지 않는 브라우저입니다. URL을 복사해주세요.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-0 sm:p-8 font-sans">
      {/* 📱 모바일 디바이스 뷰에 맞춘 컨테이너 (트렌디한 젊은 느낌의 베젤리스 & 라운디드 룩) */}
      <div className="w-full h-full sm:h-auto max-w-[430px] bg-white sm:rounded-[40px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden relative pb-12 sm:border sm:border-slate-100">
        
        {/* 우측 상단 플로팅 공유 버튼 (글래스모피즘) */}
        <div className="absolute top-6 right-6 z-30">
          <button onClick={handleShare} className="w-12 h-12 rounded-full bg-white/60 backdrop-blur-xl flex items-center justify-center text-slate-600 hover:text-[#002D5A] hover:bg-white transition-all shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white/50 active:scale-90 group">
            <Share2 size={20} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* 🌟 전면 통합 헤더 영역 (다이나믹 레이아웃) */}
        <div className="w-full pt-20 pb-10 flex flex-col items-center justify-center relative overflow-hidden bg-white">
           
           {/* 젊고 감각적인 백그라운드 빛 번짐 효과 (메시 그라데이션) */}
           <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[250px] bg-blue-400/10 blur-[80px] rounded-full pointer-events-none"></div>
           <div className="absolute top-[20%] right-[-10%] w-[60%] h-[200px] bg-[#BFA169]/10 blur-[70px] rounded-full pointer-events-none"></div>

           {/* 압도적으로 큼직해진 로고 이미지 */}
           <div className="w-full px-8 relative z-10 flex justify-center mb-10 mt-8">
             <img 
                 src="/business_card_logo.png" 
                 alt="Brand Logo" 
                 className="w-full h-auto object-contain max-h-[220px] drop-shadow-xl transform transition-transform duration-700 hover:scale-[1.04] hover:-translate-y-1"
              />
           </div>
           
           {/* 힙하고 모던한 타이포그래피 (두꺼운 폰트, 감각적인 배치) */}
           <div className="text-center relative z-10 px-6 w-full">
             <h1 className="text-[44px] font-black text-slate-800 tracking-tighter leading-none mb-6">{profile.name}</h1>
             <div className="flex flex-wrap items-center justify-center gap-3">
               <span className="px-5 py-2.5 bg-[#002D5A] text-white font-extrabold rounded-full text-[15px] tracking-wide shadow-lg shadow-[#002D5A]/30 transition-transform hover:scale-105 cursor-default">
                 {profile.title}
               </span>
               <span className="text-slate-600 font-bold tracking-tight text-[17px] bg-slate-100 px-5 py-2.5 rounded-full">{profile.company}</span>
             </div>
           </div>
        </div>

        {/* 🚀 빠른 액션 버튼 2개 (앱 스타일의 둥근 입체 버튼) */}
        <div className="flex gap-4 px-8 mt-2">
          <a href={`tel:${profile.phone.replace(/-/g, '')}`} className="flex-1 bg-gradient-to-tr from-blue-600 to-[#002D5A] hover:opacity-90 active:scale-95 transition-all text-white py-4 rounded-[1.25rem] font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20">
            <Phone size={19} strokeWidth={2.5}/>
            전화 연결
          </a>
          <button onClick={downloadVCard} className="flex-1 bg-white border-2 border-slate-100 text-slate-700 hover:border-slate-200 active:scale-95 transition-all py-4 rounded-[1.25rem] font-bold flex items-center justify-center gap-2 shadow-sm">
            <Download size={19} strokeWidth={2.5}/>
            연락처 저장
          </button>
        </div>

        {/* 모던 데일리 컨택트 컨테이너 (각기 다른 스타일로 시각적 구분) */}
        <div className="px-8 mt-10 flex flex-col gap-3.5">
           
           {/* 1. 사무실 (포멀 스퀘어형 - 슬레이트/인디고 톤) - 맨 위로 이동 */}
           <a href={`tel:${profile.officePhone.replace(/-/g, '')}`} className="group flex items-center gap-4 bg-slate-50 p-3.5 rounded-[1.25rem] border border-slate-200 shadow-sm hover:shadow-md hover:bg-slate-100 active:scale-[0.98] transition-all cursor-pointer">
             <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-slate-600 shrink-0 group-hover:scale-110 transition-transform">
               <Building size={20} strokeWidth={2.5} />
             </div>
             <div className="flex-1 pl-1">
                <p className="text-[12px] text-slate-500 font-bold tracking-wide mb-0.5">사무실 번호</p>
                <p className="font-extrabold text-slate-700 text-[16px] tracking-tight">{profile.officePhone}</p>
             </div>
           </a>

           {/* 2. 휴대폰 (메인 액션형 - 블루 톤, 라운드) */}
           <a href={`tel:${profile.phone.replace(/-/g, '')}`} className="group flex items-center gap-4 bg-blue-50/50 p-4 rounded-[1.5rem] border border-blue-100 shadow-sm hover:shadow-md hover:border-blue-200 active:scale-[0.98] transition-all cursor-pointer">
             <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-inner">
               <Phone size={22} strokeWidth={2.5} />
             </div>
             <div className="flex-1">
                <p className="text-[12px] text-blue-500 font-extrabold tracking-wide mb-0.5">휴대폰 번호</p>
                <p className="font-black text-slate-800 text-[18px] tracking-tight">{profile.phone}</p>
             </div>
           </a>

           {/* 3. 이메일 (좌측 아이콘 및 오렌지 톤으로 통일성 부여) */}
           <a href={`mailto:${profile.email}`} className="group flex items-center gap-4 bg-orange-50/40 p-4 rounded-[1.5rem] border border-orange-100 shadow-sm hover:shadow-md hover:border-orange-200 active:scale-[0.98] transition-all cursor-pointer">
             <div className="w-12 h-12 rounded-full bg-orange-100/80 flex items-center justify-center text-orange-500 shrink-0 group-hover:scale-110 group-hover:-rotate-3 transition-transform">
               <Mail size={20} strokeWidth={2.5} />
             </div>
             <div className="flex-1 pl-1">
                <p className="text-[12px] text-orange-600 font-bold tracking-wide mb-1">이메일 주소</p>
                <p className="font-bold text-slate-700 text-[15px]">{profile.email}</p>
             </div>
           </a>

           {/* 4. 주소 (언밸런스 쉐입형 - 에메랄드 톤) */}
           <div className="group flex items-center gap-4 bg-emerald-50/40 p-4 rounded-tl-[1.5rem] rounded-br-[1.5rem] rounded-tr-[10px] rounded-bl-[10px] border border-emerald-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer">
             <div className="w-12 h-12 rounded-xl bg-emerald-100/80 flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-110 transition-transform">
               <MapPin size={20} strokeWidth={2.5} />
             </div>
             <div className="flex-1">
                <p className="text-[12px] text-emerald-600 font-bold tracking-wide mb-1">사무실 주소</p>
                <p className="font-semibold text-slate-600 text-[14px] leading-snug break-keep">{profile.address}</p>
             </div>
           </div>
        </div>

        {/* 부드러운 하단 구분선 */}
        <div className="w-full px-8 my-10">
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
        </div>

        {/* 🔲 스마트 B2B 연동 구역 (힙한 배지 & 카드 UI) */}
        <div className="px-8 flex flex-col items-center pb-4">
           
           <div className="flex items-center justify-center gap-2 mb-8 bg-indigo-50/50 px-5 py-2.5 rounded-full border border-indigo-100/50">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
              </span>
              <p className="text-[13px] font-extrabold text-indigo-700 tracking-wider">스마트 건축자재 관리 플랫폼</p>
           </div>
           
           {/* QR 코드 영역 (플로팅 입체 효과) */}
           <div className="bg-white p-6 rounded-[2.5rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.08)] border border-slate-50 mb-10 relative group hover:-translate-y-2 transition-transform duration-500 cursor-pointer">
              {/* 통통 튀는 스캔 배지 */}
              <div className="absolute -top-3 -right-3 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex gap-1.5 items-center justify-center text-white text-[11px] font-black tracking-widest shadow-lg shadow-blue-500/30 transform group-hover:rotate-12 transition-transform">
                <span className="material-symbols-outlined text-[14px] font-bold">qr_code_scanner</span>
                SCAN
              </div>
              <QRCodeSVG value={profile.cardUrl} size={150} fgColor="#1e293b" level="Q" className="opacity-90"/>
           </div>

           {/* 네온사인 느낌의 파트너 가입 버튼 */}
           <a href="/login" className="w-full relative group overflow-hidden bg-slate-900 text-white py-4.5 rounded-2xl font-black text-[16px] tracking-wide flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-[0_15px_30px_-10px_rgba(15,23,42,0.4)] active:scale-[0.98]">
             <div className="absolute inset-0 w-1/4 h-full bg-white/10 -skew-x-12 translate-x-[-150%] group-hover:animate-[shine_1.5s_ease-in-out]"></div>
             비즈니스 몰 입장하기 <ExternalLink size={20} strokeWidth={3}/>
           </a>
           <p className="text-[13px] font-bold text-slate-400 mt-5 text-center">도매 파트너(인테리어 업체) 전용 발주 시스템</p>
        </div>

      </div>
    </div>
  );
};

export default MobileBusinessCard;
