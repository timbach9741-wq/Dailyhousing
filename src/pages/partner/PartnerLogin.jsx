import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePartnerUserStore } from '../../store/usePartnerUserStore';

const PartnerLogin = () => {
  const [vendorId, setVendorId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // 이미 로그인되어 있으면 대시보드로 이동
    if (localStorage.getItem('partnerAuth') === 'true') {
      navigate('/shinilsangjae/dashboard');
    }
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (vendorId.trim() === '' || password.trim() === '') {
      setErrorMsg('아이디와 비밀번호를 입력해주세요.');
      return;
    }
    
    // usePartnerUserStore에서 검증
    const { verifyUser } = usePartnerUserStore.getState();
    const result = verifyUser(vendorId, password);

    if (result.success) {
        localStorage.setItem('partnerAuth', 'true');
        localStorage.setItem('partnerUser', result.user.name);
        localStorage.setItem('partnerRole', result.user.role); // 권한 저장
        localStorage.setItem('partnerId', result.user.id); // 아이디 저장 (비번 변경용)
        navigate('/shinilsangjae/dashboard');
    } else {
        setErrorMsg(result.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 md:p-10 border border-gray-100">
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-key text-blue-600"><path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">파트너 전용 로그인</h2>
          <p className="text-sm text-gray-500 mt-2 font-medium">부여받으신 계정 정보를 입력해주세요.</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-5">
          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium mb-4 border border-red-100 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
              {errorMsg}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">아이디 (ID)</label>
            <input 
              type="text" 
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-800 font-medium"
              placeholder="예: shinil"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">비밀번호 (Password)</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-800 font-medium"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white font-bold py-4 px-4 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors mt-6 text-base shadow-lg shadow-blue-500/30"
          >
            안전하게 접속하기
          </button>
        </form>
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-400 font-medium pb-8">
        계정 문의는 시스템 관리자에게 연락 바랍니다.
      </div>
    </div>
  );
};

export default PartnerLogin;
