"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// Standalone images deliberately have no corresponding work item.
const galleryImages: { id: string; label: string; image?: { src: string; width: number; height: number } }[] = [
  { id: "canine-studio", label: "Canine Studio", image: { src: "/canine-studio.png", width: 2914, height: 1736 } },
  { id: "asanjo", label: "Asanjo" },
  { id: "standalone-1", label: "Gallery image 1" },
  { id: "eatree", label: "Eatree", image: { src: "/eatree.png", width: 2916, height: 1736 } },
  { id: "tata", label: "Tata Group & Sons", image: { src: "/tata-prioritized-comment-queue-19653c72.png", width: 4164, height: 2984 } },
  { id: "standalone-2", label: "Gallery image 2" },
  { id: "jagdish", label: "Jagdish Store" },
  { id: "spread-home", label: "Spread Home" },
  { id: "standalone-3", label: "Gallery image 3" },
  { id: "happiness-coach", label: "Happiness Coach" },
];
const imageCount = galleryImages.length;

function GalleryViewer({ initialIndex, origin, onClose }: {
  initialIndex: number;
  origin: DOMRect;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const move = (direction: number) => setIndex((current) => (current + direction + imageCount) % imageCount);
  const currentImage = galleryImages[index].image;

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
          <div className="viewer-image" ref={imageRef} role="img" data-has-image={!!currentImage}
            aria-label={currentImage ? galleryImages[index].label : `${galleryImages[index].label} placeholder`}>
            {currentImage && <Image className="viewer-art" src={currentImage.src}
              alt="" width={currentImage.width} height={currentImage.height} sizes="(max-width: 700px) 80vw, 860px" />}
          </div>
          <figcaption aria-live="polite" aria-atomic="true">{galleryImages[index].label} · {index + 1} / {imageCount}</figcaption>
        </figure>
        <button className="viewer-button viewer-next" type="button" aria-label="Next image" onClick={() => move(1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 5 7 7-7 7M4 12h13" /></svg>
        </button>
      </div>
    </dialog>
  );
}

export default function Gallery({ activeId }: { activeId: string | null }) {
  const galleryRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pauseUntilRef = useRef(0);
  const viewerOpenRef = useRef(false);
  const previewRef = useRef<HTMLElement | null>(null);
  const [selected, setSelected] = useState<{ index: number; origin: DOMRect } | null>(null);

  useEffect(() => {
    const gallery = galleryRef.current;
    previewRef.current = null;
    if (!gallery || !activeId) return;
    const horizontal = window.matchMedia("(max-width: 700px)").matches;
    if (horizontal) return;
    const viewport = horizontal ? gallery.clientWidth : gallery.clientHeight;
    const position = horizontal ? gallery.scrollLeft : gallery.scrollTop;
    const max = horizontal ? gallery.scrollWidth - viewport : gallery.scrollHeight - viewport;
    const galleryBounds = gallery.getBoundingClientRect();
    let closestDistance = Infinity;
    for (const card of Array.from(gallery.children) as HTMLElement[]) {
      if (card.dataset.galleryId !== activeId) continue;
      const bounds = card.getBoundingClientRect();
      const center = position + (horizontal
        ? bounds.left - galleryBounds.left + bounds.width / 2
        : bounds.top - galleryBounds.top + bounds.height / 2);
      const target = center - viewport / 2;
      if (target < 0 || target > max) continue;
      if (Math.abs(target - position) < closestDistance) {
        closestDistance = Math.abs(target - position);
        previewRef.current = card;
      }
    }
  }, [activeId]);

  useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 700px)");
    let animationFrame = 0;
    let previousTime = 0;

    const animate = (time: number) => {
      if (mobile.matches) return;
      const horizontal = window.matchMedia("(max-width: 700px)").matches;
      const first = gallery.children[0] as HTMLElement;
      const repeat = gallery.children[imageCount] as HTMLElement;
      const distance = horizontal ? repeat.offsetLeft - first.offsetLeft : repeat.offsetTop - first.offsetTop;
      const preview = previewRef.current;
      if (preview && !viewerOpenRef.current) {
        const position = horizontal ? gallery.scrollLeft : gallery.scrollTop;
        const bounds = preview.getBoundingClientRect();
        const galleryBounds = gallery.getBoundingClientRect();
        const target = position + (horizontal
          ? bounds.left + bounds.width / 2 - galleryBounds.left - gallery.clientWidth / 2
          : bounds.top + bounds.height / 2 - galleryBounds.top - gallery.clientHeight / 2);
        const elapsed = previousTime ? Math.min(time - previousTime, 64) : 16;
        const next = reducedMotion.matches || Math.abs(target - position) < 1.5
          ? target : position + (target - position) * (1 - Math.exp(-elapsed / 95));
        if (horizontal) gallery.scrollLeft = next;
        else gallery.scrollTop = next;
      } else if (distance && !viewerOpenRef.current && !reducedMotion.matches && time >= pauseUntilRef.current) {
        const elapsed = previousTime ? Math.min(time - previousTime, 64) : 0;
        const position = horizontal ? gallery.scrollLeft : gallery.scrollTop;
        const next = (position + elapsed * 0.045) % distance;
        if (horizontal) gallery.scrollLeft = next;
        else gallery.scrollTop = next;
      }
      previousTime = time;
      animationFrame = requestAnimationFrame(animate);
    };
    const updateLayout = () => {
      cancelAnimationFrame(animationFrame);
      previousTime = 0;
      if (mobile.matches) {
        previewRef.current = null;
        gallery.scrollTop = 0;
        gallery.scrollLeft = 0;
      } else {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    updateLayout();
    mobile.addEventListener("change", updateLayout);
    return () => {
      cancelAnimationFrame(animationFrame);
      mobile.removeEventListener("change", updateLayout);
    };
  }, []);

  return (
    <>
      <aside className="gallery-shell" aria-label="Gallery" data-previewing={!!activeId}>
        <div className="gallery" ref={galleryRef}
          onWheel={() => { pauseUntilRef.current = performance.now() + 3000; }}
          onTouchStart={() => { pauseUntilRef.current = performance.now() + 3000; }}
          onFocusCapture={() => { pauseUntilRef.current = Infinity; }}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) pauseUntilRef.current = performance.now() + 3000;
          }}>
          {Array.from({ length: imageCount * 4 }, (_, index) => {
            const item = galleryImages[index % imageCount];
            return (
              <button className="gallery-frame" type="button" key={index}
                disabled
                data-repeat={index >= imageCount}
                data-has-image={!!item.image}
                data-gallery-id={item.id}
                data-highlighted={activeId === item.id}
                tabIndex={-1}
                aria-label={item.label}
                onClick={(event) => {
                  triggerRef.current = event.currentTarget;
                  viewerOpenRef.current = true;
                  setSelected({ index: index % imageCount, origin: event.currentTarget.getBoundingClientRect() });
                }}>
                {item.image && <Image className="gallery-art"
                  src={item.image.src} alt="" width={item.image.width} height={item.image.height}
                  sizes="(max-width: 700px) 80vw, 35vw" />}
                <span className="gallery-card-label">{item.label}</span>
              </button>
            );
          })}
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
