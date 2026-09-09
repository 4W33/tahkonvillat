/**
 * Rakentaa asiakkaan sisällönhallintaoppaan PDF:ksi.
 *
 *   node scripts/admin-guide-pdf.mjs [--base http://localhost:3311]
 *
 * Kaappaa tuoreet kuvakaappaukset administa ja latoo niistä oppaan
 * docs/Tahkon-Villat-sisallonhallintaopas.pdf. Vaatii käynnissä olevan
 * dev- tai prod-palvelimen ja admin-salasanan (EVIDENCE_ADMIN_PASSWORD).
 *
 * Sisältö kuvaa vain sitä, mitä adminissa oikeasti on. Älä lisää tähän
 * ominaisuuksia, joita ei ole toteutettu.
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
const OUT_PDF = path.resolve("docs/Tahkon-Villat-sisallonhallintaopas.pdf");
const TODAY = new Intl.DateTimeFormat("fi-FI", { dateStyle: "long" }).format(new Date());

const shots = {};

async function shoot(page, key, locator) {
  const target = locator ? page.locator(locator).first() : page;
  const buffer = await target.screenshot();
  shots[key] = `data:image/png;base64,${buffer.toString("base64")}`;
  console.log("✓ kuva:", key);
}

/** Yksi epäonnistunut näkymä ei saa kaataa koko opasta — kuva jää vain pois. */
async function section(key, fn) {
  try {
    await fn();
  } catch (error) {
    console.warn(`! ${key}: ${error instanceof Error ? error.message.split("\n")[0] : error}`);
  }
}

function img(key, caption) {
  if (!shots[key]) return "";
  return `<figure><img src="${shots[key]}" alt=""><figcaption>${caption}</figcaption></figure>`;
}

function buildHtml() {
  return `<!doctype html>
<html lang="fi"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,600&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 20mm 18mm 18mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0; color: #1C1B19; background: #fff;
    font-family: "DM Sans", system-ui, sans-serif; font-size: 10.5pt; line-height: 1.65;
  }
  h1, h2, h3 { font-family: "Cormorant Garamond", Georgia, serif; font-weight: 600; color: #1C1B19; }
  h1 { font-size: 34pt; line-height: 1.05; margin: 0 0 6mm; letter-spacing: -0.01em; }
  h2 { font-size: 20pt; margin: 0 0 3mm; page-break-after: avoid; }
  h3 { font-size: 13.5pt; margin: 6mm 0 2mm; page-break-after: avoid; }
  p { margin: 0 0 3mm; }
  ol, ul { margin: 0 0 3mm; padding-left: 5mm; }
  li { margin-bottom: 1.5mm; }
  strong { font-weight: 700; }
  code {
    font-family: "IBM Plex Mono", Consolas, monospace; font-size: 9pt;
    background: #F1ECE4; padding: 0.5mm 1.4mm; border-radius: 2px;
  }
  .eyebrow {
    font-family: "Cormorant Garamond", Georgia, serif; font-style: italic;
    font-weight: 600; font-size: 13pt; color: #9A7B43; margin: 0 0 1mm;
  }
  .cover { height: 245mm; display: flex; flex-direction: column; justify-content: center; }
  .cover .rule { height: 2px; width: 40mm; background: linear-gradient(90deg,#B8955A,rgba(184,149,90,0)); margin: 6mm 0; }
  .cover .meta { margin-top: auto; font-size: 9.5pt; color: #6F6A63; }
  .lead { font-size: 12pt; line-height: 1.6; color: #3A3733; max-width: 130mm; }
  section { page-break-before: always; }
  section.first { page-break-before: avoid; }
  figure { margin: 4mm 0 5mm; page-break-inside: avoid; }
  figure img {
    width: 100%; border: 1px solid #E6DCCD; border-radius: 6px; display: block;
  }
  figcaption { font-size: 9pt; color: #6F6A63; margin-top: 1.5mm; }
  .card {
    border: 1px solid #E6DCCD; border-left: 3px solid #B8955A; background: #FAF7F3;
    padding: 4mm 5mm; margin: 4mm 0; page-break-inside: avoid;
  }
  .card p:last-child { margin-bottom: 0; }
  .card .label {
    font-size: 8.5pt; text-transform: uppercase; letter-spacing: 0.1em;
    color: #9A7B43; font-weight: 700; margin-bottom: 1.5mm;
  }
  table { width: 100%; border-collapse: collapse; margin: 4mm 0; font-size: 10pt; }
  th, td { text-align: left; padding: 2.2mm 3mm; border-bottom: 1px solid #E6DCCD; vertical-align: top; }
  th { font-weight: 700; font-size: 9pt; text-transform: uppercase; letter-spacing: 0.06em; color: #6F6A63; }
  .toc { list-style: none; padding: 0; }
  .toc li { display: flex; justify-content: space-between; border-bottom: 1px dotted #E6DCCD; padding: 2mm 0; }
  .toc .n { color: #9A7B43; font-weight: 700; min-width: 8mm; }
  .toc .t { flex: 1; }
</style></head><body>

<div class="cover">
  <p class="eyebrow">Sisällönhallintaopas</p>
  <h1>Tahkon Villat<br>verkkosivujen ylläpito</h1>
  <div class="rule"></div>
  <p class="lead">
    Tässä oppaassa käydään läpi, miten sivuston tekstejä, kuvia, hintoja ja
    saatavuutta muokataan. Kaikki tapahtuu selaimessa. Mitään ei tarvitse asentaa.
  </p>
  <p class="meta">Päivitetty ${TODAY} · Novo Media</p>
</div>

<section class="first">
  <h2>Sisältö</h2>
  <ol class="toc">
    <li><span class="n">1</span><span class="t">Kirjautuminen</span></li>
    <li><span class="n">2</span><span class="t">Sivuston tekstit ja esikatselu</span></li>
    <li><span class="n">3</span><span class="t">Etusivun kuvat</span></li>
    <li><span class="n">4</span><span class="t">Kohteet: kuvat, tekstit ja tiedot</span></li>
    <li><span class="n">5</span><span class="t">Airbnb-kalenterit</span></li>
    <li><span class="n">6</span><span class="t">Kalenteri ja käsin lisätyt varaukset</span></li>
    <li><span class="n">7</span><span class="t">Hinnat ja kaudet</span></li>
    <li><span class="n">8</span><span class="t">Varausehdotukset ja yhteydenotot</span></li>
    <li><span class="n">9</span><span class="t">Mitä adminissa ei voi muokata</span></li>
    <li><span class="n">10</span><span class="t">Jos jokin menee pieleen</span></li>
  </ol>

  <h3>Kolme asiaa, jotka kannattaa muistaa</h3>
  <ol>
    <li><strong>Tallenna ennen kuin poistut sivulta.</strong> Teksti- ja hintanäkymissä on erillinen tallennusnappi. Selain varoittaa, jos yrität poistua tallentamatta.</li>
    <li><strong>Kuvat tallentuvat heti</strong> kun valitset uuden kuvan. Väärän kuvan voi perua heti ilmestyvästä Kumoa-painikkeesta.</li>
    <li><strong>Älä jätä pakollisia kenttiä tyhjiksi.</strong> Muokkaa tekstiä, älä poista sitä kokonaan.</li>
  </ol>
</section>

<section>
  <h2>1. Kirjautuminen</h2>
  <p>Avaa selaimessa sivuston osoite ja lisää perään <code>/admin</code>. Syötä salasana, jonka olet saanut erikseen.</p>
  ${img("login", "Kirjautumissivu. Salasana toimitetaan erikseen, älä jaa sitä eteenpäin.")}
  <div class="card">
    <p class="label">Vinkki</p>
    <p>Lisää admin-osoite selaimen kirjanmerkkeihin. Kirjautuminen pysyy voimassa noin viikon, minkä jälkeen salasana kysytään uudelleen.</p>
  </div>
</section>

<section>
  <h2>2. Sivuston tekstit ja esikatselu</h2>
  <p>Täältä muokataan kaikki sivuston tekstit suomeksi ja englanniksi: etusivu, navigaatio, alatunniste, villat- ja asunnot-sivujen otsikot, usein kysytyt kysymykset, yhteystiedot, tietosuoja, lomakkeiden tekstit ja hakukoneille näkyvät otsikot.</p>
  ${img("content", "Vasemmalla osiot, keskellä kentät, oikealla sivuston esikatselu.")}
  <h3>Näin muokkaat tekstin</h3>
  <ol>
    <li>Valitse osio vasemmasta reunasta, esimerkiksi <strong>Etusivu</strong> tai <strong>UKK</strong>.</li>
    <li>Valitse kieli ylhäältä: <strong>Suomi</strong> tai <strong>English</strong>. Molemmat tallentuvat samalla napilla.</li>
    <li>Klikkaa kenttää. Oikean puolen esikatselu vierittää itsensä kohtaan ja korostaa sen kultaisella kehyksellä. Yläreunassa lukee, mitä olet muokkaamassa.</li>
    <li>Kirjoita uusi teksti.</li>
    <li>Paina <strong>Tallenna kaikki tekstit</strong>. Esikatselu päivittyy ja muutos näkyy sivustolla heti.</li>
  </ol>
  <div class="card">
    <p class="label">Toinen tapa löytää oikea kenttä</p>
    <p>Klikkaa esikatselussa suoraan sitä sivuston osiota, jota haluat muuttaa. Editori hyppää automaattisesti kyseisen osion teksteihin. Näin ei tarvitse arvailla, minkä nimisen osion takana teksti on.</p>
  </div>
  <p>Hakukenttä yläreunassa etsii tekstin sisällöstä. Jos tiedät mitä sivulla lukee mutta et mistä osiosta, kirjoita hakuun pätkä tekstiä.</p>
</section>

<section>
  <h2>3. Etusivun kuvat</h2>
  <p>Näkymä on pienoiskuva etusivusta. Klikkaa mitä tahansa kuvaa vaihtaaksesi sen.</p>
  ${img("home", "Etusivu pienoiskoossa. Kynäkuvake kertoo, että kuvaa voi vaihtaa.")}
  <ul>
    <li><strong>Iso pääkuva</strong> on etusivun ylin kuva.</li>
    <li><strong>Meistä-kuva</strong> ja <strong>luontokuva</strong> ovat sivun alempia taustakuvia.</li>
    <li><strong>Korttien kansikuvat</strong> ovat villojen ja asuntojen esittelykuvat.</li>
  </ul>
  <p>Kuvavalitsimesta valitset joko olemassa olevan kuvan tai lataat uuden omalta koneelta. Muutos tallentuu heti, ja saat <strong>Kumoa</strong>-painikkeen jos vaihdoit väärän kuvan.</p>
</section>

<section>
  <h2>4. Kohteet</h2>
  <p>Jokaisella villalla ja asunnolla on oma editori, jossa on kolme välilehteä.</p>
  ${img("properties", "Kohdelista. Valitse kohde muokataksesi sen tietoja.")}
  <table>
    <tr><th>Välilehti</th><th>Mitä siellä muokataan</th></tr>
    <tr><td>Kuvat</td><td>Kansikuva ja galleria. Uusia kuvia voi ladata, järjestystä muuttaa raahaamalla tai nuolilla, ja kuvia poistaa. Kuvamuutokset tallentuvat heti ja niissä on Kumoa-painike.</td></tr>
    <tr><td>Tekstit</td><td>Kohteen nimi, lyhyt kuvaus ja pitkä esittely suomeksi ja englanniksi.</td></tr>
    <tr><td>Tiedot</td><td>Sijainti, vieraiden määrä, makuuhuoneet ja varustelu.</td></tr>
  </table>
  <div class="card">
    <p class="label">Huomaa</p>
    <p>Kohteiden tekstit on tuotu Airbnb-listauksista. Jos muutat tekstiä täällä, muutos jää voimaan eikä Airbnb enää ylikirjoita sitä.</p>
  </div>
</section>

<section>
  <h2>5. Airbnb-kalenterit</h2>
  <p>Sivuston villasivuilla on saatavuuskalenteri, joka näyttää vapaat ja varatut päivät. Varatut päivät haetaan suoraan Airbnbstä, jotta niitä ei tarvitse ylläpitää kahdessa paikassa.</p>
  ${img("ical", "Yksi kenttä jokaiselle villalle ja Teitulin yksikölle.")}
  <h3>Näin kopioit linkin Airbnbstä</h3>
  <ol>
    <li>Kirjaudu Airbnbhen ja avaa <strong>Kalenteri</strong>.</li>
    <li>Valitse kohde ja avaa <strong>Varattavuus</strong>.</li>
    <li>Etsi kohta <strong>Yhdistä kalenterit</strong> ja valitse <strong>Yhdistä toiseen verkkosivustoon</strong>.</li>
    <li>Kopioi Airbnbn antama kalenterilinkki. Se päättyy <code>.ics</code> ja sisältää pitkän tunnisteen.</li>
    <li>Liitä linkki tähän näkymään oikean kohteen kenttään ja paina <strong>Testaa</strong>.</li>
    <li>Kun testi kertoo montako varausta linkistä löytyi, paina <strong>Tallenna linkit</strong>.</li>
  </ol>
  <div class="card">
    <p class="label">Tärkeää</p>
    <p>Kalenterilinkki on salainen. Älä julkaise sitä verkkosivuilla tai sosiaalisessa mediassa. Sivusto hakee varaukset linkistä noin kolmen tunnin välein, eli aivan tuore Airbnb-varaus voi näkyä sivustolla pienellä viiveellä.</p>
  </div>
  <p>Jos kohteelle ei ole linkkiä, sen kalenterissa näkyvät vain käsin lisätyt varaukset. Jos linkki lakkaa toimimasta, sivusto ei näytä päiviä virheellisesti vapaina vaan kertoo, ettei saatavuutta juuri nyt saada haettua.</p>
</section>

<section>
  <h2>6. Kalenteri ja käsin lisätyt varaukset</h2>
  <p>Kalenterinäkymässä näet kaikki kohteet allekkain ja varaukset palkkeina.</p>
  ${img("calendar", "Kuukausinäkymä. Vaaleat palkit ovat Airbnbstä, tummat käsin lisättyjä.")}
  <ul>
    <li><strong>Käsin lisätyt varaukset</strong> ovat klikattavia. Niitä voi muokata ja poistaa.</li>
    <li><strong>Airbnb-varaukset</strong> näkyvät harmaina palkkeina. Niitä ei voi muokata täällä, vaan muutokset tehdään Airbnbssä.</li>
    <li><strong>+ Uusi varaus</strong> lisää varauksen, joka näkyy myös villasivun julkisessa kalenterissa varattuna.</li>
  </ul>
  <p>Käytä käsivarauksia silloin, kun varaus tulee muuta kautta kuin Airbnbn: suoraan puhelimitse, sähköpostilla tai sivuston lomakkeen kautta.</p>
</section>

<section>
  <h2>7. Hinnat ja kaudet</h2>
  <p>Jokaisella kohteella on perushinta, ja sen lisäksi voi määrittää kausia, joilla on oma hinta.</p>
  ${img("pricing", "Perushinta oikealla, kaudet lisätään painikkeesta.")}
  <h3>Näin lisäät kauden</h3>
  <ol>
    <li>Paina kohteen kohdalla <strong>+ Lisää kausi</strong>.</li>
    <li>Valitse <strong>Alkaa</strong> ja <strong>Päättyy</strong> kalenterista. Molemmat päivät kuuluvat kauteen.</li>
    <li>Kirjoita hinta euroina yöltä.</li>
    <li>Halutessasi anna kaudelle nimi, esimerkiksi Ruska tai Joulu. Nimi näkyy sivustolla hinnan vieressä. Kirjoita se sekä suomeksi että englanniksi.</li>
    <li>Paina <strong>Tallenna hinnat</strong>.</li>
  </ol>
  <p>Sivustolla näkyy aina pienin tuleva hinta muodossa &rdquo;alkaen 250 € / yö&rdquo;, ja villasivulla lisäksi taulukko kausittain. Menneet kaudet katoavat sivustolta itsestään, joten vanhoja ei tarvitse siivota.</p>
  <div class="card">
    <p class="label">Jos tallennus ei onnistu</p>
    <p>Kaudet eivät saa mennä päällekkäin saman kohteen sisällä. Jos ne menevät, tallennus kertoo mitkä päivämäärät ovat ristiriidassa. Korjaa päivät ja tallenna uudelleen.</p>
  </div>
  <p>Kaikki sivuston hinnat ovat ohjehintoja. Lopullinen hinta vahvistetaan aina tiedustelun yhteydessä, ja tämä lukee myös sivustolla hinnan alla.</p>
</section>

<section>
  <h2>8. Varausehdotukset ja yhteydenotot</h2>
  <p>Sivuston lomakkeista tulevat viestit kerätään näihin kahteen näkymään. Viestit säilyvät täällä, vaikka sähköposti-ilmoitus jostain syystä epäonnistuisi.</p>
  ${img("inbox", "Varausehdotukset. Uudet viestit on korostettu.")}
  <ul>
    <li><strong>Varausehdotukset</strong> tulevat villasivujen tiedustelulomakkeesta ja sisältävät toivotut päivämäärät ja vieraiden määrän.</li>
    <li><strong>Yhteydenotot</strong> tulevat yhteystietosivun lomakkeesta.</li>
    <li><strong>Luo varaus kalenteriin</strong> vie varausehdotuksen tiedot suoraan kalenteriin, kun sovit varauksen asiakkaan kanssa.</li>
    <li><strong>Merkitse luetuksi</strong> siirtää viestin pois uusien joukosta.</li>
  </ul>
  <p>Sähköpostiosoite viestin yhteydessä on linkki: klikkaamalla voit vastata asiakkaalle suoraan omalla sähköpostiohjelmallasi.</p>
  <div class="card">
    <p class="label">Merkintä &rdquo;Ilmoitus epäonnistui&rdquo;</p>
    <p>Jos viestin kohdalla näkyy tämä merkintä, viesti on tallessa mutta sähköposti-ilmoitusta ei saatu lähetettyä. Käy tällöin tarkistamassa viestit administa säännöllisesti ja ota yhteyttä sivuston tekijään.</p>
  </div>
</section>

<section>
  <h2>9. Mitä adminissa ei voi muokata</h2>
  <p>Osa asioista on tarkoituksella lukittu, jotta sivusto ei mene rikki vahingossa. Näihin saat muutoksen ottamalla yhteyttä sivuston tekijään.</p>
  <table>
    <tr><th>Asia</th><th>Miksi</th></tr>
    <tr><td>Alatunnisteen sähköpostiosoite</td><td>Tekninen asetus, ei tekstikenttä</td></tr>
    <tr><td>Uuden kohteen lisääminen tai poistaminen</td><td>Kohdelista on koodissa</td></tr>
    <tr><td>Uusi kysymys usein kysyttyihin</td><td>Kysymysten rakenne on kiinteä</td></tr>
    <tr><td>Vieraiden arvostelujen tekstit</td><td>Tuotu Airbnb-datasta</td></tr>
    <tr><td>Teitulin yksiköiden nimet</td><td>Tulevat kohdetiedoista</td></tr>
    <tr><td>Sivujen järjestys ja rakenne</td><td>Sivupohja on kiinteä</td></tr>
  </table>
</section>

<section>
  <h2>10. Jos jokin menee pieleen</h2>
  <table>
    <tr><th>Tilanne</th><th>Mitä tehdä</th></tr>
    <tr><td>Sivu näyttää vanhaa tekstiä</td><td>Päivitä selain näppäinyhdistelmällä <code>Ctrl</code> + <code>F5</code>. Jos ei auta, odota hetki ja kokeile uudelleen.</td></tr>
    <tr><td>Tallennus epäonnistuu</td><td>Tarkista verkkoyhteys ja yritä uudelleen. Jos virhe toistuu, älä sulje välilehteä vaan ota yhteyttä, jotta muutokset eivät katoa.</td></tr>
    <tr><td>Kuva ei näy</td><td>Kokeile ladata kuva uudelleen kuvavalitsimen kautta.</td></tr>
    <tr><td>Kalenteri sanoo ettei saatavuutta saada haettua</td><td>Airbnb-linkki on vanhentunut. Kopioi linkki uudelleen Airbnbstä ja testaa se Airbnb-kalenterit-näkymässä.</td></tr>
    <tr><td>Teksti hävisi tallennuksessa</td><td>Älä tallenna uudelleen. Ota yhteyttä, niin tilanne selvitetään. Sivuston alkuperäiset oletustekstit voidaan aina palauttaa.</td></tr>
    <tr><td>Unohdit salasanan</td><td>Ota yhteyttä sivuston tekijään, salasana vaihdetaan uuteen.</td></tr>
  </table>

  <div class="card">
    <p class="label">Tuki</p>
    <p>Novo Media &middot; sivuston tekninen ylläpito ja muutokset, joita adminissa ei voi tehdä.</p>
  </div>
</section>

</body></html>`;
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await context.newPage();

try {
  await page.goto(`${BASE}/admin/login`);
  await shoot(page, "login", "main");

  await page.fill("#password", PASSWORD);
  await page.click("button[type=submit]");
  await page.waitForURL(`${BASE}/admin`, { timeout: 20000 });
  await page.waitForTimeout(1500);
  await shoot(page, "home");

  await section("content", async () => {
    await page.getByRole("button", { name: "Sivuston tekstit" }).click();
    const etusivu = page.getByRole("button", { name: "Etusivu", exact: true });
    await etusivu.waitFor({ state: "visible", timeout: 20000 });
    await etusivu.click();
    const title = page.locator("input[id='hero.title']");
    await title.waitFor({ state: "visible", timeout: 20000 });
    await title.focus();
    await page.waitForTimeout(1500);
    await shoot(page, "content");
  });

  await section("properties", async () => {
    await page.getByRole("button", { name: "Kohteet" }).click();
    await page.waitForTimeout(2000);
    await shoot(page, "properties");
  });

  await section("ical", async () => {
    await page.getByRole("button", { name: "Airbnb-kalenterit" }).click();
    await page.getByText("Näin kopioit linkin Airbnbstä").waitFor({ timeout: 15000 });
    await page.waitForTimeout(800);
    await shoot(page, "ical");
  });

  await section("calendar", async () => {
    await page.getByRole("button", { name: "Kalenteri", exact: true }).click();
    await page.waitForTimeout(2500);
    await shoot(page, "calendar");
  });

  await section("pricing", async () => {
    await page.getByRole("button", { name: "Hinnat" }).click();
    await page.waitForTimeout(1800);
    await shoot(page, "pricing");
  });

  await section("inbox", async () => {
    await page.getByRole("button", { name: "Varausehdotukset" }).click();
    await page.waitForTimeout(1800);
    await shoot(page, "inbox");
  });

  const guide = await context.newPage();
  await guide.setContent(buildHtml(), { waitUntil: "networkidle" });
  await guide.waitForTimeout(1200);
  await mkdir(path.dirname(OUT_PDF), { recursive: true });
  await guide.pdf({
    path: OUT_PDF,
    format: "A4",
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: "<div></div>",
    footerTemplate:
      '<div style="width:100%;font-family:sans-serif;font-size:8pt;color:#8A857D;padding:0 18mm;display:flex;justify-content:space-between;"><span>Tahkon Villat — sisällönhallintaopas</span><span class="pageNumber"></span></div>',
    margin: { top: "20mm", bottom: "18mm", left: "18mm", right: "18mm" },
  });
  console.log("\n✓ PDF:", path.relative(process.cwd(), OUT_PDF));

  // Talteen myös HTML, jotta opasta voi päivittää ilman uutta ajoa.
  await writeFile(path.resolve("docs/admin-guide-source.html"), buildHtml(), "utf-8");
  console.log("✓ HTML-lähde: docs/admin-guide-source.html");
} catch (error) {
  console.error("✗", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await browser.close();
}
