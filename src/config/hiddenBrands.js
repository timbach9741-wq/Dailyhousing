// 손님 화면(메뉴/목록/검색/상세/추천/사이트맵)에서 잠시 숨길 브랜드 (2026-09-28, LX Z:IN만 노출).
// 관리자/파트너 화면에서는 그대로 보이고 가격 수정도 가능하다.
// 다시 노출하려면 여기서 빼고, prerender.js / scripts/generate-sitemap.js 의 ALL_PRODUCTS에도 되살릴 것.
export const HIDDEN_BRANDS = ['구정마루', '동화마루', '한솔마루', '노바마루'];

export const isVisibleProduct = (p) => !!p && !HIDDEN_BRANDS.includes(p.brand);
