"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export type ViewerImage = { label: string; image?: { src: string; width: number; height: number } };

export default function ImageViewer({ images, initialIndex, origin, onClose }: {
  images: ViewerImage[];
  initialIndex: number;
  origin: DOMRect;
  onClose: () => void;
}) {
  const count = images.length;
  const [index, setIndex] = useState(initialIndex);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const move = (direction: number) => setIndex((current) => (current + direction + count) % count);
  const currentImage = images[index].image;

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
    <dialog className="gallery-lightbox" ref={dialogRef} aria-label="Image viewer"
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
            aria-label={currentImage ? images[index].label : `${images[index].label} placeholder`}>
            {currentImage && <Image className="viewer-art" src={currentImage.src}
              alt="" width={currentImage.width} height={currentImage.height} sizes="(max-width: 700px) 80vw, 860px" />}
          </div>
          <figcaption aria-live="polite" aria-atomic="true">{images[index].label} · {index + 1} / {count}</figcaption>
        </figure>
        <button className="viewer-button viewer-next" type="button" aria-label="Next image" onClick={() => move(1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 5 7 7-7 7M4 12h13" /></svg>
        </button>
      </div>
    </dialog>
  );
}
