import puppeteer from 'puppeteer';

(async () => {
  console.log("Starting Puppeteer...");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err.toString()));
  
  const url = process.argv[2] || 'http://localhost:5173/';
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 }).catch(e => console.error("Goto error:", e));
  
  const html = await page.content();
  console.log("PAGE HTML LENGTH:", html.length);
  console.log("PAGE HTML START:", html.substring(0, 500));
  
  const rootContent = await page.evaluate(() => {
    return document.body.innerText;
  });
  console.log("ROOT CONTENT LENGTH:", rootContent.length);
  await page.screenshot({ path: 'kakao_screenshot.png' });
  console.log("Screenshot saved as kakao_screenshot.png");
})();
