import { promises as fs } from "fs";
import path from "path";

const OUTPUT_DIR = path.join(process.cwd(), "data", "airbnb");
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const LISTING_IDS = [
  "24085153", // Villa Puolukka
  "1217947670762444308", // Villa Karpalo
  "47068801", // Tahkon Teituli (verify)
];

const PROFILE_URL =
  "https://www.airbnb.fi/users/show/1463087767542373225";

function decodeText(value) {
  if (!value) return "";
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/\\n/g, "\n")
    .trim();
}

function extractJsonBlobs(html) {
  const blobs = [];
  const regex = /<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html))) {
    try {
      blobs.push(JSON.parse(match[1]));
    } catch {
      // ignore invalid json script blocks
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

  for (const blob of blobs) {
    walk(blob, (node) => {
      if (node.__typename === "UGCText" && node.localizedString) {
        const text = decodeText(node.localizedString);
        if (
          text.includes("MAJOITUSHINTA") ||
          text.includes("makuuhuonetta") ||
          text.length > 120
        ) {
          if (!description || text.length > description.length) {
            description = text;
          }
        }
      }

      if (
        node.__typename === "PdpUGCText" &&
        node.content?.localizedString &&
        node.content.localizedString.length > 10 &&
        node.content.localizedString.length < 120
      ) {
        const text = decodeText(node.content.localizedString);
        if (text.toUpperCase().includes("VILLA") || text.includes("TEITULI")) {
          title = text;
        }
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

      if (
        node.__typename === "PdpReviewForP3" ||
        node.__typename === "Review" ||
        (node.comments && node.createdAt && node.rating)
      ) {
        const comment = decodeText(
          node.comments ||
            node.comment ||
            node.localizedReview?.comments ||
            "",
        );
        if (comment && !reviews.some((r) => r.comment === comment)) {
          reviews.push({
            author: decodeText(node.reviewer?.firstName || node.author || ""),
            rating: node.rating || node.ratingValue || null,
            date: node.createdAt || node.created_at || "",
            comment,
          });
        }
      }
    });
  }

  if (!title) {
    const titleMatch = html.match(
      /"localizedString":"(VILLA[^"]+|Villa[^"]+|Tahkon[^"]+)"/i,
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
    amenities: [...new Set(amenities)],
    images,
    reviews: reviews.slice(0, 20),
    scrapedAt: new Date().toISOString(),
  };
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      "Accept-Language": "fi-FI,fi;q=0.9,en;q=0.8",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed ${url}: ${response.status}`);
  }
  return response.text();
}

function extractListingIdsFromProfile(html) {
  return [...new Set([...html.matchAll(/rooms\/(\d+)/g)].map((m) => m[1]))];
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  let profileIds = [];
  try {
    const profileHtml = await fetchHtml(PROFILE_URL);
    profileIds = extractListingIdsFromProfile(profileHtml);
    await fs.writeFile(
      path.join(OUTPUT_DIR, "profile-listing-ids.json"),
      JSON.stringify({ profileIds, scrapedAt: new Date().toISOString() }, null, 2),
    );
  } catch (error) {
    console.warn("Profile fetch failed:", error.message);
  }

  const ids = [...new Set([...LISTING_IDS, ...profileIds])];
  const results = [];

  for (const id of ids) {
    try {
      console.log(`Scraping ${id}...`);
      const html = await fetchHtml(`https://www.airbnb.fi/rooms/${id}`);
      const parsed = parseListingFromHtml(html, id);
      results.push(parsed);
      await fs.writeFile(
        path.join(OUTPUT_DIR, `${id}.json`),
        JSON.stringify(parsed, null, 2),
        "utf-8",
      );
      console.log(`  -> ${parsed.title || "untitled"} (${parsed.images.length} images)`);
    } catch (error) {
      console.warn(`  !! ${id}: ${error.message}`);
    }
  }

  await fs.writeFile(
    path.join(OUTPUT_DIR, "all-listings.json"),
    JSON.stringify(results, null, 2),
    "utf-8",
  );

  console.log(`Done. ${results.length} listings saved to ${OUTPUT_DIR}`);
}

main();
