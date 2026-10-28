import { describe, expect, it } from "vitest";
import { hasValidSender } from "./message-guard";

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
