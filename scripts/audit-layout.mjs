import { chromium } from 'playwright';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Read-only page audit: no account creation, form submission or storage changes.
const base = process.env.AUDIT_BASE_URL ?? 'http://127.0.0.1:3170';
const output = process.env.AUDIT_OUTPUT ?? 'artifacts/site-audit';
const widths = [390, 768, 1440];
const journal = await readFile('src/lib/marketing-journal.ts', 'utf8');
const slugs = [...new Set([...journal.matchAll(/slug: '([^']+)'/g)].map(match => match[1]))];
const lessons = [...(await readFile('src/lib/portal-learning.ts','utf8')).matchAll(/id: "([^"]+)", subjectId:/g)].map(match => match[1]);
const labs = [...(await readFile('src/lib/labs/catalog.ts','utf8')).matchAll(/\{ id: "([^"]+)"/g)].map(match => match[1]);
const routes = [...new Set([
 ...['','/en','/ru'].flatMap(prefix => [prefix || '/', ...['approach','programs','trust','blog',...slugs.map(slug => `blog/${slug}`)].map(page => `${prefix}/${page}`)]),
 '/privacy','/safety','/terms','/accessibility','/studio','/components','/not-a-real-page','/portal/not-a-real-page',
 '/demo','/demo/lab','/demo/portfolio','/demo/guardian',
 '/portal','/portal/subjects','/portal/projects','/portal/labs','/portal/progress','/portal/guardian',
 ...lessons.map(id => `/portal/learn/${id}`), ...labs.map(id => `/portal/labs/${id}`),
])];
await mkdir(output,{recursive:true});
const browser = await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL ?? 'chromium'});
const report = {startedAt:new Date().toISOString(),base, routes, widths, checks:[], scope:'Initial rendered pages; Chromium viewport simulation, not physical devices. Account-dependent states remain covered by existing UI tests.'};
try {
 const page = await browser.newPage({reducedMotion:'reduce'});
 for(const width of widths){
  await page.setViewportSize({width,height:1000});
  for(const route of routes){
   const response = await page.goto(new URL(route,base).href);
   await page.locator('main h1').first().waitFor();
   await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].filter(img=>{const r=img.getBoundingClientRect();return r.width>0&&r.height>0&&r.top<innerHeight&&r.bottom>0;}).map(img=>img.decode().catch(()=>undefined))); });
   const result = await page.evaluate(() => {
    const headings=[...document.querySelectorAll('main h1,main h2,main h3')].filter(el=>el.getClientRects().length&&!el.closest('[aria-hidden="true"],[inert]'));
    const clipped=headings.filter(el=>el.scrollWidth>el.clientWidth+2&&getComputedStyle(el).overflowX==='hidden').map(el=>el.textContent.trim());
    const offscreen=headings.filter(el=>{if(el.closest('[data-marquee],pre'))return false;const r=el.getBoundingClientRect();return r.left < -2 || r.right > innerWidth+2;}).map(el=>el.textContent.trim());
    return {overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),h1:document.querySelectorAll('main h1').length,clipped,offscreen};
   });
   const record={route,width,status:response.status(),expectedStatus:route.includes('not-a-real-page')?404:200,...result};report.checks.push(record);
   if(width!==768){await page.screenshot({path:path.join(output,`${route.replaceAll('/','_')||'home'}-${width}.png`)});}
  }
  console.log(`Audited ${routes.length} routes at ${width}px`);
 }
 await writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify({routes:routes.length,checks:report.checks.length,issues:report.checks.filter(x=>x.status!==x.expectedStatus||x.overflow>1||x.h1!==1||x.clipped.length||x.offscreen.length)}));
} finally {await browser.close();}
