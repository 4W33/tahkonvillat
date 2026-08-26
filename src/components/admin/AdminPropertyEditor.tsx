"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPropertyPreview } from "./AdminPropertyPreview";
import { useUndoToast } from "./useUndoToast";
import {
  AMENITY_OPTIONS,
  type PropertyEditorData,
} from "@/types/property-editor";
import type { AmenityId } from "@/types/villa";

type Tab = "images" | "texts" | "details";

const VILLA_LOCATIONS = [
  { value: "tahko", label: "Tahko" },
  { value: "vantaa", label: "Vantaa" },
  { value: "helsinki", label: "Helsinki" },
] as const;

const APARTMENT_LOCATIONS = [
  { value: "vantaa", label: "Vantaa" },
  { value: "helsinki", label: "Helsinki" },
] as const;
type PreviewLocale = "fi" | "en";

type Props = {
  propertyId: string;
  onBack: () => void;
};

function paragraphsToText(paragraphs: string[]): string {
  return paragraphs.join("\n\n");
}

function textToParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

const inputClass =
  "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600";

const labelClass = "text-xs font-semibold uppercase tracking-wide text-slate-500";

export function AdminPropertyEditor({ propertyId, onBack }: Props) {
  const router = useRouter();
  const { toast, showUndo } = useUndoToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const orderTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imagesSnapshot = useRef<{ gallery: string[]; cover: string } | null>(
    null,
  );
  const [tab, setTab] = useState<Tab>("images");
  const [property, setProperty] = useState<PropertyEditorData | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [cover, setCover] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [nameFi, setNameFi] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [imageAltFi, setImageAltFi] = useState("");
  const [imageAltEn, setImageAltEn] = useState("");
  const [descFi, setDescFi] = useState("");
  const [descEn, setDescEn] = useState("");
  const [longFi, setLongFi] = useState("");
  const [longEn, setLongEn] = useState("");
  const [areaFi, setAreaFi] = useState("");
  const [areaEn, setAreaEn] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropFilesHint, setDropFilesHint] = useState(false);
  const [textsDirty, setTextsDirty] = useState(false);
  const [location, setLocation] = useState("");
  const [guests, setGuests] = useState(0);
  const [bedrooms, setBedrooms] = useState(0);
  const [amenities, setAmenities] = useState<AmenityId[]>([]);
  const [metaDirty, setMetaDirty] = useState(false);
  const [previewLocale, setPreviewLocale] = useState<PreviewLocale>("fi");

  const applyProperty = useCallback((data: PropertyEditorData) => {
    setProperty(data);
    setGallery(data.gallery);
    setCover(data.image || data.gallery[0] || "");
    setNameFi(data.name.fi);
    setNameEn(data.name.en);
    setImageAltFi(data.imageAlt.fi);
    setImageAltEn(data.imageAlt.en);
    setDescFi(data.description.fi);
    setDescEn(data.description.en);
    setLongFi(paragraphsToText(data.longDescription?.fi ?? []));
    setLongEn(paragraphsToText(data.longDescription?.en ?? []));
    setAreaFi(data.area?.fi ?? "");
    setAreaEn(data.area?.en ?? "");
    setLocation(data.location);
    setGuests(data.guests);
    setBedrooms(data.bedrooms);
    setAmenities(data.amenities ?? []);
    setSelected(new Set());
    setTextsDirty(false);
    setMetaDirty(false);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/properties/${propertyId}`);
      if (!response.ok) throw new Error("Unauthorized");
      applyProperty((await response.json()) as PropertyEditorData);
    } catch {
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  }, [applyProperty, propertyId, router]);

  useEffect(() => {
    load();
  }, [load]);

  const persistImages = useCallback(
    async (nextGallery: string[], nextCover: string) => {
      const response = await fetch(`/api/admin/properties/${propertyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: nextCover, gallery: nextGallery }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Tallennus epäonnistui");
      }
    },
    [propertyId],
  );

  // Instant save with a short debounce (rapid re-ordering batches into one
  // request) and a snapshot-based undo instead of a save button.
  function queueImagesSave(
    nextGallery: string[],
    nextCover: string,
    label: string,
  ) {
    if (!imagesSnapshot.current) {
      imagesSnapshot.current = { gallery, cover };
    }
    setGallery(nextGallery);
    setCover(nextCover);
    setMessage("");

    if (orderTimer.current) clearTimeout(orderTimer.current);
    orderTimer.current = setTimeout(() => {
      const snapshot = imagesSnapshot.current;
      imagesSnapshot.current = null;
      void persistImages(nextGallery, nextCover)
        .then(() => {
          if (!snapshot) return;
          showUndo(label, () => {
            setGallery(snapshot.gallery);
            setCover(snapshot.cover);
            void persistImages(snapshot.gallery, snapshot.cover).catch(() => {
              setMessage("Kumoaminen epäonnistui — yritä uudelleen.");
            });
          });
        })
        .catch((error: unknown) => {
          if (snapshot) {
            setGallery(snapshot.gallery);
            setCover(snapshot.cover);
          }
          setMessage(
            error instanceof Error ? error.message : "Tallennus epäonnistui",
          );
        });
    }, 600);
  }

  function moveImage(index: number, direction: -1 | 1) {
    const next = [...gallery];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    queueImagesSave(next, cover, "Järjestys tallennettu");
  }

  function reorderImage(from: number, to: number) {
    if (from === to) return;
    const next = [...gallery];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    queueImagesSave(next, cover, "Järjestys tallennettu");
  }

  function setAsCover(src: string) {
    if (src === cover) return;
    queueImagesSave(gallery, src, "Pääkuva vaihdettu");
  }

  function toggleSelected(src: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(src)) next.delete(src);
      else next.add(src);
      return next;
    });
  }

  async function handleSaveDetails() {
    setSaving(true);
    setMessage("");
    try {
      const body: Record<string, unknown> = {
        location,
        guests: Number(guests),
        bedrooms: Number(bedrooms),
      };

      if (property?.group === "villa") {
        body.amenities = amenities;
      }

      const response = await fetch(`/api/admin/properties/${propertyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Tallennus epäonnistui");
      }

      applyProperty((await response.json()) as PropertyEditorData);
      setMessage("Tiedot tallennettu.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Tallennus epäonnistui");
    } finally {
      setSaving(false);
    }
  }

  function toggleAmenity(id: AmenityId) {
    setAmenities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
    setMetaDirty(true);
  }

  async function handleSaveTexts() {
    if (!nameFi.trim()) {
      setMessage("Nimi (suomi) on pakollinen.");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      const body: Record<string, unknown> = {
        name: { fi: nameFi.trim(), en: nameEn.trim() },
        imageAlt: { fi: imageAltFi.trim(), en: imageAltEn.trim() },
        description: { fi: descFi.trim(), en: descEn.trim() },
      };

      if (property?.group === "villa") {
        body.longDescription = {
          fi: textToParagraphs(longFi),
          en: textToParagraphs(longEn),
        };
      } else {
        body.area = { fi: areaFi.trim(), en: areaEn.trim() };
      }

      const response = await fetch(`/api/admin/properties/${propertyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Tallennus epäonnistui");
      }

      applyProperty((await response.json()) as PropertyEditorData);
      setMessage("Tekstit tallennettu.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Tallennus epäonnistui");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(files: FileList | null) {
    if (!files?.length) return;

    setUploading(true);
    setMessage("");
    try {
      const form = new FormData();
      for (const file of Array.from(files)) {
        form.append("files", file);
      }

      const response = await fetch(
        `/api/admin/properties/${propertyId}/images`,
        { method: "POST", body: form },
      );
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Lataus epäonnistui");
      }

      const data = await response.json();
      applyProperty(data.property as PropertyEditorData);
      setMessage(`Lisättiin ${data.uploaded?.length ?? 0} kuvaa.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Lataus epäonnistui");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDeleteImages() {
    if (!selected.size) return;
    if (!confirm(`Poistetaanko ${selected.size} kuvaa?`)) return;

    setSaving(true);
    setMessage("");
    try {
      const response = await fetch(
        `/api/admin/properties/${propertyId}/images`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paths: Array.from(selected) }),
        },
      );
      if (!response.ok) throw new Error("Poisto epäonnistui");
      applyProperty((await response.json()) as PropertyEditorData);
      setMessage("Kuvat poistettu.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Poisto epäonnistui");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !property) {
    return <p className="p-6 text-sm text-slate-500">Ladataan…</p>;
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-slate-500 hover:text-slate-800"
      >
        ← Takaisin kohteisiin
      </button>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{nameFi}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {property.group === "villa" ? "Villa" : "Asunto"}
          </p>
        </div>

        <div className="flex rounded-lg border border-slate-200 bg-white p-1">
          {(
            [
              ["images", "Kuvat"],
              ["texts", "Tekstit"],
              ["details", "Tiedot"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                tab === id
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <p className="mt-4 text-sm text-slate-600" role="status">
          {message}
        </p>
      )}

      {tab === "details" ? (
        <div className="mt-6 max-w-xl space-y-6">
          <fieldset className="rounded-lg border border-slate-200 bg-white p-5">
            <legend className="px-1 text-sm font-semibold text-slate-900">
              Kohdetiedot
            </legend>

            <label className="mt-4 block">
              <span className={labelClass}>Sijainti</span>
              <select
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setMetaDirty(true);
                }}
                className={inputClass}
              >
                {(property.group === "villa"
                  ? VILLA_LOCATIONS
                  : APARTMENT_LOCATIONS
                ).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <label className="block">
                <span className={labelClass}>Vieraita</span>
                <input
                  type="number"
                  min={0}
                  value={guests}
                  onChange={(e) => {
                    setGuests(Number(e.target.value));
                    setMetaDirty(true);
                  }}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Makuuhuoneita</span>
                <input
                  type="number"
                  min={0}
                  value={bedrooms}
                  onChange={(e) => {
                    setBedrooms(Number(e.target.value));
                    setMetaDirty(true);
                  }}
                  className={inputClass}
                />
              </label>
            </div>

            {property.group === "villa" && (
              <div className="mt-6">
                <p className={labelClass}>Varustelu</p>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {AMENITY_OPTIONS.map((option) => (
                    <li key={option.id}>
                      <label className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={amenities.includes(option.id)}
                          onChange={() => toggleAmenity(option.id)}
                          className="h-4 w-4"
                        />
                        {option.label}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(property.ratingAverage != null || property.ratingCount != null) && (
              <p className="mt-6 text-sm text-slate-500">
                Arvostelut (tuotu Airbnb-scrapestä):{" "}
                {property.ratingAverage?.toFixed(2) ?? "—"} / 5
                {property.ratingCount != null
                  ? ` · ${property.ratingCount} arvostelua`
                  : ""}
              </p>
            )}
          </fieldset>

          <button
            type="button"
            onClick={handleSaveDetails}
            disabled={saving || !metaDirty}
            className="rounded-md bg-teal-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50"
          >
            {saving ? "Tallennetaan…" : "Tallenna tiedot"}
          </button>
        </div>
      ) : tab === "images" ? (
        <>
          {selected.size > 0 && (
            <div className="mt-6">
              <button
                type="button"
                onClick={handleDeleteImages}
                disabled={saving}
                className="rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-100"
              >
                Poista valitut ({selected.size})
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            className="hidden"
            onChange={(event) => handleUpload(event.target.files)}
          />

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            <section className="rounded-lg border border-slate-200 bg-white p-4">
              <p className={labelClass}>Kansikuva</p>
              <div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-md bg-slate-100">
                {cover ? (
                  <Image
                    src={cover}
                    alt={nameFi}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    Ei kansikuvaa
                  </div>
                )}
              </div>
            </section>

            <section
              onDragOver={(event) => {
                if (event.dataTransfer.types.includes("Files")) {
                  event.preventDefault();
                  setDropFilesHint(true);
                }
              }}
              onDragLeave={() => setDropFilesHint(false)}
              onDrop={(event) => {
                if (event.dataTransfer.types.includes("Files")) {
                  event.preventDefault();
                  setDropFilesHint(false);
                  void handleUpload(event.dataTransfer.files);
                }
              }}
              className={`rounded-lg border bg-white p-4 transition-colors ${
                dropFilesHint
                  ? "border-teal-600 ring-2 ring-teal-600/20"
                  : "border-slate-200"
              }`}
            >
              <p className={labelClass}>Galleria ({gallery.length})</p>
              <p className="mt-2 text-sm text-slate-500">
                Raahaa kuvat haluamaasi järjestykseen — tallentuu itsestään.
                ★ = pääkuva.
              </p>

              {
                <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <li>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-slate-300 text-slate-600 transition-colors hover:border-teal-600 hover:text-teal-700 disabled:opacity-60"
                    >
                      <span className="text-2xl leading-none">＋</span>
                      <span className="text-xs font-medium">
                        {uploading ? "Ladataan…" : "Lisää kuvia"}
                      </span>
                      {!uploading && (
                        <span className="text-[10px] text-slate-400">
                          tai pudota tähän
                        </span>
                      )}
                    </button>
                  </li>
                  {gallery.map((src, index) => {
                    const isCover = src === cover;
                    const isSelected = selected.has(src);
                    return (
                      <li
                        key={src}
                        draggable
                        onDragStart={(event) => {
                          setDragIndex(index);
                          event.dataTransfer.effectAllowed = "move";
                          event.dataTransfer.setData("text/plain", String(index));
                        }}
                        onDragEnd={() => setDragIndex(null)}
                        onDragOver={(event) => {
                          if (dragIndex !== null) event.preventDefault();
                        }}
                        onDrop={(event) => {
                          if (dragIndex === null) return;
                          event.preventDefault();
                          event.stopPropagation();
                          reorderImage(dragIndex, index);
                          setDragIndex(null);
                        }}
                        className={`cursor-grab overflow-hidden rounded-md border active:cursor-grabbing ${
                          dragIndex === index ? "opacity-40" : ""
                        } ${
                          isCover
                            ? "border-teal-600 ring-2 ring-teal-600/30"
                            : isSelected
                              ? "border-slate-900"
                              : "border-slate-200"
                        }`}
                      >
                        <div className="relative aspect-[4/3] bg-slate-100">
                          <Image
                            src={src}
                            alt=""
                            fill
                            sizes="160px"
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setAsCover(src)}
                            className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-semibold ${
                              isCover
                                ? "bg-teal-700 text-white"
                                : "bg-white/90 text-slate-700 hover:bg-white"
                            }`}
                          >
                            {isCover ? "★ Pääkuva" : "☆"}
                          </button>
                          <label className="absolute right-2 top-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded bg-white/90">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelected(src)}
                              className="h-4 w-4"
                            />
                          </label>
                        </div>
                        <div className="flex items-center justify-between px-2 py-1.5">
                          <button
                            type="button"
                            onClick={() => moveImage(index, -1)}
                            disabled={index === 0}
                            aria-label="Siirrä taaksepäin"
                            className="min-h-9 rounded px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                          >
                            ←
                          </button>
                          <span className="text-xs text-slate-400">
                            {index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => moveImage(index, 1)}
                            disabled={index === gallery.length - 1}
                            aria-label="Siirrä eteenpäin"
                            className="min-h-9 rounded px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                          >
                            →
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              }
            </section>
          </div>
        </>
      ) : (
        <div className="mt-6 space-y-6">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <p className={labelClass}>Näin näkyy sivulla</p>
                <div className="flex rounded-md border border-slate-200 bg-white p-0.5">
                  {(["fi", "en"] as const).map((locale) => (
                    <button
                      key={locale}
                      type="button"
                      onClick={() => setPreviewLocale(locale)}
                      className={`rounded px-3 py-1 text-xs font-medium uppercase ${
                        previewLocale === locale
                          ? "bg-slate-900 text-white"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {locale}
                    </button>
                  ))}
                </div>
              </div>
              <AdminPropertyPreview
                group={property.group}
                locale={previewLocale}
                image={cover}
                name={previewLocale === "fi" ? nameFi : nameEn}
                description={previewLocale === "fi" ? descFi : descEn}
                longDescription={
                  property.group === "villa"
                    ? previewLocale === "fi"
                      ? longFi
                      : longEn
                    : undefined
                }
                area={
                  property.group === "apartment"
                    ? previewLocale === "fi"
                      ? areaFi
                      : areaEn
                    : undefined
                }
              />
              <a
                href={
                  property.group === "villa"
                    ? `/villat/${property.id}`
                    : "/asunnot"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm text-teal-700 hover:text-teal-900"
              >
                Avaa julkinen sivu ↗
              </a>
            </section>

            <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <fieldset className="rounded-lg border border-slate-200 bg-white p-5">
              <legend className="px-1 text-sm font-semibold text-slate-900">
                Suomi
              </legend>
              <label className="mt-4 block">
                <span className={labelClass}>Nimi</span>
                <input
                  type="text"
                  value={nameFi}
                  onChange={(e) => {
                    setNameFi(e.target.value);
                    setTextsDirty(true);
                  }}
                  className={inputClass}
                />
              </label>
              <label className="mt-4 block">
                <span className={labelClass}>Lyhyt kuvaus</span>
                <textarea
                  value={descFi}
                  rows={3}
                  onChange={(e) => {
                    setDescFi(e.target.value);
                    setTextsDirty(true);
                  }}
                  className={inputClass}
                />
              </label>
              <label className="mt-4 block">
                <span className={labelClass}>Kuvan alt-teksti (SEO)</span>
                <input
                  type="text"
                  value={imageAltFi}
                  onChange={(e) => {
                    setImageAltFi(e.target.value);
                    setTextsDirty(true);
                  }}
                  className={inputClass}
                />
              </label>
              {property.group === "apartment" && (
                <label className="mt-4 block">
                  <span className={labelClass}>Alue / sijainti</span>
                  <input
                    type="text"
                    value={areaFi}
                    onChange={(e) => {
                      setAreaFi(e.target.value);
                      setTextsDirty(true);
                    }}
                    className={inputClass}
                  />
                </label>
              )}
              {property.group === "villa" && (
                <label className="mt-4 block">
                  <span className={labelClass}>Pitkä kuvaus</span>
                  <p className="mt-1 text-xs text-slate-400">
                    Tyhjä rivi erottaa kappaleet.
                  </p>
                  <textarea
                    value={longFi}
                    rows={8}
                    onChange={(e) => {
                      setLongFi(e.target.value);
                      setTextsDirty(true);
                    }}
                    className={inputClass}
                  />
                </label>
              )}
            </fieldset>

            <fieldset className="rounded-lg border border-slate-200 bg-white p-5">
              <legend className="px-1 text-sm font-semibold text-slate-900">
                English
              </legend>
              <label className="mt-4 block">
                <span className={labelClass}>Name</span>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => {
                    setNameEn(e.target.value);
                    setTextsDirty(true);
                  }}
                  className={inputClass}
                />
              </label>
              <label className="mt-4 block">
                <span className={labelClass}>Short description</span>
                <textarea
                  value={descEn}
                  rows={3}
                  onChange={(e) => {
                    setDescEn(e.target.value);
                    setTextsDirty(true);
                  }}
                  className={inputClass}
                />
              </label>
              <label className="mt-4 block">
                <span className={labelClass}>Image alt text (SEO)</span>
                <input
                  type="text"
                  value={imageAltEn}
                  onChange={(e) => {
                    setImageAltEn(e.target.value);
                    setTextsDirty(true);
                  }}
                  className={inputClass}
                />
              </label>
              {property.group === "apartment" && (
                <label className="mt-4 block">
                  <span className={labelClass}>Area / location</span>
                  <input
                    type="text"
                    value={areaEn}
                    onChange={(e) => {
                      setAreaEn(e.target.value);
                      setTextsDirty(true);
                    }}
                    className={inputClass}
                  />
                </label>
              )}
              {property.group === "villa" && (
                <label className="mt-4 block">
                  <span className={labelClass}>Long description</span>
                  <p className="mt-1 text-xs text-slate-400">
                    Blank line separates paragraphs.
                  </p>
                  <textarea
                    value={longEn}
                    rows={8}
                    onChange={(e) => {
                      setLongEn(e.target.value);
                      setTextsDirty(true);
                    }}
                    className={inputClass}
                  />
                </label>
              )}
            </fieldset>
          </div>

          <button
            type="button"
            onClick={handleSaveTexts}
            disabled={saving || !textsDirty}
            className="rounded-md bg-teal-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50"
          >
            {saving ? "Tallennetaan…" : "Tallenna tekstit"}
          </button>
            </div>
          </div>
        </div>
      )}
      {toast}
    </div>
  );
}
