/**
 * Todisteruutukaappaukset Playwrightilla dev-palvelinta vasten.
 *
 *   node scripts/evidence.mjs <skenaario> [--base http://localhost:3311] [--tag before]
 *
 * Skenaariot: logo · villa · home · pages
 * Kuvat: docs/superpowers/evidence/<pvm>-<skenaario>[-<tag>]-<näkymä>.png
 */
import { mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";

const args = process.argv.slice(2);
const scenario = args.find((a) => !a.startsWith("--")) ?? "home";
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const BASE = opt("base", "http://localhost:3311");
const TAG = opt("tag", "");
const OUT = path.resolve("docs/superpowers/evidence");
const DATE = new Date().toISOString().slice(0, 10);

await mkdir(OUT, { recursive: true });

function file(view) {
  return path.join(OUT, `${DATE}-${scenario}${TAG ? `-${TAG}` : ""}-${view}.png`);
}

async function shot(page, view, options = {}) {
  const target = file(view);
  await page.screenshot({ path: target, fullPage: options.fullPage ?? false });
  console.log("✓", path.relative(process.cwd(), target));
}

async function assertNoHorizontalScroll(page, label) {
  const ok = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth + 1,
  );
  console.log(ok ? "✓" : "✗", `${label}: ei vaakavieritystä = ${ok}`);
  return ok;
}

const browser = await chromium.launch({ headless: true });
const desktop = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const mobile = await browser.newContext({
  viewport: { width: 375, height: 812 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
let failures = 0;

try {
  if (scenario === "logo") {
    // Navin vaakalogo: hero-tila, vieritetty tila, md-leveys (768: pelkkä merkki) ja mobiili.
    const page = await desktop.newPage();
    await page.goto(BASE);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1200);
    await page.locator("header").screenshot({ path: file("desktop-hero-nav") });
    console.log("✓", path.relative(process.cwd(), file("desktop-hero-nav")));
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(600);
    await page.locator("header").screenshot({ path: file("desktop-scrolled-nav") });
    console.log("✓", path.relative(process.cwd(), file("desktop-scrolled-nav")));
    const md = await browser.newContext({ viewport: { width: 768, height: 900 } });
    const mdPage = await md.newPage();
    await mdPage.goto(BASE);
    await mdPage.waitForTimeout(1200);
    await mdPage.locator("header").screenshot({ path: file("md-nav") });
    console.log("✓", path.relative(process.cwd(), file("md-nav")));
    const brand = await mdPage.locator("header a[aria-label] span").last().boundingBox();
    const nav = await mdPage.locator("header nav").boundingBox();
    if (brand && nav && brand.x + brand.width > nav.x) {
      failures += 1;
      console.log("✗ 768 px: logon nimi menee navilinkkien päälle");
    } else {
      console.log("✓ 768 px: logo ja navilinkit eivät limity");
    }
    const mPage = await mobile.newPage();
    await mPage.goto(BASE);
    await mPage.waitForTimeout(1200);
    await mPage.locator("header").screenshot({ path: file("mobile-nav") });
    console.log("✓", path.relative(process.cwd(), file("mobile-nav")));
  }
  if (scenario === "villa") {
    for (const [ctx, view] of [
      [desktop, "desktop"],
      [mobile, "mobile"],
    ]) {
      const page = await ctx.newPage();
      await page.goto(`${BASE}/villat/villa-puolukka`);
      await page.waitForLoadState("networkidle");
      const cal = page.locator('section[aria-labelledby="availability-title"]');
      if (await cal.count()) {
        await cal.scrollIntoViewIfNeeded();
        await page.waitForTimeout(800);
        await cal.screenshot({ path: file(`${view}-calendar`) });
        console.log("✓", path.relative(process.cwd(), file(`${view}-calendar`)));
      } else {
        console.log("ℹ ei kalenteriosiota (ei lähdettä eikä käsivarauksia)");
      }
      if (!(await assertNoHorizontalScroll(page, `villa ${view}`))) failures += 1;
    }
  }

  if (scenario === "home") {
    for (const [ctx, view] of [
      [desktop, "desktop"],
      [mobile, "mobile"],
    ]) {
      const page = await ctx.newPage();
      await page.goto(BASE);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1500);
      await shot(page, `${view}-hero`);
      if (!(await assertNoHorizontalScroll(page, `home ${view}`))) failures += 1;
    }
    const narrow = await browser.newContext({ viewport: { width: 320, height: 700 }, deviceScaleFactor: 2 });
    const page = await narrow.newPage();
    await page.goto(BASE);
    await page.waitForTimeout(1500);
    await shot(page, "320-hero");
    if (!(await assertNoHorizontalScroll(page, "home 320"))) failures += 1;
  }

  if (scenario === "pages") {
    const paths = ["/", "/villat", "/villat/villa-puolukka", "/villat/tahkon-teituli", "/asunnot", "/yhteystiedot", "/faq", "/tietosuoja", "/en"];
    // deviceScaleFactor 1: Chromiumin koko sivun kuva jää tyhjäksi yli ~16384 px korkeudella.
    const mobile1x = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
    const page = await mobile1x.newPage();
    for (const p of paths) {
      await page.goto(`${BASE}${p}`);
      await page.waitForLoadState("networkidle");
      // Reveal-animaatiot paljastuvat vierityksessä (tai 3 s varmuusajastimella):
      // vieritetään sivu läpi ennen koko sivun kuvaa.
      await page.evaluate(async () => {
        const step = window.innerHeight * 0.8;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(1200);
      const slug = p === "/" ? "root" : p.replace(/\//g, "_").replace(/^_/, "");
      await shot(page, `mobile-${slug}`, { fullPage: true });
      if (!(await assertNoHorizontalScroll(page, `mobile ${p}`))) failures += 1;
    }
  }
} catch (error) {
  failures += 1;
  console.error("✗", error instanceof Error ? error.message : error);
} finally {
  await browser.close();
}

process.exit(failures ? 1 : 0);
