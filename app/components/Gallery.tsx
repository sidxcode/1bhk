"use client";

import { useEffect, useRef, useState } from "react";

const imageCount = 3;

function GalleryViewer({ initialIndex, origin, onClose }: {
  initialIndex: number;
  origin: DOMRect;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const move = (direction: number) => setIndex((current) => (current + direction + imageCount) % imageCount);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();

    const image = imageRef.current;
    let animation: Animation | undefined;
    if (image && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const target = image.getBoundingClientRect();
      animation = image.animate([
        { transform: `translate(${origin.x + origin.width / 2 - target.x - target.width / 2}px, ${origin.y + origin.height / 2 - target.y - target.height / 2}px) scale(${origin.width / target.width}, ${origin.height / target.height})`, opacity: 0.6 },
        { transform: "translate(0, 0) scale(1)", opacity: 1 },
      ], { duration: 320, easing: "cubic-bezier(.2,.8,.2,1)" });
    }

    return () => {
      animation?.cancel();
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [origin]);

  return (
    <dialog className="gallery-lightbox" ref={dialogRef} aria-label="Gallery image viewer"
      onClose={(event) => { if (!event.currentTarget.open) onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) dialogRef.current?.close(); }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          move(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}>
      <button className="viewer-close viewer-button" type="button" aria-label="Close image viewer"
        onClick={() => dialogRef.current?.close()}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
      </button>
      <div className="viewer-layout">
        <button className="viewer-button viewer-previous" type="button" aria-label="Previous image" onClick={() => move(-1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5-7 7 7 7M7 12h13" /></svg>
        </button>
        <figure className="viewer-figure">
          <div className="viewer-image" ref={imageRef} role="img" aria-label={`Gallery image placeholder ${index + 1} of ${imageCount}`} />
          <figcaption aria-live="polite" aria-atomic="true">{index + 1} / {imageCount}</figcaption>
        </figure>
        <button className="viewer-button viewer-next" type="button" aria-label="Next image" onClick={() => move(1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 5 7 7-7 7M4 12h13" /></svg>
        </button>
      </div>
    </dialog>
  );
}

export default function Gallery() {
  const galleryRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pauseUntilRef = useRef(0);
  const viewerOpenRef = useRef(false);
  const [selected, setSelected] = useState<{ index: number; origin: DOMRect } | null>(null);

  useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = 0;
    let previousTime = 0;

    const animate = (time: number) => {
      const horizontal = window.matchMedia("(max-width: 700px)").matches;
      const first = gallery.children[0] as HTMLElement;
      const repeat = gallery.children[imageCount] as HTMLElement;
      const distance = horizontal ? repeat.offsetLeft - first.offsetLeft : repeat.offsetTop - first.offsetTop;
      if (distance && !viewerOpenRef.current && !reducedMotion.matches && time >= pauseUntilRef.current) {
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
    <>
      <aside className="gallery-shell" aria-label="Gallery carousel">
        <div className="gallery" ref={galleryRef}
          onWheel={() => { pauseUntilRef.current = performance.now() + 3000; }}
          onTouchStart={() => { pauseUntilRef.current = performance.now() + 3000; }}
          onFocusCapture={() => { pauseUntilRef.current = Infinity; }}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) pauseUntilRef.current = performance.now() + 3000;
          }}>
          {Array.from({ length: imageCount * 4 }, (_, index) => (
            <button className="gallery-frame" type="button" key={index}
              tabIndex={index < imageCount ? 0 : -1}
              aria-label={`Open gallery image ${index % imageCount + 1}`} aria-haspopup="dialog"
              onClick={(event) => {
                triggerRef.current = event.currentTarget;
                viewerOpenRef.current = true;
                setSelected({ index: index % imageCount, origin: event.currentTarget.getBoundingClientRect() });
              }} />
          ))}
        </div>
      </aside>
      {selected && <GalleryViewer initialIndex={selected.index} origin={selected.origin} onClose={() => {
        viewerOpenRef.current = false;
        setSelected(null);
        triggerRef.current?.focus({ preventScroll: true });
      }} />}
    </>
  );
}
