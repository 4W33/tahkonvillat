/**
 * Rakentaa asiakkaalle lyhyen ohjeen Airbnbn kalenterilinkkien hakemiseen.
 *
 *   node scripts/airbnb-ical-guide-pdf.mjs [--base http://localhost:3311]
 *
 * Tarkoitus: asiakas hakee linkit itse eikä meidän tarvitse koskaan pyytää
 * hänen Airbnb-tunnuksiaan. Ohje on erillinen ja lyhyt, jotta sen voi
 * välittää sellaisenaan eteenpäin.
 *
 * Valikkotekstit on tarkistettu Airbnbn suomenkielisestä ohjeartikkelista
 * (airbnb.fi/help/article/99): Kalenteri → Varattavuus → Yhdistä kalenterit
 * → Yhdistä toiseen verkkosivustoon. Älä keksi tähän Airbnb-kuvakaappauksia.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const BASE = opt("base", "http://localhost:3311");
const PASSWORD = process.env.EVIDENCE_ADMIN_PASSWORD ?? "novo-dev-test";
const OUT_PDF = path.resolve("docs/Tahkon-Villat-Airbnb-kalenteriohje.pdf");
const TODAY = new Intl.DateTimeFormat("fi-FI", { dateStyle: "long" }).format(new Date());

let adminShot = "";

function buildHtml() {
  return `<!doctype html>
<html lang="fi"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 18mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0; color: #1C1B19; background: #fff;
    font-family: "DM Sans", system-ui, sans-serif; font-size: 11pt; line-height: 1.6;
  }
  h1, h2 { font-family: "Cormorant Garamond", Georgia, serif; font-weight: 600; }
  h1 { font-size: 30pt; line-height: 1.05; margin: 0 0 4mm; letter-spacing: -0.01em; }
  h2 { font-size: 17pt; margin: 8mm 0 3mm; page-break-after: avoid; }
  p { margin: 0 0 3mm; }
  ol, ul { margin: 0 0 3mm; padding-left: 5.5mm; }
  li { margin-bottom: 2.5mm; }
  .eyebrow {
    font-family: "Cormorant Garamond", Georgia, serif; font-style: italic;
    font-weight: 600; font-size: 13pt; color: #9A7B43; margin: 0 0 1mm;
  }
  .rule { height: 2px; width: 38mm; background: linear-gradient(90deg,#B8955A,rgba(184,149,90,0)); margin: 5mm 0 6mm; }
  .lead { font-size: 12pt; color: #3A3733; max-width: 140mm; }
  .card {
    border: 1px solid #E6DCCD; border-left: 3px solid #B8955A; background: #FAF7F3;
    padding: 4mm 5mm; margin: 5mm 0; page-break-inside: avoid;
  }
  .card p:last-child { margin-bottom: 0; }
  .card .label {
    font-size: 8.5pt; text-transform: uppercase; letter-spacing: 0.1em;
    color: #9A7B43; font-weight: 700; margin-bottom: 1.5mm;
  }
  .steps { counter-reset: s; list-style: none; padding: 0; }
  .steps > li {
    counter-increment: s; position: relative; padding-left: 11mm; margin-bottom: 4mm;
    page-break-inside: avoid;
  }
  .steps > li::before {
    content: counter(s); position: absolute; left: 0; top: -0.5mm;
    width: 7.5mm; height: 7.5mm; border-radius: 50%; background: #1C1B19; color: #fff;
    font-family: "DM Sans", sans-serif; font-weight: 700; font-size: 10pt;
    display: flex; align-items: center; justify-content: center;
  }
  table { width: 100%; border-collapse: collapse; margin: 4mm 0; font-size: 10.5pt; }
  th, td { text-align: left; padding: 2.6mm 3mm; border-bottom: 1px solid #E6DCCD; }
  th { font-size: 9pt; text-transform: uppercase; letter-spacing: 0.06em; color: #6F6A63; }
  .tick { width: 14mm; color: #BDB6AA; font-size: 13pt; }
  figure { margin: 4mm 0 2mm; page-break-inside: avoid; }
  figure img { width: 100%; border: 1px solid #E6DCCD; border-radius: 6px; display: block; }
  figcaption { font-size: 9pt; color: #6F6A63; margin-top: 1.5mm; }
  .foot { margin-top: 8mm; font-size: 9.5pt; color: #6F6A63; border-top: 1px solid #E6DCCD; padding-top: 3mm; }
  .page2 { page-break-before: always; }
</style></head><body>

<p class="eyebrow">Ohje kohteiden omistajalle</p>
<h1>Näin yhdistät Airbnb-kalenterin<br>verkkosivuille</h1>
<div class="rule"></div>
<p class="lead">
  Kun teet tämän kerran jokaiselle kohteelle, verkkosivujen kalenteri näyttää
  varatut päivät automaattisesti eikä niitä tarvitse ylläpitää kahdessa paikassa.
  Homma vie noin viisi minuuttia kohdetta kohti, ja teet sen itse omilla
  tunnuksillasi.
</p>

<div class="card">
  <p class="label">Turvallisuus</p>
  <p>
    <strong>Emme pyydä emmekä tarvitse Airbnb-tunnuksiasi.</strong> Sinä kopioit
    Airbnbstä pelkän kalenterilinkin. Se kertoo vain sen, mitkä päivät ovat varattuja
    — ei vieraiden nimiä, viestejä, hintoja eikä maksutietoja. Kirjaudut Airbnbhen
    vain itse, omalla koneellasi.
  </p>
</div>

<h2>Mitä tarvitset</h2>
<ul>
  <li>Tietokone ja selain. Tämä onnistuu helpoiten koneella, ei puhelimen sovelluksella.</li>
  <li>Airbnb-tunnukset, joilla kohteita hallinnoidaan.</li>
  <li>Noin puoli tuntia, jos teet kaikki kuusi kohdetta kerralla.</li>
</ul>

<h2>Vaiheet</h2>
<ol class="steps">
  <li>Kirjaudu Airbnbhen tietokoneella ja avaa ylhäältä <strong>Kalenteri</strong>.</li>
  <li>Valitse listalta se kohde, jonka kalenterin haluat yhdistää.</li>
  <li>Avaa oikeasta reunasta <strong>Varattavuus</strong>.</li>
  <li>Vieritä kohtaan <strong>Yhdistä kalenterit</strong> ja valitse <strong>Yhdistä toiseen verkkosivustoon</strong>.</li>
  <li>
    Näytölle tulee pitkä osoite, joka alkaa <strong>https://</strong> ja päättyy
    <strong>.ics</strong>. Kopioi se kokonaisuudessaan. Tämä on kohteen kalenterilinkki.
  </li>
  <li>
    Toimita linkki meille tai liitä se itse verkkosivujen ylläpitoon (seuraava sivu).
    Toista vaiheet 2–5 jokaiselle kohteelle.
  </li>
</ol>

<div class="card">
  <p class="label">Jos valikon nimi näyttää erilaiselta</p>
  <p>
    Airbnb uudistaa näkymiään ajoittain. Etsi tällöin kalenterinäkymästä kohtaa, jossa
    puhutaan kalenterien yhdistämisestä tai synkronoinnista toiseen sivustoon.
    Tarvitsemme sen linkin, jonka Airbnb antaa <em>vietäväksi</em> — emme sitä kenttää,
    johon liitetään toisen sivuston osoite.
  </p>
</div>

<h2>Kohteet, joista linkki tarvitaan</h2>
<table>
  <tr><th>Kohde</th><th class="tick">Tehty</th></tr>
  <tr><td>Villa Puolukka</td><td class="tick">☐</td></tr>
  <tr><td>Villa Karpalo</td><td class="tick">☐</td></tr>
  <tr><td>Tahkon Teituli A</td><td class="tick">☐</td></tr>
  <tr><td>Tahkon Teituli B</td><td class="tick">☐</td></tr>
  <tr><td>Tahkon Teituli 8A</td><td class="tick">☐</td></tr>
  <tr><td>Tahkon Teituli 8B</td><td class="tick">☐</td></tr>
</table>
<p>
  Teitulin neljällä huoneistolla on Airbnbssä oma ilmoituksensa, joten niistä
  tarvitaan neljä eri linkkiä. Näin verkkosivuilla näkyy oikea tilanne yksikkö
  kerrallaan.
</p>

<div class="page2"></div>

<h2>Linkin liittäminen verkkosivuille</h2>
<p>
  Voit liittää linkit itse. Kirjaudu sivuston ylläpitoon ja valitse vasemmalta
  <strong>Airbnb-kalenterit</strong>. Jokaisella kohteella on oma kenttänsä.
</p>
${adminShot ? `<figure><img src="${adminShot}" alt=""><figcaption>Ylläpidon Airbnb-kalenterit-näkymä. Yksi kenttä jokaiselle kohteelle.</figcaption></figure>` : ""}
<ol class="steps">
  <li>Liitä kopioimasi linkki oikean kohteen kenttään.</li>
  <li>Paina <strong>Testaa</strong>. Sivusto kertoo heti, montako varausta linkistä löytyi.</li>
  <li>Kun kaikki haluamasi linkit on liitetty, paina <strong>Tallenna linkit</strong>.</li>
</ol>
<p>
  Jos et halua tehdä tätä itse, lähetä linkit meille, niin liitämme ne puolestasi.
  Lähetä ne mieluiten sähköpostilla äläkä julkisessa ryhmässä.
</p>

<h2>Mitä tapahtuu tämän jälkeen</h2>
<ul>
  <li>Verkkosivujen kohdesivulla näkyy kalenteri, jossa varatut päivät on merkitty varatuiksi.</li>
  <li>Sivusto hakee tiedot Airbnbstä noin kolmen tunnin välein, joten aivan tuore varaus voi näkyä pienellä viiveellä.</li>
  <li>Muut kuin Airbnbn kautta tulleet varaukset lisätään ylläpidon <strong>Kalenteri</strong>-näkymässä käsin, ja nekin näkyvät sivustolla.</li>
  <li>Jos linkki lakkaa toimimasta, sivusto ei näytä päiviä virheellisesti vapaina vaan kehottaa kysymään saatavuutta.</li>
</ul>

<div class="card">
  <p class="label">Pidä linkki omana tietonasi</p>
  <p>
    Kalenterilinkki on henkilökohtainen. Älä julkaise sitä verkkosivuilla, sosiaalisessa
    mediassa tai avoimissa ryhmissä. Jos linkki päätyy vääriin käsiin, voit poistaa
    yhteyden Airbnbn samasta näkymästä, jolloin vanha linkki lakkaa toimimasta.
  </p>
</div>

<p class="foot">
  Tahkon Villat &middot; verkkosivujen kalenteriohje &middot; ${TODAY}<br>
  Kysymyksissä auttaa Novo Media.
</p>

</body></html>`;
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });

try {
  try {
    const page = await context.newPage();
    await page.goto(`${BASE}/admin/login`);
    await page.fill("#password", PASSWORD);
    await page.click("button[type=submit]");
    await page.waitForURL(`${BASE}/admin`, { timeout: 20000 });
    await page.getByRole("button", { name: "Airbnb-kalenterit" }).click();
    await page.getByText("Näin kopioit linkin Airbnbstä").waitFor({ timeout: 15000 });
    await page.waitForTimeout(800);
    const buffer = await page.screenshot();
    adminShot = `data:image/png;base64,${buffer.toString("base64")}`;
    console.log("✓ kuva: ylläpidon näkymä");
  } catch (error) {
    console.warn(
      "! ylläpidon kuvaa ei saatu, ohje rakennetaan ilman sitä:",
      error instanceof Error ? error.message.split("\n")[0] : error,
    );
  }

  const guide = await context.newPage();
  await guide.setContent(buildHtml(), { waitUntil: "networkidle" });
  await guide.waitForTimeout(1200);
  await mkdir(path.dirname(OUT_PDF), { recursive: true });
  await guide.pdf({
    path: OUT_PDF,
    format: "A4",
    printBackground: true,
    margin: { top: "18mm", bottom: "16mm", left: "18mm", right: "18mm" },
  });
  console.log("✓ PDF:", path.relative(process.cwd(), OUT_PDF));

  await writeFile(path.resolve("docs/airbnb-ical-guide-source.html"), buildHtml(), "utf-8");
  console.log("✓ HTML-lähde: docs/airbnb-ical-guide-source.html");
} catch (error) {
  console.error("✗", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await browser.close();
}
