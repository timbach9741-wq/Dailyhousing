import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { LXZIN_PRODUCTS } from '../src/data/lxzin-products.js';
import { KUJUNGMARU_PRODUCTS } from '../src/data/kujungmaru-products.js';
import { DONGHWAMARU_PRODUCTS } from '../src/data/donghwamaru-products.js';
import { HANSOLMARU_PRODUCTS } from '../src/data/hansolmaru-products.js';
import { NOVAMARU_PRODUCTS } from '../src/data/novamaru-products.js';

const ALL_PRODUCTS = [
  ...LXZIN_PRODUCTS,
  ...KUJUNGMARU_PRODUCTS,
  ...DONGHWAMARU_PRODUCTS,
  ...HANSOLMARU_PRODUCTS,
  ...NOVAMARU_PRODUCTS,
];

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, '..', 'public');

// 실제 시공 사례(거래명세표로 검증된 실주소)가 있는 지역만 포함합니다.
// src/data/regionCaseStudies.js 에 새 실사례가 추가되면 여기에도 slug를 추가하세요.
// (실사례 없는 지역을 대량으로 넣으면 Google이 "크롤링됨-색인 생성 안됨"으로 처리하는 것을 8/10 확인함)
const PSEO_SLUGS = [
  "gyeonggi-yongin", "gyeonggi-namyangju", "gyeonggi-hwaseong", "gyeonggi-anyang",
  "gyeonggi-suwon", "gyeonggi-ilsan", "seoul-yangcheon", "gyeonggi-siheung",
  "gyeonggi-gwangju", "chungnam-asan", "incheon-junggu"
];

// static pages (trailing slashes matched)
const staticPages = [
  '/',
  '/category/residential/',
  '/category/commercial/',
  '/consultations/new/',
  '/inquiry/',
  '/case-studies/',
  '/shopping-guide/',
  '/terms/',
  '/privacy/',
  '/quality-assurance/',
  '/faq/',
  '/cleaning/',
  '/cleaning/move-in/',
  '/cleaning/sick-building/',
  '/cleaning/appliance/',
  '/cleaning/regular/',
  '/card/ceo/',
  '/card/director/',
  '/card/president/',
];

async function generateSitemap() {
  console.log('🚀 사이트맵(sitemap.xml) 생성 시작...');

  const urls = [];
  const baseDomain = 'https://데일리하우징.kr';

  // 1. 고정 페이지 추가
  staticPages.forEach(page => {
    urls.push({
      loc: `${baseDomain}${page}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: page === '/' ? 'daily' : 'weekly',
      priority: page === '/' ? '1.0' : '0.8'
    });
  });

  // 2. 지역 시공 페이지 추가 (PSEO)
  PSEO_SLUGS.forEach(slug => {
    urls.push({
      loc: `${baseDomain}/${slug}-flooring/`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '0.7'
    });
  });

  // 3. 상품 상세 페이지 추가 (전체 자재)
  ALL_PRODUCTS.forEach(product => {
    urls.push({
      loc: `${baseDomain}/product/${product.id}/`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '0.6'
    });
  });

  // XML 포맷팅
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  urls.forEach(url => {
    xml += '  <url>\n';
    xml += `    <loc>${url.loc}</loc>\n`;
    xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
    xml += `    <priority>${url.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>\n';

  // public 폴더 존재 여부 확인 후 저장
  if (!existsSync(PUBLIC_DIR)) {
    mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  const outputPath = join(PUBLIC_DIR, 'sitemap.xml');
  writeFileSync(outputPath, xml, 'utf-8');
  console.log(`✅ 사이트맵 생성 완료: ${outputPath} (${urls.length}개 URL)`);
}

generateSitemap();
