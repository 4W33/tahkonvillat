import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "texts_footer_locales" ADD COLUMN "pages" varchar;
  ALTER TABLE "texts_reviews_locales" ADD COLUMN "original_language" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "texts_footer_locales" DROP COLUMN "pages";
  ALTER TABLE "texts_reviews_locales" DROP COLUMN "original_language";`)
}
