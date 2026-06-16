import { chromium } from "playwright";
import { promises as fs } from "fs";
import path from "path";

const OUTPUT_DIR = path.join(process.cwd(), "data", "airbnb");
const PROFILE_URL =
  "https://www.airbnb.fi/users/profile/1463087767542373225?previous_page_name=PdpHomeMarketplace";

const FALLBACK_IDS = ["24085153", "1217947670762444308", "47068801"];

function decodeText(value) {
  if (!value) return "";
  return value.replace(/<br\s*\/?>/gi, "\n").replace(/\\n/g, "\n").trim();
}

function extractJsonBlobs(html) {
  const blobs = [];
  const regex = /<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html))) {
    try {
      blobs.push(JSON.parse(match[1]));
    } catch {
      // skip
    }
  }
  return blobs;
}

function walk(node, visit) {
  if (!node || typeof node !== "object") return;
  visit(node);
  if (Array.isArray(node)) {
    for (const item of node) walk(item, visit);
    return;
  }
  for (const value of Object.values(node)) walk(value, visit);
}

function unescapeJsonString(raw) {
  try {
    return JSON.parse(`"${raw.replace(/"/g, '\\"')}"`);
  } catch {
    return raw.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }
}

function extractReviewsFromHtmlRegex(html) {
  const reviews = [];
  const seen = new Set();

  const patterns = [
    /"comments"\s*:\s*"((?:\\.|[^"\\])*)"/g,
    /"localizedString"\s*:\s*"((?:Siisti|Kiva|Todella|Meillä|Majoitus|Hyvä|Kiitos|Suosittelen|Viihty|mahtava|upea)[^"\\]{30,500})"/gi,
  ];

  for (const regex of patterns) {
    let match;
    while ((match = regex.exec(html))) {
      const comment = decodeText(unescapeJsonString(match[1]));
      if (comment.length < 35 || comment.length > 1200) continue;
      if (/mukavuudet|majoitushinta sisältää|näytä kaikki/i.test(comment)) continue;
      const key = comment.slice(0, 80);
      if (seen.has(key)) continue;
      seen.add(key);
      reviews.push({ author: "", rating: null, date: "", comment });
    }
  }

  return reviews;
}

function mergeReviews(...groups) {
  const merged = [];
  const seen = new Set();

  for (const group of groups) {
    for (const review of group) {
      const comment = (review.comment || "").trim();
      if (!comment) continue;
      const key = comment.slice(0, 100);
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push({ ...review, comment });
    }
  }

  return merged.slice(0, 30);
}

async function dismissCookieBanner(page) {
  for (const label of [/hyväksy/i, /accept all/i, /accept/i, /ok/i]) {
    try {
      const btn = page.getByRole("button", { name: label }).first();
      if (await btn.isVisible({ timeout: 1500 })) {
        await btn.click();
        await page.waitForTimeout(800);
        return;
      }
    } catch {
      // try next
    }
  }
}

function parseListingFromHtml(html, listingId) {
  const blobs = extractJsonBlobs(html);
  let title = "";
  let description = "";
  let ratingAverage = null;
  let ratingCount = null;
  let guests = null;
  let bedrooms = null;
  let beds = null;
  let bathrooms = null;
  let location = "";
  const images = [];
  const amenities = [];
  const reviews = [];
  const highlights = [];
  const categoryRatings = [];

  for (const blob of blobs) {
    walk(blob, (node) => {
      if (node.__typename === "UGCText" && node.localizedString) {
        const text = decodeText(node.localizedString);
        if (
          text.includes("MAJOITUSHINTA") ||
          text.includes("makuuhuonetta") ||
          text.includes("hissilippu") ||
          (text.length > 80 && text.includes("\n"))
        ) {
          if (!description || text.length > description.length) description = text;
        }
      }

      if (
        node.__typename === "PdpUGCText" &&
        node.content?.localizedString &&
        node.content.localizedString.length > 8 &&
        node.content.localizedString.length < 140
      ) {
        const text = decodeText(node.content.localizedString);
        if (/villa|teituli|puolukka|karpalo/i.test(text)) title = text;
      }

      if (node.__typename === "ImageEntity" && node.uri) {
        const alt = decodeText(
          node.altText?.user?.localizedString ||
            node.caption?.user?.localizedString ||
            "",
        );
        if (!images.some((img) => img.url === node.uri)) {
          images.push({ url: node.uri, alt });
        }
      }

      if (node.__typename === "AmenityItem" && node.available && node.title) {
        amenities.push(decodeText(node.title));
      }

      if (node.__typename === "DemandReviewRatingStats") {
        if (node.ratingAverage != null) ratingAverage = node.ratingAverage;
        if (node.ratingCount != null) ratingCount = Number(node.ratingCount);
      }

      if (node.__typename === "CategoryRating" && node.label && node.localizedRating) {
        categoryRatings.push({
          label: decodeText(node.label),
          rating: decodeText(node.localizedRating),
        });
      }

      if (node.__typename === "ListingPdpHighlight" && node.headline?.localizedContent) {
        highlights.push({
          headline: decodeText(node.headline.localizedContent),
          body: decodeText(node.body?.localizedContent || ""),
        });
      }

      if (node.__typename === "StaysPdpOverview" && node.title) {
        location = decodeText(node.title);
        if (Array.isArray(node.items)) {
          for (const item of node.items) {
            const line = decodeText(item);
            const guestMatch = line.match(/(\d+)\+?\s*vierasta/i);
            const bedroomMatch = line.match(/(\d+)\s*makuuhuonetta/i);
            const bedMatch = line.match(/(\d+)\s*vuodetta/i);
            const bathMatch = line.match(/([\d,]+)\s*kylpyhuonetta/i);
            if (guestMatch) guests = Number(guestMatch[1]);
            if (bedroomMatch) bedrooms = Number(bedroomMatch[1]);
            if (bedMatch) beds = Number(bedMatch[1]);
            if (bathMatch) bathrooms = bathMatch[1].replace(",", ".");
          }
        }
      }

      const reviewText = decodeText(
        node.comment ||
          node.comments ||
          node.localizedReview?.comments ||
          node.reviewBody ||
          node.publicComment ||
          "",
      );

      const isReviewNode =
        typeof node.__typename === "string" &&
        /review/i.test(node.__typename);

      const looksLikeReview =
        reviewText.length > 35 &&
        (node.rating != null || node.ratingValue != null || node.createdAt) &&
        (node.comments || node.comment);

      if (isReviewNode || looksLikeReview) {
        if (!reviews.some((r) => r.comment === reviewText)) {
          reviews.push({
            author: decodeText(
              node.reviewer?.firstName ||
                node.author?.firstName ||
                node.reviewerName ||
                node.reviewer?.fullName ||
                "",
            ),
            rating: node.rating || node.ratingValue || null,
            date: node.createdAt || node.created_at || "",
            comment: reviewText,
          });
        }
      }
    });
  }

  if (!title) {
    const titleMatch = html.match(
      /"localizedString":"((?:VILLA|Villa|TAHKON|Tahkon)[^"]{5,100})"/i,
    );
    if (titleMatch) title = decodeText(titleMatch[1]);
  }

  return {
    listingId,
    url: `https://www.airbnb.fi/rooms/${listingId}`,
    title,
    description,
    location,
    stats: {
      ratingAverage,
      ratingCount,
      guests,
      bedrooms,
      beds,
      bathrooms,
    },
    highlights,
    categoryRatings: categoryRatings.slice(0, 8),
    amenities: [...new Set(amenities)],
    images,
    reviews: reviews.slice(0, 50),
    scrapedAt: new Date().toISOString(),
    scrapedWith: "playwright",
  };
}

async function extractListingIdsFromProfile(page) {
  await page.goto(PROFILE_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(4000);

  // Scroll to load lazy listings
  for (let i = 0; i < 6; i++) {
    await page.mouse.wheel(0, 1200);
    await page.waitForTimeout(800);
  }

  const ids = await page.evaluate(() => {
    const found = new Set();
    for (const anchor of document.querySelectorAll('a[href*="/rooms/"]')) {
      const href = anchor.getAttribute("href") || "";
      const match = href.match(/\/rooms\/(\d+)/);
      if (match) found.add(match[1]);
    }
    return [...found];
  });

  return ids;
}

async function scrapeReviewsFromDom(page) {
  const domReviews = [];

  try {
    const reviewsHeading = page.locator("text=Arvostelut").first();
    await reviewsHeading.scrollIntoViewIfNeeded({ timeout: 10000 });
    await page.waitForTimeout(2000);
  } catch {
    // continue
  }

  const inlineTexts = await page.evaluate(() => {
    const root = document.body;
    const out = [];
    for (const el of root.querySelectorAll("div, article, li")) {
      const text = (el.textContent || "").trim();
      if (
        text.length > 45 &&
        text.length < 900 &&
        /Arvio, \d+ tähteä/.test(text) &&
        !/näytä kaikki \d+ arvostel/i.test(text)
      ) {
        out.push(text);
      }
    }
    return [...new Set(out)];
  });

  for (const comment of inlineTexts) {
    domReviews.push({ author: "", rating: null, date: "", comment });
  }

  const openers = [
    page.getByRole("button", { name: /näytä kaikki \d+ arvostel/i }).first(),
    page.getByRole("button", { name: /näytä kaikki arvostel/i }).first(),
    page.locator('button:has-text("arvostel")').first(),
    page.locator('a:has-text("arvostel")').first(),
  ];

  for (const opener of openers) {
    try {
      if (await opener.isVisible({ timeout: 2000 })) {
        await opener.click();
        await page.waitForTimeout(3500);
        break;
      }
    } catch {
      // try next
    }
  }

  for (let i = 0; i < 12; i++) {
    try {
      const more = page.locator('button:has-text("Näytä lisää")').last();
      if (await more.isVisible({ timeout: 1500 })) {
        await more.click();
        await page.waitForTimeout(1200);
      } else {
        break;
      }
    } catch {
      break;
    }
  }

  const modalTexts = await page.evaluate(() => {
    const root = document.querySelector('[role="dialog"]') || document.body;
    const out = [];
    for (const card of root.querySelectorAll('[data-testid="review"]')) {
      const text = (card.textContent || "").trim();
      if (text.length > 30) out.push(text);
    }
    for (const el of root.querySelectorAll("div, article, li")) {
      const text = (el.textContent || "").trim();
      if (
        text.length > 45 &&
        text.length < 900 &&
        /Arvio, \d+ tähteä/.test(text) &&
        !/näytä kaikki \d+ arvostel/i.test(text)
      ) {
        out.push(text);
      }
    }
    return [...new Set(out)];
  });

  for (const comment of modalTexts) {
    domReviews.push({ author: "", rating: null, date: "", comment });
  }

  return domReviews;
}

async function readExistingReviews(listingId) {
  try {
    const file = path.join(OUTPUT_DIR, `${listingId}.json`);
    const data = JSON.parse(await fs.readFile(file, "utf-8"));
    return Array.isArray(data.reviews) ? data.reviews : [];
  } catch {
    return [];
  }
}

async function scrapeListing(page, listingId) {
  const url = `https://www.airbnb.fi/rooms/${listingId}`;
  console.log(`  Navigating ${url}`);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
  await dismissCookieBanner(page);
  await page.waitForTimeout(4000);

  const html = await page.content();
  const parsed = parseListingFromHtml(html, listingId);
  const regexReviews = extractReviewsFromHtmlRegex(html);
  const domReviews = await scrapeReviewsFromDom(page);
  const existingReviews = await readExistingReviews(listingId);

  parsed.reviews = mergeReviews(
    parsed.reviews,
    domReviews,
    regexReviews,
    existingReviews,
  );

  return parsed;
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    locale: "fi-FI",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  let listingIds = [];
  try {
    console.log("Opening host profile in browser...");
    listingIds = await extractListingIdsFromProfile(page);
    console.log(`Found ${listingIds.length} listings on profile`);
    await fs.writeFile(
      path.join(OUTPUT_DIR, "profile-listing-ids.json"),
      JSON.stringify(
        { profileIds: listingIds, scrapedAt: new Date().toISOString(), method: "playwright" },
        null,
        2,
      ),
    );
  } catch (error) {
    console.warn("Profile scrape failed:", error.message);
  }

  const ids = [...new Set([...listingIds, ...FALLBACK_IDS])];
  const results = [];

  for (const id of ids) {
    try {
      console.log(`Scraping listing ${id}...`);
      const parsed = await scrapeListing(page, id);
      results.push(parsed);
      await fs.writeFile(
        path.join(OUTPUT_DIR, `${id}.json`),
        JSON.stringify(parsed, null, 2),
        "utf-8",
      );
      console.log(
        `  -> ${parsed.title || "untitled"} | ${parsed.images.length} images | ${parsed.reviews.length} reviews`,
      );
    } catch (error) {
      console.warn(`  !! ${id}: ${error.message}`);
    }
  }

  await fs.writeFile(
    path.join(OUTPUT_DIR, "all-listings.json"),
    JSON.stringify(results, null, 2),
    "utf-8",
  );

  await browser.close();
  console.log(`Done. ${results.length} listings -> ${OUTPUT_DIR}`);
}

main();
