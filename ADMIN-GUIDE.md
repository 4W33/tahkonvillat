# Tahkon Villat — Admin-opas (asiakas)

Kirjaudu: **`/admin`** → sähköpostiosoite + salasana (tunnukset toimitetaan erikseen).
Admin on suomeksi. Vasemmassa valikossa sisältö on ryhmiteltynä: **Sisältö**, **Varaukset**, **Viestit**,
**Sivuston tekstit** ja **Asetukset**.

---

## Perusasiat

- **Tallenna** jokaisen muutoksen jälkeen. Muutos näkyy sivustolla tallennuksen jälkeen (päivitä sivu selaimessa).
- **Kieliversio:** lokalisoidut kentät (nimet, kuvaukset, tekstit) muokataan erikseen suomeksi ja englanniksi.
  Vaihda kieli yläreunan kielivalitsimesta (**Suomi / English**) ja tallenna kumpikin kieli.
- **Reaaliaikainen esikatselu:** villoissa ja asunnoissa voit avata esikatselun muokkausnäkymän yläreunasta.
  Esikatselu näyttää julkisen sivun ja päivittyy, kun tallennat.

---

## Mitä voit muokata

### Sisältö → Villat
Jokaisella villalla:

- **Nimi**, **Lyhyt kuvaus** ja **Pitkä kuvaus** (kappaleina, lisää/poista kappaleita) — FI ja EN erikseen
- **Vieraita**, **Makuuhuoneita**, **Varustelu** (valitse listasta)
- **Pääkuva**, **Kuvagalleria** ja **Pääkuvan kuvaus** — ks. Kuvat alla
- **Hinnat:** *Perushinta alkaen (€ / yö)* ja **Kausihinnat**: jokaisella kaudella *Alkaa*, *Päättyy (viimeinen yö mukaan lukien)*,
  *Hinta (€ / yö)* ja valinnainen *Nimi* (esim. Joulu, FI/EN). Kaudet eivät saa mennä päällekkäin — admin ei tallenna
  päällekkäisiä kausia vaan näyttää virheen.
- **Airbnb-kalenterin iCal-linkki:** Airbnb → Kalenteri → Vie kalenteri → kopioi linkki tähän. Linkin pitää alkaa `https://`.
  Tyhjä kenttä = Airbnb-varauksia ei näytetä. Sivuston Saatavuus-kalenteri hakee Airbnb-varaukset noin 3 tunnin välein.
  Linkki on salainen: se näkyy vain kirjautuneelle, ei sivustolla.
- **Yksiköt** (esim. Tahkon Teituli): jokaisella yksiköllä oma *Nimi*, *Vieraita*, *Makuuhuoneita* ja oma iCal-linkki.
- **Arvosana (Airbnb)**, **Arvioiden määrä** ja **Arviot** (arvio, kirjoittaja, tähdet, päivämäärä).
- Sivupalkissa **Osoite (URL-tunnus)** ja **Sijainti**. Älä muuta osoitetta — sivun osoite muuttuisi.

### Sisältö → Asunnot
Kuten villat: nimi, alue, kuvaus, vieraat, makuuhuoneet, kuvat, hinnat ja arviot. Asunnoilla ei ole kalenteria.
Sivupalkin **Tunnus** (esim. `vantaa-1`) — älä muuta.

### Sisältö → Kuvat
Kaikki ladatut kuvat. Kuvakentässä (esim. Pääkuva) voit **Luoda uuden** (lataa tiedosto) tai **Valita olemassa olevista**.
Jokaiselle kuvalle pakollinen **Kuvan kuvaus** (näkövammaisille ja hakukoneille), FI ja EN.
Älä poista kuvaa, jota jokin kohde käyttää — se katoaa sivulta.

### Varaukset → Varaukset
Muualta kuin Airbnbstä tulleet varaukset (esim. suoraan sovitut). Airbnb-varaukset tulevat kalenteriin automaattisesti — niitä ei lisätä tänne.

- **Kohde:** villan osoite, esim. `villa-puolukka`. Jos villassa on yksiköitä, muodossa `osoite:yksikön tunnus`,
  esim. `tahkon-teituli:46923155`. Väärä tunnus → "Tuntematon kohde tai yksikkö".
- **Saapuminen**, **Lähtö** (lähdön pitää olla saapumisen jälkeen) ja valinnainen **Vieras**.
- Varaus näkyy villasivun Saatavuus-kalenterissa varattuna.

### Viestit → Yhteydenotot ja Varaustiedustelut
Lomakkeilta tulleet viestit. Viestin tietoja ei voi muuttaa. Merkitse käsitellyksi ruksilla **Käsitelty**.
**Sähköposti-ilmoitus** kertoo, lähtikö viestistä ilmoitus sähköpostiin (Lähetetty / Epäonnistui / Ei käytössä).

### Sivuston tekstit
Kaikki sivuston tekstit FI/EN, yksi näkymä per osio: Hakukoneet, Yleiset, Valikko, Alatunniste, Etusivu, Villat, Asunnot,
Yhteystiedot, Kysymykset (FAQ), Lähtöpäivän ohjeet, Hinnat, Arviot, Tietosuoja, Sivua ei löytynyt (404).

- Kenttien nimet ovat teknisiä tunnuksia (esim. `title`, `subtitle`) — kentän sisältö kertoo, mikä teksti on kyseessä.
- **Tyhjä kenttä = sivustolla näkyy oletusteksti.** Kirjoita vain ne tekstit, jotka haluat muuttaa.
- Vaihda kieli (FI/EN) yläreunasta.

### Asetukset → Käyttäjät
Admin-käyttäjät (sähköposti + salasana). Voit lisätä käyttäjän ja vaihtaa oman salasanasi (**Vaihda salasana**).

---

## Mitä EI voi muokata adminissa

| Asia | Miksi | Kuka muuttaa |
|------|-------|--------------|
| **Sähköpostiosoite** footerissa (`pellonkulma.apartments@gmail.com`) | Tekninen asetus, ei tekstikenttä | Kehittäjä |
| **Uusi UKK-kysymys** (uusi aihe) | Kysymysten rakenne on koodissa; olemassa olevien tekstit voi muuttaa | Kehittäjä |
| **Uusi tekstikenttä** sivulle | Vaatii koodimuutoksen | Kehittäjä |
| **Unohtunut salasana** | Palautuslinkki lähtee sähköpostiin vain, kun sähköpostipalvelu (Resend) on kytketty | Kehittäjä / toinen admin-käyttäjä |

Jos tarvitset näitä, ota yhteyttä sivuston tekijään.

---

## Jos jotain menee pieleen

- Sivu näyttää vanhaa tekstiä → päivitä selain (Ctrl+F5). Jos ei auta, ota yhteyttä tukeen.
- Tallennus ei onnistu → admin näyttää virheellisen kentän punaisena; korjaa se ja tallenna uudelleen.
- Saatavuus-kalenteri näyttää "Saatavuustietoa ei juuri nyt saada haettua" → Airbnb-linkki ei juuri nyt vastaa tai on virheellinen. Päiviä ei silloin näytetä vapaina; tarkista linkki villan iCal-kentästä.
