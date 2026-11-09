"use client";

import { FormEvent, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FormSuccess } from "@/components/ui/FormSuccess";

type Props = {
  locale: string;
  initialTopic?: FormState["topic"];
  initialMessage?: string;
};

type FormState = {
  name: string;
  email: string;
  phone: string;
  topic: "villa" | "apartment" | "general";
  message: string;
};

function buildInitialState(
  initialTopic?: FormState["topic"],
  initialMessage?: string,
): FormState {
  return {
    name: "",
    email: "",
    phone: "",
    topic: initialTopic ?? "general",
    message: initialMessage ?? "",
  };
}

export function ContactForm({
  locale,
  initialTopic,
  initialMessage,
}: Props) {
  const t = useTranslations("contact.form");
  const [form, setForm] = useState<FormState>(() =>
    buildInitialState(initialTopic, initialMessage),
  );
  const website = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          topic: form.topic,
          message: form.message.trim(),
          locale,
          website: website.current?.value ?? "",
        }),
      });

      // Palvelimen virheteksti on englanniksi: näytetään aina lokalisoitu t("error")
      if (!response.ok) throw new Error();

      setForm(buildInitialState());
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="card p-6 sm:p-7">
      {status === "success" ? (
        <FormSuccess message={t("success")} />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Roskapostiansa: piilotettu ruudun ulkopuolelle ja ruudunlukijoilta, botti täyttää sen */}
          <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <input ref={website} type="text" name="website" tabIndex={-1} autoComplete="off" />
          </div>
          <div>
            <label htmlFor="contact-name" className="label-field">
              {t("name")}
            </label>
            <input
              id="contact-name"
              maxLength={200}
              required
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="contact-email" className="label-field">
              {t("email")}
            </label>
            <input
              id="contact-email"
              maxLength={200}
              type="email"
              required
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="contact-phone" className="label-field">
              {t("phone")}
            </label>
            <input
              id="contact-phone"
              maxLength={200}
              type="tel"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="contact-topic" className="label-field">
              {t("topic")}
            </label>
            <select
              id="contact-topic"
              value={form.topic}
              onChange={(e) =>
                updateField("topic", e.target.value as FormState["topic"])
              }
              className="input-field"
            >
              <option value="general">{t("topics.general")}</option>
              <option value="villa">{t("topics.villa")}</option>
              <option value="apartment">{t("topics.apartment")}</option>
            </select>
          </div>

          <div>
            <label htmlFor="contact-message" className="label-field">
              {t("message")}
            </label>
            <textarea
              id="contact-message"
              maxLength={5000}
              required
              rows={5}
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

          <p className="font-sans text-[0.9375rem] leading-relaxed text-forest-600">
            {t("privacyNote")}{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-ink">
              {t("privacyLink")}
            </Link>
            .
          </p>

          <button
            type="submit"
            disabled={status === "loading"}
            className="btn-primary w-full disabled:translate-y-0 disabled:opacity-60"
          >
            {status === "loading" ? t("sending") : t("submit")}
          </button>
        </form>
      )}
    </div>
  );
}
