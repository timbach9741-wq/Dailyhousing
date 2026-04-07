import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const faqs = [
    {
        question: '배송은 얼마나 걸리나요?',
        answer: '결제 완료 후 2~5영업일 이내에 출고됩니다. 재고 상황 및 배송 지역에 따라 약간의 차이가 있을 수 있으며, 도서산간 지역은 추가 기간이 소요될 수 있습니다.',
    },
    {
        question: '배송비는 어떻게 되나요?',
        answer: '바닥재는 중량물인 관계로 화물 또는 용달 배송이 원칙이며, 배송비는 지역 및 수량에 따른 실비로 청구됩니다. 주문 확정 후 담당자가 개별 안내드립니다. 현장 상황(엘리베이터 유무 등)에 따라 추가 비용이 발생할 수 있습니다.',
    },
    {
        question: '반품/교환은 어떻게 신청하나요?',
        answer: '상품 수령 후 7일 이내에 고객센터(02-1234-5678) 또는 이메일(contact@dailyhousing.co.kr)로 연락 주시기 바랍니다. 단, 박스를 개봉했거나 낱장으로 분리한 경우, 이미 시공이 시작된 경우에는 반품이 불가합니다.',
    },
    {
        question: '변심으로 인한 반품 시 비용은 어떻게 되나요?',
        answer: '상품에 하자가 없는 단순 변심 반품의 경우, 왕복 운송비(용달/화물비 일체)는 고객님이 전액 부담하셔야 합니다.',
    },
    {
        question: '사업자 회원과 개인 회원의 차이가 있나요?',
        answer: '사업자 회원(B2B)으로 가입하시면 인테리어 업체 및 도매 파트너를 위한 특가 혜택, 세금계산서 발행 서비스 등을 이용하실 수 있습니다. 사업자 등록증 첨부 후 가입이 가능합니다.',
    },
    {
        question: '세금계산서 발행이 가능한가요?',
        answer: '네, 사업자 회원에 한해 세금계산서 발행이 가능합니다. 주문 완료 후 고객센터로 문의 주시면 안내드리겠습니다.',
    },
    {
        question: '주문 제작 및 특수 규격 제품도 있나요?',
        answer: '네, 특수 규격이나 대량 주문의 경우 별도 문의 주시기 바랍니다. 단, 주문 제작 상품은 제작 착수 후 변심에 의한 취소/환불이 불가합니다.',
    },
    {
        question: '시공 서비스도 제공하나요?',
        answer: '데일리하우징은 자재 유통 전문 업체로, 직접적인 시공 서비스는 제공하지 않습니다. 시공이 필요하신 경우 시공 상담 신청을 통해 파트너 업체를 소개받으실 수 있습니다.',
    },
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState(null);

    const navigate = useNavigate();
    const toggle = (idx) => setOpenIndex(openIndex === idx ? null : idx);

    return (
        <main className="flex-1 px-4 md:px-20 py-8 max-w-[1280px] mx-auto w-full mb-20">
            <div className="flex flex-col gap-4 mb-6">
                <nav className="flex items-center gap-2 text-sm text-slate-500">
                    <Link className="hover:text-primary transition-colors" to="/">홈</Link>
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                    <span className="text-slate-900 dark:text-slate-100 font-medium">자주 묻는 질문</span>
                </nav>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors w-fit"
                >
                    <span className="material-symbols-outlined text-xl">arrow_back</span>
                    <span className="font-bold text-sm">뒤로가기</span>
                </button>
            </div>

            <header className="mb-12">
                <h1 className="text-4xl font-black mb-4 tracking-tight">자주 묻는 질문</h1>
                <p className="text-slate-500 max-w-2xl leading-relaxed">
                    고객님들이 많이 문의하시는 내용을 모았습니다. 아래에서 원하시는 답변을 찾아보세요.
                </p>
            </header>

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

            <div className="mt-16 bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-primary mb-3 block">support_agent</span>
                <h3 className="text-xl font-bold mb-2">원하시는 답변을 찾지 못하셨나요?</h3>
                <p className="text-slate-500 text-sm mb-6">고객센터 또는 1:1 온라인 상담으로 문의해 주세요.</p>
                <div className="flex flex-wrap justify-center gap-4">
                    <a href="tel:02-1234-5678" className="px-6 py-3 bg-primary text-slate-900 font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-xl">call</span>
                        02-1234-5678
                    </a>
                    <Link to="/consultations/new" className="px-6 py-3 border border-primary text-primary font-bold rounded-xl hover:bg-primary/5 transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-xl">chat</span>
                        1:1 온라인 상담
                    </Link>
                </div>
            </div>
        </main>
    );
}
