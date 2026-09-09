/**
 * Todisteruutukaappaukset Playwrightilla dev-palvelinta vasten.
 *
 *   node scripts/evidence.mjs <skenaario> [--base http://localhost:3311] [--tag before]
 *
 * Skenaariot: admin-ical · admin-pricing · villa · home · pages · admin-preview
 * Kuvat: docs/superpowers/evidence/<pvm>-<skenaario>[-<tag>]-<näkymä>.png
 * Admin-salasana: EVIDENCE_ADMIN_PASSWORD (oletus dev-testiarvo, ei tuotantosalaisuus).
 */
import { mkdir } from "node:fs/promises";
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
const PASSWORD = process.env.EVIDENCE_ADMIN_PASSWORD ?? "novo-dev-test";
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

async function login(page) {
  await page.goto(`${BASE}/admin/login`);
  await page.fill("#password", PASSWORD);
  await page.click("button[type=submit]");
  await page.waitForURL(`${BASE}/admin`, { timeout: 15000 });
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
  if (scenario === "admin-ical") {
    const page = await desktop.newPage();
    await login(page);
    await page.getByRole("button", { name: "Airbnb-kalenterit" }).click();
    await page.getByText("Näin kopioit linkin Airbnbstä").waitFor();
    await shot(page, "list");
    const first = page.locator("input[type=url]").first();
    await first.fill("https://example.com/ei-ole.ics");
    await page.getByRole("button", { name: "Testaa" }).first().click();
    await page.getByText("Linkkiä ei voitu lukea").waitFor({ timeout: 20000 });
    await shot(page, "test-error");
    console.log("✓ viallinen linkki → virheviesti, ei kaatumista");
  }

  if (scenario === "admin-pricing") {
    const page = await desktop.newPage();
    await login(page);
    await page.getByRole("button", { name: "Hinnat" }).click();
    await page.getByText("Perushinta").first().waitFor();
    await shot(page, "list", { fullPage: true });
  }

  if (scenario === "pricing-e2e") {
    // Lisää kausi Puolukalle adminissa → tallenna → villasivu näyttää taulukon → poista kausi.
    const page = await desktop.newPage();
    await login(page);
    await page.getByRole("button", { name: "Hinnat" }).click();
    await page.getByText("Perushinta").first().waitFor();
    const card = page.locator("li", { hasText: "Villa Puolukka" }).first();
    await card.getByRole("button", { name: "+ Lisää kausi" }).click();
    await card.locator("input[type=date]").nth(0).fill("2026-09-12");
    await card.locator("input[type=date]").nth(1).fill("2026-09-30");
    await card.locator("input[type=number]").nth(1).fill("250");
    await page.getByRole("button", { name: "Tallenna hinnat" }).click();
    await page.getByText("Hinnat tallennettu.").waitFor({ timeout: 15000 });
    await shot(page, "admin-saved");

    const pub = await desktop.newPage();
    await pub.goto(`${BASE}/villat/villa-puolukka`);
    await pub.getByText("Hinnat kausittain").waitFor({ timeout: 20000 });
    const price = pub.locator('[data-cms="pricing"]');
    await price.screenshot({ path: file("public-table") });
    const from = await price.locator("p").first().innerText();
    console.log("✓ julkinen sivu:", from.trim(), "+ kausitaulukko");
    if (!from.includes("250")) {
      failures += 1;
      console.log("✗ alkaen-hinnan piti olla 250 (kausi < perushinta 320)");
    }

    // Päällekkäinen kausi → virhe, ei tallennu
    await card.getByRole("button", { name: "+ Lisää kausi" }).click();
    await card.locator("input[type=date]").nth(2).fill("2026-09-20");
    await card.locator("input[type=date]").nth(3).fill("2026-10-05");
    await card.locator("input[type=number]").nth(2).fill("300");
    await page.getByRole("button", { name: "Tallenna hinnat" }).click();
    await page.getByText(/päällekkäin/).waitFor({ timeout: 10000 });
    console.log("✓ päällekkäinen kausi hylättiin viestillä");

    // Siivous: poista molemmat kaudet, tallenna
    await card.getByRole("button", { name: "Poista kausi" }).nth(1).click();
    await card.getByRole("button", { name: "Poista kausi" }).nth(0).click();
    await page.getByRole("button", { name: "Tallenna hinnat" }).click();
    await page.getByText("Hinnat tallennettu.").waitFor({ timeout: 15000 });
    console.log("✓ testikaudet poistettu");
  }

  if (scenario === "villa") {
    for (const [ctx, view] of [
      [desktop, "desktop"],
      [mobile, "mobile"],
    ]) {
      const page = await ctx.newPage();
      await page.goto(`${BASE}/villat/villa-puolukka`);
      await page.waitForLoadState("networkidle");
      const cal = page.locator('[data-cms="villas.detail.calendar"]');
      if (await cal.count()) {
        await cal.scrollIntoViewIfNeeded();
        await page.waitForTimeout(800);
        await cal.screenshot({ path: file(`${view}-calendar`) });
        console.log("✓", path.relative(process.cwd(), file(`${view}-calendar`)));
      } else {
        console.log("ℹ ei kalenteriosiota (ei lähdettä eikä käsivarauksia)");
      }
      const price = page.locator('[data-cms="pricing"]');
      if (await price.count()) {
        await price.screenshot({ path: file(`${view}-price`) });
        console.log("✓", path.relative(process.cwd(), file(`${view}-price`)));
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
    const page = await mobile.newPage();
    for (const p of paths) {
      await page.goto(`${BASE}${p}`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(800);
      const slug = p === "/" ? "root" : p.replace(/\//g, "_").replace(/^_/, "");
      await shot(page, `mobile-${slug}`, { fullPage: true });
      if (!(await assertNoHorizontalScroll(page, `mobile ${p}`))) failures += 1;
    }
  }

  if (scenario === "admin-preview") {
    const page = await desktop.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });
    await login(page);
    await page.getByRole("button", { name: "Sivuston tekstit" }).click();
    await page.locator("iframe[title='Sivuston esikatselu']").waitFor({ timeout: 20000 });
    await page.waitForTimeout(2500);
    await page.locator("input#hero\\.title, input[id='hero.title']").first().focus();
    await page.waitForTimeout(1200);
    await shot(page, "split");
  }
} catch (error) {
  failures += 1;
  console.error("✗", error instanceof Error ? error.message : error);
} finally {
  await browser.close();
}

process.exit(failures ? 1 : 0);
