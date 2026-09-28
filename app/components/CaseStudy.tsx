"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import ImageViewer, { type ViewerImage } from "./ImageViewer";
import { caseStudies, type CaseStudy, type TextBlock } from "../case-studies";

// Bar widths by distance from the hovered row, so the rail swells around the pointer.
const barWidths = [40, 32, 24, 18, 16];

function Block({ block }: { block: TextBlock }) {
  if ("sub" in block) return <p className="case-subheading">{block.sub}</p>;
  if ("pair" in block) {
    return (
      <div className="case-pair">
        <p className="case-subheading">{block.pair[0]}</p>
        <p className="case-paragraph">{block.pair[1]}</p>
      </div>
    );
  }
  return <p className="case-paragraph">{block.p}</p>;
}

function MoreWork({ slug }: { slug: string }) {
  const others = caseStudies.filter((study) => study.slug !== slug);
  return (
    <div className="case-more-list">
      {others.map((study) => (
        <a className="case-more-item" key={study.slug} href={`#work/${study.slug}`}>
          <span>{study.title}</span>
          <span className="case-more-kind">{study.discipline}</span>
        </a>
      ))}
    </div>
  );
}

export default function CaseStudyView({ study }: { study: CaseStudy }) {
  const paneRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [openSection, setOpenSection] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<{ index: number; origin: DOMRect } | null>(null);

  // One flat list of cards, each remembering the section it belongs to.
  const cards = useMemo(
    () => study.sections.flatMap((section, sectionIndex) =>
      (section.media ?? []).map((item) => ({ ...item, sectionIndex, label: section.heading }))),
    [study],
  );
  // The viewer only walks the cards that actually carry an image.
  const viewerImages: ViewerImage[] = useMemo(
    () => cards.filter((card) => card.image).map((card) => ({ label: card.caption ?? card.label, image: card.image })),
    [cards],
  );

  const sectionCount = study.sections.length;
  // The trailing "more work" row sits one past the last real section.
  const moreIndex = sectionCount;

  // The scroll position at which each rail row takes over. Sections that carry no
  // imagery still get a slice of the scroll, interpolated between their neighbours,
  // so every row is reachable by scrolling rather than only by clicking its bar.
  const readStops = useCallback(() => {
    const pane = paneRef.current;
    if (!pane) return [];
    const paneTop = pane.getBoundingClientRect().top;
    const line = pane.clientHeight * 0.4;
    const stops: (number | null)[] = [];
    for (let index = 0; index < moreIndex; index++) {
      const cardIndex = cards.findIndex((card) => card.sectionIndex === index);
      const card = cardIndex < 0 ? null : cardRefs.current[cardIndex];
      stops.push(card ? card.getBoundingClientRect().top - paneTop + pane.scrollTop - line : null);
    }
    stops.push(Math.max(0, pane.scrollHeight - pane.clientHeight - 24));

    if (stops[0] == null) stops[0] = 0;
    for (let index = 1; index < stops.length; index++) {
      if (stops[index] != null) continue;
      const next = stops.findIndex((stop, at) => at > index && stop != null);
      const previous = index - 1;
      if (next < 0) { stops[index] = stops[previous]!; continue; }
      const span = (stops[next]! - stops[previous]!) / (next - previous);
      for (let fill = index; fill < next; fill++) stops[fill] = stops[previous]! + span * (fill - previous);
    }
    return stops as number[];
  }, [cards, moreIndex]);

  // Scrolling the pane drives which section is expanded in the rail.
  useEffect(() => {
    const pane = paneRef.current;
    if (!pane) return;
    const onScroll = () => {
      if (window.matchMedia("(max-width: 700px)").matches) return;
      const stops = readStops();
      let current = 0;
      stops.forEach((stop, index) => { if (pane.scrollTop >= stop - 1) current = index; });
      setOpenSection(current);
    };
    onScroll();
    pane.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      pane.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [readStops]);

  // Wheeling anywhere over the rail scrolls the pane, so the two columns feel like one surface.
  useEffect(() => {
    const info = infoRef.current;
    const pane = paneRef.current;
    if (!info || !pane) return;
    const onWheel = (event: WheelEvent) => {
      if (window.matchMedia("(max-width: 700px)").matches) return;
      event.preventDefault();
      pane.scrollTop += event.deltaY;
    };
    info.addEventListener("wheel", onWheel, { passive: false });
    return () => info.removeEventListener("wheel", onWheel);
  }, []);

  function goToSection(index: number) {
    const pane = paneRef.current;
    if (!pane) return;
    const stops = readStops();
    const target = stops[index];
    pane.scrollTo({ top: target == null ? pane.scrollHeight : Math.max(0, target), behavior: "smooth" });
  }

  function barStyle(index: number) {
    if (hovered == null) return undefined;
    const distance = Math.min(Math.abs(index - hovered), barWidths.length - 1);
    return {
      width: barWidths[distance],
      opacity: distance === 0 ? 0.9 : 0.2,
      borderRadius: distance === 0 ? 0 : 9999,
    };
  }

  function sectionState(index: number) {
    if (index === openSection) return "is-open";
    return index < openSection ? "is-past" : "";
  }

  const rows = [
    ...study.sections.map((section, index) => ({
      key: String(index),
      heading: section.heading,
      body: (
        <>
          <h1 className="case-title">{section.heading}</h1>
          {section.blocks.map((block, blockIndex) => <Block block={block} key={blockIndex} />)}
        </>
      ),
    })),
    {
      key: "more",
      heading: "Read more projects",
      body: (
        <>
          <h1 className="case-title">Read more projects</h1>
          <MoreWork slug={study.slug} />
        </>
      ),
    },
  ];

  return (
    <>
      <div className="case-info" ref={infoRef}>
        <a className="case-back" href="#home">Go back</a>
        <div className="case-sections">
          {rows.map((row, index) => (
            <div className={`case-section ${sectionState(index)}`} key={row.key}>
              <button className="case-bar-row" type="button" aria-label={row.heading}
                aria-expanded={index === openSection} tabIndex={index === openSection ? -1 : 0}
                onMouseEnter={() => setHovered(index)} onMouseLeave={() => setHovered(null)}
                onClick={() => goToSection(index)}>
                <i className="case-bar" style={barStyle(index)} />
                <span className="case-bar-label">{row.heading}</span>
              </button>
              <div className="case-section-body">
                <div className="case-section-clip">
                  <div className="case-text">{row.body}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {study.site && study.site.length > 0 && (
          <div className="case-sites">
            {study.site.map((link) => (
              <a className="case-site" key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="case-pane" ref={paneRef}>
        {cards.map((card, index) => (
          <div className="case-card" key={index} data-has-image={!!card.image}
            ref={(element) => { cardRefs.current[index] = element; }}>
            {card.image ? (
              <button className="case-card-button" type="button" aria-label={card.caption ?? card.label}
                onClick={(event) => setSelected({
                  index: viewerImages.findIndex((item) => item.image?.src === card.image?.src),
                  origin: event.currentTarget.getBoundingClientRect(),
                })}>
                <Image className="case-card-art" src={card.image.src} alt=""
                  width={card.image.width} height={card.image.height} sizes="(max-width: 700px) 92vw, 40vw" />
              </button>
            ) : null}
            {card.caption && <span className="case-card-caption">{card.caption}</span>}
          </div>
        ))}
        <div className="case-tailspace" aria-hidden="true" />
      </div>

      {selected && selected.index >= 0 && (
        <ImageViewer images={viewerImages} initialIndex={selected.index} origin={selected.origin}
          onClose={() => setSelected(null)} />
      )}
    </>
  );
}
