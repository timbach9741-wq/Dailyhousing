import { Link } from 'react-router-dom';
import { SHIPPING_POLICY, EXCHANGE_RETURN_POLICY, QUALITY_ASSURANCE } from '../data/legalContent';

export default function ShoppingGuide() {
    return (
        <main className="flex-1 px-4 md:px-20 py-8 max-w-[1280px] mx-auto w-full mb-20">
            <nav className="flex items-center gap-2 mb-6 text-sm">
                <Link className="text-slate-500 hover:text-primary" to="/">홈</Link>
                <span className="material-symbols-outlined text-sm text-slate-400">chevron_right</span>
                <span className="text-slate-900 dark:text-slate-100 font-medium">쇼핑 가이드</span>
            </nav>

            <header className="mb-12">
                <h1 className="text-4xl font-black mb-4 tracking-tight">쇼핑 가이드</h1>
                <p className="text-slate-500 max-w-2xl leading-relaxed">
                    데일리 하우징은 투명한 거래 절차와 고객님의 권리 보호를 위해 관련 법령을 준수합니다. 주문, 배송, 반품에 관한 안내를 확인해 주세요.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Shipping Policy Section */}
                <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-2xl">local_shipping</span>
                        </div>
                        <h2 className="text-2xl font-bold">{SHIPPING_POLICY.title}</h2>
                    </div>
                    <div className="space-y-6">
                        {SHIPPING_POLICY.content.map((item, idx) => (
                            <div key={idx}>
                                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">{item.subtitle}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Return Policy Section */}
                <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                            <span className="material-symbols-outlined text-orange-600 text-2xl">assignment_return</span>
                        </div>
                        <h2 className="text-2xl font-bold">{EXCHANGE_RETURN_POLICY.title}</h2>
                    </div>
                    <div className="space-y-6">
                        {EXCHANGE_RETURN_POLICY.content.map((item, idx) => (
                            <div key={idx}>
                                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">{item.subtitle}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Quality Assurance Section */}
                <section className="md:col-span-2 bg-slate-900 text-white rounded-2xl p-8 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-3xl">verified</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{QUALITY_ASSURANCE.title}</h2>
                                <p className="text-slate-400 text-sm mt-1">LX Z:IN 공식 유통 파트너로서 최상의 서비스를 약속합니다.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:w-2/3">
                            {QUALITY_ASSURANCE.content.map((item, idx) => (
                                <div key={idx} className="border-l border-white/10 pl-4">
                                    <h3 className="font-bold text-primary mb-1">{item.subtitle}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="md:col-span-2 bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
                    <h3 className="text-xl font-bold mb-3">궁금한 점이 더 있으신가요?</h3>
                    <p className="text-slate-600 mb-6 text-sm">고객센터는 평일 오전 9시부터 오후 6시까지 상담이 가능합니다.</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a href="tel:02-1234-5678" className="px-6 py-3 bg-primary text-slate-900 font-bold rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2">
                            <span className="material-symbols-outlined text-xl">call</span>
                            02-1234-5678
                        </a>
                        <Link to="/consultations/new" className="px-6 py-3 border border-primary text-primary font-bold rounded-lg hover:bg-primary/5 transition-all flex items-center gap-2">
                            <span className="material-symbols-outlined text-xl">chat</span>
                            1:1 온라인 상담
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}
