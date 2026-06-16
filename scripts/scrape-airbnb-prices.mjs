import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";

const OUTPUT = path.join(process.cwd(), "data", "airbnb", "profile-prices.json");

const LISTINGS = [
  { id: "24085153", slug: "villa-puolukka" },
  { id: "1217947670762444308", slug: "villa-karpalo" },
  { id: "47068801", slug: "tahkon-teituli" },
  { id: "32621290", slug: "vantaa-1" },
  { id: "32665560", slug: "vantaa-2" },
  { id: "32721246", slug: "vantaa-3" },
  { id: "36108291", slug: "vantaa-4" },
  { id: "18682338", slug: "helsinki-1" },
];

function addDays(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function parsePricesFromHtml(html) {
  const hits = new Set();

  for (const match of html.matchAll(/"priceString"\s*:\s*"([^"]+)"/g)) {
    const euro = match[1].match(/(\d[\d\s,.]*)\s*€/);
    if (euro) hits.add(Number(euro[1].replace(/\s/g, "").replace(",", ".")));
  }

  for (const match of html.matchAll(/"amount"\s*:\s*(\d+)/g)) {
    const cents = Number(match[1]);
    if (cents >= 2000 && cents <= 500000) hits.add(Math.round(cents / 100) || cents);
  }

  for (const match of html.matchAll(/(\d{2,4})\s*€/g)) {
    hits.add(Number(match[1]));
  }

  return [...hits].filter((n) => n >= 30 && n <= 5000).sort((a, b) => a - b);
}

const checkIn = addDays(new Date(), 28);
const checkOut = addDays(new Date(), 30);
const prices = {};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

for (const listing of LISTINGS) {
  const url = `https://www.airbnb.fi/rooms/${listing.id}?check_in=${checkIn}&check_out=${checkOut}&adults=2`;
  console.log("fetch", listing.slug);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(4500);

  const html = await page.content();
  const found = parsePricesFromHtml(html);
  if (found.length) {
    prices[listing.slug] = {
      listingId: listing.id,
      fromPerNight: found[0],
      sampleTotal: found[found.length - 1],
      checkIn,
      checkOut,
      currency: "EUR",
    };
    console.log(" ", found[0], "€/night approx");
  } else {
    console.log("  no price");
  }
}

mkdirSync(path.dirname(OUTPUT), { recursive: true });
writeFileSync(
  OUTPUT,
  JSON.stringify({ scrapedAt: new Date().toISOString(), prices }, null, 2),
);
console.log("saved", OUTPUT);
await browser.close();
