import fs from 'fs';

let content = fs.readFileSync('src/pages/ShoppingCartCheckout.jsx', 'utf-8');

// The strategy is to replace sections entirely since we have the full structure.
// So we will just look for the start and end of these elements.

content = content.replace(
    /<h3 className="text-lg font-bold mb-4">\s*배송 \?보 \?력\s*<\/h3>/,
    '<h3 className="text-lg font-bold mb-4">배송 정보 입력</h3>'
);

content = content.replace(
    /<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">\?름<\/label>/,
    '<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">이름</label>'
);

content = content.replace(
    /placeholder="\?름\?\?\?력\?주\?요"/g,
    'placeholder="이름을 입력해주세요"'
);

// We have syntax error here on label
content = content.replace(
    /<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">\?락\?\/label>/g,
    '<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">연락처</label>'
);

content = content.replace(
    /<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">배송 주소<\/label>/,
    '<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">배송 주소</label>'
);

content = content.replace(
    /placeholder="주소 검\?을 \?용\?주\?요"/g,
    'placeholder="주소 검색을 이용해주세요"'
);

content = content.replace(
    />\s*주소 검\?\?\s*<\/button>/,
    '>\n                                        주소 검색\n                                    </button>'
);

content = content.replace(
    /placeholder="\?세 주소\?\?\력\?주\?요 \(\?\? \?수 \?력\)"/g,
    'placeholder="상세 주소를 입력해주세요 (※ 필수 입력)"'
);

content = content.replace(
    /<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">\?장 관리인 \?락\?<span className="text-slate-400 font-normal ml-1">\(\?택\)<\/span><\/label>/,
    '<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">현장 관리인 연락처<span className="text-slate-400 font-normal ml-1">(선택)</span></label>'
);

content = content.replace(
    /placeholder="010-0000-0000 \(\?장 관리자 번호\)"/,
    'placeholder="010-0000-0000 (현장 관리자 번호)"'
);

content = content.replace(
    /<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">\?차 조건 <span className="text-slate-400 font-normal ml-1">\(\?택\)<\/span><\/label>/,
    '<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">하차 조건 <span className="text-slate-400 font-normal ml-1">(선택)</span></label>'
);

content = content.replace(
    /placeholder="\?\? 지게차 \?차, 까\?\?기\? \?의\?항 \?력"/,
    'placeholder="예: 지게차 하차, 까대기 등 주의사항 입력"'
);

// We have syntax error here
content = content.replace(
    /<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">배송 \?망\?\?\/label>/,
    '<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">배송 희망일</label>'
);

content = content.replace(
    /\?절 \?품\(\?는 \?고 부\?\?\?\?\?고 \?정\?\?\$\{minDeliveryDate\}\) \?후로만 \?택 가\?합\?다\./,
    '품절 상품(또는 재고 부족)은 입고 예정일(${minDeliveryDate}) 이후로만 선택 가능합니다.'
);

content = content.replace(
    /배송 주문 최소 3\?후/,
    '배송 주문 최소 3일 후'
);

content = content.replace(
    /<span className="material-symbols-outlined text-sm align-middle mr-1">info<\/span>\s*\?력\?신 \?보\?\?\?\?활\?\?배송 \?주문 \?인\?\?\?\?해\?만 \?용\?니\?\?\s*<\/p>/,
    '<span className="material-symbols-outlined text-sm align-middle mr-1">info</span>\n                                입력하신 정보는 원활한 배송 및 주문 확인을 위해서만 이용됩니다.\n                            </p>'
);

content = content.replace(
    /<h3 className="text-lg font-bold mb-4">결제 \?단 \?택<\/h3>/,
    '<h3 className="text-lg font-bold mb-4">결제 수단 선택</h3>'
);

content = content.replace(
    /<span className="font-bold text-sm">\?용카드<\/span>/,
    '<span className="font-bold text-sm">신용카드</span>'
);

content = content.replace(
    /<span className="text-xs text-slate-500">\?시\?\?\?\?\?\? 결제<\/span>/,
    '<span className="text-xs text-slate-500">실시간 안전 결제</span>'
);

// Syntax errors on missing closing tags
content = content.replace(
    /<span className="font-bold text-sm">카카\?페\?\?\/span>/,
    '<span className="font-bold text-sm">카카오페이</span>'
);

content = content.replace(
    /<span className="text-xs text-slate-500">간편\?고 빠른 결제<\/span>/,
    '<span className="text-xs text-slate-500">간편하고 빠른 결제</span>'
);

content = content.replace(
    /<span className="font-bold text-sm">\?시\?계좌\?체<\/span>/,
    '<span className="font-bold text-sm">실시간 계좌이체</span>'
);

// Syntax errors on missing closing tags
content = content.replace(
    /<span className="text-xs text-slate-500">\?스\?로 \?전결제 지\?\?\/span>/,
    '<span className="text-xs text-slate-500">에스크로 안전결제 지원</span>'
);

content = content.replace(
    /<h3 className="text-lg font-bold mb-4">\?\\? \?의<\/h3>/,
    '<h3 className="text-lg font-bold mb-4">약관 동의</h3>'
);

content = content.replace(
    /<p className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">주문 \?역 \?인 \?\?\?의\?항 \?의 \(\?수\)<\/p>/,
    '<p className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">주문 내역 확인 및 주의사항 동의 (필수)</p>'
);

content = content.replace(
    /<p className="text-slate-500 mt-1 leading-relaxed">\s*\?품\?\?주문 \?량, \?션, 결제 금액\?\?\?\?인\?\?\?\?\?며, \?핑\?\?\?용\?\?\? \?개인\?보 처리방침\?\?\?\?의\?니\?\?\s*\?히 바닥\?\?\?\?단 \?품\?\?경우 \?순 변\?\?반품\?\?\?\?한\?\?\?\?\?\?\?음\?\?\?\?인\?\?\?\?\?니\?\?\s*<Link to="\/shopping-guide" className="text-primary hover:underline ml-1 font-medium">\[\?세\?\?보기\]<\/Link>\s*<\/p>/,
    '<p className="text-slate-500 mt-1 leading-relaxed">\n                                        상품의 주문 수량, 옵션, 결제 금액을 확인하였으며, 쇼핑몰 이용약관 및 개인정보 처리방침에 동의합니다.\n                                        특히 바닥재 재단 상품의 경우 단순 변심 반품이 제한될 수 있음을 확인하였습니다.\n                                        <Link to="/shopping-guide" className="text-primary hover:underline ml-1 font-medium">[상세정보 보기]</Link>\n                                    </p>'
);

content = content.replace(
    /<h3 className="text-xl font-bold mb-6">결제 \?약<\/h3>/,
    '<h3 className="text-xl font-bold mb-6">결제 요약</h3>'
);

content = content.replace(
    /<span className="text-slate-600 dark:text-slate-400">\?품 금액\{isBusiness \? ' \(\?업\?\?\?\)' : ''\}<\/span>\s*<span className="font-medium">\{totalPrice(?:\\\.toLocaleString\(\))?\}\\원/g,
    '<span className="text-slate-600 dark:text-slate-400">상품 금액{isBusiness ? \' (사업자할인)\' : \'\'}</span>\n                                <span className="font-medium">{totalPrice.toLocaleString()}원</span>'
);

content = content.replace(
    /<span className="text-slate-600 dark:text-slate-400">\?품 금액{isBusiness \? ' \(\?업\?\?\?\)' : ''}<\/span>\s*<span className="font-medium">\{totalPrice\.toLocaleString\(\)\}원\s*<\/div>/,
    '<span className="text-slate-600 dark:text-slate-400">상품 금액{isBusiness ? \' (사업자할인)\' : \'\'}</span>\n                                <span className="font-medium">{totalPrice.toLocaleString()}원</span>\n                            </div>'
);

content = content.replace(
    /<span className="text-slate-600 dark:text-slate-400">부가\?\?10\%\)<\/span>\s*<span className="font-medium">\{tax\.toLocaleString\(\)\}원\s*<\/div>/,
    '<span className="text-slate-600 dark:text-slate-400">부가세(10%)</span>\n                                <span className="font-medium">{tax.toLocaleString()}원</span>\n                            </div>'
);

content = content.replace(
    /\{\/\* 배송\?\?\?내 - \?체 착불 \*\/\}/,
    '{/* 배송비 결제정보 */}'
);

content = content.replace(
    /<span className="text-slate-600 dark:text-slate-400">배송\?\/span>/,
    '<span className="text-slate-600 dark:text-slate-400">배송비</span>'
);

content = content.replace(
    /<span className="text-2xl font-black text-primary">\{finalPrice\.toLocaleString\(\)\}원\s*<\/div>/,
    '<span className="text-2xl font-black text-primary">{finalPrice.toLocaleString()}원</span>\n                            </div>'
);

content = content.replace(
    /\{\/\* \?업\?\?\?\?인 \?택 \?약 \*\/\}/,
    '{/* 사업자 할인 안내 */}'
);

content = content.replace(
    /<span className="text-\[14px\] font-black text-\[#c8221f\]">\?업\?\?\?\?인 \?택<\/span>/,
    '<span className="text-[14px] font-black text-[#c8221f]">사업자 할인 혜택</span>'
);

content = content.replace(
    /<span className="ml-auto text-\[11px\] bg-\[#c8221f\] text-white px-2 py-0\.5 rounded-full font-bold">\?\{discountRate\}% \?감<\/span>/,
    '<span className="ml-auto text-[11px] bg-[#c8221f] text-white px-2 py-0.5 rounded-full font-bold">총 {discountRate}% 절감</span>'
);

content = content.replace(
    /<span className="text-slate-500">\?반가 \?계<\/span>\s*<span className="text-slate-400 line-through">\{originalTotal\.toLocaleString\(\)\}원\s*<\/div>/,
    '<span className="text-slate-500">일반가 합계</span>\n                                            <span className="text-slate-400 line-through">{originalTotal.toLocaleString()}원</span>\n                                        </div>'
);

content = content.replace(
    /<span className="text-slate-500">\?업\?\?\? \?용<\/span>\s*<span className="font-bold text-slate-700">\{totalPrice\.toLocaleString\(\)\}원\s*<\/div>/,
    '<span className="text-slate-500">사업자 할인가</span>\n                                            <span className="font-bold text-slate-700">{totalPrice.toLocaleString()}원</span>\n                                        </div>'
);

content = content.replace(
    /\?\?\?감 금액/,
    '총 절감 금액'
);

content = content.replace(
    /<span className="font-black text-\[#c8221f\] text-\[15px\]">-\{discountAmount\.toLocaleString\(\)\}원\s*<\/div>/,
    '<span className="font-black text-[#c8221f] text-[15px]">- {discountAmount.toLocaleString()}원</span>\n                                        </div>'
);

content = content.replace(
    /\{agreed \? '결제\?기' : '\?\\? \?의 \?요'\}/,
    '{agreed ? \'결제하기\' : \'약관 동의 필요\'}'
);

content = content.replace(
    /\?핑 계속\?기/,
    '쇼핑 계속하기'
);

content = content.replace(
    /<p className="font-bold text-slate-700 dark:text-slate-300 mb-1">\?전 결제 \?스\?\?보증<\/p>/,
    '<p className="font-bold text-slate-700 dark:text-slate-300 mb-1">안전 결제 에스크로 보증</p>'
);

content = content.replace(
    /고객\?\?의 결제 \?보\?\?\보호\?\어 \?전\?\게 처리\?\며, 개인\?보 처리방침\?\?\?\?라 철\?\?\?\보호\?\니\?\?/,
    '고객님의 결제 정보는 암호화되어 안전하게 처리되며, 개인정보 처리방침에 따라 철저하게 보호됩니다.'
);

fs.writeFileSync('src/pages/ShoppingCartCheckout.jsx', content);
console.log('Update finished.');
