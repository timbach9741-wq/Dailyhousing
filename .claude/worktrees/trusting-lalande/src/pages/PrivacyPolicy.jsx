import React from 'react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
    return (
        <main className="flex-1 px-4 md:px-20 py-8 max-w-[1280px] mx-auto w-full mb-20">
            <nav className="flex items-center gap-2 mb-6 text-sm">
                <Link className="text-slate-500 hover:text-primary" to="/">홈</Link>
                <span className="material-symbols-outlined text-sm text-slate-400">chevron_right</span>
                <span className="text-slate-900 dark:text-slate-100 font-medium">개인정보 처리방침</span>
            </nav>

            <header className="mb-12">
                <h1 className="text-4xl font-black mb-4 tracking-tight">개인정보 처리방침</h1>
                <p className="text-slate-500 max-w-2xl leading-relaxed">
                    데일리하우징(이하 "회사")은 이용자의 개인정보를 소중히 다루며, 「개인정보 보호법」 등 관련 법규를 준수합니다.
                </p>
            </header>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 md:p-12 shadow-sm space-y-10">
                <section>
                    <h2 className="text-2xl font-bold mb-4">데일리하우징 개인정보 처리방침</h2>
                    <div className="w-20 h-1 bg-primary rounded-full mb-8"></div>

                    <div className="space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed">
                        <article>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">1. 수집하는 개인정보 항목</h3>
                            <div className="space-y-3 pl-4 border-l-2 border-primary/30">
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200">회원가입</p>
                                    <p>성명, 아이디, 비밀번호, 휴대전화번호, 이메일, 사업자등록번호(B2B 회원), 업체명</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200">주문/배송</p>
                                    <p>수령인 성명, 배송지 주소, 연락처, 결제 정보</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200">증빙 발행</p>
                                    <p>사업자등록증 정보, 담당자 연락처</p>
                                </div>
                            </div>
                        </article>

                        <article>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">2. 수집 및 이용목적</h3>
                            <p>상품 주문 확인, 자재 배송, 세금계산서 발행, 고객 상담 및 본인 확인</p>
                        </article>

                        <article>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">3. 보유 및 이용기간</h3>
                            <p>이용자의 개인정보는 목적 달성 후 지체 없이 파기합니다. 단, 전자상거래법 등 관계 법령에 따라 5년간 보관될 수 있습니다.</p>
                        </article>

                        <article>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">4. 개인정보의 위탁</h3>
                            <p>회사는 물류 배송을 위해 화물 운송 업체 및 용달 기사에게 배송에 필요한 최소한의 정보(성명, 주소, 연락처)를 제공합니다.</p>
                        </article>

                        <article className="pt-8 border-t border-slate-200 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">5. 개인정보 보호 책임자</h3>
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 space-y-2">
                                <p><span className="font-semibold text-slate-800 dark:text-slate-200">성명:</span> <span className="text-slate-400">추후 기재 예정</span></p>
                                <p><span className="font-semibold text-slate-800 dark:text-slate-200">연락처:</span> <span className="text-slate-400">추후 기재 예정</span></p>
                                <p><span className="font-semibold text-slate-800 dark:text-slate-200">이메일:</span> <span className="text-slate-400">추후 기재 예정</span></p>
                            </div>
                        </article>
                    </div>
                </section>
            </div>

            <div className="mt-12 text-center">
                <Link to="/" className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all">
                    홈으로 돌아가기
                </Link>
            </div>
        </main>
    );
}
