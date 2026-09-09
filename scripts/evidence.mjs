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

  if (scenario === "contact-e2e") {
    // Lomake ilman RESEND_API_KEY:tä → tallentuu inboxiin, ei "Ilmoitus epäonnistui" -merkkiä.
    const page = await desktop.newPage();
    await page.goto(`${BASE}/yhteystiedot`);
    await page.waitForLoadState("networkidle");
    const marker = `evidence-${Date.now()}`;
    await page.locator("#contact-name").fill("Testi Todiste");
    await page.locator("#contact-email").fill("todiste@example.com");
    await page.locator("form textarea").first().fill(`Automaattinen testiviesti ${marker}`);
    await page.locator("form button[type=submit]").first().click();
    await page.waitForTimeout(3000);
    await shot(page, "form-sent");

    const admin = await desktop.newPage();
    await login(admin);
    await admin.getByRole("button", { name: "Yhteydenotot" }).click();
    await admin.getByText(marker).waitFor({ timeout: 15000 });
    const item = admin.locator("li", { hasText: marker }).first();
    const failed = await item.getByText("Ilmoitus epäonnistui").count();
    console.log(failed === 0 ? "✓" : "✗", "inbox: viesti tallessa, epäonnistumismerkkiä ei (ei avainta):", failed === 0);
    if (failed !== 0) failures += 1;
    await shot(admin, "inbox");
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

  if (scenario === "admin-preview") {
    const page = await desktop.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });
    await login(page);
    await page.getByRole("button", { name: "Sivuston tekstit" }).click();
    await page.locator("iframe[title='Sivuston esikatselu']").waitFor({ timeout: 20000 });
    // Oletusosio on ensimmäinen avain (metadata) → vaihda Etusivu-osioon
    await page.getByRole("button", { name: "Etusivu", exact: true }).click();
    const frame = page.frameLocator("iframe[title='Sivuston esikatselu']");
    await frame.locator("[data-cms='home.hero']").waitFor({ timeout: 30000 });
    await page.waitForTimeout(1500);

    // 1) Kentän fokus → iframe korostaa oikean osion
    await page.locator("input[id='hero.title']").first().focus();
    await frame.locator("[data-cms-active='1'][data-cms='home.hero']").waitFor({ timeout: 5000 });
    const label = await frame.locator("[data-cms-active='1']").getAttribute("data-cms-label");
    console.log("✓ fokus hero.title → korostus:", label);
    await page.getByText("Muokkaat: Etusivu › Hero").waitFor();
    await shot(page, "split");

    // 2) Klikkaus iframessa alatunnistetta → editori vaihtaa osioon Alatunniste
    await frame.locator("[data-cms='footer']").scrollIntoViewIfNeeded();
    await frame.locator("[data-cms='footer']").click({ position: { x: 20, y: 20 } });
    await page.getByRole("heading", { level: 2, name: "Alatunniste" }).waitFor({ timeout: 5000 });
    console.log("✓ klikkaus footer → osio Alatunniste");
    await shot(page, "click-footer");

    // 3) English → iframe /en?cms=1
    await page.getByRole("button", { name: "English" }).click();
    await page.waitForTimeout(500);
    const src = await page.locator("iframe[title='Sivuston esikatselu']").getAttribute("src");
    console.log(src === "/en?cms=1" ? "✓" : "✗", "iframe src en:", src);
    if (src !== "/en?cms=1") failures += 1;
  }
} catch (error) {
  failures += 1;
  console.error("✗", error instanceof Error ? error.message : error);
} finally {
  await browser.close();
}

process.exit(failures ? 1 : 0);
