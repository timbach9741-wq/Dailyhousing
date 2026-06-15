import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { LXZIN_PRODUCTS } from './src/data/lxzin-products.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(__dirname, 'dist');

const PSEO_SLUGS = [
  "seoul-gangnam", "seoul-seocho", "seoul-songpa", "seoul-mapo", "seoul-yongsan",
  "seoul-seongdong", "seoul-gangdong", "seoul-nowon", "seoul-yeongdeungpo",
  "gyeonggi-bundang", "gyeonggi-suwon", "gyeonggi-ilsan", "gyeonggi-gimpo",
  "gyeonggi-hwaseong", "gyeonggi-yongin", "gyeonggi-hanami", "gyeonggi-namyangju",
  "gyeonggi-anyang", "gyeonggi-bucheon", "gyeonggi-gwangmyeong",
  "incheon-yeonsu", "incheon-bupyeong",
  "busan-haeundae", "busan-suyeong", "busan-dongnae",
  "daegu-suseong", "daejeon-yuseong"
];

// static pages to prerender
const staticPages = [
  '/',
  '/category/residential',
  '/category/commercial',
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
];

const ROUTES_TO_PRERENDER = [
  ...staticPages,
  ...PSEO_SLUGS.map(slug => `/${slug}-flooring`),
  ...LXZIN_PRODUCTS.map(p => `/product/${p.id}`)
];

/**
 * 간단한 정적 파일 서버
 * dist 폴더를 로컬에서 서빙하여 Puppeteer가 접근할 수 있도록 함
 */
function createStaticServer(port) {
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
        // SPA fallback to index.html
        try {
          const indexContent = readFileSync(join(DIST_DIR, 'index.html'));
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(indexContent);
        } catch {
          res.writeHead(404);
          res.end('Not Found');
        }
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

  try {
    // 순차적으로 혹은 소규모 병렬로 처리하여 속도 및 메모리 안정성 보장
    // 청소타워와 마찬가지로 비동기 병렬 매핑하되 에러 관리 철저히 진행
    const batchSize = 10;
    for (let i = 0; i < ROUTES_TO_PRERENDER.length; i += batchSize) {
      const batch = ROUTES_TO_PRERENDER.slice(i, i + batchSize);
      await Promise.all(batch.map(async (route) => {
        try {
          const page = await browser.newPage();
          // Viewport 및 User-Agent 모방
          await page.setViewport({ width: 1280, height: 800 });
          await page.setUserAgent('Mozilla/5.0 (compatible; Yeti/1.1; +http://naver.me/bot)');
          
          const url = `http://localhost:${PORT}${route}`;
          console.log(`  📄 렌더링 중 (${i + batch.indexOf(route) + 1}/${ROUTES_TO_PRERENDER.length}): ${route}`);
          
          await page.goto(url, { 
            waitUntil: 'networkidle2',
            timeout: 45000,
          });

          // React 렌더링 및 Suspense 완료 대기 (#root 하위에 노드가 그려질 때까지 대기)
          await page.waitForSelector('#root > *', { timeout: 15000 });
          
          // 데이터 로드 안정화를 위한 대기
          await new Promise(r => setTimeout(r, 200));

          // 대표 canonical URL 보정 및 트레일링 슬래시 주입 (React Helmet이 씌워준 head 내 link tag 등 수정)
          await page.evaluate((currentRoute) => {
            const canonical = document.querySelector('link[rel="canonical"]');
            if (canonical) {
              // 루트면 슬래시 포함, 그 외엔 끝에 슬래시 강제 추가
              const formattedRoute = currentRoute === '/' ? '/' : currentRoute + '/';
              canonical.setAttribute('href', `https://데일리하우징.kr${formattedRoute}`);
            }
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
          await page.close();
        } catch (err) {
          console.warn(`  ⚠️ ${route} 렌더링 실패: ${err.message}`);
        }
      }));
    }

    console.log(`\n🎉 프리렌더링 완료! 총 ${ROUTES_TO_PRERENDER.length}개 페이지가 정적 HTML로 변환되었습니다.`);
  } catch (error) {
    console.error('❌ 프리렌더링 중 오류 발생:', error);
    process.exit(1);
  } finally {
    await browser.close();
    server.close();
  }
}

prerender();
