"use client";

import { FormEvent, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FormSuccess } from "@/components/ui/FormSuccess";

type Props = {
  villaSlug: string;
  villaName: string;
  maxGuests: number;
  locale: string;
};

type FormState = {
  name: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  message: string;
};

const initialState: FormState = {
  name: "",
  email: "",
  phone: "",
  checkIn: "",
  checkOut: "",
  guests: "2",
  message: "",
};

export function VillaInquiryForm({
  villaSlug,
  villaName,
  maxGuests,
  locale,
}: Props) {
  const t = useTranslations("villas.detail.form");
  const [form, setForm] = useState<FormState>(initialState);
  const website = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          villaSlug,
          villaName,
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          checkIn: form.checkIn,
          checkOut: form.checkOut,
          guests: Number(form.guests),
          message: form.message.trim(),
          locale,
          website: website.current?.value ?? "",
        }),
      });

      // Palvelimen virheteksti on englanniksi: näytetään aina lokalisoitu t("error")
      if (!response.ok) throw new Error();

      setForm(initialState);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div
      id="villa-inquiry"
      className="card scroll-mt-24 p-5 pb-28 sm:p-6 lg:pb-6"
    >
      <h3 className="font-display text-2xl font-semibold text-forest">{t("title")}</h3>
      <p className="mt-2 font-sans text-[0.9375rem] leading-relaxed text-forest-600">
        {t("subtitle")}
      </p>

      {status === "success" ? (
        <FormSuccess message={t("success")} />
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Roskapostiansa: piilotettu ruudun ulkopuolelle ja ruudunlukijoilta, botti täyttää sen */}
          <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <input ref={website} type="text" name="website" tabIndex={-1} autoComplete="off" />
          </div>
          <div>
            <label htmlFor="name" className="label-field">
              {t("name")}
            </label>
            <input
              id="name"
              maxLength={200}
              required
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="email" className="label-field">
              {t("email")}
            </label>
            <input
              id="email"
              maxLength={200}
              type="email"
              required
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="phone" className="label-field">
              {t("phone")}
            </label>
            <input
              id="phone"
              maxLength={200}
              type="tel"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className="input-field"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="checkIn" className="label-field">
                {t("checkIn")}
              </label>
              <input
                id="checkIn"
                type="date"
                required
                value={form.checkIn}
                onChange={(e) => updateField("checkIn", e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="checkOut" className="label-field">
                {t("checkOut")}
              </label>
              <input
                id="checkOut"
                type="date"
                required
                value={form.checkOut}
                onChange={(e) => updateField("checkOut", e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label htmlFor="guests" className="label-field">
              {t("guests")}
            </label>
            <input
              id="guests"
              type="number"
              min={1}
              max={maxGuests}
              required
              value={form.guests}
              onChange={(e) => updateField("guests", e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="message" className="label-field">
              {t("message")}
            </label>
            <textarea
              id="message"
              maxLength={5000}
              required
              rows={4}
              value={form.message}
              onChange={(e) => updateField("message", e.target.value)}
              className="input-field resize-y"
            />
          </div>

          {status === "error" && (
            <p role="alert" className="font-sans text-[0.9375rem] text-red-700">
              {t("error")}
            </p>
          )}

          <p className="font-sans text-[0.9375rem] leading-relaxed text-forest/60">
            {t("privacyNote")}{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-forest">
              {t("privacyLink")}
            </Link>
            .
          </p>

          <button
            type="submit"
            disabled={status === "loading"}
            className="btn-primary w-full disabled:translate-y-0 disabled:opacity-60 disabled:hover:shadow-soft"
          >
            {status === "loading" ? t("sending") : t("submit")}
          </button>
        </form>
      )}
    </div>
  );
}
