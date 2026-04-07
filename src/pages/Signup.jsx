import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../services/authService';
import { verifyBusinessNumber } from '../services/businessVerifyService';
import { useToastStore } from '../store/useToastStore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

const Signup = () => {
  const [activeTab, setActiveTab] = useState('individual'); // 'individual' or 'business'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    displayName: '',
    phoneNumber: '',
    companyName: '',
    registrationNumber: '',
  });
  const [businessLicenseFile, setBusinessLicenseFile] = useState(null);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { addToast } = useToastStore();

  // 사업자번호 검증 상태
  const [bizVerifyStatus, setBizVerifyStatus] = useState(null); // null | 'loading' | 'success' | 'fail' | 'inactive'
  const [bizVerifyMessage, setBizVerifyMessage] = useState('');

  // 사업자번호 검증 실행
  const handleVerifyBusinessNumber = async () => {
    if (!formData.registrationNumber.trim()) {
      setBizVerifyStatus('fail');
      setBizVerifyMessage('사업자등록번호를 입력해주세요.');
      return;
    }
    setBizVerifyStatus('loading');
    setBizVerifyMessage('검증 중...');
    const result = await verifyBusinessNumber(formData.registrationNumber);
    if (result.success) {
      if (result.isActive === false && result.status !== 'format_only') {
        setBizVerifyStatus('inactive');
        setBizVerifyMessage(`⚠️ ${result.statusText} (휴·폐업 사업자)`);
      } else {
        setBizVerifyStatus('success');
        setBizVerifyMessage(`✅ ${result.statusText}`);
      }
    } else {
      setBizVerifyStatus('fail');
      setBizVerifyMessage(`❌ ${result.error}`);
    }
  };

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

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // 10MB 크기 제한
      if (file.size > 10 * 1024 * 1024) {
        setError('파일 크기는 10MB를 초과할 수 없습니다.');
        return;
      }
      setBusinessLicenseFile(file);
      setError('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setError('파일 크기는 10MB를 초과할 수 없습니다.');
        return;
      }
      setBusinessLicenseFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    if (!privacyAgreed) {
      setError('개인정보 처리방침에 동의하셔야 회원가입이 가능합니다.');
      return;
    }

    if (activeTab === 'business' && !businessLicenseFile) {
      setError('사업자등록증을 첨부해주세요.');
      return;
    }

    if (activeTab === 'business' && bizVerifyStatus !== 'success') {
      setError('사업자등록번호 인증을 먼저 완료해주세요.');
      return;
    }

    setLoading(true);

    try {
      // 사업자등록증 Firebase Storage 업로드 (타임아웃 10초)
      let licenseFileUrl = null;
      let licenseFileName = null;
      if (activeTab === 'business' && businessLicenseFile) {
        try {
          const fileExt = businessLicenseFile.name.split('.').pop();
          const storageRef = ref(storage, `business-licenses/${Date.now()}_${formData.registrationNumber}.${fileExt}`);
          
          // 10초 타임아웃
          const uploadPromise = uploadBytes(storageRef, businessLicenseFile).then(() => getDownloadURL(storageRef));
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('업로드 타임아웃')), 10000));
          
          licenseFileUrl = await Promise.race([uploadPromise, timeoutPromise]);
          licenseFileName = businessLicenseFile.name;
        } catch (uploadErr) {
          console.error('사업자등록증 업로드 실패 (가입은 계속 진행):', uploadErr);
          // 업로드 실패해도 가입은 진행
        }
      }

      const businessInfo = activeTab === 'business' ? {
        businessName: formData.companyName,
        businessNumber: formData.registrationNumber,
        ntsVerified: bizVerifyStatus === 'success',
        licenseUrl: licenseFileUrl,
        licenseFileName,
      } : null;

      const result = await signup(
        formData.email,
        formData.password,
        formData.displayName,
        activeTab,
        businessInfo,
        formData.phoneNumber
      );

      if (result.success) {
        if (result.pendingApproval) {
          addToast('회원가입이 완료되었습니다. 관리자 승인 후 이용 가능합니다.', 'info');
          navigate('/login');
        } else {
          addToast(activeTab === 'business'
            ? '사업자 인증이 완료되어 자동 승인되었습니다. 환영합니다!'
            : '회원가입이 완료되었습니다. 환영합니다!');
          navigate('/');
        }
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
          <p className="text-slate-600 text-lg">새로운 비즈니스 파트너가 되어보세요.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-10">
          <button
            type="button"
            onClick={() => setActiveTab('individual')}
            className={`flex flex-col items-center justify-center p-6 bg-white border-2 rounded-2xl transition-all group ${activeTab === 'individual' ? 'border-[#a51c30] ring-4 ring-[#a51c30]/10' : 'border-slate-200 hover:border-[#a51c30]/50 active'}`}
          >
            <span className={`material-symbols-outlined text-4xl mb-3 ${activeTab === 'individual' ? 'text-[#a51c30]' : 'text-slate-400 group-hover:text-[#a51c30]'}`}>person</span>
            <span className="text-lg font-bold text-slate-900">개인 회원</span>
            <span className="text-xs text-slate-500 mt-1">일반 소비자 및 개인 구매</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('business')}
            className={`flex flex-col items-center justify-center p-6 bg-white border-2 rounded-2xl transition-all group ${activeTab === 'business' ? 'border-[#a51c30] ring-4 ring-[#a51c30]/10' : 'border-slate-200 hover:border-[#a51c30]/50'}`}
          >
            <span className={`material-symbols-outlined text-4xl mb-3 ${activeTab === 'business' ? 'text-[#a51c30]' : 'text-slate-400 group-hover:text-[#a51c30]'}`}>business_center</span>
            <span className="text-lg font-bold text-slate-900">사업자 회원</span>
            <span className="text-xs text-slate-500 mt-1">인테리어 업체 및 도매 파트너</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10 bg-white p-8 md:p-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
          {activeTab === 'business' && (
            <div className="bg-[#a51c30]/10 border border-[#a51c30]/30 rounded-xl p-4 flex flex-col md:flex-row items-center justify-center gap-3 mb-[-1.5rem] mt-[-1rem]">
              <span className="material-symbols-outlined text-[#a51c30] text-2xl animate-bounce">sell</span>
              <p className="text-[#a51c30] font-black text-sm md:text-base text-center">
                🔥 사업자 번호 실시간 인증 시, 관리자 대기 없이 <span className="underline underline-offset-4">즉시 도매가 승인(10~20% 할인)</span> 적용!
              </p>
            </div>
          )}
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

          {activeTab === 'business' && (
            <section className="pt-8 border-t border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-slate-900 text-xl font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#a51c30]">store</span> 사업자 정보
                </h2>
                <span className="text-xs text-[#a51c30] font-medium">* 모든 항목 필수 입력</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-700" htmlFor="companyName">업체명 <span className="text-[#a51c30]">*</span></label>
                  <input id="companyName" value={formData.companyName} onChange={handleInputChange} className="rounded-lg border-slate-300 focus:ring-[#a51c30] focus:border-[#a51c30] px-4 py-2.5 bg-white border outline-none transition-colors" placeholder="사업자등록증 상 상호" required type="text" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-700" htmlFor="registrationNumber">사업자 등록번호 <span className="text-[#a51c30]">*</span></label>
                  <div className="flex gap-2">
                    <input id="registrationNumber" value={formData.registrationNumber} onChange={(e) => { handleInputChange(e); setBizVerifyStatus(null); setBizVerifyMessage(''); }} className="flex-1 rounded-lg border-slate-300 focus:ring-[#a51c30] focus:border-[#a51c30] px-4 py-2.5 bg-white border outline-none transition-colors" placeholder="000-00-00000" required type="text" />
                    <button
                      type="button"
                      onClick={handleVerifyBusinessNumber}
                      disabled={bizVerifyStatus === 'loading'}
                      className={`px-4 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${bizVerifyStatus === 'success' ? 'bg-emerald-500 text-white' : bizVerifyStatus === 'fail' || bizVerifyStatus === 'inactive' ? 'bg-red-500 text-white' : 'bg-[#a51c30] text-white hover:bg-[#8a1625]'} disabled:opacity-50`}
                    >
                      {bizVerifyStatus === 'loading' ? '검증중...' : bizVerifyStatus === 'success' ? '✓ 인증됨' : '인증'}
                    </button>
                  </div>
                  {bizVerifyMessage && (
                    <p className={`text-xs mt-1 font-medium ${bizVerifyStatus === 'success' ? 'text-emerald-600' : bizVerifyStatus === 'inactive' ? 'text-amber-600' : 'text-red-600'}`}>
                      {bizVerifyMessage}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">사업자 등록증 첨부 <span className="text-[#a51c30]">*</span></label>
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer ${businessLicenseFile ? 'border-[#a51c30] bg-[#a51c30]/5' : 'border-slate-300 bg-slate-50 hover:border-[#a51c30] hover:bg-[#a51c30]/5'
                    }`}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf, .jpg, .jpeg, .png"
                    type="file"
                  />
                  {businessLicenseFile ? (
                    <>
                      <span className="material-symbols-outlined text-[#a51c30] text-5xl mb-3">task</span>
                      <p className="text-slate-700 font-bold mb-1">{businessLicenseFile.name}</p>
                      <p className="text-slate-500 text-xs">{(businessLicenseFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[#a51c30] text-5xl mb-3">upload_file</span>
                      <p className="text-slate-700 font-bold">파일을 이곳에 드래그하거나 클릭하세요</p>
                      <p className="text-slate-500 text-xs mt-2">지원형식: PDF, JPG, PNG (최대 10MB)</p>
                    </>
                  )}
                </div>
              </div>
            </section>
          )}

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
              {loading ? '가입 중...' : (activeTab === 'business' ? '사업자 회원가입' : '개인 회원가입')}
            </button>
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
