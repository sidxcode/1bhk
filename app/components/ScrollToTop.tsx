"use client";

import { useEffect, useState } from "react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 700px)");
    const update = () => setVisible(mobile.matches && window.scrollY > window.innerHeight * 2);
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    mobile.addEventListener("change", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      mobile.removeEventListener("change", update);
    };
  }, []);

  if (!visible) return null;

  return (
    <button className="scroll-to-top" type="button" aria-label="Scroll to top" title="Scroll to top"
      onClick={() => {
        document.querySelector<HTMLAnchorElement>(".side-nav a")?.focus({ preventScroll: true });
        window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
      }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m5 12 7-7 7 7M12 5v15" />
      </svg>
    </button>
  );
}
