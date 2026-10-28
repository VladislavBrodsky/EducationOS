import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { missions, missionUi, translate } from '../../src/lib/missions/catalog';
import { marketingJournal } from '../../src/lib/marketing-journal';
import { localizedPath, marketingCopy, type Locale } from '../../src/lib/marketing-i18n';
import { visualWorlds, visualWorldCopy } from '../../src/lib/marketing-worlds';
import { solved } from '../fixtures/context-missions';

for(const locale of ['es','en','ru'] as Locale[]) for(const mission of missions) {
  test(`${locale}: ${mission.id} supports solve, error, edit, resume and reset`,async({page})=>{
    test.setTimeout(60000);
    const width=locale==='es'?390:locale==='ru'?768:1440;
    await page.setViewportSize({width,height:1000});
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto(localizedPath(locale,`missions/${mission.id}`));
    await expect(page.locator('html')).toHaveAttribute('lang',locale);
    await expect(page.getByRole('heading',{level:1})).toHaveText(translate(locale,mission.title));
    await expect(page.locator('.ms-task')).toHaveAttribute('aria-busy','false');
    const submit=page.getByRole('button',{name:translate(locale,missionUi.check),exact:true});
    await submit.click();
    await expect(page.locator('.activity-feedback.is-error')).toBeVisible();
    await page.getByRole('button',{name:translate(locale,missionUi.review)}).click();
    await expect(page.locator('[aria-invalid=true]')).toBeFocused();
    for(const field of mission.fields) {
      const value=solved[mission.id][field.key];
      if(field.kind==='grid') { for(const index of value.split(',').map(Number)) await page.locator('.ms-half-grid button').nth(index).click(); }
      else if(field.kind==='select') await page.locator(`#mission-${field.key}`).selectOption(value);
      else if(field.kind==='range') {
        const input=page.locator(`#mission-${field.key}`);await input.focus();await input.press('Home');
        for(let n=field.min!;n<Number(value);n+=field.step??1) await input.press('ArrowRight');
      } else await page.locator(`#mission-${field.key}`).fill(value);
    }
    await submit.click();
    await expect(page.locator('.activity-feedback.is-success')).toContainText(translate(locale,missionUi.success));
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    if(locale==='es') {
      const scan=await new AxeBuilder({page}).include('main').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      expect(scan.violations).toEqual([]);
    }
    if(process.env.VISUAL_AUDIT==='1') {
      await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
      await page.waitForTimeout(200);
      await page.screenshot({path:`test-results/missions/${locale}-${mission.id}-${width}.png`,fullPage:true});
      if(locale==='en') await page.locator('.ms-model').screenshot({path:`test-results/missions/model-${mission.id}.png`});
    }
    const last=mission.fields.at(-1)!;
    if(last.kind==='select') await page.locator(`#mission-${last.key}`).selectOption('');else await page.locator(`#mission-${last.key}`).fill('');
    await expect(page.locator('.activity-feedback.is-success')).toHaveCount(0);
    await expect(page.locator('.ms-edited')).toBeVisible();
    await submit.click();await expect(page.locator('.activity-feedback.is-error')).toBeVisible();
    if(last.kind==='select') await page.locator(`#mission-${last.key}`).selectOption(solved[mission.id][last.key]);else await page.locator(`#mission-${last.key}`).fill(solved[mission.id][last.key]);
    await submit.click();await expect(page.locator('.activity-feedback.is-success')).toBeVisible();
    await page.reload();await expect(page.locator('.ms-task')).toHaveAttribute('aria-busy','false');
    await expect(page.locator('.activity-feedback')).toHaveCount(0);
    await submit.click();await expect(page.locator('.activity-feedback.is-success')).toBeVisible();
    await page.getByRole('button',{name:translate(locale,missionUi.reset),exact:true}).click();
    await expect(page.locator('.activity-feedback')).toHaveCount(0);
    await submit.click();await expect(page.locator('.activity-feedback.is-error')).toBeVisible();
  });
}

test('journal and visual-world entrances open the matching localized mission',async({page})=>{
  test.setTimeout(90000);
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const locale of ['es','en','ru'] as Locale[]) {
    for(const article of marketingJournal[locale]) {
      await page.goto(localizedPath(locale,`blog/${article.slug}`));
      const path=localizedPath(locale,`missions/${article.missionId}`);
      await expect(page.locator('.m-header-cta')).toHaveAttribute('href',path);
      await expect(page.locator('.m-article-actions a')).toHaveAttribute('href',path);
      await page.locator('.m-article-actions a').click();
      await expect(page).toHaveURL(new RegExp(`${path}$`));
      await expect(page.locator('[data-mission]')).toHaveAttribute('data-mission',article.missionId);
    }
    await page.goto(localizedPath(locale));
    for(const world of visualWorlds) {
      await page.getByRole('button',{name:visualWorldCopy[locale].subjects[world.id].label,exact:true}).click();
      await expect(page.locator('.m-worlds-copy a')).toHaveAttribute('href',localizedPath(locale,`missions/${world.missionId}`));
    }
    await page.goto(localizedPath(locale,'missions'));
    await expect(page.locator('.ms-mission-card')).toHaveCount(10);
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href',`https://educationos.space${localizedPath(locale,'missions')}`);
  }
});

test('mission recovery, language switching and blocked storage are explicit',async({page})=>{
  await page.addInitScript(()=>{Object.defineProperty(window,'sessionStorage',{get(){throw new Error('Blocked for test');}});});
  await page.goto('/missions/heart-route');
  await expect(page.locator('.ms-task')).toHaveAttribute('aria-busy','false');
  await page.locator('#mission-first').selectOption('right');
  await expect(page.locator('.ms-storage')).toContainText('no permite guardar');
  await page.locator('.m-language summary').click();
  await page.getByRole('link',{name:'Русский',exact:true}).click();
  await expect(page).toHaveURL(/\/ru\/missions\/heart-route$/);
  await expect(page.locator('html')).toHaveAttribute('lang','ru');
  await expect(page.locator('.skip-link')).toHaveText(marketingCopy.ru.skip);
  const response=await page.goto('/missions/not-a-mission');expect(response?.status()).toBe(404);
});
