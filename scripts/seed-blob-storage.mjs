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

// Yksi yksityinen säilö: kaikki kirjoitetaan yksityisenä (ks. src/lib/storage/access-policy.ts).
const JSON_FILES = [
  "data/pricing.json",
  "data/site-images.json",
  "data/reservations.json",
  "data/inquiries.json",
  "data/contacts.json",
];

function accessFor() {
  return "private";
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
    await uploadJson(`data/content/${name}`);
  }

  const messagesDir = path.join(contentDir, "messages");
  try {
    const messageFiles = await fs.readdir(messagesDir);
    for (const name of messageFiles.filter((f) => f.endsWith(".json"))) {
      await uploadJson(`data/content/messages/${name}`);
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
  // Repon kuvat (public/images/properties) tarjoillaan staattisesti deployn mukana,
  // joten niitä ei ladata Blobiin. Adminissa ladatut uudet kuvat menevät Blobiin itse.

  console.log(
    "\nDone. Production reads use Blob when available; git files remain fallback.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
