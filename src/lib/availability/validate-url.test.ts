import { describe, expect, it } from "vitest";
import { isValidIcalUrl } from "./validate-url";

describe("isValidIcalUrl", () => {
  it("hyväksyy https", () => {
    expect(isValidIcalUrl("https://www.airbnb.com/calendar/ical/123.ics?s=abc")).toBe(true);
  });
  it("hylkää http, tyhjän ja roskan", () => {
    expect(isValidIcalUrl("http://www.airbnb.com/calendar/ical/123.ics")).toBe(false);
    expect(isValidIcalUrl("")).toBe(false);
    expect(isValidIcalUrl("ei osoite")).toBe(false);
  });
});
