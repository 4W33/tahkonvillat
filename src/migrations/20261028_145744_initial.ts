import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('fi', 'en');
  CREATE TYPE "public"."enum_villas_amenities" AS ENUM('sauna', 'wifi', 'jacuzzi', 'pets', 'beds', 'kitchen', 'fireplace', 'parking');
  CREATE TYPE "public"."enum_villas_location" AS ENUM('tahko', 'vantaa', 'helsinki');
  CREATE TYPE "public"."enum_apartments_location" AS ENUM('vantaa', 'helsinki');
  CREATE TYPE "public"."enum_contacts_topic" AS ENUM('villa', 'apartment', 'general');
  CREATE TYPE "public"."enum_contacts_notified" AS ENUM('sent', 'failed', 'off');
  CREATE TYPE "public"."enum_inquiries_notified" AS ENUM('sent', 'failed', 'off');
  CREATE TABLE "villas_long_description" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"paragraph" varchar NOT NULL
  );
  
  CREATE TABLE "villas_amenities" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_villas_amenities",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "villas_units" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"unit_id" varchar NOT NULL,
  	"guests" numeric,
  	"bedrooms" numeric,
  	"ical_url" varchar
  );
  
  CREATE TABLE "villas_units_locales" (
  	"name" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "villas_pricing_seasons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"start" timestamp(3) with time zone NOT NULL,
  	"end" timestamp(3) with time zone NOT NULL,
  	"price_per_night" numeric NOT NULL
  );
  
  CREATE TABLE "villas_pricing_seasons_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "villas_reviews" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"comment" varchar NOT NULL,
  	"author" varchar,
  	"rating" numeric,
  	"date" varchar
  );
  
  CREATE TABLE "villas" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"location" "enum_villas_location" NOT NULL,
  	"guests" numeric,
  	"bedrooms" numeric,
  	"image_id" integer,
  	"ical_url" varchar,
  	"pricing_from_per_night" numeric,
  	"rating_average" numeric,
  	"rating_count" numeric,
  	"synced_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "villas_locales" (
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"image_alt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "villas_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "apartments_pricing_seasons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"start" timestamp(3) with time zone NOT NULL,
  	"end" timestamp(3) with time zone NOT NULL,
  	"price_per_night" numeric NOT NULL
  );
  
  CREATE TABLE "apartments_pricing_seasons_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "apartments_reviews" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"comment" varchar NOT NULL,
  	"author" varchar,
  	"rating" numeric,
  	"date" varchar
  );
  
  CREATE TABLE "apartments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"apartment_id" varchar NOT NULL,
  	"location" "enum_apartments_location" NOT NULL,
  	"guests" numeric,
  	"bedrooms" numeric,
  	"image_id" integer,
  	"pricing_from_per_night" numeric,
  	"rating_average" numeric,
  	"rating_count" numeric,
  	"synced_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "apartments_locales" (
  	"name" varchar NOT NULL,
  	"area" varchar,
  	"description" varchar,
  	"image_alt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "apartments_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "reservations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"calendar_key" varchar NOT NULL,
  	"start_date" timestamp(3) with time zone NOT NULL,
  	"end_date" timestamp(3) with time zone NOT NULL,
  	"guest_name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "contacts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"topic" "enum_contacts_topic",
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"message" varchar,
  	"locale" varchar,
  	"read" boolean DEFAULT false,
  	"notified" "enum_contacts_notified",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "inquiries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"villa_slug" varchar,
  	"villa_name" varchar,
  	"check_in" varchar,
  	"check_out" varchar,
  	"guests" numeric,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"message" varchar,
  	"locale" varchar,
  	"read" boolean DEFAULT false,
  	"notified" "enum_inquiries_notified",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"villas_id" integer,
  	"apartments_id" integer,
  	"reservations_id" integer,
  	"contacts_id" integer,
  	"inquiries_id" integer,
  	"media_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "texts_metadata" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "texts_metadata_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "texts_common" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "texts_common_locales" (
  	"brand" varchar,
  	"brand_short" varchar,
  	"locale_fi" varchar,
  	"locale_en" varchar,
  	"menu_open" varchar,
  	"menu_close" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "texts_nav" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "texts_nav_locales" (
  	"home" varchar,
  	"villas" varchar,
  	"apartments" varchar,
  	"contact" varchar,
  	"help_menu" varchar,
  	"faq" varchar,
  	"checkout" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "texts_footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "texts_footer_locales" (
  	"tagline" varchar,
  	"contact" varchar,
  	"rights" varchar,
  	"privacy" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "texts_home" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_image_id" integer,
  	"story_image_id" integer,
  	"editorial_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "texts_home_locales" (
  	"hero_eyebrow" varchar,
  	"hero_title" varchar,
  	"hero_subtitle" varchar,
  	"hero_image_alt" varchar,
  	"hero_cta" varchar,
  	"hero_cta_secondary" varchar,
  	"villas_eyebrow" varchar,
  	"villas_title" varchar,
  	"villas_subtitle" varchar,
  	"villas_meta" varchar,
  	"villas_explore" varchar,
  	"villas_cta" varchar,
  	"apartments_eyebrow" varchar,
  	"apartments_title" varchar,
  	"apartments_subtitle" varchar,
  	"apartments_cta" varchar,
  	"story_eyebrow" varchar,
  	"story_title" varchar,
  	"story_image_alt" varchar,
  	"story_paragraph1" varchar,
  	"story_paragraph2" varchar,
  	"story_paragraph3" varchar,
  	"editorial_eyebrow" varchar,
  	"editorial_title" varchar,
  	"editorial_subtitle" varchar,
  	"editorial_image_alt" varchar,
  	"editorial_cta" varchar,
  	"trust_eyebrow" varchar,
  	"trust_item1_title" varchar,
  	"trust_item1_text" varchar,
  	"trust_item2_title" varchar,
  	"trust_item2_text" varchar,
  	"trust_item3_title" varchar,
  	"trust_item3_text" varchar,
  	"cta_title" varchar,
  	"cta_subtitle" varchar,
  	"cta_button" varchar,
  	"stats_eyebrow" varchar,
  	"stats_rating" varchar,
  	"stats_reviews" varchar,
  	"stats_homes" varchar,
  	"stats_regions" varchar,
  	"highlights_eyebrow" varchar,
  	"highlights_title" varchar,
  	"highlights_subtitle" varchar,
  	"highlights_lakeside" varchar,
  	"highlights_slopes" varchar,
  	"home_reviews_eyebrow" varchar,
  	"home_reviews_title" varchar,
  	"home_reviews_subtitle" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "texts_villas" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "texts_villas_locales" (
  	"metadata_title" varchar,
  	"metadata_description" varchar,
  	"eyebrow" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"city_hint" varchar,
  	"city_hint_link" varchar,
  	"meta" varchar,
  	"explore" varchar,
  	"locations_tahko" varchar,
  	"locations_helsinki" varchar,
  	"locations_vantaa" varchar,
  	"filters_label" varchar,
  	"filters_all" varchar,
  	"filters_tahko" varchar,
  	"filters_helsinki" varchar,
  	"filters_vantaa" varchar,
  	"empty_title" varchar,
  	"empty_subtitle" varchar,
  	"empty_cta" varchar,
  	"detail_back" varchar,
  	"detail_mobile_cta_label" varchar,
  	"detail_amenities_title" varchar,
  	"detail_units_title" varchar,
  	"detail_units_subtitle" varchar,
  	"detail_unit_meta" varchar,
  	"detail_amenities_sauna" varchar,
  	"detail_amenities_wifi" varchar,
  	"detail_amenities_jacuzzi" varchar,
  	"detail_amenities_pets" varchar,
  	"detail_amenities_beds" varchar,
  	"detail_amenities_kitchen" varchar,
  	"detail_amenities_fireplace" varchar,
  	"detail_amenities_parking" varchar,
  	"detail_booking_title" varchar,
  	"detail_booking_body" varchar,
  	"detail_booking_direct" varchar,
  	"detail_booking_rating" varchar,
  	"detail_gallery_open_lightbox" varchar,
  	"detail_gallery_lightbox_title" varchar,
  	"detail_gallery_expand" varchar,
  	"detail_gallery_close" varchar,
  	"detail_gallery_prev" varchar,
  	"detail_gallery_next" varchar,
  	"detail_calendar_title" varchar,
  	"detail_calendar_sync_hint" varchar,
  	"detail_calendar_unavailable" varchar,
  	"detail_calendar_unit_label" varchar,
  	"detail_calendar_prev_month" varchar,
  	"detail_calendar_next_month" varchar,
  	"detail_calendar_legend_free" varchar,
  	"detail_calendar_legend_booked" varchar,
  	"detail_calendar_booked_day" varchar,
  	"detail_calendar_free_day" varchar,
  	"detail_calendar_weekdays_mon" varchar,
  	"detail_calendar_weekdays_tue" varchar,
  	"detail_calendar_weekdays_wed" varchar,
  	"detail_calendar_weekdays_thu" varchar,
  	"detail_calendar_weekdays_fri" varchar,
  	"detail_calendar_weekdays_sat" varchar,
  	"detail_calendar_weekdays_sun" varchar,
  	"detail_form_title" varchar,
  	"detail_form_subtitle" varchar,
  	"detail_form_name" varchar,
  	"detail_form_email" varchar,
  	"detail_form_phone" varchar,
  	"detail_form_check_in" varchar,
  	"detail_form_check_out" varchar,
  	"detail_form_guests" varchar,
  	"detail_form_message" varchar,
  	"detail_form_submit" varchar,
  	"detail_form_sending" varchar,
  	"detail_form_success" varchar,
  	"detail_form_error" varchar,
  	"detail_form_privacy_note" varchar,
  	"detail_form_privacy_link" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "texts_apartments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "texts_apartments_locales" (
  	"metadata_title" varchar,
  	"metadata_description" varchar,
  	"review_count" varchar,
  	"eyebrow" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"inquire" varchar,
  	"show_reviews" varchar,
  	"hide_reviews" varchar,
  	"empty_title" varchar,
  	"empty_subtitle" varchar,
  	"locations_vantaa" varchar,
  	"locations_helsinki" varchar,
  	"filters_label" varchar,
  	"filters_all" varchar,
  	"filters_vantaa" varchar,
  	"filters_helsinki" varchar,
  	"inquiry_title" varchar,
  	"inquiry_subtitle" varchar,
  	"inquiry_cta" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "texts_contact" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "texts_contact_locales" (
  	"metadata_title" varchar,
  	"metadata_description" varchar,
  	"eyebrow" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"info_title" varchar,
  	"info_description" varchar,
  	"info_email_label" varchar,
  	"info_response_label" varchar,
  	"info_response" varchar,
  	"info_booking_label" varchar,
  	"info_booking" varchar,
  	"form_name" varchar,
  	"form_email" varchar,
  	"form_phone" varchar,
  	"form_topic" varchar,
  	"form_topics_general" varchar,
  	"form_topics_villa" varchar,
  	"form_topics_apartment" varchar,
  	"form_message" varchar,
  	"form_submit" varchar,
  	"form_sending" varchar,
  	"form_success" varchar,
  	"form_error" varchar,
  	"form_prefill_apartment" varchar,
  	"form_privacy_note" varchar,
  	"form_privacy_link" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "texts_faq" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "texts_faq_locales" (
  	"metadata_title" varchar,
  	"metadata_description" varchar,
  	"eyebrow" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"items_pets_question" varchar,
  	"items_pets_answer" varchar,
  	"items_bed_linens_question" varchar,
  	"items_bed_linens_answer" varchar,
  	"items_check_in_out_question" varchar,
  	"items_check_in_out_answer" varchar,
  	"items_cleaning_question" varchar,
  	"items_cleaning_answer" varchar,
  	"items_keys_question" varchar,
  	"items_keys_answer" varchar,
  	"items_kitchen_question" varchar,
  	"items_kitchen_answer" varchar,
  	"items_cancellation_question" varchar,
  	"items_cancellation_answer" varchar,
  	"items_booking_question" varchar,
  	"items_booking_answer" varchar,
  	"cta_title" varchar,
  	"cta_subtitle" varchar,
  	"cta_button" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "texts_checkout_checkout_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "texts_checkout_cleaning_kitchen_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "texts_checkout_cleaning_other_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "texts_checkout_cleaning_outdoor_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "texts_checkout" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "texts_checkout_locales" (
  	"metadata_title" varchar,
  	"metadata_description" varchar,
  	"eyebrow" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"checkout_title" varchar,
  	"cleaning_title" varchar,
  	"cleaning_intro" varchar,
  	"cleaning_kitchen_title" varchar,
  	"cleaning_other_title" varchar,
  	"cleaning_outdoor_title" varchar,
  	"cleaning_note" varchar,
  	"cta_eyebrow" varchar,
  	"cta_title" varchar,
  	"cta_subtitle" varchar,
  	"cta_button" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "texts_pricing" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "texts_pricing_locales" (
  	"from_per_night" varchar,
  	"per_night" varchar,
  	"disclaimer" varchar,
  	"seasons_title" varchar,
  	"other_times" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "texts_reviews" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "texts_reviews_locales" (
  	"title" varchar,
  	"summary" varchar,
  	"showing_subset" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "texts_privacy" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "texts_privacy_locales" (
  	"metadata_title" varchar,
  	"metadata_description" varchar,
  	"eyebrow" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"updated_at" varchar,
  	"sections_controller_title" varchar,
  	"sections_controller_body" varchar,
  	"sections_data_collected_title" varchar,
  	"sections_data_collected_body" varchar,
  	"sections_purpose_title" varchar,
  	"sections_purpose_body" varchar,
  	"sections_legal_basis_title" varchar,
  	"sections_legal_basis_body" varchar,
  	"sections_retention_title" varchar,
  	"sections_retention_body" varchar,
  	"sections_sharing_title" varchar,
  	"sections_sharing_body" varchar,
  	"sections_rights_title" varchar,
  	"sections_rights_body" varchar,
  	"sections_contact_title" varchar,
  	"sections_contact_body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "texts_not_found" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "texts_not_found_locales" (
  	"title" varchar,
  	"description" varchar,
  	"cta" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "villas_long_description" ADD CONSTRAINT "villas_long_description_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."villas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "villas_amenities" ADD CONSTRAINT "villas_amenities_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."villas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "villas_units" ADD CONSTRAINT "villas_units_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."villas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "villas_units_locales" ADD CONSTRAINT "villas_units_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."villas_units"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "villas_pricing_seasons" ADD CONSTRAINT "villas_pricing_seasons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."villas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "villas_pricing_seasons_locales" ADD CONSTRAINT "villas_pricing_seasons_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."villas_pricing_seasons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "villas_reviews" ADD CONSTRAINT "villas_reviews_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."villas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "villas" ADD CONSTRAINT "villas_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "villas_locales" ADD CONSTRAINT "villas_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."villas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "villas_rels" ADD CONSTRAINT "villas_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."villas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "villas_rels" ADD CONSTRAINT "villas_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "apartments_pricing_seasons" ADD CONSTRAINT "apartments_pricing_seasons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."apartments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "apartments_pricing_seasons_locales" ADD CONSTRAINT "apartments_pricing_seasons_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."apartments_pricing_seasons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "apartments_reviews" ADD CONSTRAINT "apartments_reviews_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."apartments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "apartments" ADD CONSTRAINT "apartments_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "apartments_locales" ADD CONSTRAINT "apartments_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."apartments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "apartments_rels" ADD CONSTRAINT "apartments_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."apartments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "apartments_rels" ADD CONSTRAINT "apartments_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_villas_fk" FOREIGN KEY ("villas_id") REFERENCES "public"."villas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_apartments_fk" FOREIGN KEY ("apartments_id") REFERENCES "public"."apartments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reservations_fk" FOREIGN KEY ("reservations_id") REFERENCES "public"."reservations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contacts_fk" FOREIGN KEY ("contacts_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_inquiries_fk" FOREIGN KEY ("inquiries_id") REFERENCES "public"."inquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "texts_metadata_locales" ADD CONSTRAINT "texts_metadata_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."texts_metadata"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "texts_common_locales" ADD CONSTRAINT "texts_common_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."texts_common"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "texts_nav_locales" ADD CONSTRAINT "texts_nav_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."texts_nav"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "texts_footer_locales" ADD CONSTRAINT "texts_footer_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."texts_footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "texts_home" ADD CONSTRAINT "texts_home_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "texts_home" ADD CONSTRAINT "texts_home_story_image_id_media_id_fk" FOREIGN KEY ("story_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "texts_home" ADD CONSTRAINT "texts_home_editorial_image_id_media_id_fk" FOREIGN KEY ("editorial_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "texts_home_locales" ADD CONSTRAINT "texts_home_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."texts_home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "texts_villas_locales" ADD CONSTRAINT "texts_villas_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."texts_villas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "texts_apartments_locales" ADD CONSTRAINT "texts_apartments_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."texts_apartments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "texts_contact_locales" ADD CONSTRAINT "texts_contact_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."texts_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "texts_faq_locales" ADD CONSTRAINT "texts_faq_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."texts_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "texts_checkout_checkout_steps" ADD CONSTRAINT "texts_checkout_checkout_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."texts_checkout"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "texts_checkout_cleaning_kitchen_steps" ADD CONSTRAINT "texts_checkout_cleaning_kitchen_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."texts_checkout"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "texts_checkout_cleaning_other_steps" ADD CONSTRAINT "texts_checkout_cleaning_other_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."texts_checkout"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "texts_checkout_cleaning_outdoor_steps" ADD CONSTRAINT "texts_checkout_cleaning_outdoor_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."texts_checkout"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "texts_checkout_locales" ADD CONSTRAINT "texts_checkout_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."texts_checkout"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "texts_pricing_locales" ADD CONSTRAINT "texts_pricing_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."texts_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "texts_reviews_locales" ADD CONSTRAINT "texts_reviews_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."texts_reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "texts_privacy_locales" ADD CONSTRAINT "texts_privacy_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."texts_privacy"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "texts_not_found_locales" ADD CONSTRAINT "texts_not_found_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."texts_not_found"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "villas_long_description_order_idx" ON "villas_long_description" USING btree ("_order");
  CREATE INDEX "villas_long_description_parent_id_idx" ON "villas_long_description" USING btree ("_parent_id");
  CREATE INDEX "villas_long_description_locale_idx" ON "villas_long_description" USING btree ("_locale");
  CREATE INDEX "villas_amenities_order_idx" ON "villas_amenities" USING btree ("order");
  CREATE INDEX "villas_amenities_parent_idx" ON "villas_amenities" USING btree ("parent_id");
  CREATE INDEX "villas_units_order_idx" ON "villas_units" USING btree ("_order");
  CREATE INDEX "villas_units_parent_id_idx" ON "villas_units" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "villas_units_locales_locale_parent_id_unique" ON "villas_units_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "villas_units_locales_parent_id_idx" ON "villas_units_locales" USING btree ("_parent_id");
  CREATE INDEX "villas_pricing_seasons_order_idx" ON "villas_pricing_seasons" USING btree ("_order");
  CREATE INDEX "villas_pricing_seasons_parent_id_idx" ON "villas_pricing_seasons" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "villas_pricing_seasons_locales_locale_parent_id_unique" ON "villas_pricing_seasons_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "villas_pricing_seasons_locales_parent_id_idx" ON "villas_pricing_seasons_locales" USING btree ("_parent_id");
  CREATE INDEX "villas_reviews_order_idx" ON "villas_reviews" USING btree ("_order");
  CREATE INDEX "villas_reviews_parent_id_idx" ON "villas_reviews" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "villas_slug_idx" ON "villas" USING btree ("slug");
  CREATE INDEX "villas_image_idx" ON "villas" USING btree ("image_id");
  CREATE INDEX "villas_updated_at_idx" ON "villas" USING btree ("updated_at");
  CREATE INDEX "villas_created_at_idx" ON "villas" USING btree ("created_at");
  CREATE UNIQUE INDEX "villas_locales_locale_parent_id_unique" ON "villas_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "villas_locales_parent_id_idx" ON "villas_locales" USING btree ("_parent_id");
  CREATE INDEX "villas_rels_order_idx" ON "villas_rels" USING btree ("order");
  CREATE INDEX "villas_rels_parent_idx" ON "villas_rels" USING btree ("parent_id");
  CREATE INDEX "villas_rels_path_idx" ON "villas_rels" USING btree ("path");
  CREATE INDEX "villas_rels_media_id_idx" ON "villas_rels" USING btree ("media_id");
  CREATE INDEX "apartments_pricing_seasons_order_idx" ON "apartments_pricing_seasons" USING btree ("_order");
  CREATE INDEX "apartments_pricing_seasons_parent_id_idx" ON "apartments_pricing_seasons" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "apartments_pricing_seasons_locales_locale_parent_id_unique" ON "apartments_pricing_seasons_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "apartments_pricing_seasons_locales_parent_id_idx" ON "apartments_pricing_seasons_locales" USING btree ("_parent_id");
  CREATE INDEX "apartments_reviews_order_idx" ON "apartments_reviews" USING btree ("_order");
  CREATE INDEX "apartments_reviews_parent_id_idx" ON "apartments_reviews" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "apartments_apartment_id_idx" ON "apartments" USING btree ("apartment_id");
  CREATE INDEX "apartments_image_idx" ON "apartments" USING btree ("image_id");
  CREATE INDEX "apartments_updated_at_idx" ON "apartments" USING btree ("updated_at");
  CREATE INDEX "apartments_created_at_idx" ON "apartments" USING btree ("created_at");
  CREATE UNIQUE INDEX "apartments_locales_locale_parent_id_unique" ON "apartments_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "apartments_locales_parent_id_idx" ON "apartments_locales" USING btree ("_parent_id");
  CREATE INDEX "apartments_rels_order_idx" ON "apartments_rels" USING btree ("order");
  CREATE INDEX "apartments_rels_parent_idx" ON "apartments_rels" USING btree ("parent_id");
  CREATE INDEX "apartments_rels_path_idx" ON "apartments_rels" USING btree ("path");
  CREATE INDEX "apartments_rels_media_id_idx" ON "apartments_rels" USING btree ("media_id");
  CREATE INDEX "reservations_updated_at_idx" ON "reservations" USING btree ("updated_at");
  CREATE INDEX "reservations_created_at_idx" ON "reservations" USING btree ("created_at");
  CREATE INDEX "contacts_updated_at_idx" ON "contacts" USING btree ("updated_at");
  CREATE INDEX "contacts_created_at_idx" ON "contacts" USING btree ("created_at");
  CREATE INDEX "inquiries_updated_at_idx" ON "inquiries" USING btree ("updated_at");
  CREATE INDEX "inquiries_created_at_idx" ON "inquiries" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_locales_parent_id_idx" ON "media_locales" USING btree ("_parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_villas_id_idx" ON "payload_locked_documents_rels" USING btree ("villas_id");
  CREATE INDEX "payload_locked_documents_rels_apartments_id_idx" ON "payload_locked_documents_rels" USING btree ("apartments_id");
  CREATE INDEX "payload_locked_documents_rels_reservations_id_idx" ON "payload_locked_documents_rels" USING btree ("reservations_id");
  CREATE INDEX "payload_locked_documents_rels_contacts_id_idx" ON "payload_locked_documents_rels" USING btree ("contacts_id");
  CREATE INDEX "payload_locked_documents_rels_inquiries_id_idx" ON "payload_locked_documents_rels" USING btree ("inquiries_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE UNIQUE INDEX "texts_metadata_locales_locale_parent_id_unique" ON "texts_metadata_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "texts_metadata_locales_parent_id_idx" ON "texts_metadata_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "texts_common_locales_locale_parent_id_unique" ON "texts_common_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "texts_common_locales_parent_id_idx" ON "texts_common_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "texts_nav_locales_locale_parent_id_unique" ON "texts_nav_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "texts_nav_locales_parent_id_idx" ON "texts_nav_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "texts_footer_locales_locale_parent_id_unique" ON "texts_footer_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "texts_footer_locales_parent_id_idx" ON "texts_footer_locales" USING btree ("_parent_id");
  CREATE INDEX "texts_home_hero_hero_image_idx" ON "texts_home" USING btree ("hero_image_id");
  CREATE INDEX "texts_home_story_story_image_idx" ON "texts_home" USING btree ("story_image_id");
  CREATE INDEX "texts_home_editorial_editorial_image_idx" ON "texts_home" USING btree ("editorial_image_id");
  CREATE UNIQUE INDEX "texts_home_locales_locale_parent_id_unique" ON "texts_home_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "texts_home_locales_parent_id_idx" ON "texts_home_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "texts_villas_locales_locale_parent_id_unique" ON "texts_villas_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "texts_villas_locales_parent_id_idx" ON "texts_villas_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "texts_apartments_locales_locale_parent_id_unique" ON "texts_apartments_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "texts_apartments_locales_parent_id_idx" ON "texts_apartments_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "texts_contact_locales_locale_parent_id_unique" ON "texts_contact_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "texts_contact_locales_parent_id_idx" ON "texts_contact_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "texts_faq_locales_locale_parent_id_unique" ON "texts_faq_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "texts_faq_locales_parent_id_idx" ON "texts_faq_locales" USING btree ("_parent_id");
  CREATE INDEX "texts_checkout_checkout_steps_order_idx" ON "texts_checkout_checkout_steps" USING btree ("_order");
  CREATE INDEX "texts_checkout_checkout_steps_parent_id_idx" ON "texts_checkout_checkout_steps" USING btree ("_parent_id");
  CREATE INDEX "texts_checkout_checkout_steps_locale_idx" ON "texts_checkout_checkout_steps" USING btree ("_locale");
  CREATE INDEX "texts_checkout_cleaning_kitchen_steps_order_idx" ON "texts_checkout_cleaning_kitchen_steps" USING btree ("_order");
  CREATE INDEX "texts_checkout_cleaning_kitchen_steps_parent_id_idx" ON "texts_checkout_cleaning_kitchen_steps" USING btree ("_parent_id");
  CREATE INDEX "texts_checkout_cleaning_kitchen_steps_locale_idx" ON "texts_checkout_cleaning_kitchen_steps" USING btree ("_locale");
  CREATE INDEX "texts_checkout_cleaning_other_steps_order_idx" ON "texts_checkout_cleaning_other_steps" USING btree ("_order");
  CREATE INDEX "texts_checkout_cleaning_other_steps_parent_id_idx" ON "texts_checkout_cleaning_other_steps" USING btree ("_parent_id");
  CREATE INDEX "texts_checkout_cleaning_other_steps_locale_idx" ON "texts_checkout_cleaning_other_steps" USING btree ("_locale");
  CREATE INDEX "texts_checkout_cleaning_outdoor_steps_order_idx" ON "texts_checkout_cleaning_outdoor_steps" USING btree ("_order");
  CREATE INDEX "texts_checkout_cleaning_outdoor_steps_parent_id_idx" ON "texts_checkout_cleaning_outdoor_steps" USING btree ("_parent_id");
  CREATE INDEX "texts_checkout_cleaning_outdoor_steps_locale_idx" ON "texts_checkout_cleaning_outdoor_steps" USING btree ("_locale");
  CREATE UNIQUE INDEX "texts_checkout_locales_locale_parent_id_unique" ON "texts_checkout_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "texts_checkout_locales_parent_id_idx" ON "texts_checkout_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "texts_pricing_locales_locale_parent_id_unique" ON "texts_pricing_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "texts_pricing_locales_parent_id_idx" ON "texts_pricing_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "texts_reviews_locales_locale_parent_id_unique" ON "texts_reviews_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "texts_reviews_locales_parent_id_idx" ON "texts_reviews_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "texts_privacy_locales_locale_parent_id_unique" ON "texts_privacy_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "texts_privacy_locales_parent_id_idx" ON "texts_privacy_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "texts_not_found_locales_locale_parent_id_unique" ON "texts_not_found_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "texts_not_found_locales_parent_id_idx" ON "texts_not_found_locales" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "villas_long_description" CASCADE;
  DROP TABLE "villas_amenities" CASCADE;
  DROP TABLE "villas_units" CASCADE;
  DROP TABLE "villas_units_locales" CASCADE;
  DROP TABLE "villas_pricing_seasons" CASCADE;
  DROP TABLE "villas_pricing_seasons_locales" CASCADE;
  DROP TABLE "villas_reviews" CASCADE;
  DROP TABLE "villas" CASCADE;
  DROP TABLE "villas_locales" CASCADE;
  DROP TABLE "villas_rels" CASCADE;
  DROP TABLE "apartments_pricing_seasons" CASCADE;
  DROP TABLE "apartments_pricing_seasons_locales" CASCADE;
  DROP TABLE "apartments_reviews" CASCADE;
  DROP TABLE "apartments" CASCADE;
  DROP TABLE "apartments_locales" CASCADE;
  DROP TABLE "apartments_rels" CASCADE;
  DROP TABLE "reservations" CASCADE;
  DROP TABLE "contacts" CASCADE;
  DROP TABLE "inquiries" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "texts_metadata" CASCADE;
  DROP TABLE "texts_metadata_locales" CASCADE;
  DROP TABLE "texts_common" CASCADE;
  DROP TABLE "texts_common_locales" CASCADE;
  DROP TABLE "texts_nav" CASCADE;
  DROP TABLE "texts_nav_locales" CASCADE;
  DROP TABLE "texts_footer" CASCADE;
  DROP TABLE "texts_footer_locales" CASCADE;
  DROP TABLE "texts_home" CASCADE;
  DROP TABLE "texts_home_locales" CASCADE;
  DROP TABLE "texts_villas" CASCADE;
  DROP TABLE "texts_villas_locales" CASCADE;
  DROP TABLE "texts_apartments" CASCADE;
  DROP TABLE "texts_apartments_locales" CASCADE;
  DROP TABLE "texts_contact" CASCADE;
  DROP TABLE "texts_contact_locales" CASCADE;
  DROP TABLE "texts_faq" CASCADE;
  DROP TABLE "texts_faq_locales" CASCADE;
  DROP TABLE "texts_checkout_checkout_steps" CASCADE;
  DROP TABLE "texts_checkout_cleaning_kitchen_steps" CASCADE;
  DROP TABLE "texts_checkout_cleaning_other_steps" CASCADE;
  DROP TABLE "texts_checkout_cleaning_outdoor_steps" CASCADE;
  DROP TABLE "texts_checkout" CASCADE;
  DROP TABLE "texts_checkout_locales" CASCADE;
  DROP TABLE "texts_pricing" CASCADE;
  DROP TABLE "texts_pricing_locales" CASCADE;
  DROP TABLE "texts_reviews" CASCADE;
  DROP TABLE "texts_reviews_locales" CASCADE;
  DROP TABLE "texts_privacy" CASCADE;
  DROP TABLE "texts_privacy_locales" CASCADE;
  DROP TABLE "texts_not_found" CASCADE;
  DROP TABLE "texts_not_found_locales" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_villas_amenities";
  DROP TYPE "public"."enum_villas_location";
  DROP TYPE "public"."enum_apartments_location";
  DROP TYPE "public"."enum_contacts_topic";
  DROP TYPE "public"."enum_contacts_notified";
  DROP TYPE "public"."enum_inquiries_notified";`)
}
