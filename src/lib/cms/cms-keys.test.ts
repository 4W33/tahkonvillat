import { describe, expect, it } from "vitest";
import { buildPreviewSrc, cmsLabel, findBestCmsKey } from "./cms-keys";

describe("findBestCmsKey", () => {
  const available = ["home.hero", "home.villas", "home", "footer", "villas.detail.calendar"];
  it("pisin prefiksi voittaa", () => {
    expect(findBestCmsKey("home.hero.title", available)).toBe("home.hero");
    expect(findBestCmsKey("home.story.title", available)).toBe("home");
  });
  it("tarkka osuma", () => {
    expect(findBestCmsKey("footer", available)).toBe("footer");
  });
  it("ei osumaa → null; 'homer' ei ole 'home'", () => {
    expect(findBestCmsKey("nav.contact", available)).toBeNull();
    expect(findBestCmsKey("homer.x", available)).toBeNull();
  });
});

describe("buildPreviewSrc", () => {
  const map = {
    fi: { home: "/", villas: "/villat", faq: "/faq" },
    en: { home: "/", villas: "/villas", faq: "/faq" },
  };
  it("fi ilman etuliitettä, en /en-etuliitteellä ja en-polulla", () => {
    expect(buildPreviewSrc("home", "fi", map)).toBe("/?cms=1");
    expect(buildPreviewSrc("home", "en", map)).toBe("/en?cms=1");
    expect(buildPreviewSrc("villas", "fi", map)).toBe("/villat?cms=1");
    expect(buildPreviewSrc("villas", "en", map)).toBe("/en/villas?cms=1");
  });
  it("osio ilman sivua → etusivu", () => {
    expect(buildPreviewSrc("footer", "fi", map)).toBe("/?cms=1");
    expect(buildPreviewSrc("footer", "en", map)).toBe("/en?cms=1");
  });
});

describe("cmsLabel", () => {
  it("Osio › Alaosio", () => {
    expect(cmsLabel("home.hero", { home: "Etusivu" })).toBe("Etusivu › Hero");
    expect(cmsLabel("footer", { footer: "Alatunniste" })).toBe("Alatunniste");
    expect(cmsLabel("villas.detail.calendar", { villas: "Villat-sivu" })).toBe(
      "Villat-sivu › Detail › Calendar",
    );
  });
});
