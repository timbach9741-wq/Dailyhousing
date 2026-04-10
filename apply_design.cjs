const fs = require('fs');
let t = fs.readFileSync('src/pages/MobileBusinessCard.jsx', 'utf8');

const startIdx = t.indexOf('  return (');
if (startIdx === -1) {
  console.log('Return block not found!');
  process.exit(1);
}

const newReturnBlock = `  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-8 font-sans selection:bg-blue-200">
      <div className="w-full h-full sm:h-auto min-h-screen sm:min-h-0 max-w-[430px] bg-white sm:rounded-[40px] shadow-2xl sm:shadow-[0_40px_80px_-20px_rgba(0,45,90,0.15)] overflow-hidden relative pb-12 flex flex-col">
        
        {/* 🌟 다이나믹 네이비 헤더 (Option 3: Brand Identity) */}
        <div className="relative w-full pt-16 pb-24 bg-gradient-to-br from-[#001229] via-[#002D5A] to-[#004f9e] overflow-hidden rounded-b-[40px] shadow-lg shrink-0">
          
          {/* 우측 상단 플로팅 공유 버튼 (글래스모피즘 어두운 버전) */}
          <div className="absolute top-6 right-6 z-30">
            <button onClick={handleShare} className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90 hover:text-white hover:bg-white/20 hover:scale-105 active:scale-95 transition-all shadow-lg group">
              <Share2 size={20} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform" />
            </button>
          </div>

          {/* 메쉬 그라데이션 광원 효과 (젊고 역동적인 에너지) */}
          <div className="absolute top-0 right-[-10%] w-[250px] h-[250px] bg-cyan-400/30 blur-[80px] rounded-full pointer-events-none mix-blend-screen opacity-80 animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-20%] w-[300px] h-[200px] bg-blue-500/40 blur-[80px] rounded-full pointer-events-none mix-blend-screen"></div>

          {/* 로고 영역 (흰색 글래스모피즘 박스 안에 담아 로고 색상 충돌 방지 및 고급감 강조) */}
          <div className="w-full px-8 relative z-10 flex justify-center mb-6 mt-4">
            <div className="bg-white/95 backdrop-blur-xl px-6 py-4 rounded-[1.5rem] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] border border-white/40 transform hover:-translate-y-1 transition-transform">
              <img 
                  src="/business_card_logo.png" 
                  alt="Brand Logo" 
                  className="w-full h-auto object-contain max-h-[35px] drop-shadow-sm"
              />
            </div>
          </div>
          
          {/* 타이포그래피 (화이트 & 시안 포인트) */}
          <div className="text-center relative z-10 px-6 w-full">
            <h1 className="text-[42px] font-black text-white tracking-tighter leading-tight mb-4 drop-shadow-md">
              {profile.name}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="px-5 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-extrabold rounded-full text-[15px] tracking-wide shadow-[0_0_15px_rgba(56,189,248,0.4)]">
                {profile.title}
              </span>
              <span className="text-blue-100 font-bold tracking-tight text-[15px] bg-white/10 px-5 py-2 rounded-full border border-white/10 backdrop-blur-md">
                {profile.company}
              </span>
            </div>
          </div>
        </div>

        {/* 🚀 빠른 액션 버튼 2개 (플로팅 겹침 효과 - 트렌디 모바일 UI) */}
        <div className="px-8 -mt-9 relative z-20">
          <div className="flex gap-4 p-2 bg-white/80 backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,45,90,0.15)] border border-white/80">
            <a href={\`tel:\${profile.phone.replace(/-/g, '')}\`} className="flex-1 bg-[#002D5A] hover:bg-[#002244] active:scale-[0.97] transition-all text-white py-4 rounded-[1.5rem] font-black text-[15px] flex items-center justify-center gap-2 shadow-lg shadow-[#002D5A]/30">
              <Phone size={19} strokeWidth={2.5} className="animate-bounce" style={{animationDuration: '2s'}}/>
              전화 걸기
            </a>
            <button onClick={downloadVCard} className="flex-1 bg-white text-[#002D5A] hover:bg-slate-50 active:scale-[0.97] transition-all py-4 rounded-[1.5rem] font-black text-[15px] flex items-center justify-center gap-2 shadow-sm border border-slate-100">
              <Download size={19} strokeWidth={2.5}/>
              연락처 저장
            </button>
          </div>
        </div>

        {/* 모던 라이트 컨택트 리스트 (아이콘에 회사 메인 컬러 적용) */}
        <div className="px-8 mt-8 flex flex-col gap-3.5 z-10 w-full flex-1">
           {/* Mobile */}
           <a href={\`tel:\${profile.phone.replace(/-/g, '')}\`} className="group flex items-center gap-4 bg-white p-4 rounded-[1.5rem] shadow-[0_4px_20px_-5px_rgba(0,0,0,0.03)] border border-slate-50 hover:shadow-lg hover:-translate-y-0.5 hover:border-blue-100 transition-all cursor-pointer">
             <div className="w-13 h-13 min-w-[52px] min-h-[52px] rounded-2xl bg-blue-50/80 flex items-center justify-center text-[#002D5A] shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform">
               <Phone size={22} strokeWidth={2.5} />
             </div>
             <div className="flex-1 overflow-hidden">
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Mobile</p>
                <p className="font-extrabold text-slate-800 text-[17px] tracking-tight">{profile.phone}</p>
             </div>
           </a>
           
           {/* Email */}
           <a href={\`mailto:\${profile.email}\`} className="group flex items-center gap-4 bg-white p-4 rounded-[1.5rem] shadow-[0_4px_20px_-5px_rgba(0,0,0,0.03)] border border-slate-50 hover:shadow-lg hover:-translate-y-0.5 hover:border-blue-100 transition-all cursor-pointer">
             <div className="w-13 h-13 min-w-[52px] min-h-[52px] rounded-2xl bg-indigo-50/80 flex items-center justify-center text-indigo-600 shrink-0 group-hover:scale-110 group-hover:-rotate-6 transition-transform">
               <Mail size={22} strokeWidth={2.5} />
             </div>
             <div className="flex-1 overflow-hidden">
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Email</p>
                <p className="font-black text-slate-800 text-[15px] tracking-tight truncate">{profile.email}</p>
             </div>
           </a>

           {/* Address */}
           <div className="group flex items-center gap-4 bg-white p-4 rounded-[1.5rem] shadow-[0_4px_20px_-5px_rgba(0,0,0,0.03)] border border-slate-50 hover:shadow-lg hover:-translate-y-0.5 hover:border-blue-100 transition-all">
             <div className="w-13 h-13 min-w-[52px] min-h-[52px] rounded-2xl bg-cyan-50/80 flex items-center justify-center text-cyan-600 shrink-0 group-hover:scale-110 transition-transform">
               <MapPin size={22} strokeWidth={2.5} />
             </div>
             <div className="flex-1 overflow-hidden">
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Office / HQ</p>
                <p className="font-bold text-slate-700 text-[13px] leading-snug break-keep">{profile.address}</p>
             </div>
           </div>
        </div>

        <div className="w-full px-12 my-8 opacity-40">
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
        </div>

        {/* 🔲 스마트 B2B 연동 구역 (브랜드 다이나믹 테마) */}
        <div className="px-8 flex flex-col items-center">
           
           <div className="flex items-center justify-center gap-2 mb-6 bg-slate-50 px-6 py-2.5 rounded-full border border-slate-100 shadow-inner">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
              </span>
              <p className="text-[12px] font-extrabold text-slate-600 tracking-wider">스마트 건축자재 발주 시스템</p>
           </div>
           
           {/* QR 코드 영역 (메인 컬러 포인트) */}
           <div className="bg-white p-5 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,45,90,0.15)] border-2 border-slate-50 mb-8 relative group hover:-translate-y-2 transition-transform duration-500 cursor-pointer">
              <div className="absolute -top-3 -right-3 px-4 py-2 bg-gradient-to-r from-[#002D5A] to-blue-500 rounded-full flex gap-1.5 items-center justify-center text-white text-[11px] font-black tracking-widest shadow-[0_5px_15px_rgba(0,45,90,0.3)] transform group-hover:rotate-12 transition-transform z-10">
                <span className="material-symbols-outlined text-[14px] font-bold">qr_code_scanner</span>
                SCAN 
              </div>
              <div className="bg-slate-50 p-3 rounded-[1.5rem]">
                <QRCodeSVG value={profile.cardUrl} size={130} fgColor="#001D4A" level="H" className="opacity-95"/>
              </div>
           </div>

           {/* 브랜드 딥네이비 액션 버튼 */}
           <a href="/login" className="w-full relative group overflow-hidden bg-gradient-to-r from-[#001D4A] to-[#002D5A] text-white py-4 rounded-2xl font-black text-[16px] tracking-wide flex items-center justify-center gap-2 shadow-[0_15px_30px_-10px_rgba(0,45,90,0.5)] active:scale-[0.98] transition-all">
             <div className="absolute inset-0 w-1/4 h-full bg-white/20 -skew-x-12 translate-x-[-150%] group-hover:animate-[shine_1.5s_ease-in-out]"></div>
             파트너 비즈니스 몰 입장 <ExternalLink size={20} strokeWidth={3}/>
           </a>
           <p className="text-xs font-bold text-slate-400 mt-4 text-center px-4 leading-relaxed">
             인테리어 업체를 위한<br/>프리미엄 자재 도매 전용몰
           </p>
        </div>

      </div>
    </div>
  );
};

export default MobileBusinessCard;
`;

const updatedContent = t.substring(0, startIdx) + newReturnBlock;
fs.writeFileSync('src/pages/MobileBusinessCard.jsx', updatedContent);
console.log('Successfully updated component UI to Option 3');
