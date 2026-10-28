// Paikallinen Postgres kehitykseen (ei asennusta, ei tiliä). Tuotannossa Neon.
// DATABASE_URL=postgres://postgres:postgres@127.0.0.1:54329/tahkonvillat
import { existsSync } from "node:fs";
import EmbeddedPostgres from "embedded-postgres";

const dir = ".dev-db";
const pg = new EmbeddedPostgres({
  databaseDir: dir,
  port: 54329,
  user: "postgres",
  password: "postgres",
  persistent: true,
});

if (!existsSync(dir)) await pg.initialise();
await pg.start();
try {
  await pg.createDatabase("tahkonvillat");
} catch (e) {
  if (!String(e?.message ?? e).includes("already exists")) throw e;
}
console.log("dev-db valmis: 127.0.0.1:54329/tahkonvillat");

const stop = async () => {
  await pg.stop();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
