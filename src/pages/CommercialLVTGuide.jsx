import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const TIERS = [
    {
        name: 'LVT 베이직 3T (보타닉)',
        thickness: '3T',
        fit: '창고, 통로, 사용 빈도가 낮은 보조 공간',
        desc: '3T 두께의 입문형 상업용 LVT입니다. 예산을 최우선으로 고려하는 공간, 혹은 유동인구가 적은 보조 공간에 적합합니다.',
    },
    {
        name: 'LVT 스탠다드 3T (에코노플러스)',
        thickness: '3T',
        fit: '일반 사무실, 지식산업센터 개별 호실, 상담실',
        desc: '지식산업센터·사무실에서 가장 많이 문의하시는 등급입니다. 내구성과 가격의 균형이 좋아, 데스크가 많고 사람이 상시 오가는 일반 업무 공간에 무난하게 쓰입니다.',
    },
    {
        name: 'LVT 프리미엄 5T (프레스티지)',
        thickness: '5T',
        fit: '로비, 회의실, 대표실, 유동인구 많은 상업공간',
        desc: '5T 두께로 내구성과 마감 완성도가 가장 높은 등급입니다. 방문객이 자주 드나드는 로비·회의실이나, 장기적으로 보행 마모가 큰 공간에 추천드립니다.',
    },
];

const FAQS = [
    {
        q: '지식산업센터 개별 호실도 상업용 LVT 시공이 가능한가요?',
        a: '네, 가능합니다. 지식산업센터는 관리사무소 규정상 시공 가능 시간대(주로 야간·주말)와 공용 엘리베이터 사용 절차가 있는 경우가 많아, 실측 전에 해당 규정부터 함께 확인해드립니다.',
    },
    {
        q: '사무실 바닥재로 LVT와 데코타일 중 어떤 걸 선택해야 하나요?',
        a: 'LVT와 데코타일은 같은 계열의 바닥재이며, 유통사·제품 라인에 따라 부르는 명칭이 다를 뿐입니다. 데일리하우징은 LX Z:IN LVT(보타닉/에코노플러스/프레스티지) 라인을 공식 유통하고 있으며, 두께와 등급에 따라 가격·내구성이 달라집니다.',
    },
    {
        q: '기존 바닥재(타일, 데코타일) 위에 바로 시공할 수 있나요?',
        a: '기존 바닥 상태에 따라 다릅니다. 평탄도가 확보된 경우 기존 바닥 위 시공이 가능하지만, 요철이나 단차가 있으면 먼저 평탄화 작업이 필요합니다. 정확한 판단은 현장 실측 후 안내드립니다.',
    },
    {
        q: '평당 시공 가격은 어느 정도인가요?',
        a: '등급(보타닉/에코노플러스/프레스티지), 면적, 기존 바닥 철거·평탄화 필요 여부에 따라 달라져서 일괄 안내가 어렵습니다. 무료 방문 실측 후 정확한 견적을 드립니다.',
    },
    {
        q: '주말이나 야간에도 시공이 가능한가요?',
        a: '네, 사무실·상업공간은 영업에 지장이 없도록 주말 또는 야간 시공을 많이 진행합니다. 일정 조율이 가능하니 상담 시 희망 시간대를 말씀해 주세요.',
    },
];

export default function CommercialLVTGuide() {
    return (
        <main className="flex-1 px-4 md:px-20 py-8 max-w-[1280px] mx-auto w-full mb-20">
            <SEO
                title="상업용 LVT·데코타일 사무실 바닥재 가이드 — 지식산업센터 바닥재 선택 기준"
                description="지식산업센터, 사무실, 상업공간 바닥재를 고민 중이신가요? LVT·데코타일 등급별 비교와 시공 절차, 자주 묻는 질문을 데일리하우징이 정리했습니다. 무료 실측 상담 가능."
                url="https://데일리하우징.kr/commercial-lvt-guide/"
                imageUrl="https://데일리하우징.kr/assets/images/hero_banner_2.png"
            />

            <nav className="flex items-center gap-2 mb-6 text-sm">
                <Link className="text-slate-500 hover:text-primary" to="/">홈</Link>
                <span className="material-symbols-outlined text-sm text-slate-400">chevron_right</span>
                <Link className="text-slate-500 hover:text-primary" to="/category/commercial">상업용 LVT</Link>
                <span className="material-symbols-outlined text-sm text-slate-400">chevron_right</span>
                <span className="text-slate-900 dark:text-slate-100 font-medium">사무실 바닥재 가이드</span>
            </nav>

            <header className="mb-12">
                <h1 className="text-4xl font-black mb-4 tracking-tight">지식산업센터·사무실 바닥재, 이렇게 고르세요</h1>
                <p className="text-slate-500 max-w-2xl leading-relaxed">
                    지식산업센터 입주나 사무실 리모델링을 준비하며 상업용 LVT·데코타일 바닥재를 처음 알아보시는 분들을 위해,
                    등급별 차이와 시공 절차, 자주 묻는 질문을 정리했습니다. 데일리하우징은 LX Z:IN 상업용 LVT 공식 유통 파트너입니다.
                </p>
            </header>

            {/* 등급 비교 */}
            <section className="mb-16">
                <h2 className="text-2xl font-bold mb-6">등급별 비교</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {TIERS.map((tier) => (
                        <div key={tier.name} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                            <div className="text-xs font-bold text-primary mb-2">{tier.thickness}</div>
                            <h3 className="font-bold text-lg mb-2">{tier.name}</h3>
                            <p className="text-sm text-slate-500 mb-4 leading-relaxed">{tier.desc}</p>
                            <div className="text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                                <span className="font-semibold text-slate-600 dark:text-slate-300">추천 공간: </span>{tier.fit}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 시공 절차 */}
            <section className="mb-16">
                <h2 className="text-2xl font-bold mb-6">시공 절차</h2>
                <ol className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { step: '1', title: '무료 실측 상담', desc: '현장 방문 또는 도면으로 면적·바닥 상태를 확인합니다.' },
                        { step: '2', title: '등급·수량 견적', desc: '용도와 예산에 맞는 등급을 추천하고 정확한 견적을 안내드립니다.' },
                        { step: '3', title: '일정 조율', desc: '영업 지장을 최소화하도록 주말·야간 시공 등 일정을 맞춥니다.' },
                        { step: '4', title: '시공 및 마감', desc: '평탄화가 필요한 경우 선행 후 LVT를 시공하고 마감까지 정리합니다.' },
                    ].map((s) => (
                        <li key={s.step} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center mb-3">{s.step}</div>
                            <h3 className="font-bold mb-1">{s.title}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                        </li>
                    ))}
                </ol>
            </section>

            {/* FAQ */}
            <section className="mb-16">
                <h2 className="text-2xl font-bold mb-6">자주 묻는 질문</h2>
                <div className="space-y-4">
                    {FAQS.map((f) => (
                        <details key={f.q} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 group">
                            <summary className="font-bold cursor-pointer list-none flex items-center justify-between">
                                {f.q}
                                <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform">expand_more</span>
                            </summary>
                            <p className="text-sm text-slate-500 mt-3 leading-relaxed">{f.a}</p>
                        </details>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
                <h3 className="text-xl font-bold mb-3">지식산업센터·사무실 바닥재, 무료로 상담받아 보세요</h3>
                <p className="text-slate-600 mb-6 text-sm">현장 실측 후 등급별 정확한 견적을 안내드립니다.</p>
                <div className="flex flex-wrap justify-center gap-4">
                    <a href="tel:031-409-5556" className="px-6 py-3 bg-primary text-slate-900 font-bold rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-xl">call</span>
                        031-409-5556
                    </a>
                    <Link to="/consultations/new" className="px-6 py-3 border border-primary text-primary font-bold rounded-lg hover:bg-primary/5 transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-xl">chat</span>
                        1:1 온라인 상담
                    </Link>
                </div>
            </section>
        </main>
    );
}
