"use client";

import Image from "next/image";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ImagePicker } from "./ImagePicker";
import { useUndoToast } from "./useUndoToast";

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

const BANNER_INFO: Record<BannerSlot, { label: string; pickerTitle: string }> = {
  hero: { label: "Iso pääkuva", pickerTitle: "Vaihda iso pääkuva" },
  story: { label: "Meistä-kuva", pickerTitle: "Vaihda Meistä-osion kuva" },
  editorial: { label: "Luontokuva", pickerTitle: "Vaihda luontokaistan kuva" },
};

type PickTarget =
  | { kind: "banner"; slot: BannerSlot }
  | { kind: "cover"; propertyId: string }
  | null;

function EditableImage({
  src,
  label,
  ariaLabel,
  aspectClass,
  sizes,
  onClick,
  children,
}: {
  src: string;
  label: string;
  ariaLabel?: string;
  aspectClass: string;
  sizes: string;
  onClick: () => void;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Vaihda kuva: ${ariaLabel ?? label}`}
      className={`group relative block w-full overflow-hidden bg-slate-100 ${aspectClass}`}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes={sizes}
          className="object-cover transition duration-200 group-hover:scale-[1.02]"
        />
      ) : (
        <span className="flex h-full items-center justify-center text-xs text-slate-400">
          Ei kuvaa
        </span>
      )}
      <span className="absolute left-2 top-2 rounded bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-slate-700 shadow-sm">
        {label}
      </span>
      <span
        aria-hidden
        className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-sm shadow transition group-hover:bg-white"
      >
        ✎
      </span>
      {children}
    </button>
  );
}

function QuietBand({ label }: { label: string }) {
  return (
    <div className="border-y border-slate-100 bg-slate-50 px-3 py-2 text-center text-[10px] uppercase tracking-wide text-slate-400">
      {label}
    </div>
  );
}

export function AdminHomePage() {
  const router = useRouter();
  const { toast, showUndo } = useUndoToast();
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pick, setPick] = useState<PickTarget>(null);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const response = await fetch("/api/admin/home-page");
        if (!response.ok) throw new Error("Unauthorized");
        setData((await response.json()) as HomeData);
      } catch {
        router.push("/admin/login");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [router],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const applyBanner = useCallback(
    async (slot: BannerSlot, image: string, withUndo: boolean) => {
      const previous = data?.banners[slot];
      setError("");
      setData((current) =>
        current
          ? { ...current, banners: { ...current.banners, [slot]: image } }
          : current,
      );

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
        router.refresh();
        if (withUndo && previous && previous !== image) {
          showUndo(`${BANNER_INFO[slot].label} vaihdettu`, () => {
            void applyBanner(slot, previous, false);
          });
        }
      } catch (err) {
        setData((current) =>
          current && previous
            ? { ...current, banners: { ...current.banners, [slot]: previous } }
            : current,
        );
        setError(err instanceof Error ? err.message : "Tallennus epäonnistui");
      }
    },
    [data, router, showUndo],
  );

  const applyCover = useCallback(
    async (propertyId: string, image: string, withUndo: boolean) => {
      const previous = data?.properties.find((p) => p.id === propertyId)?.image;
      setError("");
      setData((current) =>
        current
          ? {
              ...current,
              properties: current.properties.map((property) =>
                property.id === propertyId
                  ? { ...property, image }
                  : property,
              ),
            }
          : current,
      );

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
        router.refresh();
        if (withUndo && previous && previous !== image) {
          showUndo("Kansikuva vaihdettu", () => {
            void applyCover(propertyId, previous, false);
          });
        }
      } catch (err) {
        setData((current) =>
          current && previous
            ? {
                ...current,
                properties: current.properties.map((property) =>
                  property.id === propertyId
                    ? { ...property, image: previous }
                    : property,
                ),
              }
            : current,
        );
        setError(err instanceof Error ? err.message : "Tallennus epäonnistui");
      }
    },
    [data, router, showUndo],
  );

  if (loading || !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
        Ladataan etusivua…
      </div>
    );
  }

  const villas = data.properties.filter((p) => p.group === "villa");
  const apartments = data.properties.filter((p) => p.group === "apartment");
  const pickedProperty =
    pick?.kind === "cover"
      ? data.properties.find((p) => p.id === pick.propertyId) ?? null
      : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-slate-200 bg-white px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              Etusivun kuvat
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Tämä on etusivusi pienoiskoossa. Klikkaa mitä tahansa kuvaa
              vaihtaaksesi sen — muutos tallentuu heti.
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
        {error && (
          <p className="mt-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <EditableImage
            src={data.banners.hero}
            label={BANNER_INFO.hero.label}
            aspectClass="aspect-[16/10]"
            sizes="448px"
            onClick={() => setPick({ kind: "banner", slot: "hero" })}
          >
            <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/70 to-transparent px-3 pb-2 pt-8 text-left text-sm font-semibold text-white">
              Tahkon Villat
            </span>
          </EditableImage>

          <div className="px-3 pb-3 pt-3">
            <p className="pb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Villat
            </p>
            <div className="grid grid-cols-3 gap-2">
              {villas.map((villa) => (
                <div key={villa.id}>
                  <div className="overflow-hidden rounded-lg">
                    <EditableImage
                      src={villa.image}
                      label=""
                      ariaLabel={`${villa.name} — kansikuva`}
                      aspectClass="aspect-[4/5]"
                      sizes="140px"
                      onClick={() =>
                        setPick({ kind: "cover", propertyId: villa.id })
                      }
                    />
                  </div>
                  <p className="mt-1 truncate text-[10px] text-slate-600">
                    {villa.name}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 items-stretch gap-0 border-t border-slate-100">
            <EditableImage
              src={data.banners.story}
              label={BANNER_INFO.story.label}
              aspectClass="aspect-[4/3]"
              sizes="224px"
              onClick={() => setPick({ kind: "banner", slot: "story" })}
            />
            <div className="flex flex-col justify-center gap-1.5 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Meistä
              </p>
              <span className="h-1.5 w-full rounded bg-slate-100" />
              <span className="h-1.5 w-5/6 rounded bg-slate-100" />
              <span className="h-1.5 w-2/3 rounded bg-slate-100" />
            </div>
          </div>

          <QuietBand label="Kohokohdat · Luottamus — ei kuvia" />

          <div className="px-3 pb-3 pt-3">
            <p className="pb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Asunnot
            </p>
            <div className="grid grid-cols-3 gap-2">
              {apartments.map((apartment) => (
                <div key={apartment.id}>
                  <div className="overflow-hidden rounded-lg">
                    <EditableImage
                      src={apartment.image}
                      label=""
                      ariaLabel={`${apartment.name} — kansikuva`}
                      aspectClass="aspect-[4/3]"
                      sizes="140px"
                      onClick={() =>
                        setPick({ kind: "cover", propertyId: apartment.id })
                      }
                    />
                  </div>
                  <p className="mt-1 truncate text-[10px] text-slate-600">
                    {apartment.name}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <EditableImage
            src={data.banners.editorial}
            label={BANNER_INFO.editorial.label}
            aspectClass="aspect-[16/7]"
            sizes="448px"
            onClick={() => setPick({ kind: "banner", slot: "editorial" })}
          />

          <QuietBand label="Arvostelut · Yhteydenotto — ei kuvia" />
        </div>
      </div>

      {pick?.kind === "banner" && (
        <ImagePicker
          open
          title={BANNER_INFO[pick.slot].pickerTitle}
          images={data.allImages}
          currentImage={data.banners[pick.slot]}
          uploadUrl="/api/admin/site-images"
          onSelect={(image) => {
            const slot = pick.slot;
            setPick(null);
            void applyBanner(slot, image, true);
          }}
          onUploaded={() => void load(true)}
          onClose={() => setPick(null)}
        />
      )}

      {pick?.kind === "cover" && pickedProperty && (
        <ImagePicker
          open
          title={`${pickedProperty.name} — kansikuva`}
          subtitle="Näkyy etusivun kortissa. Napauta kuvaa — käytössä heti."
          images={pickedProperty.gallery}
          currentImage={pickedProperty.image}
          uploadUrl={`/api/admin/properties/${pickedProperty.id}/images`}
          onSelect={(image) => {
            const propertyId = pickedProperty.id;
            setPick(null);
            void applyCover(propertyId, image, true);
          }}
          onUploaded={() => void load(true)}
          onClose={() => setPick(null)}
        />
      )}

      {toast}
    </div>
  );
}
