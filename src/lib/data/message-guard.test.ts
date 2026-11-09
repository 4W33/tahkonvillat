import { describe, expect, it } from "vitest";
import { hasValidSender, hasValidStay, isHoneypotFilled, isSiteLocale } from "./message-guard";

const base = { name: "Testi", email: "testi@example.com", message: "Hei" };

describe("hasValidSender", () => {
  it("hyväksyy tavallisen viestin, puhelin valinnainen", () => {
    expect(hasValidSender(base)).toBe(true);
    expect(hasValidSender({ ...base, phone: "040 123" })).toBe(true);
  });

  it("hylkää osoitteen, jonka Payload hylkäisi (ei TLD:tä)", () => {
    expect(hasValidSender({ ...base, email: "x@localhost" })).toBe(false);
  });

  it("hylkää ylipitkät kentät ja väärän puhelintyypin", () => {
    expect(hasValidSender({ ...base, message: "a".repeat(5001) })).toBe(false);
    expect(hasValidSender({ ...base, name: "a".repeat(201) })).toBe(false);
    expect(hasValidSender({ ...base, phone: 123 })).toBe(false);
    expect(hasValidSender({ ...base, name: "  " })).toBe(false);
  });
});

describe("isHoneypotFilled", () => {
  it("tyhjä tai puuttuva piilokenttä = ihminen, täytetty = botti", () => {
    expect(isHoneypotFilled(base)).toBe(false);
    expect(isHoneypotFilled({ ...base, website: "" })).toBe(false);
    expect(isHoneypotFilled({ ...base, website: "http://spam.example" })).toBe(true);
    expect(isHoneypotFilled(null)).toBe(false);
  });
});

describe("isSiteLocale", () => {
  it("hyväksyy vain fi ja en", () => {
    expect(isSiteLocale("fi")).toBe(true);
    expect(isSiteLocale("en")).toBe(true);
    expect(isSiteLocale("sv")).toBe(false);
    expect(isSiteLocale(undefined)).toBe(false);
  });
});

describe("hasValidStay", () => {
  const stay = { villaSlug: "villa-puolukka", checkIn: "2027-01-10", checkOut: "2027-01-12", guests: 2 };

  it("hyväksyy kelvollisen tiedustelun", () => {
    expect(hasValidStay(stay)).toBe(true);
  });

  it("hylkää väärän päivämuodon, väärän järjestyksen ja ylipitkän slugin", () => {
    expect(hasValidStay({ ...stay, checkIn: "2027-1-10" })).toBe(false);
    expect(hasValidStay({ ...stay, checkOut: "2027-01-12T00:00" })).toBe(false);
    expect(hasValidStay({ ...stay, checkOut: "2027-01-10" })).toBe(false);
    expect(hasValidStay({ ...stay, villaSlug: "a".repeat(201) })).toBe(false);
    expect(hasValidStay({ ...stay, villaSlug: "" })).toBe(false);
    expect(hasValidStay({ ...stay, guests: 0 })).toBe(false);
  });
});
