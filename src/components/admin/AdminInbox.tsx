"use client";

import { useCallback, useEffect, useState } from "react";
import type { StoredContact } from "@/types/contact";
import type { StoredInquiry } from "@/types/inquiry";

type View = "inquiries" | "contacts";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fi-FI", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const TOPIC_LABELS: Record<StoredContact["topic"], string> = {
  villa: "Villa",
  apartment: "Asunto",
  general: "Yleinen",
};

/** Näkyy vain kun lähetystä yritettiin ja se epäonnistui (ei kun sähköpostia ei ole konfiguroitu). */
function NotifyFailedBadge({ notified }: { notified?: boolean | null }) {
  if (notified !== false) return null;
  return (
    <span
      className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-800"
      title="Sähköposti-ilmoitusta ei saatu lähetettyä — viesti on tallessa tässä"
    >
      Ilmoitus epäonnistui
    </span>
  );
}

type Props = {
  view: View;
  onCreateReservation?: (inquiry: StoredInquiry) => void;
};

export function AdminInbox({ view, onCreateReservation }: Props) {
  const [inquiries, setInquiries] = useState<StoredInquiry[]>([]);
  const [contacts, setContacts] = useState<StoredContact[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [inqRes, cntRes] = await Promise.all([
        fetch("/api/admin/inquiries"),
        fetch("/api/admin/contacts"),
      ]);
      if (inqRes.ok) setInquiries(await inqRes.json());
      if (cntRes.ok) setContacts(await cntRes.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function markInquiryRead(id: string) {
    await fetch("/api/admin/inquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setInquiries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  }

  async function markContactRead(id: string) {
    await fetch("/api/admin/contacts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setContacts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Ladataan…</p>;
  }

  if (view === "inquiries") {
    if (!inquiries.length) {
      return (
        <p className="text-sm text-slate-500">Ei varausehdotuksia vielä.</p>
      );
    }

    return (
      <ul className="space-y-3">
        {inquiries.map((item) => (
          <li
            key={item.id}
            className={`rounded-md border p-4 ${
              item.read
                ? "border-slate-200 bg-white"
                : "border-teal-200 bg-teal-50/50"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium text-slate-900">
                  {item.villaName}
                  {!item.read && (
                    <span className="ml-2 rounded bg-teal-700 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">
                      Uusi
                    </span>
                  )}
                  <NotifyFailedBadge notified={item.notified} />
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {item.name} ·{" "}
                  <a
                    href={`mailto:${item.email}`}
                    className="text-teal-700 hover:underline"
                  >
                    {item.email}
                  </a>
                  {item.phone ? ` · ${item.phone}` : ""}
                </p>
              </div>
              <p className="text-xs text-slate-400">{formatDate(item.createdAt)}</p>
            </div>
            <p className="mt-2 text-sm text-slate-700">
              {item.checkIn} → {item.checkOut} · {item.guests} hlö
            </p>
            <p className="mt-3 whitespace-pre-wrap text-sm text-slate-800">
              {item.message}
            </p>
            <div className="mt-3 flex flex-wrap gap-4">
              {onCreateReservation && (
                <button
                  type="button"
                  onClick={() => onCreateReservation(item)}
                  className="text-xs font-medium text-slate-900 hover:underline"
                >
                  Luo varaus kalenteriin
                </button>
              )}
              {!item.read && (
                <button
                  type="button"
                  onClick={() => markInquiryRead(item.id)}
                  className="text-xs font-medium text-teal-700 hover:underline"
                >
                  Merkitse luetuksi
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (!contacts.length) {
    return <p className="text-sm text-slate-500">Ei yhteydenottoja vielä.</p>;
  }

  return (
    <ul className="space-y-3">
      {contacts.map((item) => (
        <li
          key={item.id}
          className={`rounded-md border p-4 ${
            item.read
              ? "border-slate-200 bg-white"
              : "border-teal-200 bg-teal-50/50"
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-medium text-slate-900">
                {item.name}
                {!item.read && (
                  <span className="ml-2 rounded bg-teal-700 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">
                    Uusi
                  </span>
                )}
                <NotifyFailedBadge notified={item.notified} />
              </p>
              <p className="mt-1 text-sm text-slate-600">
                <a
                  href={`mailto:${item.email}`}
                  className="text-teal-700 hover:underline"
                >
                  {item.email}
                </a>
                {item.phone ? ` · ${item.phone}` : ""}
              </p>
            </div>
            <p className="text-xs text-slate-400">{formatDate(item.createdAt)}</p>
          </div>
          <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            {TOPIC_LABELS[item.topic]}
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">
            {item.message}
          </p>
          {!item.read && (
            <button
              type="button"
              onClick={() => markContactRead(item.id)}
              className="mt-3 text-xs font-medium text-teal-700 hover:underline"
            >
              Merkitse luetuksi
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
