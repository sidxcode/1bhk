"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import Gallery from "./components/Gallery";
import ScrollToTop from "./components/ScrollToTop";

const DitherBackground = dynamic(() => import("./components/Dither"), { ssr: false });

type Section = "home" | "now" | "about" | "playground";
type Category = "All" | "Product" | "Web" | "Brand";
type Appearance = { theme: "light" | "dark"; hue: number };
const appearanceKey = "portfolio-dither-appearance";

const sections: { id: Section; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "now", label: "Now" },
  { id: "about", label: "About" },
  { id: "playground", label: "Playground" },
];

const projects: { name: string; kind: string; categories: Category[]; galleryId: string }[] = [
  { name: "Canine Studio", kind: "Web & Brand Design", categories: ["Web", "Brand"], galleryId: "canine-studio" },
  { name: "Asanjo", kind: "Product Design", categories: ["Product"], galleryId: "asanjo" },
  { name: "Eatree", kind: "Product Design", categories: ["Product"], galleryId: "eatree" },
  { name: "Tata Group & Sons", kind: "Brand Design", categories: ["Brand"], galleryId: "tata" },
  { name: "Jagdish Store", kind: "Web Design", categories: ["Web"], galleryId: "jagdish" },
  { name: "Spread Home", kind: "Web Design", categories: ["Web"], galleryId: "spread-home" },
  { name: "Happiness Coach", kind: "Brand Design", categories: ["Brand"], galleryId: "happiness-coach" },
];

function HomeContent({ onHover, onFocus }: { onHover: (id: string | null) => void; onFocus: (id: string | null) => void }) {
  const [category, setCategory] = useState<Category>("All");
  const visibleProjects = projects.filter(
    (project) => category === "All" || project.categories.includes(category),
  );

  return (
    <>
      <div className="intro-heading">
        <h1>Siddharth Borman</h1>
        <p>Product &amp; Web Designer</p>
      </div>

      <div className="intro-copy">
        <p>
          Design generalist working across product, brand and web with early-stage teams.
          <br />
          Currently working as a product designer @caninestudio
        </p>
        <p>I like art, technology, and ideas that are new and ambitious.</p>
        <a className="contact-button" href="mailto:hello@siddharthborman.com">
          Get in touch
        </a>
      </div>

      <section className="work-section" aria-labelledby="work-heading">
        <div className="work-heading-row">
          <h2 id="work-heading">Work</h2>
          <div className="filters" aria-label="Filter work by category">
            {(["All", "Product", "Web", "Brand"] as Category[]).map((filter) => (
              <button
                key={filter}
                type="button"
                className={`filter ${category === filter ? "active" : ""}`}
                aria-pressed={category === filter}
                onClick={() => { setCategory(filter); onHover(null); onFocus(null); }}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        <div className="project-list">
          {visibleProjects.map((project) => (
            <div className="project-row" key={project.name} tabIndex={0}
              onPointerEnter={(event) => { if (event.pointerType !== "touch") onHover(project.galleryId); }}
              onPointerLeave={() => onHover(null)}
              onFocus={() => onFocus(project.galleryId)} onBlur={() => onFocus(null)}>
              <span>{project.name}</span>
              <span className="project-kind">{project.kind}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function NowContent() {
  return (
    <div className="text-page now-page">
      <section>
        <p>Currently rewatching Modern Family.</p>
        <p>Getting back into sketching.</p>
      </section>
      <section>
        <h2>August</h2>
        <p>Hosted Board Game Night.</p>
        <p>Obviously had to watch Spiderman : Brand New Day in the theatres.</p>
        <p>Had my wisdom removed.</p>
      </section>
      <section>
        <h2>July</h2>
        <p>Started Redesigning and developing shopify site for SpreadHome.</p>
        <p>Got a nice space in Indiranagar, Bangalore.</p>
        <p>Moved back to Bangalore.</p>
      </section>
    </div>
  );
}

function AboutContent() {
  return (
    <div className="text-page about-page">
      <section>
        <p>Hi, I am Siddharth Borman from Assam, although i have spent my whole life traveling all across India.</p>
        <p>I graduated from Kalinga Institute Of Industrial Technology with a bachelor’s degree in Information Technology in 2025.</p>
        <p>I first stumbled across design during my second year at university, where i started designing websites because i was into really into web development, and somehow ended up getting my first freelance client to design an app.</p>
        <p>Fast forward to a few projects and experimenting with layouts, typography and colors later. I started interning @CanineStudio (prev. PixelCanine Studio).</p>
      </section>
      <section>
        <h2>Outside work</h2>
        <p>Hi, I am Siddharth Borman from Assam, although i have spent my whole life traveling all across India.</p>
        <p>I graduated from Kalinga Institute Of Industrial Technology with a bachelor’s degree in Information Technology in 2025.</p>
        <p>I first stumbled across design during my second year at university, where i started designing websites because i was into really into web development, and somehow ended up getting my first freelance client to design an app.</p>
        <p>Fast forward to a few projects and experimenting with layouts, typography and colors later. I started interning @CanineStudio (prev. PixelCanine Studio).</p>
      </section>
    </div>
  );
}

export default function Page() {
  const [section, setSection] = useState<Section>("home");
  const [appearance, setAppearance] = useState<Appearance>({ theme: "dark", hue: 220 });
  const contentRef = useRef<HTMLElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const transitionOrigin = useRef<{ x: number; y: number } | null>(null);
  const previousSection = useRef(section);
  const [hoveredGallery, setHoveredGallery] = useState<string | null>(null);
  const [focusedGallery, setFocusedGallery] = useState<string | null>(null);

  useLayoutEffect(() => {
    if (previousSection.current === section) return;
    previousSection.current = section;
    const page = pageRef.current;
    const origin = transitionOrigin.current;
    transitionOrigin.current = null;
    if (!page || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const bounds = page.getBoundingClientRect();
    const x = Math.max(0, Math.min(bounds.width, origin ? origin.x - bounds.left : bounds.width / 2));
    const y = Math.max(0, Math.min(bounds.height, origin ? origin.y - bounds.top : 0));
    const radius = Math.hypot(Math.max(x, bounds.width - x), Math.max(y, bounds.height - y));
    const animation = page.animate([
      { clipPath: `circle(0px at ${x}px ${y}px)`, opacity: 0.3, filter: "blur(5px)" },
      { clipPath: `circle(${radius}px at ${x}px ${y}px)`, opacity: 1, filter: "blur(0px)" },
    ], { duration: 700, easing: "cubic-bezier(.16,1,.3,1)" });

    return () => animation.cancel();
  }, [section]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const saved = JSON.parse(localStorage.getItem(appearanceKey) || "null");
        if (saved && (saved.theme === "light" || saved.theme === "dark")
          && typeof saved.hue === "number" && saved.hue >= 0 && saved.hue <= 360) {
          setAppearance({ theme: saved.theme, hue: saved.hue });
        }
      } catch { /* Use the default appearance when storage is unavailable. */ }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  function updateAppearance(change: Partial<Appearance>) {
    const next = { ...appearance, ...change };
    setAppearance(next);
    try { localStorage.setItem(appearanceKey, JSON.stringify(next)); } catch { /* Preferences remain usable without storage. */ }
  }

  useEffect(() => {
    const updateSection = () => {
      const hash = window.location.hash.slice(1);
      setSection(sections.some((item) => item.id === hash) ? hash as Section : "home");
      contentRef.current?.scrollTo({ top: 0 });
      if (window.matchMedia("(max-width: 700px)").matches) window.scrollTo({ top: 0, behavior: "instant" });
      setHoveredGallery(null);
      setFocusedGallery(null);
    };
    updateSection();
    window.addEventListener("hashchange", updateSection);
    return () => window.removeEventListener("hashchange", updateSection);
  }, []);

  return (
    <div className="portfolio-shell" data-theme={appearance.theme} style={{ "--accent-hue": appearance.hue } as CSSProperties}>
      <div className="site-background" aria-hidden="true">
        <DitherBackground {...appearance} />
      </div>
      <nav className="side-nav" aria-label="Main navigation">
        {sections.map((item) => (
          <a key={item.id} href={`#${item.id}`} aria-current={section === item.id ? "page" : undefined}
            onClick={(event) => {
              if (section === item.id || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              const bounds = event.currentTarget.getBoundingClientRect();
              transitionOrigin.current = event.detail === 0
                ? { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 }
                : { x: event.clientX, y: event.clientY };
            }}>
            {item.label}
          </a>
        ))}
      </nav>
      <main className="content-panel" ref={contentRef} id={section}>
        <div className="content-inner" ref={pageRef}>
          {section === "home" && <HomeContent onHover={setHoveredGallery} onFocus={setFocusedGallery} />}
          {section === "now" && <NowContent />}
          {section === "about" && <AboutContent />}
          {section === "playground" && <div className="text-page"><h1>Playground</h1></div>}
        </div>
      </main>
      <Gallery activeId={section === "home" ? hoveredGallery ?? focusedGallery : null} />
      <ScrollToTop />
      <aside className="appearance-controls" aria-label="Appearance">
        <div className="accent-control">
          <label htmlFor="accent-hue">Accent colour</label>
          <input id="accent-hue" className="accent-slider" type="range" min="0" max="360"
            value={appearance.hue} onChange={(event) => updateAppearance({ hue: Number(event.target.value) })} />
        </div>
        <div className="theme-control">
          <span className="control-label" id="theme-label">Theme</span>
          <div className="theme-buttons" role="group" aria-labelledby="theme-label">
            <button className="theme-button light-swatch" type="button" aria-label="Light theme"
              aria-pressed={appearance.theme === "light"} title="Light theme"
              onClick={() => updateAppearance({ theme: "light" })}><span /></button>
            <button className="theme-button dark-swatch" type="button" aria-label="Dark theme"
              aria-pressed={appearance.theme === "dark"} title="Dark theme"
              onClick={() => updateAppearance({ theme: "dark" })}><span /></button>
          </div>
        </div>
      </aside>
    </div>
  );
}
