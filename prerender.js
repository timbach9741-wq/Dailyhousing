import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { LXZIN_PRODUCTS } from './src/data/lxzin-products.js';
import { KUJUNGMARU_PRODUCTS } from './src/data/kujungmaru-products.js';
import { DONGHWAMARU_PRODUCTS } from './src/data/donghwamaru-products.js';
import { HANSOLMARU_PRODUCTS } from './src/data/hansolmaru-products.js';
import { NOVAMARU_PRODUCTS } from './src/data/novamaru-products.js';

const ALL_PRODUCTS = [
  ...LXZIN_PRODUCTS,
  ...KUJUNGMARU_PRODUCTS,
  ...DONGHWAMARU_PRODUCTS,
  ...HANSOLMARU_PRODUCTS,
  ...NOVAMARU_PRODUCTS,
];

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(__dirname, 'dist');
const DEFAULT_TITLE_TAG = '데일리하우징 - 프리미엄 바닥재 솔루션</title>';
// dist 밖(프로젝트 루트)에 보관 — vite build가 dist를 통째로 비워도 살아남고,
// prerender.js를 여러 번 나눠 재실행해도 "손 안 탄 원본 셸"을 계속 재사용 가능
const SHELL_BACKUP_PATH = join(__dirname, '.prerender-pristine-shell.html');

// vite build 직후 dist/index.html은 아직 아무 라우트도 프리렌더되지 않은 순수 원본이므로
// 이 시점의 내용을 백업해둠. 이미 진행 중이던 prerender.js를 재실행하는 경우라면
// (dist/index.html이 이미 홈페이지 내용으로 덮어써졌을 수 있으므로) 저장해둔 백업을 그대로 씀.
function getPristineShell() {
  const current = readFileSync(join(DIST_DIR, 'index.html'), 'utf-8');
  if (current.includes(DEFAULT_TITLE_TAG)) {
    writeFileSync(SHELL_BACKUP_PATH, current, 'utf-8');
    return current;
  }
  if (existsSync(SHELL_BACKUP_PATH)) {
    return readFileSync(SHELL_BACKUP_PATH, 'utf-8');
  }
  return current;
}

// 기존 27개 지역은 이미 Google에 크롤링된 URL이라 그대로 프리렌더해서
// noindex 태그가 정적 HTML에 정확히 박히도록 유지합니다(실사례 없는 지역은
// LocalFlooringSEO.jsx가 자동으로 noindex 처리함). sitemap.xml에는 실사례
// 있는 10개 지역만 올라갑니다 (scripts/generate-sitemap.js 참고).
const PSEO_SLUGS = [
  "seoul-gangnam", "seoul-seocho", "seoul-songpa", "seoul-mapo", "seoul-yongsan",
  "seoul-seongdong", "seoul-gangdong", "seoul-nowon", "seoul-yeongdeungpo",
  "gyeonggi-bundang", "gyeonggi-suwon", "gyeonggi-ilsan", "gyeonggi-gimpo",
  "gyeonggi-hwaseong", "gyeonggi-yongin", "gyeonggi-hanami", "gyeonggi-namyangju",
  "gyeonggi-anyang", "gyeonggi-bucheon", "gyeonggi-gwangmyeong",
  "incheon-yeonsu", "incheon-bupyeong",
  "busan-haeundae", "busan-suyeong", "busan-dongnae",
  "daegu-suseong", "daejeon-yuseong",
  // 8/10 신규 추가 (실제 시공 사례 확보된 지역)
  "seoul-yangcheon", "gyeonggi-siheung", "gyeonggi-gwangju", "chungnam-asan",
  // 8/31 신규 추가 (실제 시공 사례 확보된 지역)
  "incheon-junggu",
  // 9/4 신규 추가 — 동탄 slug 신설. 실사례 미확보 상태라 LocalFlooringSEO.jsx가
  // 자동으로 noindex 처리함(실사례 확보 시 regionCaseStudies.js에 추가하면 자동 해제).
  "gyeonggi-dongtan"
];

// static pages to prerender
const staticPages = [
  '/',
  '/category/residential',
  '/category/commercial',
  '/commercial-lvt-guide',
  '/consultations/new',
  '/inquiry',
  '/case-studies',
  '/shopping-guide',
  '/terms',
  '/privacy',
  '/quality-assurance',
  '/faq',
  '/cleaning',
  '/cleaning/move-in',
  '/cleaning/sick-building',
  '/cleaning/appliance',
  '/cleaning/regular',
  '/card/ceo',
  '/card/director',
  '/card/president',
];

const ROUTES_TO_PRERENDER = [
  ...staticPages,
  ...PSEO_SLUGS.map(slug => `/${slug}-flooring`),
  ...ALL_PRODUCTS.map(p => `/product/${p.id}`)
];

/**
 * 간단한 정적 파일 서버
 * dist 폴더를 로컬에서 서빙하여 Puppeteer가 접근할 수 있도록 함
 */
function createStaticServer(port) {
  // vite build 직후, 어떤 라우트도 아직 프리렌더로 dist/index.html을 덮어쓰기 전에
  // "깨끗한" 앱 셸을 한 번만 메모리에 스냅샷해둠. 이걸 안 해두면 "/"가 먼저 프리렌더되면서
  // dist/index.html이 홈페이지 title/canonical이 박힌 채로 바뀌고, 이후 다른 라우트들이
  // (아직 자기 폴더가 없어) SPA 폴백으로 이 오염된 파일을 받아 그 위에 자기 태그를 더 쌓는
  // 방식으로 title/canonical이 페이지마다 중복 누적되는 버그가 있었음 (2026-08-20 발견).
  const PRISTINE_SHELL = getPristineShell();

  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let urlPath = req.url.split('?')[0];
      let filePath = join(DIST_DIR, urlPath);

      try {
        const content = readFileSync(filePath);
        const ext = urlPath.split('.').pop();
        const mimeTypes = {
          'html': 'text/html',
          'js': 'application/javascript',
          'css': 'text/css',
          'svg': 'image/svg+xml',
          'webp': 'image/webp',
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'json': 'application/json',
          'xml': 'application/xml',
          'txt': 'text/plain',
        };
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        res.end(content);
      } catch {
        // SPA fallback: 항상 오염되지 않은 최초 스냅샷을 서빙
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(PRISTINE_SHELL);
      }
    });

    server.listen(port, () => {
      console.log(`📡 정적 서버 시작: http://localhost:${port}`);
      resolve(server);
    });
  });
}

async function prerender() {
  const PORT = 4173;
  console.log('🚀 데일리하우징 프리렌더링 시작...\n');

  if (!existsSync(DIST_DIR)) {
    console.error('❌ dist 폴더가 없습니다. 먼저 "npm run build"를 실행하세요.');
    process.exit(1);
  }

  const server = await createStaticServer(PORT);
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  function isAlreadyRendered(route) {
    // vite build는 매번 dist를 통째로 비우지만, prerender.js만 재실행할 때는
    // 이전 시도에서 이미 정상적으로 (기본 title이 아닌) 렌더링된 페이지는
    // 다시 돌릴 필요가 없음 — 리소스 경합으로 여러 번 나눠 돌려야 할 때 재사용
    const outputPath = route === '/' ? join(DIST_DIR, 'index.html') : join(DIST_DIR, route, 'index.html');
    if (!existsSync(outputPath)) return false;
    try {
      const html = readFileSync(outputPath, 'utf-8');
      return html.includes('</title>') && !html.includes(DEFAULT_TITLE_TAG) && html.includes('rel="canonical"');
    } catch {
      return false;
    }
  }

  try {
    async function renderRoute(route, label) {
      if (isAlreadyRendered(route)) {
        console.log(`  ⏭️  이미 완료됨 (${label}): ${route}`);
        return true;
      }
      let page;
      try {
        page = await browser.newPage();
        // Viewport 및 User-Agent 모방
        await page.setViewport({ width: 1280, height: 800 });
        await page.setUserAgent('Mozilla/5.0 (compatible; Yeti/1.1; +http://naver.me/bot)');

        const url = `http://localhost:${PORT}${route}`;
        console.log(`  📄 렌더링 중 (${label}): ${route}`);

        await page.goto(url, {
          waitUntil: 'networkidle2',
          timeout: 45000,
        });

        // React 렌더링 및 Suspense 완료 대기 (#root 하위에 노드가 그려질 때까지 대기)
        await page.waitForSelector('#root > *', { timeout: 20000 });

        // react-helmet-async가 실제 페이지별 title을 커밋할 때까지 대기
        // (index.html 기본 title과 다른 값이 될 때까지 기다림. 못 기다리면 그냥 진행)
        await page.waitForFunction(
          (defaultTitle) => document.title && document.title !== defaultTitle,
          { timeout: 3000 },
          '데일리하우징 - 프리미엄 바닥재 솔루션'
        ).catch(() => {});

        // 데이터 로드 안정화를 위한 대기
        await new Promise(r => setTimeout(r, 200));

        // 대표 canonical URL 보정/트레일링 슬래시 주입 + 혹시 남아있는 중복 title/canonical 정리
        await page.evaluate((currentRoute) => {
          const canonicals = document.querySelectorAll('link[rel="canonical"]');
          canonicals.forEach((el, idx) => { if (idx > 0) el.remove(); });
          const canonical = canonicals[0];
          if (canonical) {
            // 루트면 슬래시 포함, 그 외엔 끝에 슬래시 강제 추가
            const formattedRoute = currentRoute === '/' ? '/' : currentRoute + '/';
            canonical.setAttribute('href', `https://데일리하우징.kr${formattedRoute}`);
          }

          // <title>은 실제 document.title과 일치하는 태그 하나만 남기고 나머지(정적 기본값 등) 제거
          const titles = document.querySelectorAll('title');
          let kept = false;
          titles.forEach((el) => {
            if (!kept && el.textContent === document.title) {
              kept = true;
            } else {
              el.remove();
            }
          });
        }, route);

        const html = await page.content();

        // 저장 경로 계산 및 폴더 생성
        let outputPath;
        if (route === '/') {
          outputPath = join(DIST_DIR, 'index.html');
        } else {
          const dir = join(DIST_DIR, route);
          if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
          }
          outputPath = join(dir, 'index.html');
        }

        writeFileSync(outputPath, html, 'utf-8');
        return true;
      } catch (err) {
        console.warn(`  ⚠️ ${route} 렌더링 실패: ${err.message}`);
        return false;
      } finally {
        if (page) await page.close().catch(() => {});
      }
    }

    // 순차적으로 혹은 소규모 병렬로 처리하여 속도 및 메모리 안정성 보장
    // 청소타워와 마찬가지로 비동기 병렬 매핑하되 에러 관리 철저히 진행
    const batchSize = 4;
    let failedRoutes = [];
    for (let i = 0; i < ROUTES_TO_PRERENDER.length; i += batchSize) {
      const batch = ROUTES_TO_PRERENDER.slice(i, i + batchSize);
      const results = await Promise.all(batch.map((route, idx) =>
        renderRoute(route, `${i + idx + 1}/${ROUTES_TO_PRERENDER.length}`)
      ));
      batch.forEach((route, idx) => { if (!results[idx]) failedRoutes.push(route); });
    }

    // 시스템 부하로 실패한 페이지는 동시성을 낮춰 최대 3회까지 재시도
    for (let attempt = 1; failedRoutes.length > 0 && attempt <= 3; attempt++) {
      console.log(`\n🔁 재시도 ${attempt}차 (${failedRoutes.length}개 남음, 동시 2개씩)...`);
      const retryTargets = failedRoutes;
      failedRoutes = [];
      const retryBatchSize = 2;
      for (let i = 0; i < retryTargets.length; i += retryBatchSize) {
        const batch = retryTargets.slice(i, i + retryBatchSize);
        const results = await Promise.all(batch.map((route, idx) =>
          renderRoute(route, `재시도 ${i + idx + 1}/${retryTargets.length}`)
        ));
        batch.forEach((route, idx) => { if (!results[idx]) failedRoutes.push(route); });
      }
    }

    if (failedRoutes.length > 0) {
      console.warn(`\n⚠️ 최종적으로 ${failedRoutes.length}개 페이지 렌더링 실패: ${failedRoutes.join(', ')}`);
    }

    console.log(`\n🎉 프리렌더링 완료! 총 ${ROUTES_TO_PRERENDER.length}개 중 ${ROUTES_TO_PRERENDER.length - failedRoutes.length}개 페이지가 정적 HTML로 변환되었습니다.`);
  } catch (error) {
    console.error('❌ 프리렌더링 중 오류 발생:', error);
    process.exit(1);
  } finally {
    await browser.close();
    server.close();
  }
}

prerender();
