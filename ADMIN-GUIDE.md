# Tahkon Villat — Admin-opas (asiakas)

Kirjaudu: **`/admin/login`** (salasana toimitetaan erikseen)

---

## Mitä voit muokata adminissa

### Etusivu — kuvat
Vaihda etusivun kuvat klikkaamalla — ei tarvitse avata Kohteet-editoria.

- **Taustakuvat** — hero, Meistä-osio, luonto-kaista
- **Korttien kansikuvat** — valitse villa tai asunto, klikkaa kuvaa

Muutos näkyy heti etusivulla (villat + asunnot -kortit).

### Sivuston tekstit
Kaikki sivuston copy FI/EN: etusivu, navigaatio, footer, villat/asunnot-sivujen otsikot, UKK, yhteystiedot, tietosuoja, lomaketekstit, SEO-otsikot.

- Valitse osio vasemmalta (esim. **Etusivu**, **UKK**)
- Vaihda **Suomi / English**
- **Tallenna kaikki tekstit** — muutokset näkyvät sivustolla heti

### Kohteet
Jokainen villa/asunto: **Kuvat**, **Tekstit** (FI/EN), **Tiedot** (sijainti, vieraiden määrä, varustelu).

### Kalenteri
Manuaalinen saatavuus — lisää, muokkaa ja poista varauslohkoja.

### Hinnat
Ohjehinnat (€/yö) per kohde. Lopullinen hinta vahvistetaan aina tiedustelussa.

### Varausehdotukset & Yhteydenotot
Lomakkeiden viestit. Varausehdotuksesta voi luoda kalenterivarauksen.

---

## Mitä EI voi muokata adminissa

| Asia | Miksi | Kuka muuttaa |
|------|-------|--------------|
| **Sähköpostiosoite** footerissa (`pellonkulma.apartments@gmail.com`) | Tekninen asetus, ei teksti-CMS | Kehittäjä / tuki |
| **Uuden kohteen lisäys** (9. villa tms.) | Kohdelista koodissa | Kehittäjä |
| **Kohteen poisto** | Sama | Kehittäjä |
| **Uusi UKK-kysymys** (uusi aihe) | UKK-rakenne kiinteä | Kehittäjä |
| **Arvostelujen tekstit** | Tuotu Airbnb-datasta | Kehittäjä / uudelleentuonti |
| **Teituli-yksiköiden nimet** (A, B, 8A…) | JSON-data | Kehittäjä |

Jos tarvitset näitä, ota yhteyttä sivuston tekijään.

---

## Vinkit

1. **Tallenna aina** ennen kuin poistut sivulta — näet “Tallentamattomia muutoksia” -varoituksen.
2. **Kuvan vaihto** käy aina klikkaamalla kuvaa — polkuja ei tarvitse kopioida mihinkään. Kuvavalitsimesta valitset joko olemassa olevan kuvan tai lataat uuden. Kuvamuutokset tallentuvat heti, ja saat **Kumoa**-painikkeen jos vaihdoit väärän.
3. **Älä poista kenttiä** — muokkaa tekstiä, älä jätä tyhjäksi pakollisia kohtia (nimi, otsikot).
4. **Testaa** “Avaa julkisella sivulla” -linkillä tallennuksen jälkeen.

---

## Jos jotain menee pieleen

- Sivu näyttää vanhaa tekstiä → päivitä selain (Ctrl+F5). Jos ei auta, ota yhteyttä tukeen.
- Tallennus epäonnistuu → tarkista internetyhteys ja yritä uudelleen.
- Kuva ei näy → tarkista kuvapolku (`/images/properties/...`).
