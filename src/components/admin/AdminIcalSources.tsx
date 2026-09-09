"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { BookedRange, CalendarKey, IcalSourceStore } from "@/types/availability";
import { adminCardClass, adminInputClass, adminLabelClass } from "./admin-ui";

type TestResult =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "ok"; count: number; next: BookedRange | null }
  | { state: "error"; error: string };

function formatFi(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d}.${m}.${y}`;
}

export function AdminIcalSources() {
  const router = useRouter();
  const [keys, setKeys] = useState<CalendarKey[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Record<string, string>>({});
  const [tests, setTests] = useState<Record<string, TestResult>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/ical-sources");
      if (!response.ok) throw new Error("Unauthorized");
      const data = (await response.json()) as {
        keys: CalendarKey[];
        sources: IcalSourceStore;
      };
      const next: Record<string, string> = {};
      for (const k of data.keys) next[k.key] = data.sources[k.key]?.url ?? "";
      setKeys(data.keys);
      setValues(next);
      setSaved(next);
    } catch {
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const dirty = JSON.stringify(values) !== JSON.stringify(saved);

  async function runTest(key: string) {
    const url = values[key]?.trim();
    if (!url) return;
    setTests((prev) => ({ ...prev, [key]: { state: "loading" } }));
    const response = await fetch("/api/admin/ical-sources/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = (await response.json()) as
      | { ok: true; count: number; next: BookedRange | null }
      | { ok: false; error: string };
    setTests((prev) => ({
      ...prev,
      [key]: data.ok
        ? { state: "ok", count: data.count, next: data.next }
        : { state: "error", error: data.error },
    }));
  }

  async function handleSave() {
    setSaving(true);
    setStatus("");
    try {
      const response = await fetch("/api/admin/ical-sources", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sources: values }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Tallennus epäonnistui");
      setSaved(values);
      setStatus("Tallennettu. Sivuston kalenterit päivittyvät noin 3 tunnin välein.");
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Tallennus epäonnistui");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Ladataan…</p>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className={adminCardClass}>
        <h2 className="text-base font-semibold text-slate-900">Näin kopioit linkin Airbnbstä</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-600">
          <li>
            Airbnb → Kalenteri → valitse kohde → <strong>Saatavuus</strong>
          </li>
          <li>
            Kohta <strong>Yhdistä kalenterit</strong> → <strong>Yhdistä toiseen sivustoon</strong>
          </li>
          <li>
            Kopioi Airbnbn kalenterilinkki (päättyy <code>.ics?s=…</code>) ja liitä alle
          </li>
        </ol>
        <p className="mt-2 text-xs text-slate-500">
          Sivusto hakee varaukset linkistä noin 3 tunnin välein. Linkki on salainen — älä jaa
          sitä.
        </p>
      </div>

      <ul className="space-y-4">
        {keys.map((k) => {
          const test = tests[k.key] ?? { state: "idle" };
          return (
            <li key={k.key} className={adminCardClass}>
              <label className={adminLabelClass} htmlFor={`ical-${k.key}`}>
                {k.label.fi}
              </label>
              <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
                <input
                  id={`ical-${k.key}`}
                  type="url"
                  inputMode="url"
                  placeholder="https://www.airbnb.com/calendar/ical/…ics?s=…"
                  value={values[k.key] ?? ""}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, [k.key]: event.target.value }))
                  }
                  className={`${adminInputClass} mt-0 flex-1 font-mono text-xs`}
                />
                <button
                  type="button"
                  onClick={() => runTest(k.key)}
                  disabled={!values[k.key]?.trim() || test.state === "loading"}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {test.state === "loading" ? "Testataan…" : "Testaa"}
                </button>
              </div>
              {test.state === "ok" && (
                <p className="mt-2 text-sm text-emerald-700">
                  Linkki toimii — {test.count} varausta.
                  {test.next
                    ? ` Seuraava: ${formatFi(test.next.start)}–${formatFi(test.next.end)}.`
                    : ""}
                </p>
              )}
              {test.state === "error" && (
                <p className="mt-2 text-sm text-red-700">{test.error}</p>
              )}
              {!values[k.key]?.trim() && (
                <p className="mt-2 text-xs text-slate-400">
                  Ei linkkiä — sivustolla ei näytetä Airbnb-varauksia tälle kohteelle.
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm">
          {dirty ? (
            <span className="font-medium text-amber-700">Tallentamattomia muutoksia</span>
          ) : (
            <span className="text-slate-500">Kaikki tallennettu</span>
          )}
          {status && <span className="ml-3 text-slate-600">{status}</span>}
        </p>
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving}
          className="rounded-lg bg-forest px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Tallennetaan…" : "Tallenna linkit"}
        </button>
      </div>
    </div>
  );
}
