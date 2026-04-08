import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const PartnerLogin = () => {
  const [vendorId, setVendorId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // onAuthStateChanged를 활용해 이미 로그인된 파트너 계정인지 확인
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user && user.email?.endsWith('@partner.dailyhousing.com')) {
            navigate('/shinilsangjae/dashboard');
        }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (vendorId.trim() === '' || password.trim() === '') {
      setErrorMsg('아이디와 비밀번호를 입력해주세요.');
      return;
    }
    
    setIsLoading(true);
    setErrorMsg('');

    // 파트너 전용(가상) 이메일 조합
    const partnerEmail = `${vendorId}@partner.dailyhousing.com`;

    try {
        // Firebase Auth 로그인 시도
        await signInWithEmailAndPassword(auth, partnerEmail, password);
        
        // 로그인 성공 시 Firestore 파트너 유저 정보 조회
        const userDocRef = doc(db, 'partner_users', vendorId);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            localStorage.setItem('partnerUser', userData.name);
            localStorage.setItem('partnerRole', userData.role);
            localStorage.setItem('partnerId', vendorId);
            
            setIsLoading(false);
            navigate('/shinilsangjae/dashboard');
        } else {
            // DB에는 없는데 Auth에만 있는 경우 (이전 권한 에러 등으로 DB생성이 누락된 경우 복구)
            if (vendorId === 'admin1' || vendorId === 'admin2') {
                await setDoc(userDocRef, {
                    name: vendorId === 'admin1' ? '관리자 1' : '관리자 2',
                    role: 'admin',
                    createdAt: new Date().toISOString()
                });
                localStorage.setItem('partnerUser', vendorId === 'admin1' ? '관리자 1' : '관리자 2');
                localStorage.setItem('partnerRole', 'admin');
                localStorage.setItem('partnerId', vendorId);
                
                setIsLoading(false);
                navigate('/shinilsangjae/dashboard');
            } else {
                setErrorMsg('권한이 없는 계정입니다. 관리자에게 문의하세요.');
                await auth.signOut();
                setIsLoading(false);
            }
        }
        
    } catch (error) {
        // 계정이 없어서 실패한 경우 (또는 비밀번호 불일치)
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
            // [초기 셋팅용] admin1, admin2 강제 자동 생성 로직
            if ((vendorId === 'admin1' && password === 'admin1') || 
                (vendorId === 'admin2' && password === 'admin2')) {
                try {
                    await createUserWithEmailAndPassword(auth, partnerEmail, password);
                    await setDoc(doc(db, 'partner_users', vendorId), {
                        name: vendorId === 'admin1' ? '관리자 1' : '관리자 2',
                        role: 'admin',
                        createdAt: new Date().toISOString()
                    });
                    
                    localStorage.setItem('partnerUser', vendorId === 'admin1' ? '관리자 1' : '관리자 2');
                    localStorage.setItem('partnerRole', 'admin');
                    localStorage.setItem('partnerId', vendorId);
                    
                    setIsLoading(false);
                    navigate('/shinilsangjae/dashboard');
                } catch (createError) {
                    console.error("Firebase 초기 계정 생성 실패:", createError);
                    setErrorMsg('초기 관리자 계정 생성 중 오류가 발생했습니다.');
                    setIsLoading(false);
                }
            } else {
                 setErrorMsg('아이디 또는 비밀번호가 올바르지 않습니다.');
                 setIsLoading(false);
            }
        } else {
            console.error("Firebase 로그인 실패:", error);
            setErrorMsg('인증 중 문제가 발생했습니다. 네트워크를 확인하세요.');
            setIsLoading(false);
        }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 md:p-10 border border-gray-100">
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-key text-blue-600"><path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">신일상재 스마트 재고관리</h2>
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
            disabled={isLoading}
            className={`w-full text-white font-bold py-4 px-4 rounded-xl transition-colors mt-6 text-base shadow-lg ${isLoading ? 'bg-blue-400 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-blue-500/30'}`}
          >
            {isLoading ? '안전하게 인증 중...' : '안전하게 접속하기'}
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
