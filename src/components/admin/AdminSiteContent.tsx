"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  SECTION_LABELS,
  SECTION_PREVIEW,
  SECTION_PREVIEW_EN,
  collectStringFields,
  humanizeKey,
  setByPath,
  type JsonObject,
} from "@/lib/admin/site-content-utils";
import { buildPreviewSrc, cmsLabel } from "@/lib/cms/cms-keys";
import {
  adminCardClass,
  adminInputClass,
  adminLabelClass,
  adminPillActive,
  adminPillIdle,
  adminSaveBarClass,
  adminTextareaClass,
} from "./admin-ui";

type Locale = "fi" | "en";

type SiteMessages = JsonObject;

type FieldRow = {
  path: string;
  value: string;
  label: string;
};

function isImagePath(path: string, value: string): boolean {
  return path.endsWith(".image") || (path.includes("image") && value.startsWith("/images/"));
}

function buildFieldRows(sectionData: JsonObject, search: string): FieldRow[] {
  const query = search.trim().toLowerCase();
  return collectStringFields(sectionData)
    .map((field) => ({
      ...field,
      label: humanizeKey(field.path.split(".").pop() ?? field.path),
    }))
    .filter((field) => {
      if (!query) return true;
      return (
        field.path.toLowerCase().includes(query) ||
        field.label.toLowerCase().includes(query) ||
        field.value.toLowerCase().includes(query)
      );
    });
}

type PreviewMessage =
  | { type: "cms:focus"; key: string; label: string }
  | { type: "cms:reload" };

/** Viesti esikatselu-iframelle. Sama origin → silta hyväksyy. */
function postToPreview(iframe: HTMLIFrameElement | null, message: PreviewMessage) {
  iframe?.contentWindow?.postMessage(message, window.location.origin);
}

const PREVIEW_STORAGE_KEY = "tv-admin-preview";

function FieldEditor({
  field,
  onChange,
  onFocus,
}: {
  field: FieldRow;
  onChange: (path: string, value: string) => void;
  onFocus: (path: string) => void;
}) {
  const multiline =
    field.value.length > 120 ||
    field.value.includes("\n") ||
    field.path.endsWith(".answer") ||
    field.path.endsWith(".body") ||
    field.path.endsWith(".description");

  return (
    <div className={adminCardClass}>
      <label className={adminLabelClass} htmlFor={field.path}>
        {field.label}
      </label>
      <p className="mt-1 font-mono text-[10px] text-slate-400">{field.path}</p>
      {multiline ? (
        <textarea
          id={field.path}
          value={field.value}
          rows={Math.min(10, Math.max(3, Math.ceil(field.value.length / 80)))}
          onChange={(event) => onChange(field.path, event.target.value)}
          onFocus={() => onFocus(field.path)}
          className={adminTextareaClass}
        />
      ) : (
        <input
          id={field.path}
          type="text"
          value={field.value}
          onChange={(event) => onChange(field.path, event.target.value)}
          onFocus={() => onFocus(field.path)}
          className={adminInputClass}
        />
      )}
      {isImagePath(field.path, field.value) && (
        <p className="mt-2 text-xs text-slate-500">
          Kuvapolku — esim. /images/properties/villa-puolukka/18.jpg
        </p>
      )}
      {field.path.includes("metadata") && (
        <p className="mt-2 text-xs text-slate-500">
          {field.value.length} merkkiä — SEO-kentät näkyvät hakukoneissa
        </p>
      )}
    </div>
  );
}

export function AdminSiteContent() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }
  const [locale, setLocale] = useState<Locale>("fi");
  const [messages, setMessages] = useState<{ fi: SiteMessages; en: SiteMessages } | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [section, setSection] = useState("home");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(PREVIEW_STORAGE_KEY) === "0") setPreviewOpen(false);
    } catch {
      // localStorage estetty → oletus (auki) riittää
    }
  }, []);

  function togglePreview() {
    setPreviewOpen((open) => {
      try {
        window.localStorage.setItem(PREVIEW_STORAGE_KEY, open ? "0" : "1");
      } catch {
        // ei kriittistä
      }
      return !open;
    });
  }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/site-content");
      if (!response.ok) throw new Error("Unauthorized");
      const data = (await response.json()) as { fi: SiteMessages; en: SiteMessages };
      setMessages(data);
      setSavedSnapshot(JSON.stringify(data));
      const firstSection = Object.keys(data.fi)[0] ?? "home";
      setSection(firstSection);
    } catch {
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const currentMessages = messages?.[locale] ?? null;
  const sectionKeys = useMemo(
    () => (messages ? Object.keys(messages.fi) : []),
    [messages],
  );

  const sectionData = useMemo(() => {
    if (!currentMessages) return null;
    const value = currentMessages[section];
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return value as JsonObject;
  }, [currentMessages, section]);

  const fields = useMemo(
    () => (sectionData ? buildFieldRows(sectionData, search) : []),
    [sectionData, search],
  );

  const dirty =
    messages !== null && JSON.stringify(messages) !== savedSnapshot;

  // ADMIN-GUIDE lupaa varoituksen ennen sivulta poistumista — pelkkä
  // "Tallentamattomia muutoksia" -teksti ei estänyt tekstien menettämistä.
  useEffect(() => {
    if (!dirty) return;

    function warn(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // Esikatselu klikkasi osiota → hyppää sen teksteihin.
  useEffect(() => {
    function onMessage(event: MessageEvent<{ type?: string; key?: string }>) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "cms:select" || !event.data.key) return;
      const key = event.data.key;
      const [nextSection, ...rest] = key.split(".");
      if (!sectionKeys.includes(nextSection)) return;
      setSection(nextSection);
      setSearch("");
      setActiveKey(key);
      postToPreview(iframeRef.current, {
        type: "cms:focus",
        key,
        label: cmsLabel(key, SECTION_LABELS),
      });
      const prefix = rest.join(".");
      window.setTimeout(() => {
        const first = prefix
          ? document.querySelector<HTMLElement>(`[id^="${prefix}"]`)
          : document.querySelector<HTMLElement>("input[id], textarea[id]");
        first?.scrollIntoView({ behavior: "smooth", block: "center" });
        first?.focus({ preventScroll: true });
      }, 50);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [sectionKeys]);

  function handleFieldFocus(path: string) {
    const key = `${section}.${path}`;
    setActiveKey(key);
    postToPreview(iframeRef.current, {
      type: "cms:focus",
      key,
      label: cmsLabel(key, SECTION_LABELS),
    });
  }

  function updateField(path: string, value: string) {
    if (!messages) return;
    const sectionRoot = messages[locale][section];
    if (!sectionRoot || typeof sectionRoot !== "object" || Array.isArray(sectionRoot)) {
      return;
    }

    const updatedSection = setByPath(sectionRoot as JsonObject, path, value);
    setMessages({
      ...messages,
      [locale]: {
        ...messages[locale],
        [section]: updatedSection,
      },
    });
    setStatus("");
  }

  async function handleSave() {
    if (!messages) return;
    setSaving(true);
    setStatus("");

    try {
      for (const loc of ["fi", "en"] as const) {
        const response = await fetch("/api/admin/site-content", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale: loc, messages: messages[loc] }),
        });
        if (!response.ok) throw new Error("Save failed");
      }

      setSavedSnapshot(JSON.stringify(messages));
      setStatus("Tallennettu — muutokset näkyvät sivustolla.");
      router.refresh();
      postToPreview(iframeRef.current, { type: "cms:reload" });
    } catch {
      setStatus("Tallennus epäonnistui. Yritä uudelleen.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !messages || !currentMessages) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
        Ladataan sivuston tekstejä…
      </div>
    );
  }

  const previewPath = SECTION_PREVIEW[section];
  const previewSrc = buildPreviewSrc(section, locale, {
    fi: SECTION_PREVIEW,
    en: SECTION_PREVIEW_EN,
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-slate-200 bg-white px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Sivuston tekstit</h1>
            <p className="mt-1 text-sm text-slate-500">
              Kaikki sivuston tekstit FI/EN — muutokset tallennetaan ja päivittyvät julkiselle sivulle.
            </p>
            {activeKey && (
              <p className="mt-1 text-xs font-medium text-forest">
                Muokkaat: {cmsLabel(activeKey, SECTION_LABELS)}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={togglePreview}
              aria-pressed={previewOpen}
              className={`hidden rounded-lg border px-3 py-2 text-sm lg:inline-flex ${
                previewOpen
                  ? "border-forest bg-forest/10 text-forest"
                  : "border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {previewOpen ? "Piilota esikatselu" : "Näytä esikatselu"}
            </button>
            {(["fi", "en"] as const).map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setLocale(loc)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  locale === loc ? adminPillActive : adminPillIdle
                }`}
              >
                {loc === "fi" ? "Suomi" : "English"}
              </button>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Kirjaudu ulos
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Hae kenttiä tai tekstiä…"
            className={`${adminInputClass} mt-0 max-w-md`}
          />
          {previewPath && (
            <a
              href={locale === "en" ? `/en${previewPath === "/" ? "" : previewPath}` : previewPath}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-forest underline-offset-2 hover:underline"
            >
              Avaa julkisella sivulla ↗
            </a>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-slate-50 p-3 lg:block">
          <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Osiot
          </p>
          <ul className="mt-2 space-y-0.5">
            {sectionKeys.map((key) => (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => {
                    setSection(key);
                    setSearch("");
                  }}
                  className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    section === key ? adminPillActive : "text-slate-700 hover:bg-slate-200/70"
                  }`}
                >
                  {SECTION_LABELS[key] ?? humanizeKey(key)}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mb-4 lg:hidden">
            <label className={adminLabelClass} htmlFor="section-mobile">
              Osa
            </label>
            <select
              id="section-mobile"
              value={section}
              onChange={(event) => setSection(event.target.value)}
              className={adminInputClass}
            >
              {sectionKeys.map((key) => (
                <option key={key} value={key}>
                  {SECTION_LABELS[key] ?? humanizeKey(key)}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <h2 className="text-base font-semibold text-slate-900">
              {SECTION_LABELS[section] ?? humanizeKey(section)}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {fields.length} muokattavaa kenttää ({locale.toUpperCase()})
            </p>
          </div>

          {fields.length === 0 ? (
            <p className="text-sm text-slate-500">Ei kenttiä haulla tai tässä osiossa.</p>
          ) : (
            <div className="space-y-4 pb-28">
              {fields.map((field) => (
                <FieldEditor
                  key={`${locale}-${section}-${field.path}`}
                  field={field}
                  onChange={updateField}
                  onFocus={handleFieldFocus}
                />
              ))}
            </div>
          )}
        </div>

        {previewOpen && (
          <div className="hidden w-[46%] shrink-0 border-l border-slate-200 bg-slate-100 lg:flex lg:flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
              <span>Esikatselu — klikkaa sivun osiota avataksesi sen tekstit</span>
              <a
                href={previewSrc.replace("?cms=1", "")}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-forest hover:underline"
              >
                Avaa ↗
              </a>
            </div>
            <iframe
              ref={iframeRef}
              key={previewSrc}
              src={previewSrc}
              title="Sivuston esikatselu"
              className="h-full min-h-0 w-full flex-1 bg-white"
            />
          </div>
        )}
      </div>

      <div className={adminSaveBarClass}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm">
            {dirty ? (
              <span className="font-medium text-amber-700">Tallentamattomia muutoksia</span>
            ) : (
              <span className="text-slate-500">Kaikki muutokset tallennettu</span>
            )}
            {status && <p className="mt-1 text-slate-600">{status}</p>}
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty || saving}
            className="rounded-lg bg-forest px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Tallennetaan…" : "Tallenna kaikki tekstit"}
          </button>
        </div>
      </div>
    </div>
  );
}
