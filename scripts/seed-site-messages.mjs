/**
 * Copy bundled messages/*.json to data/content/messages/ for CMS editing.
 * Run once before first admin text edit, or to reset CMS copy from defaults.
 */
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const targetDir = path.join(root, "data", "content", "messages");

await fs.mkdir(targetDir, { recursive: true });

for (const locale of ["fi", "en"]) {
  const source = path.join(root, "messages", `${locale}.json`);
  const target = path.join(targetDir, `${locale}.json`);
  const raw = await fs.readFile(source, "utf-8");
  JSON.parse(raw);
  await fs.writeFile(target, raw, "utf-8");
  console.log(`✓ data/content/messages/${locale}.json`);
}

console.log("Site messages seeded — admin edits will use these files.");
