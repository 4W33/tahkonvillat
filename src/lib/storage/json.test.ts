import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Simuloidaan Blob-säilön häiriö: jokainen luku heittää muun kuin "not found" -virheen.
const getMock = vi.fn();
vi.mock("@/lib/storage/blob-client", () => ({
  getBlobClient: async () => ({ get: getMock, put: vi.fn(), del: vi.fn() }),
}));

import { failLoudOnReadError } from "./access-policy";
import { readStoreJson } from "./json";

describe("readStoreJson kun Blob-säilössä on häiriö", () => {
  const savedStore = process.env.BLOB_STORE_ID;
  const savedToken = process.env.BLOB_READ_WRITE_TOKEN;

  beforeEach(() => {
    process.env.BLOB_STORE_ID = "store_test";
    delete process.env.BLOB_READ_WRITE_TOKEN;
    getMock.mockReset();
    getMock.mockRejectedValue(new Error("Vercel Blob: 503 Service Unavailable"));
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    if (savedStore === undefined) delete process.env.BLOB_STORE_ID;
    else process.env.BLOB_STORE_ID = savedStore;
    if (savedToken !== undefined) process.env.BLOB_READ_WRITE_TOKEN = savedToken;
    vi.restoreAllMocks();
  });

  it("sivuston sisältö palaa repon oletukseen eikä kaada sivua", async () => {
    const pricing = await readStoreJson<Record<string, unknown>>("data/pricing.json");
    expect(pricing).not.toBeNull();
    expect(Object.keys(pricing ?? {})).toContain("villa-puolukka");

    const villa = await readStoreJson<{ slug: string }>("data/content/villa-puolukka.json");
    expect(villa?.slug).toBe("villa-puolukka");
  });

  it("lomakeviestit heittävät virheen eivätkä näytä vanhaa dataa ajantasaisena", async () => {
    await expect(readStoreJson("data/contacts.json")).rejects.toThrow(/luku epäonnistui/);
    await expect(readStoreJson("data/inquiries.json")).rejects.toThrow(/luku epäonnistui/);
  });

  it("puuttuva blob (null) palaa repon tiedostoon kaikille", async () => {
    getMock.mockResolvedValue(null);
    expect(await readStoreJson("data/pricing.json")).not.toBeNull();
    expect(Array.isArray(await readStoreJson("data/contacts.json"))).toBe(true);
  });

  it("luetaan aina yksityisenä ja tuoreena (useCache: false)", async () => {
    getMock.mockResolvedValue(null);
    await readStoreJson("data/pricing.json");
    expect(getMock).toHaveBeenCalledWith("store/data/pricing.json", {
      access: "private",
      useCache: false,
    });
  });
});

describe("failLoudOnReadError", () => {
  it("vain lomakeviestit, varaukset ja iCal-linkit", () => {
    expect(failLoudOnReadError("data/contacts.json")).toBe(true);
    expect(failLoudOnReadError("data/reservations.json")).toBe(true);
    expect(failLoudOnReadError("data/ical-sources.json")).toBe(true);
    expect(failLoudOnReadError("data/pricing.json")).toBe(false);
    expect(failLoudOnReadError("data/content/messages/fi.json")).toBe(false);
  });
});
