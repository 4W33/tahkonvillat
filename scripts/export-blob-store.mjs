// Vanhan CMS:n tuotantodata (yksityinen Blob) → data/blob-export/<pathname>.
// Käyttö: BLOB_READ_WRITE_TOKEN=<tuotannon token> npm run cms:export-blob
// Sen jälkeen `npm run cms:seed` käyttää exporttia repon data/-tiedostojen sijaan.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { get, list } from "@vercel/blob";

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error("BLOB_READ_WRITE_TOKEN puuttuu (tuotannon yksityisen säilön token).");
  process.exit(1);
}

const OUT = path.join(process.cwd(), "data", "blob-export");
let count = 0;

for (const prefix of ["store/", "media/properties/"]) {
  let cursor;
  do {
    const page = await list({ prefix, cursor, limit: 1000 });
    for (const blob of page.blobs) {
      const result = await get(blob.pathname, { access: "private", useCache: false });
      if (!result || result.statusCode !== 200 || !result.stream) {
        throw new Error(`Luku epäonnistui: ${blob.pathname}`);
      }
      const file = path.join(OUT, ...blob.pathname.split("/"));
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, Buffer.from(await new Response(result.stream).arrayBuffer()));
      count += 1;
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
}

console.log(`Viety ${count} tiedostoa → ${path.relative(process.cwd(), OUT)}`);
