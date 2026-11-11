"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties, type PointerEvent, type WheelEvent } from "react";
import type { MediaBlock } from "../../case-studies";

type Offset = { x: number; y: number };

function InfiniteCanvas({ item, title }: { item: MediaBlock; title: string }) {
  const [expanded, setExpanded] = useState(false);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [drag, setDrag] = useState<{ pointerId: number; x: number; y: number; origin: Offset } | null>(null);

  useEffect(() => {
    if (!expanded) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setExpanded(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [expanded]);

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ pointerId: event.pointerId, x: event.clientX, y: event.clientY, origin: offset });
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    if (!drag || drag.pointerId !== event.pointerId) return;
    setOffset({ x: drag.origin.x + event.clientX - drag.x, y: drag.origin.y + event.clientY - drag.y });
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    if (drag?.pointerId === event.pointerId) setDrag(null);
  }

  function zoom(event: WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    setScale((current) => Math.min(3, Math.max(0.5, current - event.deltaY * 0.001)));
  }

  const canvasStyle = {
    "--canvas-x": `${offset.x}px`,
    "--canvas-y": `${offset.y}px`,
    "--canvas-scale": scale,
  } as CSSProperties;

  return (
    <figure className={`case-banner infinite-banner${expanded ? " is-expanded" : ""}`}>
      <div
        className={`infinite-canvas${drag ? " is-dragging" : ""}`}
        style={canvasStyle}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onWheel={zoom}
      >
        <div className="infinite-artwork">
          {item.image ? (
            <Image src={item.image.src} alt="" width={item.image.width} height={item.image.height} draggable={false} />
          ) : (
            <span className="canvas-note">Drag to explore · Scroll to zoom</span>
          )}
        </div>
      </div>

      <button
        className="canvas-expand"
        type="button"
        aria-label={expanded ? "Close expanded canvas" : `Expand ${title} canvas`}
        aria-pressed={expanded}
        onClick={() => setExpanded((current) => !current)}
      >
        {expanded ? "×" : "↗"}
      </button>
      {item.caption && <figcaption>{item.caption}</figcaption>}
    </figure>
  );
}

export default function CaseMediaGallery({ media, title }: { media: MediaBlock[]; title: string }) {
  const banners: MediaBlock[] = media.length >= 2
    ? media
    : [...media, ...Array.from({ length: 2 - media.length }, (): MediaBlock => ({}))];

  return (
    <section className="case-banners" aria-label={`${title} project media`}>
      {banners.map((item, index) => index === 1 ? (
        <InfiniteCanvas item={item} title={title} key={`canvas-${index}`} />
      ) : (
        <figure className="case-banner" key={`${item.image?.src ?? "placeholder"}-${index}`}>
          {item.image ? (
            <Image
              src={item.image.src}
              alt=""
              width={item.image.width}
              height={item.image.height}
              sizes="(max-width: 700px) calc(100vw - 48px), 67vw"
              priority={index === 0}
            />
          ) : null}
          {item.caption && <figcaption>{item.caption}</figcaption>}
        </figure>
      ))}
    </section>
  );
}
