// 같은 상품 라인(subtitle이 동일 = 색상/패턴만 다른 변형)의 상품들을 하나의 대표
// 페이지로 묶기 위한 유틸. 859개 상품 페이지 중 상당수가 색상만 다른 사실상 동일
// 페이지라 Google Search Console에서 "발견됨 - 현재 색인 생성되지 않음"으로 대부분
// 방치되는 문제(2026-09-07 확인)가 있어, 라인별 대표 1개만 색인 요청하고 나머지는
// noindex + canonical로 대표 페이지를 가리키게 한다.
//
// 대표 상품은 id가 가장 작은 상품으로 결정(배열 순서에 의존하지 않아, 상품 목록이
// 어떤 순서로 조합되어도 — 클라이언트 스토어(useProductStore)와 빌드 스크립트
// (prerender.js, scripts/generate-sitemap.js) 양쪽 모두 — 항상 같은 대표를 가리킴).

export function getProductLineKey(product) {
  return product.subtitle || product.title;
}

export function buildCanonicalIdMap(products) {
  const groups = new Map();
  for (const p of products) {
    const key = getProductLineKey(p);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(p);
  }

  const canonicalById = new Map();
  for (const group of groups.values()) {
    const canonical = group.reduce((min, p) =>
      Number(p.id) < Number(min.id) ? p : min
    );
    for (const p of group) {
      canonicalById.set(String(p.id), String(canonical.id));
    }
  }
  return canonicalById;
}
