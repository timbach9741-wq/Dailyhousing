import { COMMERCIAL_PRODUCTS } from './src/data/commercial-products.js';

const cats = ['LVT 베이직 3T(보타닉)', 'LVT 스탠다드 3T(에코노플러스)', 'LVT 프리미엄 5T(프레스티지)'];

cats.forEach(cat => {
    const items = COMMERCIAL_PRODUCTS.filter(p => p.subCategory === cat);
    console.log(`\n${'='.repeat(60)}`);
    console.log(`${cat} (${items.length}개)`);
    console.log('='.repeat(60));
    
    // 보타닉/에코노 필터 테스트
    if (['LVT 베이직 3T(보타닉)', 'LVT 스탠다드 3T(에코노플러스)'].includes(cat)) {
        const f600 = items.filter(p => p.title?.includes('600각') || p.specifications?.size?.includes('600'));
        const f450 = items.filter(p => p.title?.includes('450각') || p.specifications?.size?.includes('450'));
        const fwood = items.filter(p => p.title?.includes('우드') || p.patterns?.includes('Wood') || p.model_id?.includes('W'));
        
        console.log(`\n  [600각 필터] ${f600.length}개`);
        f600.forEach(p => console.log(`    ${p.id} | ${p.title} | ${p.model_id} | ${p.specifications?.size}`));
        
        console.log(`\n  [450각 필터] ${f450.length}개`);
        f450.forEach(p => console.log(`    ${p.id} | ${p.title} | ${p.model_id} | ${p.specifications?.size}`));
        
        console.log(`\n  [우드 필터] ${fwood.length}개`);
        fwood.forEach(p => console.log(`    ${p.id} | ${p.title} | ${p.model_id} | ${p.specifications?.size}`));
        
        // 중복 검사
        const ids600 = new Set(f600.map(p => p.id));
        const ids450 = new Set(f450.map(p => p.id));
        const idsW = new Set(fwood.map(p => p.id));
        
        console.log('\n  [중복 검사]');
        items.forEach(p => {
            const in600 = ids600.has(p.id);
            const in450 = ids450.has(p.id);
            const inW = idsW.has(p.id);
            const count = (in600?1:0)+(in450?1:0)+(inW?1:0);
            if (count >= 2) {
                console.log(`    ⚠️ 중복! ${p.id} | ${p.title} | ${p.model_id} => 600각:${in600} 450각:${in450} 우드:${inW}`);
            }
            if (count === 0) {
                console.log(`    ❌ 누락! ${p.id} | ${p.title} | ${p.model_id} | ${p.specifications?.size}`);
            }
        });
    }
    
    // 프레스티지 필터
    if (cat === 'LVT 프리미엄 5T(프레스티지)') {
        const f600 = items.filter(p => (p.model_id?.startsWith('PTT') || p.title?.includes('사각')) && p.specifications?.size?.includes('600'));
        const fSq = items.filter(p => (p.model_id?.startsWith('PTT') || p.title?.includes('사각')) && !p.specifications?.size?.includes('600'));
        const fwood = items.filter(p => p.model_id?.startsWith('PTW') || p.patterns?.includes('Wood') || p.title?.includes('우드'));
        
        console.log(`\n  [사각600각 필터] ${f600.length}개`);
        f600.forEach(p => console.log(`    ${p.id} | ${p.title} | ${p.model_id} | ${p.specifications?.size}`));
        
        console.log(`\n  [사각 필터] ${fSq.length}개`);
        fSq.forEach(p => console.log(`    ${p.id} | ${p.title} | ${p.model_id} | ${p.specifications?.size}`));
        
        console.log(`\n  [우드 필터] ${fwood.length}개`);
        fwood.forEach(p => console.log(`    ${p.id} | ${p.title} | ${p.model_id} | ${p.specifications?.size}`));
        
        // 중복 검사
        items.forEach(p => {
            const in600 = f600.some(x => x.id === p.id);
            const inSq = fSq.some(x => x.id === p.id);
            const inW = fwood.some(x => x.id === p.id);
            const count = (in600?1:0)+(inSq?1:0)+(inW?1:0);
            if (count >= 2) {
                console.log(`    ⚠️ 중복! ${p.id} | ${p.title} | ${p.model_id} => 600각:${in600} 사각:${inSq} 우드:${inW}`);
            }
        });
    }
});
