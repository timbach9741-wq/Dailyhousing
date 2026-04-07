import fs from 'fs';

let lines = fs.readFileSync('src/pages/ShoppingCartCheckout.jsx', 'utf-8').split('\n');

const correctBlock = `                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h3 className="text-lg font-bold mb-4">결제 수단 선택</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <label className="relative flex flex-col p-4 border-2 border-primary rounded-xl bg-primary/5 cursor-pointer transition-all">
                                <input defaultChecked className="absolute top-4 right-4 text-primary focus:ring-primary h-4 w-4" name="payment" type="radio" />
                                <span className="material-symbols-outlined text-2xl mb-2 text-primary">credit_card</span>
                                <span className="font-bold text-sm">신용카드</span>
                                <span className="text-xs text-slate-500">실시간 안전 결제</span>
                            </label>
                            <label className="relative flex flex-col p-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-primary/50 cursor-pointer transition-all">
                                <input className="absolute top-4 right-4 text-primary focus:ring-primary h-4 w-4" name="payment" type="radio" />
                                <div className="w-6 h-6 mb-2 rounded bg-[#FEE500] flex items-center justify-center overflow-hidden">
                                    <span className="material-symbols-outlined text-lg text-slate-900">chat_bubble</span>
                                </div>
                                <span className="font-bold text-sm">카카오페이</span>
                                <span className="text-xs text-slate-500">간편하고 빠른 결제</span>
                            </label>
                            <label className="relative flex flex-col p-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-primary/50 cursor-pointer transition-all">
                                <input className="absolute top-4 right-4 text-primary focus:ring-primary h-4 w-4" name="payment" type="radio" />
                                <span className="material-symbols-outlined text-2xl mb-2 text-slate-400">account_balance</span>
                                <span className="font-bold text-sm">실시간 계좌이체</span>
                                <span className="text-xs text-slate-500">에스크로 안전결제 지원</span>
                            </label>
                        </div>
                    </div>

                    {/* Terms Agreement Section */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h3 className="text-lg font-bold mb-4">약관 동의</h3>
                        <div className="space-y-4">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                    className="mt-1 w-5 h-5 text-primary focus:ring-primary rounded border-slate-300"
                                />
                                <div className="text-sm">
                                    <p className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">주문 내역 확인 및 주의사항 동의 (필수)</p>
                                    <p className="text-slate-500 mt-1 leading-relaxed">
                                        상품의 주문 수량, 옵션, 결제 금액을 확인하였으며, 쇼핑몰 이용약관 및 개인정보 처리방침에 동의합니다.
                                        특히 바닥재 재단 상품의 경우 단순 변심 반품이 제한될 수 있음을 확인하였습니다.
                                        <Link to="/shopping-guide" className="text-primary hover:underline ml-1 font-medium">[상세정보 보기]</Link>
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm sticky top-24">
                        <h3 className="text-xl font-bold mb-6">결제 요약</h3>
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">상품 금액{isBusiness ? ' (사업자할인)' : ''}</span>
                                <span className="font-medium">{totalPrice.toLocaleString()}원</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">부가세(10%)</span>
                                <span className="font-medium">{tax.toLocaleString()}원</span>
                            </div>
                            {/* 배송비 결제정보 */}
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">배송비</span>
                                <span className="font-bold text-red-500">착불</span>
                            </div>
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-baseline">
                                <span className="text-lg font-bold">최종 결제 금액</span>
                                <span className="text-2xl font-black text-primary">{finalPrice.toLocaleString()}원</span>
                            </div>

                            {/* 사업자 할인 안내 */}
                            {isBusiness && discountAmount > 0 && (
                                <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="material-symbols-outlined text-[18px] text-[#c8221f]">savings</span>
                                        <span className="text-[14px] font-black text-[#c8221f]">사업자 할인 혜택</span>
                                        <span className="ml-auto text-[11px] bg-[#c8221f] text-white px-2 py-0.5 rounded-full font-bold">총 {discountRate}% 절감</span>
                                    </div>
                                    <div className="space-y-2 text-[13px]">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">일반가 합계</span>
                                            <span className="text-slate-400 line-through">{originalTotal.toLocaleString()}원</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">사업자 할인가</span>
                                            <span className="font-bold text-slate-700">{totalPrice.toLocaleString()}원</span>
                                        </div>
                                        <div className="flex justify-between pt-2 border-t border-red-200">
                                            <span className="font-bold text-[#c8221f] flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                                                총 절감 금액
                                            </span>
                                            <span className="font-black text-[#c8221f] text-[15px]">- {discountAmount.toLocaleString()}원</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="space-y-3">
                            <button
                                className={\`w-full font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed \${agreed ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200' : 'bg-slate-200 text-slate-500 animate-blink-warning border-red-200 shadow-sm'}\`}
                                disabled={items.length === 0 || !agreed}
                                onClick={handleCheckout}
                            >
                                <span className="material-symbols-outlined">{agreed ? 'lock' : 'check_circle'}</span>
                                {agreed ? '결제하기' : '약관 동의 필요'}
                            </button>
                            <button onClick={() => navigate(-1)} className="w-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-lg transition-colors">
                                쇼핑 계속하기
                            </button>
                        </div>
                        <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-primary text-xl">verified_user</span>
                                <div className="text-xs text-slate-500 leading-relaxed">
                                    <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">안전 결제 에스크로 보증</p>
                                    고객님의 결제 정보는 암호화되어 안전하게 처리되며, 개인정보 처리방침에 따라 철저하게 보호됩니다.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}`;

lines.splice(445, 571 - 445 + 1, correctBlock);
fs.writeFileSync('src/pages/ShoppingCartCheckout.jsx', lines.join('\n'));
console.log('perfect replacement complete');
