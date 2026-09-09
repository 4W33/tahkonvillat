"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminProperty } from "@/lib/admin/properties";
import { validateSeasons } from "@/lib/pricing/seasons";
import type { PriceSeason, PricingStore } from "@/types/pricing";
import { adminCardClass, adminInputClass, adminLabelClass } from "./admin-ui";

type SeasonRow = {
  id: string;
  start: string;
  end: string;
  price: string;
  labelFi: string;
  labelEn: string;
};
type Row = { base: string; seasons: SeasonRow[] };

type Props = { properties: AdminProperty[] };

function toRows(store: PricingStore, properties: AdminProperty[]): Record<string, Row> {
  const rows: Record<string, Row> = {};
  for (const p of properties) {
    const entry = store[p.id];
    rows[p.id] = {
      base: entry?.fromPerNight != null ? String(entry.fromPerNight) : "",
      seasons: (entry?.seasons ?? []).map((s) => ({
        id: s.id,
        start: s.start,
        end: s.end,
        price: String(s.pricePerNight),
        labelFi: s.label?.fi ?? "",
        labelEn: s.label?.en ?? "",
      })),
    };
  }
  return rows;
}

function toSeason(row: SeasonRow): PriceSeason {
  const label =
    row.labelFi.trim() || row.labelEn.trim()
      ? { fi: row.labelFi.trim(), en: row.labelEn.trim() }
      : undefined;
  return {
    id: row.id,
    start: row.start,
    end: row.end,
    pricePerNight: Number(row.price.replace(",", ".")),
    ...(label ? { label } : {}),
  };
}

export function AdminPricing({ properties }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState<Record<string, Row>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadPricing = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/pricing");
      if (!response.ok) throw new Error("Unauthorized");
      setRows(toRows((await response.json()) as PricingStore, properties));
    } catch {
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  }, [properties, router]);

  useEffect(() => {
    void loadPricing();
  }, [loadPricing]);

  function updateBase(id: string, value: string) {
    setRows((prev) => ({ ...prev, [id]: { ...prev[id], base: value } }));
  }

  function updateSeason(id: string, seasonId: string, patch: Partial<SeasonRow>) {
    setRows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        seasons: prev[id].seasons.map((s) => (s.id === seasonId ? { ...s, ...patch } : s)),
      },
    }));
  }

  function addSeason(id: string) {
    setRows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        seasons: [
          ...prev[id].seasons,
          { id: `s-${Date.now()}`, start: "", end: "", price: "", labelFi: "", labelEn: "" },
        ],
      },
    }));
  }

  function removeSeason(id: string, seasonId: string) {
    setRows((prev) => ({
      ...prev,
      [id]: { ...prev[id], seasons: prev[id].seasons.filter((s) => s.id !== seasonId) },
    }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      const payload: PricingStore = {};
      for (const property of properties) {
        const row = rows[property.id];
        if (!row) continue;
        const base = Number((row.base || "0").replace(",", "."));
        const seasons = row.seasons.map(toSeason);
        const error = validateSeasons(seasons);
        if (error) throw new Error(`${property.name}: ${error}`);
        if (!(base > 0) && seasons.length === 0) continue;
        payload[property.id] = {
          ...(base > 0 ? { fromPerNight: Math.round(base) } : {}),
          currency: "EUR",
          ...(seasons.length ? { seasons } : {}),
        };
      }

      const response = await fetch("/api/admin/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Tallennus epäonnistui");
      setMessage("Hinnat tallennettu.");
      await loadPricing();
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Tallennus epäonnistui");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="p-6 text-sm text-slate-500">Ladataan hintoja…</p>;

  const groups = [
    { title: "Villat", items: properties.filter((p) => p.group === "villa") },
    { title: "Asunnot", items: properties.filter((p) => p.group === "apartment") },
  ];

  return (
    <div className="p-6">
      <div className="max-w-3xl">
        <h2 className="text-lg font-semibold text-slate-900">Hinnat</h2>
        <p className="mt-2 text-sm text-slate-600">
          Perushinta näkyy &quot;alkaen&quot;-hintana. Kaudet ovat ajanjaksoja, joilla on oma
          hinta (esim. 12.9.–30.9. → 250 €). Sivulla näkyy pienin tuleva hinta ja
          kausitaulukko. Lopullinen hinta vahvistetaan aina tiedustelussa.
        </p>

        <div className="mt-8 space-y-8">
          {groups.map((group) => (
            <section key={group.title}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                {group.title}
              </h3>
              <ul className="mt-3 space-y-4">
                {group.items.map((property) => {
                  const row = rows[property.id];
                  return (
                    <li key={property.id} className={adminCardClass}>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="font-medium text-slate-800">{property.name}</span>
                        <label className="flex items-center gap-2 text-sm text-slate-600">
                          Perushinta
                          <input
                            type="number"
                            min={0}
                            step={1}
                            value={row?.base ?? ""}
                            onChange={(event) => updateBase(property.id, event.target.value)}
                            className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-right text-slate-900"
                            placeholder="—"
                          />
                          € / yö
                        </label>
                      </div>

                      {row?.seasons.length ? (
                        <ul className="mt-4 space-y-3">
                          {row.seasons.map((season) => (
                            <li
                              key={season.id}
                              className="grid gap-2 rounded-lg bg-slate-50 p-3 sm:grid-cols-[1fr_1fr_6rem_1.4fr_auto] sm:items-end"
                            >
                              <div>
                                <label className={adminLabelClass} htmlFor={`${season.id}-start`}>
                                  Alkaa
                                </label>
                                <input
                                  id={`${season.id}-start`}
                                  type="date"
                                  value={season.start}
                                  onChange={(e) =>
                                    updateSeason(property.id, season.id, { start: e.target.value })
                                  }
                                  className={adminInputClass}
                                />
                              </div>
                              <div>
                                <label className={adminLabelClass} htmlFor={`${season.id}-end`}>
                                  Päättyy
                                </label>
                                <input
                                  id={`${season.id}-end`}
                                  type="date"
                                  value={season.end}
                                  onChange={(e) =>
                                    updateSeason(property.id, season.id, { end: e.target.value })
                                  }
                                  className={adminInputClass}
                                />
                              </div>
                              <div>
                                <label className={adminLabelClass} htmlFor={`${season.id}-price`}>
                                  € / yö
                                </label>
                                <input
                                  id={`${season.id}-price`}
                                  type="number"
                                  min={1}
                                  step={1}
                                  value={season.price}
                                  onChange={(e) =>
                                    updateSeason(property.id, season.id, { price: e.target.value })
                                  }
                                  className={`${adminInputClass} text-right`}
                                />
                              </div>
                              <div>
                                <span className={adminLabelClass}>Nimi (valinnainen) FI / EN</span>
                                <div className="flex gap-2">
                                  <input
                                    aria-label="Kauden nimi suomeksi"
                                    value={season.labelFi}
                                    onChange={(e) =>
                                      updateSeason(property.id, season.id, {
                                        labelFi: e.target.value,
                                      })
                                    }
                                    className={adminInputClass}
                                  />
                                  <input
                                    aria-label="Kauden nimi englanniksi"
                                    value={season.labelEn}
                                    onChange={(e) =>
                                      updateSeason(property.id, season.id, {
                                        labelEn: e.target.value,
                                      })
                                    }
                                    className={adminInputClass}
                                  />
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeSeason(property.id, season.id)}
                                className="mb-0.5 rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-600 hover:bg-white"
                                aria-label="Poista kausi"
                              >
                                Poista
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => addSeason(property.id)}
                        className="mt-3 text-sm font-medium text-forest hover:underline"
                      >
                        + Lisää kausi
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? "Tallennetaan…" : "Tallenna hinnat"}
          </button>
          {message && <p className="text-sm text-slate-600">{message}</p>}
        </div>
      </div>
    </div>
  );
}
