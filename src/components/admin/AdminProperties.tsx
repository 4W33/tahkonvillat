"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPropertyEditor } from "./AdminPropertyEditor";

type PropertyListItem = {
  id: string;
  name: string;
  group: "villa" | "apartment";
  image: string;
  imageCount: number;
};

export function AdminProperties() {
  const router = useRouter();
  const [items, setItems] = useState<PropertyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/properties");
      if (!response.ok) throw new Error("Unauthorized");
      setItems(await response.json());
    } catch {
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  if (editingId) {
    return (
      <AdminPropertyEditor
        propertyId={editingId}
        onBack={() => {
          setEditingId(null);
          load();
        }}
      />
    );
  }

  if (loading) {
    return <p className="p-6 text-sm text-slate-500">Ladataan kohteita…</p>;
  }

  const villas = items.filter((item) => item.group === "villa");
  const apartments = items.filter((item) => item.group === "apartment");

  return (
    <div className="p-6">
      <div className="max-w-5xl">
        <h2 className="text-lg font-semibold text-slate-900">Kohteet</h2>
        <p className="mt-2 text-sm text-slate-600">
          Muokkaa kuvia ja tekstejä (FI/EN). Kansikuva näkyy listauksissa,
          galleria ja kuvaukset kohdesivulla.
        </p>

        <PropertySection
          title="Villat"
          items={villas}
          onEdit={setEditingId}
        />
        <PropertySection
          title="Asunnot"
          items={apartments}
          onEdit={setEditingId}
        />
      </div>
    </div>
  );
}

function PropertySection({
  title,
  items,
  onEdit,
}: {
  title: string;
  items: PropertyListItem[];
  onEdit: (id: string) => void;
}) {
  return (
    <section className="mt-8">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h3>
      <ul className="mt-3 grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="overflow-hidden rounded-lg border border-slate-200 bg-white"
          >
            <div className="relative aspect-[16/10] bg-slate-100">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 320px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  Ei kuvaa
                </div>
              )}
            </div>
            <div className="flex items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium text-slate-900">{item.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {item.imageCount} kuvaa
                </p>
              </div>
              <button
                type="button"
                onClick={() => onEdit(item.id)}
                className="shrink-0 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Muokkaa
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
