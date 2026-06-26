import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithCustomToken } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';

const SocialAuthCallback = () => {
    const navigate = useNavigate();
    const { setUser } = useAuthStore();
    const { addToast } = useToastStore();
    const [loadingMessage, setLoadingMessage] = useState('인증 정보를 확인하는 중입니다...');
    const [error, setError] = useState('');

    useEffect(() => {
        const processSocialLogin = async () => {
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');
            const state = params.get('state');

            if (!code) {
                setError('인증 코드가 누락되었습니다. 다시 시도해 주세요.');
                return;
            }

            const provider = sessionStorage.getItem('social_provider') || (state && state.includes('naver') ? 'naver' : 'kakao');
            const signupRole = sessionStorage.getItem('social_signup_role') || 'individual';
            const redirectUri = `${window.location.origin}/auth/callback`;

            setLoadingMessage(`${provider === 'kakao' ? '카카오' : '네이버'} 로그인 정보를 처리하고 있습니다...`);

            try {
                // 1. Cloud Function 호출하여 커스텀 토큰 가져오기
                const functionName = provider === 'kakao' ? 'kakaoLogin' : 'naverLogin';
                const apiUrl = `https://us-central1-project-dog-1-51759630-ea08b.cloudfunctions.net/${functionName}`;

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code, redirectUri, state })
                });

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    const errorMessage = typeof errData.error === 'object' ? JSON.stringify(errData.error) : (errData.error || `로그인 처리 실패 (HTTP ${response.status})`);
                    throw new Error(errorMessage);
                }

                const result = await response.json();
                const { customToken, isNewUser, uid } = result;

                // 2. Firebase Custom Token으로 로그인
                const userCredential = await signInWithCustomToken(auth, customToken);
                const fbUser = userCredential.user;

                // 3. Firestore에서 최신 유저 데이터 확인
                const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
                const userData = userDoc.exists() ? userDoc.data() : {};

                // 4. 회원 가입 / 로그인 가이드 분기 처리
                // A. 신규 사업자 회원 가입 시도인 경우 -> 추가 정보 입력 화면으로 리다이렉트
                if (isNewUser && signupRole === 'business') {
                    // 추가 입력이 진행되는 동안 임시 role 설정
                    setUser({
                        uid: fbUser.uid,
                        email: fbUser.email,
                        displayName: fbUser.displayName || '소셜 회원',
                        role: 'business_pending_info',
                        approved: false
                    });
                    
                    // sessionStorage에 임시 상태 보존
                    sessionStorage.setItem('social_temp_uid', fbUser.uid);
                    
                    addToast('사업자 추가 인증 정보를 입력해 주세요.', 'info');
                    navigate('/signup/business-info');
                    return;
                }

                // B. 이미 사업자 추가 정보를 제출했으나 관리자 승인 대기 중인 경우
                if (userData.role === 'business' && userData.approved === false) {
                    addToast('가입 승인 대기 중입니다. 관리자 승인 후 이용 가능합니다.', 'info');
                    await auth.signOut();
                    setUser(null);
                    navigate('/login');
                    return;
                }

                // C. 정상 로그인 처리
                const finalUser = {
                    uid: fbUser.uid,
                    email: fbUser.email,
                    displayName: fbUser.displayName || userData.displayName || '사용자',
                    role: userData.role || 'individual',
                    businessInfo: userData.businessInfo || null,
                    phoneNumber: userData.phoneNumber || '',
                    address: userData.address || '',
                    approved: userData.approved !== false
                };

                // 로컬 세션 보존 및 Zustand 스토어 업데이트
                localStorage.setItem('floorcraft_mock_session', JSON.stringify(finalUser));
                setUser(finalUser);

                addToast(`${finalUser.displayName}님, 로그인이 완료되었습니다!`);
                navigate('/');
                
            } catch (err) {
                console.error('소셜 로그인 처리 중 에러:', err);
                setError(err.message || '인증 처리 과정에서 오류가 발생했습니다.');
            } finally {
                // 세션 정리
                sessionStorage.removeItem('social_provider');
                sessionStorage.removeItem('social_signup_role');
            }
        };

        processSocialLogin();
    }, [navigate, setUser, addToast]);

    return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-6 p-8 bg-white rounded-2xl shadow-xl border border-slate-100 max-w-sm text-center">
                {error ? (
                    <>
                        <span className="material-symbols-outlined text-5xl text-red-500 animate-bounce">error</span>
                        <h2 className="text-xl font-bold text-slate-900">로그인 실패</h2>
                        <p className="text-slate-500 text-sm leading-relaxed">{error}</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="mt-2 w-full bg-[#1a1a1a] hover:bg-black text-white py-2.5 rounded-lg text-sm font-bold transition-all"
                        >
                            로그인 화면으로 이동
                        </button>
                    </>
                ) : (
                    <>
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#a51c30] border-t-transparent"></div>
                        <p className="text-slate-800 font-bold text-base leading-snug">{loadingMessage}</p>
                        <p className="text-slate-400 text-xs">잠시만 기다려 주십시오.</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default SocialAuthCallback;
