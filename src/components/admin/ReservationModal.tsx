"use client";

import { FormEvent, useEffect, useState } from "react";
import type { Reservation } from "@/types/villa";
import type { AdminProperty } from "@/lib/admin/properties";

type FormData = {
  propertySlug: string;
  guestName: string;
  startDate: string;
  endDate: string;
};

type Props = {
  open: boolean;
  properties: AdminProperty[];
  reservation: Reservation | null;
  defaultPropertyId?: string;
  seedForm?: FormData | null;
  onClose: () => void;
  onSave: (data: FormData, id?: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
};

const emptyForm = (propertySlug: string): FormData => ({
  propertySlug,
  guestName: "",
  startDate: "",
  endDate: "",
});

export function ReservationModal({
  open,
  properties,
  reservation,
  defaultPropertyId,
  seedForm,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [form, setForm] = useState<FormData>(
    emptyForm(defaultPropertyId || properties[0]?.id || ""),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    if (reservation) {
      setForm({
        propertySlug: reservation.propertySlug,
        guestName: reservation.guestName,
        startDate: reservation.startDate,
        endDate: reservation.endDate,
      });
    } else if (seedForm) {
      setForm({
        propertySlug:
          seedForm.propertySlug ||
          defaultPropertyId ||
          properties[0]?.id ||
          "",
        guestName: seedForm.guestName,
        startDate: seedForm.startDate,
        endDate: seedForm.endDate,
      });
    } else {
      setForm(emptyForm(defaultPropertyId || properties[0]?.id || ""));
    }
    setError("");
  }, [open, reservation, defaultPropertyId, properties, seedForm]);

  if (!open) return null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await onSave(form, reservation?.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tallennus epäonnistui");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!reservation?.id || !onDelete) return;
    if (!confirm("Poistetaanko varaus?")) return;

    setLoading(true);
    try {
      await onDelete(reservation.id);
      onClose();
    } catch {
      setError("Poisto epäonnistui");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-md bg-white p-5 shadow-lg">
        <h2 className="text-lg font-semibold">
          {reservation ? "Muokkaa varausta" : "Uusi varaus"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-medium uppercase text-slate-500">
              Kohde
            </label>
            <select
              value={form.propertySlug}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, propertySlug: e.target.value }))
              }
              className={inputClass}
              required
            >
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium uppercase text-slate-500">
              Vieras
            </label>
            <input
              value={form.guestName}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, guestName: e.target.value }))
              }
              className={inputClass}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium uppercase text-slate-500">
                Saapuminen
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, startDate: e.target.value }))
                }
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium uppercase text-slate-500">
                Lähtö
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className={inputClass}
                required
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? "Tallennetaan…" : "Tallenna"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
            >
              Peruuta
            </button>
            {reservation && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="ml-auto rounded border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50"
              >
                Poista
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
