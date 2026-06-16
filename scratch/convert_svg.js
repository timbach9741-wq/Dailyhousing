import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');

// Common chrome paths
const chromePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Users\\PC\\.cache\\puppeteer\\chrome\\win64-148.0.7778.167\\chrome-win64\\chrome.exe',
    'C:\\Users\\PC\\.cache\\puppeteer\\chrome\\win64-148.0.7778.97\\chrome-win64\\chrome.exe'
];

let foundChromePath = null;
for (const p of chromePaths) {
    if (fs.existsSync(p)) {
        foundChromePath = p;
        break;
    }
}

async function convertSvgToPng(svgRelativePath, pngRelativePath, width = 400, height = 400) {
    const svgPath = path.join(projectRoot, svgRelativePath);
    const pngPath = path.join(projectRoot, pngRelativePath);

    if (!fs.existsSync(svgPath)) {
        console.error(`SVG file not found: ${svgPath}`);
        return;
    }

    const svgContent = fs.readFileSync(svgPath, 'utf8');

    const launchOptions = {};
    if (foundChromePath) {
        console.log(`Using Chrome executable: ${foundChromePath}`);
        launchOptions.executablePath = foundChromePath;
    } else {
        console.log('No specific Chrome path found, letting Puppeteer resolve default...');
    }

    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width, height, deviceScaleFactor: 2 });

    // Set page content with centered SVG
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    margin: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: ${width}px;
                    height: ${height}px;
                    background: transparent;
                }
                svg {
                    width: 100%;
                    height: 100%;
                }
            </style>
        </head>
        <body>
            ${svgContent}
        </body>
        </html>
    `;

    await page.setContent(htmlContent);
    
    // Wait for Montserrat font if needed
    await new Promise(r => setTimeout(r, 1000));

    await page.screenshot({
        path: pngPath,
        omitBackground: true,
        type: 'png'
    });

    await browser.close();
    console.log(`Successfully converted ${svgRelativePath} to ${pngRelativePath}`);
}

async function run() {
    try {
        await convertSvgToPng('public/assets/images/daily_housing_logo.svg', 'public/assets/images/daily_housing_logo.png', 400, 400);
        await convertSvgToPng('public/assets/images/daily_housing_icon.svg', 'public/assets/images/daily_housing_icon.png', 200, 200);
    } catch (err) {
        console.error('Error during conversion:', err);
    }
}

run();
