import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { completeBusinessSignup } from '../services/authService';
import { verifyBusinessNumber } from '../services/businessVerifyService';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';

const SignupBusinessInfo = () => {
    const navigate = useNavigate();
    const { user, setUser } = useAuthStore();
    const { addToast } = useToastStore();

    const [companyName, setCompanyName] = useState('');
    const [registrationNumber, setRegistrationNumber] = useState('');
    const [businessLicenseFile, setBusinessLicenseFile] = useState(null);
    const [privacyAgreed, setPrivacyAgreed] = useState(false);
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // 사업자등록번호 검증 상태
    const [bizVerifyStatus, setBizVerifyStatus] = useState(null); // null | 'loading' | 'success' | 'fail' | 'inactive'
    const [bizVerifyMessage, setBizVerifyMessage] = useState('');

    const fileInputRef = useRef(null);

    // 비정상적인 접근 차단 (로그인 상태가 아니거나 이미 가입 승인 완료된 사업자 등)
    useEffect(() => {
        const tempUid = sessionStorage.getItem('social_temp_uid');
        if (!user && !tempUid) {
            addToast('인증 정보가 없습니다. 다시 로그인해 주세요.', 'error');
            navigate('/login');
            return;
        }

        if (user && user.role === 'business' && user.approved) {
            navigate('/');
        }
    }, [user, navigate, addToast]);

    // 사업자번호 수동 검증 (인증 버튼 클릭시)
    const handleVerifyBusinessNumber = async () => {
        const cleaned = registrationNumber.replace(/[^0-9]/g, '');
        if (!cleaned) {
            setBizVerifyStatus('fail');
            setBizVerifyMessage('사업자등록번호를 입력해주세요.');
            return;
        }
        if (cleaned.length !== 10) {
            setBizVerifyStatus('fail');
            setBizVerifyMessage('사업자등록번호는 10자리 숫자입니다.');
            return;
        }
        setBizVerifyStatus('loading');
        setBizVerifyMessage('검증 중...');
        const result = await verifyBusinessNumber(cleaned);
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

    // 사업자등록번호 입력 처리 및 실시간 포맷팅 + 자동 검증
    const handleBizNumberChange = async (e) => {
        const { value } = e.target;
        const cleaned = value.replace(/[^0-9]/g, '');
        const limited = cleaned.slice(0, 10);

        // 포맷팅 (000-00-00000)
        let formatted = limited;
        if (limited.length > 3 && limited.length <= 5) {
            formatted = `${limited.slice(0, 3)}-${limited.slice(3)}`;
        } else if (limited.length > 5) {
            formatted = `${limited.slice(0, 3)}-${limited.slice(3, 5)}-${limited.slice(5)}`;
        }

        setRegistrationNumber(formatted);

        // 10자리가 아니면 상태 초기화
        if (limited.length < 10) {
            setBizVerifyStatus(null);
            setBizVerifyMessage('');
            return;
        }

        // 10자리가 채워지면 자동 검증 실행
        if (limited.length === 10) {
            setBizVerifyStatus('loading');
            setBizVerifyMessage('자동 검증 중...');
            const result = await verifyBusinessNumber(limited);
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
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
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

        const targetUid = user?.uid || sessionStorage.getItem('social_temp_uid');
        if (!targetUid) {
            setError('인증 세션이 만료되었습니다. 다시 시도해 주세요.');
            return;
        }

        if (!companyName.trim()) {
            setError('업체명을 입력해주세요.');
            return;
        }

        if (bizVerifyStatus !== 'success') {
            setError('사업자등록번호 인증을 완료해주세요.');
            return;
        }

        if (!businessLicenseFile) {
            setError('사업자등록증을 첨부해주세요.');
            return;
        }

        if (!privacyAgreed) {
            setError('개인정보 처리방침 동의에 체크해주세요.');
            return;
        }

        setLoading(true);

        try {
            // 1. 사업자등록증 Firebase Storage 업로드 (타임아웃 10초)
            let licenseFileUrl = null;
            let licenseFileName = null;
            
            const fileExt = businessLicenseFile.name.split('.').pop();
            const storageRef = ref(storage, `business-licenses/${Date.now()}_${registrationNumber.replace(/[^0-9]/g, '')}.${fileExt}`);
            
            const uploadPromise = uploadBytes(storageRef, businessLicenseFile).then(() => getDownloadURL(storageRef));
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('업로드 타임아웃')), 10000));
            
            licenseFileUrl = await Promise.race([uploadPromise, timeoutPromise]);
            licenseFileName = businessLicenseFile.name;

            // 2. Firestore 정보 업데이트 및 승인 신청 처리
            const result = await completeBusinessSignup(
                targetUid,
                companyName,
                registrationNumber,
                licenseFileUrl,
                licenseFileName,
                bizVerifyStatus === 'success'
            );

            if (result.success) {
                sessionStorage.removeItem('social_temp_uid');
                
                if (result.approved) {
                    addToast('사업자 인증이 완료되어 자동 승인되었습니다. 환영합니다!');
                    
                    // 스토어 상태 갱신
                    localStorage.setItem('floorcraft_mock_session', JSON.stringify(result.user));
                    setUser(result.user);
                    navigate('/');
                } else {
                    addToast('사업자 등록이 완료되었습니다. 관리자 승인 후 로그인 가능합니다.', 'info');
                    setUser(null);
                    navigate('/login');
                }
            } else {
                setError(result.error || '사업자 정보 등록에 실패했습니다.');
            }
        } catch (err) {
            console.error('사업자 추가 정보 입력 처리 에러:', err);
            setError('정보 처리 중 오류가 발생했습니다. 다시 시도해 주세요.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-1 justify-center py-8 px-4 md:px-10 bg-slate-50 min-h-screen">
            <div className="flex flex-col max-w-[720px] flex-1">
                <div className="flex flex-col gap-3 mb-10 text-center mt-6">
                    <h1 className="text-slate-900 text-3xl font-black leading-tight tracking-tight">사업자 정보 추가 등록</h1>
                    <p className="text-slate-600 text-sm">사업자 혜택(10~20% 할인가 적용)을 받기 위해 최초 1회 등록이 필요합니다.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 md:p-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#a51c30]/15 via-[#a51c30]/5 to-slate-50 border border-[#a51c30]/20 p-5 flex items-center gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#a51c30] text-white shadow-md shadow-[#a51c30]/20">
                            <span className="material-symbols-outlined text-2xl">verified</span>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-slate-900 font-extrabold text-sm md:text-base flex items-center gap-1.5 leading-snug">
                                사업자 번호 실시간 인증 즉시 승인!
                            </h4>
                            <p className="text-slate-600 text-xs md:text-sm mt-1 leading-relaxed">
                                실시간 번호 조회가 통과되면 대기 없이 <strong className="text-[#a51c30] font-black underline underline-offset-4">즉시 도매 단가(10~20% 즉시 할인)</strong>가 적용됩니다.
                            </p>
                        </div>
                    </div>

                    <section className="space-y-6">
                        <h2 className="text-slate-900 text-lg font-bold flex items-center gap-2 border-b border-slate-100 pb-3">
                            <span className="material-symbols-outlined text-[#a51c30]">store</span> 사업자 정보 기입
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700" htmlFor="companyName">업체명 (상호명) <span className="text-[#a51c30]">*</span></label>
                                <input
                                    id="companyName"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className="rounded-lg border-slate-300 focus:ring-[#a51c30] focus:border-[#a51c30] px-4 py-2.5 bg-white border outline-none transition-colors text-sm"
                                    placeholder="사업자등록증 상 상호"
                                    required
                                    type="text"
                                />
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700" htmlFor="registrationNumber">사업자 등록번호 <span className="text-[#a51c30]">*</span></label>
                                <div className="flex gap-2">
                                    <input
                                        id="registrationNumber"
                                        value={registrationNumber}
                                        onChange={handleBizNumberChange}
                                        className="flex-1 rounded-lg border-slate-300 focus:ring-[#a51c30] focus:border-[#a51c30] px-4 py-2.5 bg-white border outline-none transition-colors text-sm"
                                        placeholder="000-00-00000"
                                        required
                                        type="text"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleVerifyBusinessNumber}
                                        disabled={bizVerifyStatus === 'loading'}
                                        className={`px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${bizVerifyStatus === 'success' ? 'bg-emerald-500 text-white' : bizVerifyStatus === 'fail' || bizVerifyStatus === 'inactive' ? 'bg-red-500 text-white' : 'bg-[#a51c30] text-white hover:bg-[#8a1625]'} disabled:opacity-50`}
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
                                className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer ${businessLicenseFile ? 'border-[#a51c30] bg-[#a51c30]/5' : 'border-slate-300 bg-slate-50 hover:border-[#a51c30] hover:bg-[#a51c30]/5'}`}
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
                                        <p className="text-slate-700 font-bold mb-1 text-sm">{businessLicenseFile.name}</p>
                                        <p className="text-slate-500 text-xs">{(businessLicenseFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[#a51c30] text-5xl mb-3">upload_file</span>
                                        <p className="text-slate-700 font-bold text-sm">파일을 이곳에 드래그하거나 클릭하세요</p>
                                        <p className="text-slate-500 text-xs mt-2">지원형식: PDF, JPG, PNG (최대 10MB)</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </section>

                    {error && (
                        <div className="bg-[#a51c30]/5 border border-[#a51c30]/20 rounded-lg p-4 flex items-start gap-3">
                            <span className="material-symbols-outlined text-[#a51c30]">error</span>
                            <p className="text-[#a51c30] text-sm mt-0.5">{error}</p>
                        </div>
                    )}

                    {/* 개인정보 처리방침 동의 */}
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
                                    <span className="text-[#a51c30]">(필수)</span> 개인정보 수집 및 활용 동의
                                </label>
                                <p className="text-slate-500 mt-1 text-xs leading-relaxed">
                                    입력하신 정보는 사업자 자격 검증 및 Google Sheets 기록, 마케팅/시공 관리 서비스 제공 목적으로만 수집됩니다.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            className="w-full bg-[#1a1a1a] hover:bg-black text-white font-bold text-base py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            type="submit"
                            disabled={loading}
                        >
                            {loading && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                            {loading ? '정보 등록 중...' : '사업자 정보 등록 완료'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignupBusinessInfo;
