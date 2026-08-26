"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  title: string;
  subtitle?: string;
  images: string[];
  currentImage?: string;
  /** POST target that accepts FormData "files" and returns { uploaded: string[] }. Omit to hide upload. */
  uploadUrl?: string;
  onSelect: (image: string) => void;
  onUploaded?: (paths: string[]) => void;
  onClose: () => void;
};

/**
 * The one image picker used everywhere an image can be chosen.
 * Bottom sheet on mobile, dialog on desktop. Uploading a new image
 * selects it immediately — one action, not two.
 */
export function ImagePicker({
  open,
  title,
  subtitle,
  images,
  currentImage,
  uploadUrl,
  onSelect,
  onUploaded,
  onClose,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [dropHint, setDropHint] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setError("");
      setDropHint(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const upload = useCallback(
    async (files: FileList | File[]) => {
      if (!uploadUrl) return;
      const list = Array.from(files).filter((file) =>
        file.type.startsWith("image/"),
      );
      if (!list.length) return;

      setUploading(true);
      setError("");
      try {
        const form = new FormData();
        for (const file of list) form.append("files", file);

        const response = await fetch(uploadUrl, {
          method: "POST",
          body: form,
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error || "Lataus epäonnistui");
        }

        const uploaded: string[] = Array.isArray(data.uploaded)
          ? data.uploaded.filter((item: unknown) => typeof item === "string")
          : [];
        setRecent((prev) => [...uploaded, ...prev]);
        onUploaded?.(uploaded);
        if (uploaded[0]) onSelect(uploaded[0]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lataus epäonnistui");
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [uploadUrl, onSelect, onUploaded],
  );

  if (!open) return null;

  const pool = Array.from(new Set([...recent, ...images]));

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/50 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        onDragOver={(event) => {
          if (uploadUrl && event.dataTransfer.types.includes("Files")) {
            event.preventDefault();
            setDropHint(true);
          }
        }}
        onDragLeave={() => setDropHint(false)}
        onDrop={(event) => {
          if (!uploadUrl) return;
          event.preventDefault();
          setDropHint(false);
          void upload(event.dataTransfer.files);
        }}
        className={`flex max-h-[88vh] w-full flex-col rounded-t-2xl bg-white shadow-xl sm:max-w-2xl sm:rounded-2xl ${
          dropHint ? "ring-4 ring-forest/40" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {subtitle ?? "Napauta kuvaa — se tulee käyttöön heti."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Sulje"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        {error && (
          <p className="border-b border-red-100 bg-red-50 px-5 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}

        {/* Fixed row height: content-derived (aspect-ratio) rows collapse in a
            height-constrained scrollable grid in Chrome. */}
        <div className="grid min-h-0 auto-rows-[9.5rem] grid-cols-2 content-start gap-3 overflow-y-auto p-5 sm:grid-cols-3">
          {uploadUrl && (
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-slate-600 transition-colors hover:border-forest hover:text-forest disabled:opacity-60"
            >
              <span className="text-2xl leading-none">＋</span>
              <span className="px-2 text-center text-sm font-medium">
                {uploading ? "Ladataan…" : "Lisää uusi kuva"}
              </span>
              {!uploading && (
                <span className="px-2 text-center text-xs text-slate-400">
                  tai pudota tähän
                </span>
              )}
            </button>
          )}

          {pool.map((image) => {
            const isActive = image === currentImage;
            return (
              <button
                key={image}
                type="button"
                onClick={() => onSelect(image)}
                className={`relative overflow-hidden rounded-lg ring-2 transition hover:opacity-90 ${
                  isActive ? "ring-forest" : "ring-transparent"
                }`}
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="200px"
                  className="object-cover"
                />
                {isActive && (
                  <span className="absolute left-2 top-2 rounded bg-forest px-2 py-0.5 text-[10px] font-semibold text-white">
                    Käytössä
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {uploadUrl && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            className="hidden"
            onChange={(event) => {
              if (event.target.files) void upload(event.target.files);
            }}
          />
        )}
      </div>
    </div>
  );
}
