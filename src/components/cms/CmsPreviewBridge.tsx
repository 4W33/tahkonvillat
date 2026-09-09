"use client";

import { useEffect } from "react";
import { findBestCmsKey } from "@/lib/cms/cms-keys";

type ParentMessage =
  | { type: "cms:focus"; key: string; label?: string }
  | { type: "cms:reload" };

/**
 * Aktiivinen vain kun sivu on adminin iframessa (?cms=1 JA parent !== window).
 * Korostaa muokattavan osion ja kertoo adminille klikatun osion. Ei tee mitään
 * tavallisille kävijöille.
 */
export function CmsPreviewBridge() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("cms") !== "1" || window.parent === window) return;

    const origin = window.location.origin;
    const root = document.documentElement;
    root.setAttribute("data-cms-preview", "1");
    let timer: number | undefined;

    function clearActive() {
      document.querySelectorAll("[data-cms-active]").forEach((el) => {
        el.removeAttribute("data-cms-active");
        el.removeAttribute("data-cms-label");
      });
    }

    function highlight(el: Element, label: string) {
      clearActive();
      el.setAttribute("data-cms-active", "1");
      el.setAttribute("data-cms-label", label);
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      window.clearTimeout(timer);
      timer = window.setTimeout(clearActive, 3000);
    }

    function onMessage(event: MessageEvent<ParentMessage>) {
      if (event.origin !== origin) return;
      const data = event.data;
      if (!data || typeof data !== "object") return;
      if (data.type === "cms:reload") {
        window.location.reload();
        return;
      }
      if (data.type === "cms:focus" && data.key) {
        const available = Array.from(
          document.querySelectorAll<HTMLElement>("[data-cms]"),
        ).map((el) => el.dataset.cms ?? "");
        const best = findBestCmsKey(data.key, available);
        if (!best) return;
        const el = document.querySelector(`[data-cms="${best}"]`);
        if (el) highlight(el, data.label ?? best);
      }
    }

    function onClick(event: MouseEvent) {
      const target = (event.target as Element | null)?.closest<HTMLElement>("[data-cms]");
      if (!target) return;
      event.preventDefault();
      event.stopPropagation();
      window.parent.postMessage({ type: "cms:select", key: target.dataset.cms }, origin);
    }

    window.addEventListener("message", onMessage);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("message", onMessage);
      document.removeEventListener("click", onClick, true);
      window.clearTimeout(timer);
      root.removeAttribute("data-cms-preview");
    };
  }, []);

  return null;
}
