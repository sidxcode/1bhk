"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const DitherBackground = dynamic(() => import("./components/Dither"), { ssr: false });

type Section = "home" | "now" | "about" | "playground";
type Category = "All" | "Product" | "Web" | "Brand";

const sections: { id: Section; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "now", label: "Now" },
  { id: "about", label: "About" },
  { id: "playground", label: "Playground" },
];

const projects: { name: string; kind: string; categories: Category[] }[] = [
  { name: "Canine Studio", kind: "Web & Brand Design", categories: ["Web", "Brand"] },
  { name: "Asanjo", kind: "Product Design", categories: ["Product"] },
  { name: "Eatree", kind: "Product Design", categories: ["Product"] },
  { name: "Tata Group & Sons", kind: "Brand Design", categories: ["Brand"] },
  { name: "Jagdish Store", kind: "Web Design", categories: ["Web"] },
  { name: "Spread Home", kind: "Web Design", categories: ["Web"] },
  { name: "Happiness Coach", kind: "Brand Design", categories: ["Brand"] },
];

function HomeContent() {
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
                onClick={() => setCategory(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        <div className="project-list">
          {visibleProjects.map((project) => (
            <div className="project-row" key={project.name} tabIndex={0}>
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

function Gallery() {
  const galleryRef = useRef<HTMLDivElement>(null);
  const pauseUntilRef = useRef(0);
  const count = 3;

  useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = 0;
    let previousTime = 0;

    const animate = (time: number) => {
      const horizontal = window.matchMedia("(max-width: 700px)").matches;
      const first = gallery.children[0] as HTMLElement;
      const repeat = gallery.children[count] as HTMLElement;
      const distance = horizontal
        ? repeat.offsetLeft - first.offsetLeft
        : repeat.offsetTop - first.offsetTop;

      if (distance && !reducedMotion.matches && time >= pauseUntilRef.current) {
        const elapsed = previousTime ? Math.min(time - previousTime, 64) : 0;
        const position = horizontal ? gallery.scrollLeft : gallery.scrollTop;
        const next = (position + elapsed * 0.045) % distance;
        if (horizontal) gallery.scrollLeft = next;
        else gallery.scrollTop = next;
      }

      previousTime = time;
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <aside className="gallery-shell" aria-label="Gallery carousel">
      <div className="gallery" ref={galleryRef} onWheel={() => { pauseUntilRef.current = performance.now() + 3000; }} onTouchStart={() => { pauseUntilRef.current = performance.now() + 3000; }}>
        {Array.from({ length: count * 4 }, (_, index) => (
          <div className="gallery-frame" key={index} aria-hidden={index >= count} aria-label={index < count ? `Gallery image placeholder ${index + 1} of ${count}` : undefined} />
        ))}
      </div>
    </aside>
  );
}

export default function Page() {
  const [section, setSection] = useState<Section>("home");
  const [ditherEnabled, setDitherEnabled] = useState(true);
  const contentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const updateSection = () => {
      const hash = window.location.hash.slice(1);
      setSection(sections.some((item) => item.id === hash) ? hash as Section : "home");
      contentRef.current?.scrollTo({ top: 0 });
    };
    updateSection();
    window.addEventListener("hashchange", updateSection);
    return () => window.removeEventListener("hashchange", updateSection);
  }, []);

  return (
    <div className="portfolio-shell">
      <div className="site-background" aria-hidden="true">
        {ditherEnabled && <DitherBackground />}
      </div>
      <nav className="side-nav" aria-label="Main navigation">
        {sections.map((item) => (
          <a key={item.id} href={`#${item.id}`} aria-current={section === item.id ? "page" : undefined}>
            {item.label}
          </a>
        ))}
      </nav>
      <main className="content-panel" ref={contentRef} id={section}>
        <div className="content-inner">
          {section === "home" && <HomeContent />}
          {section === "now" && <NowContent />}
          {section === "about" && <AboutContent />}
          {section === "playground" && <div className="text-page"><h1>Playground</h1></div>}
        </div>
      </main>
      <Gallery />
      <button
        className="dither-toggle"
        type="button"
        aria-label="Animated background"
        aria-pressed={ditherEnabled}
        title={ditherEnabled ? "Turn off animated background" : "Turn on animated background"}
        onClick={() => setDitherEnabled((enabled) => !enabled)}
      />
    </div>
  );
}
