"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminProperty } from "@/lib/admin/properties";
import type { PricingStore } from "@/types/pricing";

type Props = {
  properties: AdminProperty[];
};

export function AdminPricing({ properties }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadPricing = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/pricing");
      if (!response.ok) throw new Error("Unauthorized");
      const data = (await response.json()) as PricingStore;
      const next: Record<string, string> = {};
      for (const property of properties) {
        next[property.id] =
          data[property.id]?.fromPerNight != null
            ? String(data[property.id].fromPerNight)
            : "";
      }
      setValues(next);
    } catch {
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  }, [properties, router]);

  useEffect(() => {
    loadPricing();
  }, [loadPricing]);

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      const payload: PricingStore = {};
      for (const property of properties) {
        const raw = values[property.id]?.trim();
        if (!raw) continue;
        const amount = Number(raw.replace(",", "."));
        if (!Number.isFinite(amount) || amount <= 0) continue;
        payload[property.id] = {
          fromPerNight: Math.round(amount),
          currency: "EUR",
        };
      }

      const response = await fetch("/api/admin/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Tallennus epäonnistui");
      setMessage("Hinnat tallennettu.");
      await loadPricing();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Tallennus epäonnistui");
    } finally {
      setSaving(false);
    }
  }

  const villas = properties.filter((p) => p.group === "villa");
  const apartments = properties.filter((p) => p.group === "apartment");

  if (loading) {
    return <p className="p-6 text-sm text-slate-500">Ladataan hintoja…</p>;
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl">
        <h2 className="text-lg font-semibold text-slate-900">Ohjehinnat</h2>
        <p className="mt-2 text-sm text-slate-600">
          Syötä Airbnb-listauksen mukainen alkaen-hinta (€ / yö). Sivulla näkyy
          ohjehinta — lopullinen hinta vahvistetaan aina tiedustelussa.
        </p>

        <div className="mt-8 space-y-8">
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Villat
            </h3>
            <ul className="mt-3 space-y-3">
              {villas.map((property) => (
                <li
                  key={property.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-4 py-3"
                >
                  <span className="font-medium text-slate-800">{property.name}</span>
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    Alkaen
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={values[property.id] ?? ""}
                      onChange={(event) =>
                        setValues((prev) => ({
                          ...prev,
                          [property.id]: event.target.value,
                        }))
                      }
                      className="w-28 rounded-md border border-slate-300 px-3 py-2 text-right text-slate-900"
                      placeholder="—"
                    />
                    € / yö
                  </label>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Asunnot
            </h3>
            <ul className="mt-3 space-y-3">
              {apartments.map((property) => (
                <li
                  key={property.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-4 py-3"
                >
                  <span className="font-medium text-slate-800">{property.name}</span>
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    Alkaen
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={values[property.id] ?? ""}
                      onChange={(event) =>
                        setValues((prev) => ({
                          ...prev,
                          [property.id]: event.target.value,
                        }))
                      }
                      className="w-28 rounded-md border border-slate-300 px-3 py-2 text-right text-slate-900"
                      placeholder="—"
                    />
                    € / yö
                  </label>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? "Tallennetaan…" : "Tallenna hinnat"}
          </button>
          {message && (
            <p className="text-sm text-slate-600" role="status">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
