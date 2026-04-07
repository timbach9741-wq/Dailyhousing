import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';

export default function UserBusinessRegistration() {
    const { register } = useAuthStore();
    const { addToast } = useToastStore();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mock registration
        register({ name: '테스트 유저', email: 'test@example.com', type: 'BUSINESS' });
        addToast('신규 회원가입이 완료되었습니다.');
        navigate('/');
    };

    return (
        <div className="flex flex-1 justify-center py-8 px-4 md:px-10">
            <div className="layout-content-container flex flex-col max-w-[720px] flex-1">
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
                    <h1 className="text-slate-900 dark:text-slate-100 text-4xl font-black leading-tight tracking-tight">회원가입</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">FlooringDirect의 회원이 되어 다양한 혜택을 누리세요.</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-10">
                    <button className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl hover:border-primary/50 transition-all group active">
                        <span className="material-symbols-outlined text-4xl mb-3 text-slate-400 group-hover:text-primary">person</span>
                        <span className="text-lg font-bold text-slate-900 dark:text-slate-100">개인 회원</span>
                        <span className="text-xs text-slate-500 mt-1">일반 소비자 및 개인 구매</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 border-2 border-primary rounded-2xl ring-4 ring-primary/10 transition-all group">
                        <span className="material-symbols-outlined text-4xl mb-3 text-primary">business_center</span>
                        <span className="text-lg font-bold text-slate-900 dark:text-slate-100">사업자 회원</span>
                        <span className="text-xs text-slate-500 mt-1">인테리어 업체 및 도매 파트너</span>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-10 bg-white dark:bg-slate-900 p-8 md:p-10 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
                    <section>
                        <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">account_circle</span> 계정 정보
                        </h2>
                        <div className="grid grid-cols-1 gap-5">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 required">아이디</label>
                                <div className="flex gap-2">
                                    <input className="flex-1 rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary focus:border-primary px-4 py-2.5" placeholder="영문, 숫자 6~20자" required type="text" />
                                    <button className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg font-bold text-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors" type="button">중복확인</button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 required">비밀번호</label>
                                    <input className="rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary focus:border-primary px-4 py-2.5" placeholder="8자 이상 (영문/숫자/특수문자)" required type="password" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 required">비밀번호 확인</label>
                                    <input className="rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary focus:border-primary px-4 py-2.5" placeholder="비밀번호 재입력" required type="password" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 required">이메일</label>
                                <input className="rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary focus:border-primary px-4 py-2.5" placeholder="example@email.com" required type="email" />
                            </div>
                        </div>
                    </section>
                    <section className="pt-8 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">store</span> 사업자 정보
                            </h2>
                            <span className="text-xs text-red-500 font-medium">* 모든 항목 필수 입력</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 required">상호명</label>
                                <input className="rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary focus:border-primary px-4 py-2.5" placeholder="사업자등록증 상 상호" required type="text" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 required">대표자명</label>
                                <input className="rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary focus:border-primary px-4 py-2.5" placeholder="대표자 성함" required type="text" />
                            </div>
                            <div className="flex flex-col gap-2 md:col-span-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 required">사업자 등록번호</label>
                                <div className="flex gap-2">
                                    <input className="flex-1 rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary focus:border-primary px-4 py-2.5" placeholder="000-00-00000" required type="text" />
                                    <button className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg font-bold text-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors" type="button">인증하기</button>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 required">사업자 등록증 첨부 (필수)</label>
                            <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/40 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                                <input className="absolute inset-0 opacity-0 cursor-pointer" required type="file" />
                                <span className="material-symbols-outlined text-primary text-5xl mb-3">upload_file</span>
                                <p className="text-slate-700 dark:text-slate-300 font-bold">파일을 이곳에 드래그하거나 클릭하세요</p>
                                <p className="text-slate-500 text-xs mt-2">지원형식: PDF, JPG, PNG (최대 10MB)</p>
                            </div>
                        </div>
                    </section>
                    <section className="pt-8 border-t border-slate-100 dark:border-slate-800">
                        <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">location_on</span> 사업장/배송지 주소
                        </h2>
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <input className="w-32 rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary focus:border-primary px-4 py-2.5" placeholder="우편번호" readOnly type="text" />
                                <button className="bg-slate-800 dark:bg-slate-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity" type="button">주소 검색</button>
                            </div>
                            <input className="w-full rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary focus:border-primary px-4 py-2.5" placeholder="기본 주소" readOnly type="text" />
                            <input className="w-full rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary focus:border-primary px-4 py-2.5" placeholder="상세 주소를 입력해주세요" type="text" />
                        </div>
                    </section>
                    <section className="pt-8 border-t border-slate-100 dark:border-slate-800">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl space-y-4">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary" type="checkbox" />
                                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">전체 동의합니다.</span>
                            </label>
                            <div className="h-px bg-slate-200 dark:bg-slate-700 my-2"></div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" required type="checkbox" />
                                        <span className="text-sm text-slate-600 dark:text-slate-400"><span className="text-primary font-bold">(필수)</span> 이용약관 동의</span>
                                    </label>
                                    <Link className="text-xs text-slate-400 underline underline-offset-4" to="#">상세보기</Link>
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" required type="checkbox" />
                                        <span className="text-sm text-slate-600 dark:text-slate-400"><span className="text-primary font-bold">(필수)</span> 개인정보 수집 및 이용 동의</span>
                                    </label>
                                    <Link className="text-xs text-slate-400 underline underline-offset-4" to="#">상세보기</Link>
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" type="checkbox" />
                                        <span className="text-sm text-slate-600 dark:text-slate-400"><span className="text-slate-400">(선택)</span> 마케팅 정보 수신 동의</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </section>
                    <div className="pt-4">
                        <button className="w-full bg-primary text-slate-900 font-black text-xl py-5 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all" type="submit">
                            사업자 회원가입 완료
                        </button>
                        <div className="flex items-center justify-center gap-2 mt-6">
                            <span className="text-slate-500 dark:text-slate-400 text-sm">이미 계정이 있으신가요?</span>
                            <Link className="text-primary font-bold text-sm border-b border-primary/30" to="#">로그인하기</Link>
                        </div>
                    </div>
                </form>
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex flex-col items-center text-center">
                        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-primary text-2xl">verified</span>
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">안전한 데이터 관리</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">최신 보안 기술을 통해 소중한 사업자 정보를 보호합니다.</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-primary text-2xl">local_shipping</span>
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">사업자 전용 단가</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">회원 가입 승인 즉시 파트너 전용 특별 할인가가 적용됩니다.</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-primary text-2xl">support_agent</span>
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">1:1 전담 서포트</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">전문 상담사가 견적부터 시공까지 밀착 지원합니다.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
