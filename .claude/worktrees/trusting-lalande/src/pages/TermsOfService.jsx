import React from 'react';
import { Link } from 'react-router-dom';

export default function TermsOfService() {
    return (
        <main className="flex-1 px-4 md:px-20 py-8 max-w-[1280px] mx-auto w-full mb-20">
            <nav className="flex items-center gap-2 mb-6 text-sm">
                <Link className="text-slate-500 hover:text-primary" to="/">홈</Link>
                <span className="material-symbols-outlined text-sm text-slate-400">chevron_right</span>
                <span className="text-slate-900 dark:text-slate-100 font-medium">이용약관</span>
            </nav>

            <header className="mb-12">
                <h1 className="text-4xl font-black mb-4 tracking-tight">이용약관</h1>
                <p className="text-slate-500 max-w-2xl leading-relaxed">
                    데일리 하우징 서비스 이용을 위한 약관입니다. 서비스를 이용하시기 전에 반드시 읽어보시기 바랍니다.
                </p>
            </header>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 md:p-12 shadow-sm space-y-10">
                <section>
                    <h2 className="text-2xl font-bold mb-4">데일리하우징 이용약관</h2>
                    <div className="w-20 h-1 bg-primary rounded-full mb-8"></div>

                    <div className="space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed">
                        <article>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">제1조 (목적)</h3>
                            <p>본 약관은 데일리하우징(이하 "회사")이 운영하는 온라인 쇼핑몰에서 제공하는 전자상거래 서비스(이하 "서비스")를 이용함에 있어 "회사"와 "이용자"의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
                        </article>

                        <article>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">제2조 (B2B 거래의 특성)</h3>
                            <p>본 쇼핑몰은 사업자 간 거래(B2B) 및 자재 유통을 주된 목적으로 하며, 이용자가 상품을 구매할 경우 본 약관의 모든 조항에 동의한 것으로 간주합니다.</p>
                        </article>

                        <article>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">제3조 (배송 및 물류비용)</h3>
                            <p className="mb-2">바닥재(마루, 타일 등)는 중량물인 관계로 화물 또는 용달 배송이 원칙이며, 배송비는 지역 및 수량에 따른 실비 청구를 원칙으로 합니다.</p>
                            <p>현장 상황(엘리베이터 유무, 진입로 협소, 상차 방식 등)에 따라 발생하는 추가 비용 및 장비 사용료는 이용자가 부담합니다.</p>
                        </article>

                        <article>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">제4조 (청약철회 및 환불)</h3>
                            <ul className="list-disc pl-5 space-y-4">
                                <li><strong>결제 취소:</strong> 상품 출고(배송 출발) 전까지는 무상 취소가 가능합니다.</li>
                                <li><strong>환불 기한:</strong> 이용자는 상품을 수령한 날로부터 7일 이내에 환불 신청을 할 수 있습니다. (전자상거래법 준용)</li>
                                <li>
                                    <strong>환불 제한 (불가 사유):</strong>
                                    <ul className="mt-2 space-y-1 list-none pl-4 border-l-2 border-slate-200 dark:border-slate-800">
                                        <li>• 이용자의 책임으로 상품 박스가 훼손되거나 멸실된 경우</li>
                                        <li>• 박스를 개봉하여 상품 가치가 하락한 경우 (낱장 분리 포함)</li>
                                        <li>• 주문 제작 및 특수 발주 상품(특수 규격, 특정 브랜드 전용 모델 등)인 경우</li>
                                        <li>• 자재를 이미 시공했거나 시공이 시작된 경우</li>
                                    </ul>
                                </li>
                                <li><strong>반품 단위:</strong> 모든 자재는 '미개봉 박스' 단위로만 반품이 가능하며, 사용 후 남은 자재나 낱장 반품은 일체 불가합니다.</li>
                            </ul>
                        </article>

                        <article>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">제5조 (변심 반품 비용)</h3>
                            <p>상품 하자가 없는 단순 변심에 의한 반품 및 교환의 경우, <strong>왕복 운송비(용달/화물비 일체)</strong>는 이용자가 전액 부담하며, 배송 시 발생한 회차비 등 제반 비용이 추가 청구될 수 있습니다.</p>
                        </article>

                        <article>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">제6조 (품질 보증 및 시공 면책)</h3>
                            <ul className="list-disc pl-5 space-y-4">
                                <li><strong>자재 하자:</strong> 제조상의 중대한 결함은 100% 교환/환불하나, 반드시 시공 전에 확인하여야 합니다. 시공 후 발견된 자재 하자는 제조사의 판정에 따르며 보상이 제한될 수 있습니다.</li>
                                <li><strong>시공 면책:</strong> 데일리하우징은 자재 유통만을 담당하며, 직접적인 시공 서비스는 제공하지 않습니다. 시공 과정에서 발생하는 모든 하자, 분쟁, 손해배상 책임은 시공자와 이용자 간의 계약에 따르며 "회사"는 어떠한 법적 책임도 지지 않습니다.</li>
                            </ul>
                        </article>

                        <article>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">제7조 (관할 법원)</h3>
                            <p>서비스 이용과 관련하여 발생한 분쟁에 관한 소송은 "회사"의 본점 소재지를 관할하는 법원을 전속 관할법원으로 합니다.</p>
                        </article>

                        <article className="pt-8 border-t border-slate-200 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">부칙</h3>
                            <p>본 약관은 2026년 3월 9일부터 시행됩니다.</p>
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
