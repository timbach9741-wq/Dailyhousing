import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const warranties = [
    {
        icon: 'verified',
        iconBg: 'bg-primary/10',
        iconColor: 'text-primary',
        title: 'LX Z:IN 공식 유통 파트너',
        description: '데일리하우징은 LX Z:IN(구 LG 하우시스)의 공식 유통 파트너로서, 모든 제품은 정품 인증을 거쳐 공급됩니다.',
    },
    {
        icon: 'workspace_premium',
        iconBg: 'bg-blue-100 dark:bg-blue-900/20',
        iconColor: 'text-blue-600',
        title: '제조사 품질 보증',
        description: '공급되는 모든 바닥재 제품은 제조사(LX Z:IN)의 엄격한 품질 기준을 통과한 제품으로, 제조상 결함 발생 시 제조사 기준에 따라 교환/환불 처리됩니다.',
    },
    {
        icon: 'inventory_2',
        iconBg: 'bg-green-100 dark:bg-green-900/20',
        iconColor: 'text-green-600',
        title: '시공 전 자재 검수 필수',
        description: '자재 하자는 반드시 시공 전에 확인하셔야 합니다. 시공이 시작된 이후 발견된 하자에 대해서는 제조사 판정 결과에 따라 보상이 제한될 수 있습니다.',
    },
    {
        icon: 'build',
        iconBg: 'bg-orange-100 dark:bg-orange-900/20',
        iconColor: 'text-orange-600',
        title: '시공 면책 사항',
        description: '데일리하우징은 자재 유통만을 담당하며, 직접적인 시공 서비스는 제공하지 않습니다. 시공 과정에서 발생하는 모든 하자 및 손해배상 책임은 시공자와 이용자 간의 계약에 따릅니다.',
    },
];

const faqs = [
    {
        question: '제품 하자가 발견되면 어떻게 해야 하나요?',
        answer: '시공 전 발견된 제조상의 중대 결함은 고객센터로 연락 주시면 100% 교환/환불 처리됩니다. 사진 또는 영상 자료를 함께 첨부해 주시면 더욱 신속하게 처리 가능합니다.',
    },
    {
        question: 'AS 접수는 어떻게 하나요?',
        answer: '고객센터(02-1234-5678) 또는 이메일(contact@dailyhousing.co.kr)로 문의 주세요. 제품명, 구매일, 하자 내용을 알려주시면 빠르게 안내드리겠습니다.',
    },
];

export default function QualityAssurance() {
    const [openIndex, setOpenIndex] = useState(null);

    const toggle = (idx) => setOpenIndex(openIndex === idx ? null : idx);

    return (
        <main className="flex-1 px-4 md:px-20 py-8 max-w-[1280px] mx-auto w-full mb-20">
            <nav className="flex items-center gap-2 mb-6 text-sm">
                <Link className="text-slate-500 hover:text-primary" to="/">홈</Link>
                <span className="material-symbols-outlined text-sm text-slate-400">chevron_right</span>
                <span className="text-slate-900 dark:text-slate-100 font-medium">품질 보증 안내</span>
            </nav>

            <header className="mb-12">
                <h1 className="text-4xl font-black mb-4 tracking-tight">품질 보증 안내</h1>
                <p className="text-slate-500 max-w-2xl leading-relaxed">
                    데일리 하우징은 LX Z:IN 공식 유통 파트너로서 최상의 품질을 보장합니다.
                </p>
            </header>

            {/* Warranty Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                {warranties.map((item, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm hover:shadow-md transition-shadow">
                        <div className={`w-14 h-14 rounded-xl ${item.iconBg} flex items-center justify-center mb-5`}>
                            <span className={`material-symbols-outlined text-3xl ${item.iconColor}`}>{item.icon}</span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">{item.title}</h2>
                        <p className="text-slate-500 leading-relaxed text-sm">{item.description}</p>
                    </div>
                ))}
            </div>

            {/* FAQ Section */}
            <section>
                <h2 className="text-2xl font-bold mb-6">자주 묻는 품질 관련 질문</h2>
                <div className="space-y-3">
                    {faqs.map((faq, idx) => (
                        <div
                            key={idx}
                            className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all overflow-hidden ${openIndex === idx ? 'border-primary shadow-md shadow-primary/10' : 'border-slate-200 dark:border-slate-800'}`}
                        >
                            <button
                                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                                onClick={() => toggle(idx)}
                                aria-expanded={openIndex === idx}
                            >
                                <div className="flex items-center gap-4">
                                    <span className={`text-sm font-black px-2.5 py-1 rounded-lg ${openIndex === idx ? 'bg-primary text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>Q</span>
                                    <span className={`font-bold text-base ${openIndex === idx ? 'text-primary' : 'text-slate-900 dark:text-slate-100'}`}>{faq.question}</span>
                                </div>
                                <span className={`material-symbols-outlined text-2xl flex-shrink-0 transition-transform duration-300 ${openIndex === idx ? 'rotate-180 text-primary' : 'text-slate-400'}`}>
                                    expand_more
                                </span>
                            </button>
                            {openIndex === idx && (
                                <div className="px-6 pb-6">
                                    <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <span className="text-sm font-black px-2.5 py-1 rounded-lg bg-slate-900 text-white h-fit">A</span>
                                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{faq.answer}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <div className="mt-12 bg-slate-900 text-white rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h3 className="text-xl font-bold mb-1">품질 문제가 발생하셨나요?</h3>
                    <p className="text-slate-400 text-sm">신속하게 처리해 드리겠습니다. 고객센터로 연락해 주세요.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <a href="tel:02-1234-5678" className="px-6 py-3 bg-primary text-slate-900 font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 whitespace-nowrap">
                        <span className="material-symbols-outlined text-xl">call</span>
                        02-1234-5678
                    </a>
                    <Link to="/consultations/new" className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all flex items-center gap-2 whitespace-nowrap">
                        <span className="material-symbols-outlined text-xl">chat</span>
                        온라인 문의
                    </Link>
                </div>
            </div>
        </main>
    );
}
