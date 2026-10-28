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
  // Windowsin oletus on WIN1252, joka ei hyväksy emojeja (Airbnb-arviot). Neon on UTF8.
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
});

if (!existsSync(dir)) await pg.initialise();
await pg.start();
const client = pg.getPgClient();
await client.connect();
const { rowCount } = await client.query("select 1 from pg_database where datname = 'tahkonvillat'");
if (!rowCount) {
  await client.query("create database tahkonvillat encoding 'UTF8' lc_collate 'C' lc_ctype 'C' template template0");
}
await client.end();
console.log("dev-db valmis: 127.0.0.1:54329/tahkonvillat");

const stop = async () => {
  await pg.stop();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
