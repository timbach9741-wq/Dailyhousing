import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../services/authService';
import { useToastStore } from '../store/useToastStore';

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

    if (formData.password !== formData.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!privacyAgreed) {
      setError('개인정보 처리방침에 동의하셔야 회원가입이 가능합니다.');
      return;
    }

    if (activeTab === 'business' && !businessLicenseFile) {
      setError('사업자등록증을 첨부해주세요.');
      return;
    }

    setLoading(true);

    const businessInfo = activeTab === 'business' ? {
      companyName: formData.companyName,
      registrationNumber: formData.registrationNumber,
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
      addToast('회원가입이 완료되었습니다. 환영합니다!');
      navigate('/');
    } else {
      // Firebase 에러 코드 변환 (예시)
      let errorMessage = result.error;
      if (result.error.includes('email-already-in-use')) {
        errorMessage = '이미 사용 중인 이메일입니다.';
      } else if (result.error.includes('weak-password')) {
        errorMessage = '비밀번호는 6자리 이상이어야 합니다.';
      }
      setError(errorMessage || '회원가입에 실패했습니다.');
    }
    setLoading(false);
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
                  <input id="password" value={formData.password} onChange={handleInputChange} minLength={6} className="w-full rounded-lg border-slate-300 focus:ring-[#a51c30] focus:border-[#a51c30] px-4 py-2.5 bg-white border outline-none transition-colors" placeholder="6자 이상 입력" required type="password" />
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
                  <input id="registrationNumber" value={formData.registrationNumber} onChange={handleInputChange} className="rounded-lg border-slate-300 focus:ring-[#a51c30] focus:border-[#a51c30] px-4 py-2.5 bg-white border outline-none transition-colors" placeholder="000-00-00000" required type="text" />
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
