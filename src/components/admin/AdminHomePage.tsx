"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminCardClass,
  adminPillActive,
  adminPillIdle,
} from "./admin-ui";

type BannerSlot = "hero" | "story" | "editorial";

type PropertyRow = {
  id: string;
  name: string;
  group: "villa" | "apartment";
  image: string;
  gallery: string[];
};

type HomeData = {
  banners: Record<BannerSlot, string>;
  properties: PropertyRow[];
  allImages: string[];
};

const BANNER_LABELS: Record<BannerSlot, string> = {
  hero: "Hero (iso taustakuva)",
  story: "Meistä-osio",
  editorial: "Luonto-kaista",
};

const MODE_LABELS = {
  banner: "Taustakuvat",
  covers: "Korttien kansikuvat",
} as const;

type EditMode = keyof typeof MODE_LABELS;

export function AdminHomePage() {
  const router = useRouter();
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [mode, setMode] = useState<EditMode>("banner");
  const [activeSlot, setActiveSlot] = useState<BannerSlot>("hero");
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/home-page");
      if (!response.ok) throw new Error("Unauthorized");
      const payload = (await response.json()) as HomeData;
      setData(payload);
      if (!activePropertyId && payload.properties[0]) {
        setActivePropertyId(payload.properties[0].id);
      }
    } catch {
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  }, [activePropertyId, router]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveBanner(slot: BannerSlot, image: string) {
    setSaving(true);
    setStatus("");
    try {
      const response = await fetch("/api/admin/home-page", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "banner", slot, image }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Tallennus epäonnistui");
      }
      setStatus(`${BANNER_LABELS[slot]} päivitetty.`);
      await load();
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Tallennus epäonnistui");
    } finally {
      setSaving(false);
    }
  }

  async function saveCover(propertyId: string, image: string) {
    setSaving(true);
    setStatus("");
    try {
      const response = await fetch("/api/admin/home-page", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cover", propertyId, image }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Tallennus epäonnistui");
      }
      setStatus("Kansikuva päivitetty — näkyy etusivun kortissa.");
      await load();
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Tallennus epäonnistui");
    } finally {
      setSaving(false);
    }
  }

  function handleImagePick(image: string) {
    if (!data || saving) return;

    if (mode === "banner") {
      void saveBanner(activeSlot, image);
      return;
    }

    if (activePropertyId) {
      void saveCover(activePropertyId, image);
    }
  }

  if (loading || !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
        Ladataan etusivua…
      </div>
    );
  }

  const activeProperty = data.properties.find((p) => p.id === activePropertyId);
  const imagePool =
    mode === "covers" && activeProperty ? activeProperty.gallery : data.allImages;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-slate-200 bg-white px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Etusivu — kuvat</h1>
            <p className="mt-1 text-sm text-slate-500">
              Valitse kuva klikkaamalla — ei tarvitse mennä Kohteet-editoriin.
            </p>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-forest underline-offset-2 hover:underline"
          >
            Avaa etusivu ↗
          </a>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(Object.keys(MODE_LABELS) as EditMode[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setMode(key)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                mode === key ? adminPillActive : adminPillIdle
              }`}
            >
              {MODE_LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {mode === "banner" ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {(Object.keys(BANNER_LABELS) as BannerSlot[]).map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setActiveSlot(slot)}
                className={`${adminCardClass} text-left transition ring-2 ${
                  activeSlot === slot ? "ring-forest" : "ring-transparent"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {BANNER_LABELS[slot]}
                </p>
                <div className="relative mt-3 aspect-[16/10] overflow-hidden rounded-lg bg-slate-100">
                  <Image
                    src={data.banners[slot]}
                    alt={BANNER_LABELS[slot]}
                    fill
                    className="object-cover"
                    sizes="300px"
                  />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Valitse kohde — klikkaa kuvaa asettaaksesi sen etusivun kortin kansikuvaksi.
            </p>
            <div className="flex flex-wrap gap-2">
              {data.properties.map((property) => (
                <button
                  key={property.id}
                  type="button"
                  onClick={() => setActivePropertyId(property.id)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                    activePropertyId === property.id
                      ? "border-forest bg-forest text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {property.name}{" "}
                  <span className="opacity-70">
                    ({property.group === "villa" ? "villa" : "asunto"})
                  </span>
                </button>
              ))}
            </div>
            {activeProperty && (
              <div className={adminCardClass}>
                <p className="text-sm font-medium text-slate-900">
                  Nykyinen kansikuva: {activeProperty.name}
                </p>
                <div className="relative mt-3 aspect-[4/3] max-w-xs overflow-hidden rounded-lg bg-slate-100">
                  <Image
                    src={activeProperty.image}
                    alt={activeProperty.name}
                    fill
                    className="object-cover"
                    sizes="320px"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-sm font-semibold text-slate-900">
            {mode === "banner"
              ? `Valitse kuva: ${BANNER_LABELS[activeSlot]}`
              : `Valitse kansikuva: ${activeProperty?.name ?? ""}`}
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {imagePool.map((image) => {
              const isActive =
                mode === "banner"
                  ? data.banners[activeSlot] === image
                  : activeProperty?.image === image;

              return (
                <button
                  key={image}
                  type="button"
                  disabled={saving}
                  onClick={() => handleImagePick(image)}
                  className={`relative aspect-[4/3] overflow-hidden rounded-lg ring-2 transition hover:opacity-90 disabled:opacity-50 ${
                    isActive ? "ring-forest" : "ring-transparent"
                  }`}
                >
                  <Image
                    src={image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                  {isActive && (
                    <span className="absolute left-2 top-2 rounded bg-forest px-2 py-0.5 text-[10px] font-semibold text-white">
                      Valittu
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {status && (
          <p className="mt-6 text-sm text-slate-600">{status}</p>
        )}
      </div>
    </div>
  );
}
