import { describe, expect, it } from "vitest";
import { mergeMessages } from "@/lib/data/merge-messages";
import fiMessages from "../../../messages/fi.json";
import {
  countLocalized,
  globalToMessages,
  MAX_LOCALIZED_PER_GLOBAL,
  messagesToFields,
} from "./messages-to-fields";

describe("messagesToFields", () => {
  it("objekti → group, merkkijono → lokalisoitu text", () => {
    expect(messagesToFields({ a: { b: "x" } })).toMatchObject([
      { type: "group", name: "a", fields: [{ type: "text", name: "b", localized: true }] },
    ]);
  });

  it("pitkä merkkijono → textarea", () => {
    expect(messagesToFields({ b: "x".repeat(81) })).toMatchObject([
      { type: "textarea", name: "b", localized: true },
    ]);
  });

  it("merkkijonolista → lokalisoitu array", () => {
    expect(messagesToFields({ steps: ["a", "b"] })).toMatchObject([
      { type: "array", name: "steps", localized: true, fields: [{ name: "value", type: "textarea" }] },
    ]);
  });

  it("avain image → upload media", () => {
    const [hero] = messagesToFields({ hero: { image: "/images/x.jpg" } }) as Array<{
      fields: unknown[];
    }>;
    expect(hero.fields).toMatchObject([{ type: "upload", name: "image", relationTo: "media" }]);
  });
});

describe("countLocalized", () => {
  it("laskee lokalisoidut skalaarikentät (ei listoja eikä kuvia)", () => {
    expect(countLocalized({ a: "x", b: { c: "y", image: "/i.jpg" }, d: ["z"] })).toBe(2);
  });

  it("jokainen messages/fi.json-osio mahtuu yhteen globaliin (Postgres 100 argumentin raja)", () => {
    for (const [key, value] of Object.entries(fiMessages)) {
      expect(countLocalized(value as Record<string, unknown>), key).toBeLessThanOrEqual(
        MAX_LOCALIZED_PER_GLOBAL,
      );
    }
  });
});

describe("globalToMessages", () => {
  it("array → string[], upload → url, tyhjä pois", () => {
    expect(
      globalToMessages({
        id: 1,
        updatedAt: "2026-10-28",
        steps: [{ id: "r1", value: "a" }],
        hero: { image: { url: "/api/media/file/x.webp" } },
        empty: "",
        none: null,
      }),
    ).toEqual({ steps: ["a"], hero: { image: "/api/media/file/x.webp" } });
  });

  it("kuva ilman relaatiota (vain id) jää pois", () => {
    expect(globalToMessages({ hero: { image: 5 } })).toEqual({});
  });

  it("puuttuva avain → oletus säilyy (mergeMessages)", () => {
    expect(
      mergeMessages({ a: "oletus", b: "oletus" }, globalToMessages({ a: "uusi" })),
    ).toEqual({ a: "uusi", b: "oletus" });
  });
});
