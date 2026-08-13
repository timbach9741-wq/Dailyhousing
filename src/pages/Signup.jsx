import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../services/authService';
import { useToastStore } from '../store/useToastStore';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    displayName: '',
    phoneNumber: '',
  });
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { addToast } = useToastStore();

  // 폼 유효성 검사 통합
  const validateForm = () => {
    // 이메일 형식
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('올바른 이메일 형식이 아닙니다.');
      return false;
    }

    // 전화번호 형식
    const phoneRegex = /^01[0-9]-?\d{3,4}-?\d{4}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      setError('올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)');
      return false;
    }

    // 비밀번호 (영문 대소문자 + 숫자 포함 8자 이상)
    const pwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!pwRegex.test(formData.password)) {
      setError('비밀번호는 영문(대소문자), 숫자를 포함하여 8자 이상이어야 합니다.');
      return false;
    }

    // 비밀번호 확인
    if (formData.password !== formData.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return false;
    }

    return true;
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    if (!privacyAgreed) {
      setError('개인정보 처리방침에 동의하셔야 회원가입이 가능합니다.');
      return;
    }

    setLoading(true);

    try {
      const result = await signup(
        formData.email,
        formData.password,
        formData.displayName,
        formData.phoneNumber
      );

      if (result.success) {
        addToast('회원가입이 완료되었습니다. 환영합니다!');
        navigate('/');
      } else {
        let errorMessage = result.error;
        if (result.error?.includes('email-already-in-use')) {
          errorMessage = '이미 사용 중인 이메일입니다.';
        } else if (result.error?.includes('weak-password')) {
          errorMessage = '비밀번호는 6자리 이상이어야 합니다.';
        }
        setError(errorMessage || '회원가입에 실패했습니다.');
      }
    } catch (err) {
      console.error('회원가입 처리 중 오류:', err); console.log('__SIGNUP_ERROR_IS__', err.message);
      setError('회원가입 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 소셜 간편가입 처리
  const handleSocialSignup = (provider) => {
    const kakaoClientId = import.meta.env.VITE_KAKAO_CLIENT_ID || '';
    const naverClientId = import.meta.env.VITE_NAVER_CLIENT_ID || '';
    const redirectUri = `${window.location.origin}/auth/callback`;

    sessionStorage.setItem('social_provider', provider);

    if (provider === 'kakao') {
      if (!kakaoClientId) {
        addToast('카카오 Client ID가 .env에 설정되지 않았습니다.', 'error');
        return;
      }
      window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
    } else if (provider === 'naver') {
      if (!naverClientId) {
        addToast('네이버 Client ID가 .env에 설정되지 않았습니다.', 'error');
        return;
      }
      const state = `naver_signup`;
      window.location.href = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${naverClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
    }
  };

  return (
    <div className="flex flex-1 justify-center py-8 px-4 md:px-10 bg-slate-50 min-h-screen">
      <div className="flex flex-col max-w-[720px] flex-1">
        <div className="flex flex-col gap-4 mb-10">
          <nav className="flex items-center gap-2 text-sm text-slate-500">
            <Link to="/" className="hover:text-primary transition-colors">홈</Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-slate-900 font-medium">회원가입</span>
          </nav>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors w-fit"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
            <span className="font-bold text-sm">뒤로가기</span>
          </button>
        </div>

        <div className="flex flex-col gap-3 mb-10 text-center">
          <h1 className="text-slate-900 text-4xl font-black leading-tight tracking-tight">회원가입</h1>
          <p className="text-slate-600 text-lg">데일리하우징의 회원이 되어보세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10 bg-white p-8 md:p-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <section>
            <h2 className="text-slate-900 text-xl font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#a51c30]">account_circle</span> 계정 정보
            </h2>
            <div className="grid grid-cols-1 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700" htmlFor="displayName">성함 <span className="text-[#a51c30]">*</span></label>
                <input id="displayName" value={formData.displayName} onChange={handleInputChange} className="w-full rounded-lg border-slate-300 focus:ring-[#a51c30] focus:border-[#a51c30] px-4 py-2.5 bg-white border outline-none transition-colors" placeholder="홍길동" required type="text" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700" htmlFor="phoneNumber">휴대폰 번호 <span className="text-[#a51c30]">*</span></label>
                <input id="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="w-full rounded-lg border-slate-300 focus:ring-[#a51c30] focus:border-[#a51c30] px-4 py-2.5 bg-white border outline-none transition-colors" placeholder="010-0000-0000" required type="tel" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700" htmlFor="email">이메일 <span className="text-[#a51c30]">*</span></label>
                <input id="email" value={formData.email} onChange={handleInputChange} className="w-full rounded-lg border-slate-300 focus:ring-[#a51c30] focus:border-[#a51c30] px-4 py-2.5 bg-white border outline-none transition-colors" placeholder="example@email.com" required type="email" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-700" htmlFor="password">비밀번호 <span className="text-[#a51c30]">*</span></label>
                  <input id="password" value={formData.password} onChange={handleInputChange} minLength={8} className="w-full rounded-lg border-slate-300 focus:ring-[#a51c30] focus:border-[#a51c30] px-4 py-2.5 bg-white border outline-none transition-colors" placeholder="영문(대소문자), 숫자 포함 8자 이상" required type="password" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-700" htmlFor="passwordConfirm">비밀번호 확인 <span className="text-[#a51c30]">*</span></label>
                  <input id="passwordConfirm" value={formData.passwordConfirm} onChange={handleInputChange} className="w-full rounded-lg border-slate-300 focus:ring-[#a51c30] focus:border-[#a51c30] px-4 py-2.5 bg-white border outline-none transition-colors" placeholder="비밀번호 재입력" required type="password" />
                </div>
              </div>
            </div>
          </section>

          {error && (
            <div className="bg-[#a51c30]/5 border border-[#a51c30]/20 rounded-lg p-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-[#a51c30]">error</span>
              <p className="text-[#a51c30] text-sm mt-0.5">{error}</p>
            </div>
          )}

          {/* Privacy Policy Consent */}
          <div className="pt-6 border-t border-slate-100">
            <div className="flex items-start gap-4 p-5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center h-5 mt-0.5">
                <input
                  id="privacyAgreed"
                  type="checkbox"
                  checked={privacyAgreed}
                  onChange={(e) => setPrivacyAgreed(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 text-[#a51c30] focus:ring-[#a51c30] cursor-pointer"
                />
              </div>
              <div className="flex-1 text-sm">
                <label htmlFor="privacyAgreed" className="font-bold text-slate-900 cursor-pointer">
                  <span className="text-[#a51c30]">(필수)</span> 개인정보 처리방침에 동의합니다
                </label>
                <p className="text-slate-500 mt-1 leading-relaxed">
                  회원가입 시 개인정보(성명, 연락처, 이메일 등)가 수집되며 서비스 제공 목적으로만 활용됩니다.
                </p>
              </div>
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#a51c30] font-semibold underline underline-offset-2 hover:text-[#8a1625] whitespace-nowrap"
              >
                전문 보기
              </a>
            </div>
          </div>

          <div className="pt-4">
            <button
              className="w-full bg-[#1a1a1a] hover:bg-[#000000] text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              type="submit"
              disabled={loading}
            >
              {loading && <span className="material-symbols-outlined animate-spin">progress_activity</span>}
              {loading ? '가입 중...' : '회원가입'}
            </button>

            {/* 간편 회원가입 연동 */}
            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="mx-4 text-xs text-slate-400 font-medium whitespace-nowrap">또는 간편 회원가입</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleSocialSignup('kakao')}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-[#FEE500] hover:bg-[#E6CF00] text-[#191919] rounded-xl text-sm font-bold shadow-sm transition-all"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="currentColor">
                  <path d="M12 3C6.477 3 2 6.48 2 10.78c0 2.78 1.88 5.22 4.69 6.63L5.5 21.64l4.72-3.41c.58.1 1.17.16 1.78.16 5.52 0 10-3.48 10-7.78C22 6.48 17.52 3 12 3z" />
                </svg>
                카카오 가입
              </button>

              <button
                type="button"
                onClick={() => handleSocialSignup('naver')}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-[#03C75A] hover:bg-[#02b34f] text-white rounded-xl text-sm font-bold shadow-sm transition-all"
              >
                <span className="font-extrabold text-base leading-none mr-0.5">N</span>
                네이버 가입
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 mt-6">
              <span className="text-slate-500 text-sm">이미 계정이 있으신가요?</span>
              <Link className="text-[#a51c30] font-bold text-sm hover:underline" to="/login">로그인하기</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
