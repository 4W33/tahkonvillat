"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BRAND_LOGO, BRAND_NAME } from "@/lib/constants";
import type { Availability } from "@/types/availability";
import type { StoredInquiry } from "@/types/inquiry";
import type { Reservation } from "@/types/villa";
import type { AdminProperty } from "@/lib/admin/properties";
import { AdminIcalSources } from "./AdminIcalSources";
import { AdminInbox } from "./AdminInbox";
import { AdminPricing } from "./AdminPricing";
import { AdminProperties } from "./AdminProperties";
import { AdminHomePage } from "./AdminHomePage";
import { AdminSiteContent } from "./AdminSiteContent";
import { ReservationModal } from "./ReservationModal";

type AdminView =
  | "home"
  | "content"
  | "calendar"
  | "ical"
  | "properties"
  | "pricing"
  | "inquiries"
  | "contacts";

const DAY_WIDTH = 42;
const ROW_HEIGHT = 52;

type Props = {
  properties: AdminProperty[];
};

function formatMonthLabel(year: number, month: number) {
  return new Date(year, month, 1).toLocaleDateString("fi-FI", {
    month: "long",
    year: "numeric",
  });
}

function getMonthDays(year: number, month: number) {
  const last = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: last }, (_, i) => {
    const day = i + 1;
    const date = new Date(year, month, day);
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return {
      iso,
      label: day,
      weekday: date.toLocaleDateString("fi-FI", { weekday: "short" }),
    };
  });
}

function getBarSpan(
  reservation: Reservation,
  days: { iso: string }[],
): { start: number; span: number } | null {
  let start = -1;
  let end = -1;

  days.forEach((day, index) => {
    if (day.iso >= reservation.startDate && day.iso < reservation.endDate) {
      if (start === -1) start = index;
      end = index + 1;
    }
  });

  if (start === -1) return null;
  return { start, span: end - start };
}

export function AdminDashboard({ properties }: Props) {
  const router = useRouter();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [icalBookings, setIcalBookings] = useState<Record<string, Availability>>({});
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(
    properties[0]?.id || "",
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Reservation | null>(null);
  const [view, setView] = useState<AdminView>("home");
  const [reservationSeed, setReservationSeed] = useState<{
    propertySlug: string;
    guestName: string;
    startDate: string;
    endDate: string;
  } | null>(null);
  const [navOpen, setNavOpen] = useState(false);

  function selectView(next: AdminView) {
    setView(next);
    setNavOpen(false);
  }

  const days = useMemo(
    () => getMonthDays(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const loadReservations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/reservations");
      if (!response.ok) throw new Error("Unauthorized");
      const data = await response.json();
      setReservations(data);
      // Airbnb-varaukset (iCal, 3 h välimuisti) harmaina palkkeina — virhe ei kaada näkymää.
      try {
        const icalRes = await fetch("/api/admin/ical-bookings");
        if (icalRes.ok) {
          setIcalBookings((await icalRes.json()) as Record<string, Availability>);
        }
      } catch {
        setIcalBookings({});
      }
    } catch {
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  function shiftMonth(delta: number) {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  async function handleSave(
    data: {
      propertySlug: string;
      guestName: string;
      startDate: string;
      endDate: string;
    },
    id?: string,
  ) {
    const response = await fetch(
      id ? `/api/admin/reservations/${id}` : "/api/admin/reservations",
      {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || "Tallennus epäonnistui");
    }

    await loadReservations();
  }

  async function handleDelete(id: string) {
    const response = await fetch(`/api/admin/reservations/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Poisto epäonnistui");
    await loadReservations();
  }

  function openCreate() {
    setEditing(null);
    setReservationSeed(null);
    setModalOpen(true);
  }

  function openFromInquiry(inquiry: StoredInquiry) {
    const propertyExists = properties.some((p) => p.id === inquiry.villaSlug);
    setEditing(null);
    setReservationSeed({
      propertySlug: propertyExists
        ? inquiry.villaSlug
        : properties[0]?.id || inquiry.villaSlug,
      guestName: inquiry.name,
      startDate: inquiry.checkIn,
      endDate: inquiry.checkOut,
    });
    setSelectedProperty(
      propertyExists ? inquiry.villaSlug : properties[0]?.id || "",
    );
    setView("calendar");
    setModalOpen(true);
  }

  function openEdit(reservation: Reservation) {
    setEditing(reservation);
    setReservationSeed(null);
    setModalOpen(true);
  }

  const villas = properties.filter((p) => p.group === "villa");
  const apartments = properties.filter((p) => p.group === "apartment");

  const sidebar = (
    <>
        <div className="border-b border-slate-200 px-4 py-4">
          <Image
            src={BRAND_LOGO}
            alt={BRAND_NAME}
            width={80}
            height={80}
            className="h-16 w-16 object-contain"
          />
          <p className="mt-2 text-xs text-slate-500">Admin</p>
        </div>

        <nav className="border-b border-slate-200 p-3">
          <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Sisältö
          </p>
          <ul className="mt-1 space-y-0.5">
            {(
              [
                ["home", "Etusivu — kuvat"],
                ["content", "Sivuston tekstit"],
                ["properties", "Kohteet"],
              ] as const
            ).map(([id, label]) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => selectView(id)}
                  className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    view === id
                      ? "bg-forest text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>

          <p className="mt-4 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Toiminnot
          </p>
          <ul className="mt-1 space-y-0.5">
            {(
              [
                ["calendar", "Kalenteri"],
                ["ical", "Airbnb-kalenterit"],
                ["pricing", "Hinnat"],
                ["inquiries", "Varausehdotukset"],
                ["contacts", "Yhteydenotot"],
              ] as const
            ).map(([id, label]) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => selectView(id)}
                  className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    view === id
                      ? "bg-forest text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {view === "calendar" && (
        <nav className="p-3">
          <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Villat
          </p>
          <ul className="mt-1 space-y-0.5">
            {villas.map((property) => (
              <li key={property.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProperty(property.id);
                    setNavOpen(false);
                  }}
                  className={`w-full rounded px-3 py-2.5 text-left text-sm ${
                    selectedProperty === property.id
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {property.name}
                </button>
              </li>
            ))}
          </ul>

          <p className="mt-4 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Asunnot
          </p>
          <ul className="mt-1 space-y-0.5">
            {apartments.map((property) => (
              <li key={property.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProperty(property.id);
                    setNavOpen(false);
                  }}
                  className={`w-full rounded px-3 py-2.5 text-left text-sm ${
                    selectedProperty === property.id
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {property.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        )}
    </>
  );

  return (
    <div className="flex min-h-screen">
      {navOpen && (
        <button
          type="button"
          aria-label="Sulje valikko"
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={() => setNavOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${
          navOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {sidebar}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className={`flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 ${
            view === "content" || view === "home" ? "hidden" : ""
          }`}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setNavOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded border border-slate-300 text-lg hover:bg-slate-50 lg:hidden"
              aria-label="Avaa valikko"
            >
              ☰
            </button>
          {view === "calendar" ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                className="inline-flex h-10 min-w-10 items-center justify-center rounded border border-slate-300 px-3 text-sm hover:bg-slate-50"
              >
                ‹
              </button>
              <h1 className="min-w-[10rem] text-center text-sm font-semibold capitalize">
                {formatMonthLabel(viewYear, viewMonth)}
              </h1>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                className="inline-flex h-10 min-w-10 items-center justify-center rounded border border-slate-300 px-3 text-sm hover:bg-slate-50"
              >
                ›
              </button>
            </div>
          ) : (
            <h1 className="text-sm font-semibold text-slate-900">
              {view === "home"
                ? "Etusivu — kuvat"
                : view === "content"
                  ? "Sivuston tekstit"
                  : view === "properties"
                  ? "Kohteet"
                  : view === "ical"
                  ? "Airbnb-kalenterit"
                  : view === "pricing"
                    ? "Hinnat"
                    : view === "inquiries"
                      ? "Varausehdotukset"
                      : "Yhteydenotot"}
            </h1>
          )}
          </div>

          <div className="flex items-center gap-2">
            {view === "calendar" && (
              <button
                type="button"
                onClick={openCreate}
                className="rounded bg-teal-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-800"
              >
                + Uusi varaus
              </button>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              Kirjaudu ulos
            </button>
          </div>
        </header>

        <div
          className={`flex-1 overflow-auto ${view === "content" || view === "home" ? "p-0" : "p-4"}`}
        >
          {view === "home" ? (
            <AdminHomePage />
          ) : view === "content" ? (
            <AdminSiteContent />
          ) : view === "properties" ? (
            <AdminProperties />
          ) : view === "pricing" ? (
            <AdminPricing properties={properties} />
          ) : view === "ical" ? (
            <AdminIcalSources />
          ) : view !== "calendar" ? (
            <AdminInbox
              view={view}
              onCreateReservation={
                view === "inquiries" ? openFromInquiry : undefined
              }
            />
          ) : loading ? (
            <p className="text-sm text-slate-500">Ladataan…</p>
          ) : (
            <div className="flex min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white">
              <div className="relative z-10 w-44 shrink-0 border-r border-slate-200 bg-white shadow-[4px_0_10px_-6px_rgba(15,23,42,0.18)]">
                <div
                  className="flex items-center border-b border-slate-200 bg-slate-50 px-3 text-xs font-semibold uppercase text-slate-500"
                  style={{ height: ROW_HEIGHT }}
                >
                  Kohde
                </div>
                {properties.map((property) => (
                  <div
                    key={property.id}
                    className={`flex items-center border-b border-slate-100 px-3 text-sm font-medium text-slate-800 last:border-b-0 ${
                      selectedProperty === property.id ? "bg-teal-50" : "bg-white"
                    }`}
                    style={{ height: ROW_HEIGHT }}
                  >
                    <span className="line-clamp-2 leading-snug">{property.name}</span>
                  </div>
                ))}
              </div>

              <div className="min-w-0 flex-1 overflow-x-auto">
                <div style={{ width: days.length * DAY_WIDTH }}>
                  <div
                    className="flex border-b border-slate-200 bg-slate-50"
                    style={{ height: ROW_HEIGHT }}
                  >
                    {days.map((day) => (
                      <div
                        key={day.iso}
                        style={{ width: DAY_WIDTH }}
                        className="flex shrink-0 flex-col items-center justify-center border-r border-slate-100 px-1"
                      >
                        <div className="text-[10px] uppercase text-slate-400">
                          {day.weekday}
                        </div>
                        <div className="text-xs font-medium text-slate-700">
                          {day.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {properties.map((property) => {
                    const propertyReservations = reservations.filter(
                      (r) => r.propertySlug === property.id,
                    );
                    const isSelected = selectedProperty === property.id;

                    return (
                      <div
                        key={property.id}
                        className={`relative border-b border-slate-100 last:border-b-0 ${
                          isSelected ? "bg-teal-50/40" : ""
                        }`}
                        style={{ height: ROW_HEIGHT }}
                      >
                        <div className="absolute inset-0 flex">
                          {days.map((day) => (
                            <div
                              key={day.iso}
                              style={{ width: DAY_WIDTH }}
                              className="shrink-0 border-r border-slate-50"
                            />
                          ))}
                        </div>

                        {propertyReservations.map((reservation) => {
                          const span = getBarSpan(reservation, days);
                          if (!span) return null;

                          return (
                            <button
                              key={reservation.id}
                              type="button"
                              onClick={() => openEdit(reservation)}
                              className="absolute top-2 z-[1] flex h-8 items-center overflow-hidden rounded-full bg-teal-600 px-2 text-left text-xs font-medium text-white shadow-sm hover:bg-teal-700"
                              style={{
                                left: span.start * DAY_WIDTH + 2,
                                width: span.span * DAY_WIDTH - 4,
                              }}
                              title={`${reservation.guestName} · ${reservation.startDate} → ${reservation.endDate}`}
                            >
                              <span className="truncate">
                                {reservation.guestName}
                              </span>
                            </button>
                          );
                        })}

                        {Object.values(icalBookings)
                          .filter(
                            (a) =>
                              a.key === property.id ||
                              a.key.startsWith(`${property.id}:`),
                          )
                          .flatMap((a) =>
                            a.booked
                              .filter((r) => r.source === "airbnb")
                              .map((r) => ({ ...r, key: a.key })),
                          )
                          .map((r) => {
                            const span = getBarSpan(
                              {
                                id: r.key,
                                propertySlug: property.id,
                                guestName: "",
                                startDate: r.start,
                                endDate: r.end,
                              },
                              days,
                            );
                            if (!span) return null;
                            const unit = r.key.includes(":")
                              ? r.key.split(":")[1].toUpperCase()
                              : "";
                            return (
                              <div
                                key={`${r.key}-${r.start}`}
                                className="absolute bottom-1 z-[1] flex h-4 items-center overflow-hidden rounded bg-slate-300 px-1.5 text-[10px] font-medium text-slate-700"
                                style={{
                                  left: span.start * DAY_WIDTH + 2,
                                  width: span.span * DAY_WIDTH - 4,
                                }}
                                title={`Airbnb${unit ? ` · ${unit}` : ""} · ${r.start} → ${r.end}`}
                              >
                                <span className="truncate">
                                  Airbnb{unit ? ` ${unit}` : ""}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ReservationModal
        open={modalOpen}
        properties={properties}
        reservation={editing}
        defaultPropertyId={selectedProperty}
        seedForm={reservationSeed}
        onClose={() => {
          setModalOpen(false);
          setReservationSeed(null);
        }}
        onSave={handleSave}
        onDelete={editing ? handleDelete : undefined}
      />
    </div>
  );
}
