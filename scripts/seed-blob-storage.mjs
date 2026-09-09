/**
 * Upload local data/*.json to Vercel Blob for production.
 * Run once before or after first Vercel deploy when BLOB_READ_WRITE_TOKEN is set.
 *
 * Usage: BLOB_READ_WRITE_TOKEN=xxx node scripts/seed-blob-storage.mjs
 */
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { put } from "@vercel/blob";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dataDir = path.join(root, "data");
const contentDir = path.join(dataDir, "content");

const PREFIX = "store";

// PIDÄ SYNKASSA src/lib/storage/access-policy.ts kanssa.
// Testi src/lib/storage/access-policy.test.ts hajoaa, jos listat eriytyvät.
const PRIVATE_PATHS = new Set([
  "data/contacts.json",
  "data/inquiries.json",
  "data/reservations.json",
  "data/ical-sources.json",
]);

const JSON_FILES = [
  "data/pricing.json",
  "data/site-images.json",
  "data/reservations.json",
  "data/inquiries.json",
  "data/contacts.json",
  "data/ical-sources.json",
];

function accessFor(relativePath) {
  return PRIVATE_PATHS.has(relativePath) ? "private" : "public";
}

async function uploadJson(relativePath, access = accessFor(relativePath)) {
  const file = path.join(root, relativePath);
  try {
    const raw = await fs.readFile(file, "utf-8");
    JSON.parse(raw);
    const pathname = `${PREFIX}/${relativePath.replace(/\\/g, "/")}`;
    await put(pathname, raw, {
      access,
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    console.log(`✓ ${pathname}`);
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log(`– skip (missing): ${relativePath}`);
      return;
    }
    throw error;
  }
}

async function uploadContentFiles() {
  let files;
  try {
    files = await fs.readdir(contentDir);
  } catch {
    console.log("– no data/content directory");
    return;
  }

  for (const name of files.filter((f) => f.endsWith(".json"))) {
    await uploadJson(`data/content/${name}`, "public");
  }

  const messagesDir = path.join(contentDir, "messages");
  try {
    const messageFiles = await fs.readdir(messagesDir);
    for (const name of messageFiles.filter((f) => f.endsWith(".json"))) {
      await uploadJson(`data/content/messages/${name}`, "public");
    }
  } catch {
    console.log("– no data/content/messages directory");
  }
}

async function walkFiles(dir, baseDir = dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(full, baseDir)));
    } else {
      files.push(path.relative(baseDir, full));
    }
  }

  return files;
}

async function uploadPropertyImages() {
  const imagesRoot = path.join(root, "public", "images", "properties");

  try {
    await fs.access(imagesRoot);
  } catch {
    console.log("\n– no public/images/properties (run npm run content:import first)");
    return;
  }

  const files = await walkFiles(imagesRoot);
  const imageFiles = files.filter((file) =>
    /\.(jpe?g|png|webp|avif)$/i.test(file),
  );

  if (!imageFiles.length) {
    console.log("\n– no property images to upload");
    return;
  }

  console.log(`\nUploading ${imageFiles.length} property images…`);

  for (const relative of imageFiles) {
    const file = path.join(imagesRoot, relative);
    const buffer = await fs.readFile(file);
    const pathname = `media/properties/${relative.replace(/\\/g, "/")}`;
    const ext = path.extname(relative).toLowerCase();
    const contentType =
      ext === ".png"
        ? "image/png"
        : ext === ".webp"
          ? "image/webp"
          : ext === ".avif"
            ? "image/avif"
            : "image/jpeg";

    const blob = await put(pathname, buffer, {
      access: "public",
      contentType,
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    console.log(`✓ ${pathname} → ${blob.url}`);
  }
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("Set BLOB_READ_WRITE_TOKEN before running this script.");
    process.exit(1);
  }

  console.log("Seeding Vercel Blob from local data/…\n");

  for (const relativePath of JSON_FILES) {
    await uploadJson(relativePath);
  }

  await uploadContentFiles();
  await uploadPropertyImages();

  console.log(
    "\nDone. Production reads use Blob when available; git files remain fallback.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
