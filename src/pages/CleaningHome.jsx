import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function CleaningHome() {
  const [houseType, setHouseType] = useState('아파트');
  const [size, setSize] = useState(24);
  const [sliderPosition, setSliderPosition] = useState(50);
  
  // 부가서비스 옵션 상태
  const [addons, setAddons] = useState({
    syndrome: false,
    acWash: false,
    regular: false
  });

  // 예상 견적 로직 (예: 아파트 평당 12,000원, 빌라 14,000원 + 추가 옵션)
  const getEstimatedPrice = () => {
    const basePrice = houseType === '아파트' ? 12000 : 14000;
    let total = size * basePrice;
    
    if (addons.syndrome) total += 150000;
    if (addons.acWash) total += 120000;
    if (addons.regular) total += 200000;
    
    return total;
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans">
      {/* =============================================
          SECTION 1: Hero Banner & 1초 견적기
      ============================================= */}
      <section className="relative w-full min-h-[700px] flex items-center justify-center overflow-hidden bg-slate-900 pt-20 pb-16">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070" 
            alt="Clean Room Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-12">
          
          {/* Hero Text */}
          <div className="text-white lg:w-3/5 flex flex-col items-start text-left">
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold bg-blue-600/30 text-blue-300 border border-blue-500/50 rounded-full backdrop-blur-md">
              ✨ 4대 집중 홈케어 / 100% 본사 직영팀 투입
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-[1.2] tracking-tight">
              이사 앞두고<br/>
              고민 많으셨죠? <br/>
              설렘만 남겨드릴게요.
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 font-light mb-8 max-w-lg leading-relaxed">
              입주청소, 새집증후군, 가전 분해청소, 정기청소까지. <br className="hidden sm:block" />
              외주 인력이 아닌 <strong className="font-semibold text-white">분야별 전문 정규직 팀</strong>이 <br className="hidden sm:block" />
              당신의 새로운 시작과 일상을 완벽하게 관리합니다.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-slate-200">
                <span className="material-symbols-outlined text-green-400">check_circle</span>
                당일 추가 요금 절대 없음 (계약서 명시)
              </li>
              <li className="flex items-center gap-3 text-slate-200">
                <span className="material-symbols-outlined text-green-400">check_circle</span>
                독일 카처 고온 스팀기 & 친환경 세제 사용
              </li>
            </ul>
          </div>

          {/* 1초 견적기 위젯 */}
          <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl relative">
            <div className="absolute -top-3 -right-3">
              <span className="relative flex h-6 w-6">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-6 w-6 bg-blue-500 items-center justify-center text-white text-xs font-bold">!</span>
              </span>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">우리집 입주청소 비용은?</h2>
            <p className="text-slate-300 text-sm mb-6">3초 만에 확인하는 투명한 정찰제 견적</p>
            
            <div className="space-y-5">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">💡 주거 형태</label>
                <div className="grid grid-cols-3 gap-2">
                  {['아파트', '빌라', '오피스텔'].map(type => (
                    <button
                      key={type}
                      onClick={() => setHouseType(type)}
                      className={`py-2 rounded-lg text-sm font-semibold transition-all ${
                        houseType === type 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">📏 공급 면적 (평)</label>
                <div className="flex items-center bg-white/5 border border-white/20 rounded-xl overflow-hidden focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all">
                  <input 
                    type="number" 
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value) || 0)}
                    min="10"
                    max="100"
                    className="w-full bg-transparent p-4 text-white font-bold text-lg outline-none"
                  />
                  <span className="text-slate-400 font-medium px-4">평</span>
                </div>
              </div>

              <div className="pt-4 mt-6">
                <label className="block text-slate-300 text-sm font-medium mb-3">🛠 추가 묶음 케어 (동시 진행 시 할인)</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={addons.syndrome} 
                      onChange={() => setAddons(p => ({...p, syndrome: !p.syndrome}))} 
                      className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500 bg-white/10" 
                    />
                    <span className="text-slate-200 text-sm flex-1">새집증후군 (피톤치드 연무) <span className="text-blue-300 text-xs ml-1 font-bold">+15만원</span></span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={addons.acWash} 
                      onChange={() => setAddons(p => ({...p, acWash: !p.acWash}))} 
                      className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500 bg-white/10" 
                    />
                    <span className="text-slate-200 text-sm flex-1">에어컨/세탁기 분해 세척 <span className="text-blue-300 text-xs ml-1 font-bold">+12만원</span></span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={addons.regular} 
                      onChange={() => setAddons(p => ({...p, regular: !p.regular}))} 
                      className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500 bg-white/10" 
                    />
                    <span className="text-slate-200 text-sm flex-1">집 정기 청소 (첫 결제 포함) <span className="text-blue-300 text-xs ml-1 font-bold">+20만원</span></span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 mt-6">
                {/* 프리미엄 신뢰도 배너 (경쟁사 분석 반영) */}
                <div className="bg-slate-800/80 rounded-xl p-3 mb-5 border border-slate-700 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-blue-400 text-[16px] mt-0.5">verified_user</span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <strong className="text-blue-300">7일 무상 A/S 보장.</strong> 결제 후 불만족 시 다시 방문합니다.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-rose-400 text-[16px] mt-0.5">info_i</span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <strong className="text-rose-300">투명한 요금제.</strong> 빌트인 가전, 심한 오염(곰팡이 등) 외 부당한 현장 추가금을 절대 요구하지 않습니다.
                    </p>
                  </div>
                </div>

                <p className="text-slate-400 text-xs mb-1 float-right">VAT 포함</p>
                <p className="text-slate-300 text-sm mb-1 font-medium">예상 견적가</p>
                <div className="text-4xl font-black text-white flex items-baseline gap-1">
                  {getEstimatedPrice().toLocaleString()} <span className="text-xl font-normal text-slate-300">원</span>
                </div>
              </div>

              <button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                자세한 맞춤 견적 카톡으로 받기
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =============================================
          SECTION 2: Flip Card (차별화 1 - 아이디어 3 적용)
      ============================================= */}
      <section className="py-24 bg-slate-50 border-t border-slate-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">디테일의 차이가 청소의 격을 만듭니다.</h2>
            <p className="text-lg text-slate-600 font-medium">카드를 뒤집어, 데일리하우징만의 완벽한 비포/애프터 스케일링을 확인해보세요.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Card 1: 주방 후드 */}
            <div className="group h-[400px] w-full [perspective:1000px] cursor-pointer">
              <div className="relative h-full w-full rounded-2xl shadow-xl transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                
                {/* Front Face (After - Clean) */}
                <div className="absolute inset-0 h-full w-full rounded-2xl bg-white [backface-visibility:hidden] overflow-hidden border border-slate-200">
                  <img src="/clean_kitchen.png" className="h-2/3 w-full object-cover" alt="주방 후드 깨끗" />
                  <div className="h-1/3 p-6 bg-white flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-2">
                       <h3 className="text-lg font-bold text-slate-900">주방 후드망 완전 탈거 세척</h3>
                       <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">After</span>
                    </div>
                    <p className="text-sm text-slate-600 flex items-center gap-2">
                      마우스를 올려 비포 사진 확인 <span className="material-symbols-outlined text-sm">flip_camera_android</span>
                    </p>
                  </div>
                </div>

                {/* Back Face (Before - Dirty) */}
                <div className="absolute inset-0 h-full w-full rounded-2xl bg-slate-900 [transform:rotateY(180deg)] [backface-visibility:hidden] overflow-hidden border border-slate-800">
                  <div className="h-2/3 w-full relative">
                    <img src="/dirty_kitchen.png" className="absolute inset-0 w-full h-full object-cover opacity-80" alt="주방 후드 더러움" />
                  </div>
                  <div className="h-1/3 p-6 bg-slate-900 flex flex-col justify-center text-white relative z-10">
                     <div className="flex justify-between items-center mb-2">
                       <h3 className="text-lg font-bold text-white">최고급 알칼리성 세제 분해</h3>
                       <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-1 rounded-full border border-red-500/30">오염도: 심각</span>
                    </div>
                    <p className="text-sm text-slate-300">누렇게 굳어버린 요리 기름때를 안전하고 깨끗하게 살균 철거했습니다.</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Card 2: 싱크대 배수구 */}
            <div className="group h-[400px] w-full [perspective:1000px] cursor-pointer">
              <div className="relative h-full w-full rounded-2xl shadow-xl transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]" >
                
                {/* Front Face (After) */}
                <div className="absolute inset-0 h-full w-full rounded-2xl bg-white [backface-visibility:hidden] overflow-hidden border border-slate-200">
                  <img src="/clean_bathroom.png" className="h-2/3 w-full object-cover" alt="화장실 깨끗" />
                  <div className="h-1/3 p-6 bg-white flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-2">
                       <h3 className="text-lg font-bold text-slate-900">화장실/배수구 고압 살균</h3>
                       <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">After</span>
                    </div>
                    <p className="text-sm text-slate-600 flex items-center gap-2">
                      마우스를 올려 비포 사진 확인 <span className="material-symbols-outlined text-sm">flip_camera_android</span>
                    </p>
                  </div>
                </div>

                {/* Back Face (Before) */}
                <div className="absolute inset-0 h-full w-full rounded-2xl bg-slate-900 [transform:rotateY(180deg)] [backface-visibility:hidden] overflow-hidden border border-slate-800">
                  <div className="h-2/3 w-full relative">
                    <img src="/dirty_bathroom.png" className="absolute inset-0 w-full h-full object-cover opacity-80" alt="화장실 더러움" />
                  </div>
                  <div className="h-1/3 p-6 bg-slate-900 flex flex-col justify-center text-white relative z-10">
                     <div className="flex justify-between items-center mb-2">
                       <h3 className="text-lg font-bold text-white">트랩 안쪽까지 스케일링</h3>
                       <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-1 rounded-full border border-red-500/30">악취 원인</span>
                    </div>
                    <p className="text-sm text-slate-300">음식물 찌꺼기와 깊은 곳의 곰팡이/물때까지 고압 세척했습니다.</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Card 3: 수전 및 창틀 */}
            <div className="group h-[400px] w-full [perspective:1000px] cursor-pointer">
              <div className="relative h-full w-full rounded-2xl shadow-xl transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]" >
                
                {/* Front Face (After) */}
                <div className="absolute inset-0 h-full w-full rounded-2xl bg-white [backface-visibility:hidden] overflow-hidden border border-slate-200">
                  <img src="/clean_window.png" className="h-2/3 w-full object-cover" alt="창틀 수전 깨끗" />
                  <div className="h-1/3 p-6 bg-white flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-2">
                       <h3 className="text-lg font-bold text-slate-900">외풍 차단 창틀 틈새 세척</h3>
                       <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">After</span>
                    </div>
                    <p className="text-sm text-slate-600 flex items-center gap-2">
                      마우스를 올려 비포 사진 확인 <span className="material-symbols-outlined text-sm">flip_camera_android</span>
                    </p>
                  </div>
                </div>

                {/* Back Face (Before) */}
                <div className="absolute inset-0 h-full w-full rounded-2xl bg-slate-900 [transform:rotateY(180deg)] [backface-visibility:hidden] overflow-hidden border border-slate-800">
                  <div className="h-2/3 w-full relative">
                    <img src="/dirty_window.png" className="absolute inset-0 w-full h-full object-cover opacity-80" alt="창틀 더러움" />
                  </div>
                  <div className="h-1/3 p-6 bg-slate-900 flex flex-col justify-center text-white relative z-10">
                     <div className="flex justify-between items-center mb-2">
                       <h3 className="text-lg font-bold text-white">미세먼지 완벽 제거</h3>
                       <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-1 rounded-full border border-red-500/30">벌레/미세먼지</span>
                    </div>
                    <p className="text-sm text-slate-300">스팀 세척기와 전용 브러쉬를 이용해 닦기 힘든 좁은 창틀 먼지까지 제거합니다.</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =============================================
          SECTION 2-1: 4대 핵심 서비스 (사용자 요청 반영)
      ============================================= */}
      <section className="py-24 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 mb-4 text-sm font-bold bg-blue-100 text-blue-700 rounded-full">CORE SERVICES</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">데일리하우징 4대 핵심 서비스</h2>
            <p className="text-lg text-slate-600 font-medium">우리가 가장 잘하는 4가지 청소에만 집중하여 변함없는 퀄리티를 약속합니다.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Service 1 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group relative">
              <div className="h-56 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10 transition-opacity group-hover:opacity-80"></div>
                <img src="/service_move_in.png" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="입주청소" />
                <h3 className="absolute bottom-4 left-6 text-2xl font-bold text-white z-20">입주청소</h3>
              </div>
              <div className="p-6">
                <p className="text-slate-600 mb-4 text-sm leading-relaxed">서랍장 안쪽, 배수구 트랩 등 보이지 않는 곳의 먼지까지 완전 탈거하여 고압세척합니다.</p>
                <Link to="/cleaning/move-in" className="flex items-center text-blue-600 text-sm font-bold cursor-pointer group-hover:text-blue-700">
                  자세히 보기 <span className="material-symbols-outlined text-sm ml-1">arrow_forward_ios</span>
                </Link>
              </div>
            </div>
            
            {/* Service 2 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group relative">
              <div className="h-56 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10 transition-opacity group-hover:opacity-80"></div>
                <img src="/service_syndrome.png" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="새집증후군" />
                <h3 className="absolute bottom-4 left-6 text-2xl font-bold text-white z-20">새집증후군</h3>
              </div>
              <div className="p-6">
                <p className="text-slate-600 mb-4 text-sm leading-relaxed">유해 건축 자재에서 뿜어져 나오는 포름알데히드를 피톤치드 연무 시공으로 완벽 차단합니다.</p>
                <Link to="/cleaning/sick-building" className="flex items-center text-blue-600 text-sm font-bold cursor-pointer group-hover:text-blue-700">
                  자세히 보기 <span className="material-symbols-outlined text-sm ml-1">arrow_forward_ios</span>
                </Link>
              </div>
            </div>
            
            {/* Service 3 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group relative">
              <div className="h-56 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10 transition-opacity group-hover:opacity-80"></div>
                <img src="/service_appliance.png" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="에어컨/세탁기 청소" />
                <h3 className="absolute bottom-4 left-6 text-2xl font-bold text-white z-20 leading-snug">에어컨/세탁기<br/>청소</h3>
              </div>
              <div className="p-6">
                <p className="text-slate-600 mb-4 text-sm leading-relaxed">필터 교체와 다릅니다. 내부 냉각핀과 드럼통 안쪽의 찌든 세균과 곰팡이를 날려버립니다.</p>
                <Link to="/cleaning/appliance" className="flex items-center text-blue-600 text-sm font-bold cursor-pointer group-hover:text-blue-700">
                  자세히 보기 <span className="material-symbols-outlined text-sm ml-1">arrow_forward_ios</span>
                </Link>
              </div>
            </div>

            {/* Service 4 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group relative border-2 border-transparent hover:border-blue-100">
              <div className="absolute top-0 right-0 bg-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-bl-lg z-30">인기 구독!</div>
              <div className="h-56 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10 transition-opacity group-hover:opacity-80"></div>
                <img src="/service_regular.png" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="집 정기 청소" />
                <h3 className="absolute bottom-4 left-6 text-2xl font-bold text-white z-20">집 정기 청소</h3>
              </div>
              <div className="p-6">
                <p className="text-slate-600 mb-4 text-sm leading-relaxed">입주 상태를 그대로! 검증된 호텔식 매뉴얼로 각 가정마다 전담 매니저가 지정되어 방문합니다.</p>
                <Link to="/cleaning/regular" className="flex items-center text-blue-600 text-sm font-bold cursor-pointer group-hover:text-blue-700">
                  자세히 보기 <span className="material-symbols-outlined text-sm ml-1">arrow_forward_ios</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =============================================
          SECTION 3: 3 Promises (전문성 / 탈거 / A/S)
      ============================================= */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 mb-4 text-sm font-bold bg-indigo-100 text-indigo-700 rounded-full">OUR PROMISE</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">당연한 것을 완벽하게 지킵니다.</h2>
            <p className="text-lg text-slate-600 font-medium">눈속임 없는 정직한 시공과 책임지는 마인드, 데일리하우징의 3가지 원칙입니다.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Promise 1 */}
            <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100 group">
              <div className="h-60 overflow-hidden relative">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                <img src="/promise_disassembly_kr.png" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="100% 완전 탈거 세척" />
                <div className="absolute top-4 left-4 bg-blue-600 text-white w-10 h-10 flex items-center justify-center rounded-full font-black text-xl z-20 shadow-lg">1</div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">100% 완전 탈거 세척</h3>
                <p className="text-slate-600 leading-relaxed font-medium">전등 갓, 환풍기, 서랍장, 하수구 트랩까지 뺄 수 있는 모든 것을 완전히 분해합니다. 보이지 않는 은밀한 곳의 먼지와 곰팡이가 호흡기를 위협하기 때문입니다.</p>
              </div>
            </div>
            
            {/* Promise 2 */}
            <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100 group">
              <div className="h-60 overflow-hidden relative">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                <img src="/promise_experts_kr.png" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="전원 정규직 마스터 투입" />
                <div className="absolute top-4 left-4 bg-green-600 text-white w-10 h-10 flex items-center justify-center rounded-full font-black text-xl z-20 shadow-lg">2</div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">전원 정규직 마스터 투입</h3>
                <p className="text-slate-600 leading-relaxed font-medium">오더를 던지고 빠지는 일회성 알바생, 하청 용역이 절대 아닙니다. 본사 교육을 이수한 최소 3년 경력의 정규직 팀장이 각 현장에 투입되어 직접 구역을 관리합니다.</p>
              </div>
            </div>
            
            {/* Promise 3 */}
            <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100 group">
              <div className="h-60 overflow-hidden relative">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                <img src="/promise_warranty.png" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="7일 무상 A/S 보장" />
                <div className="absolute top-4 left-4 bg-rose-600 text-white w-10 h-10 flex items-center justify-center rounded-full font-black text-xl z-20 shadow-lg">3</div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">7일 무상 A/S 보장</h3>
                <p className="text-slate-600 leading-relaxed font-medium">당일 바빠서 미처 꼼꼼히 확인하지 못하셨나요? 안심하세요. 결제가 끝났다고 잠수타지 않습니다. 7일 이내 불만족 시 무조건 현장에 다시 방문해 해결합니다.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =============================================
          SECTION 4: CTA (Call To Action)
      ============================================= */}
      <section className="py-20 bg-blue-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-black mb-6">청소가 끝난 후, 카톡으로 결과 보고서를 보내드립니다.</h2>
          <p className="text-xl text-blue-100 font-light mb-10">오실 필요 없이 편안하게 일상에 집중하세요. 저희가 완벽한 결과를 보여드립니다.</p>
          <button className="bg-white text-blue-600 font-bold text-lg px-10 py-5 rounded-full shadow-[0_10px_30px_rgba(255,255,255,0.2)] hover:shadow-[0_15px_40px_rgba(255,255,255,0.4)] hover:-translate-y-1 transition-all duration-300">
            무료 상담 시작하기
          </button>
        </div>
      </section>
    </div>
  );
}
