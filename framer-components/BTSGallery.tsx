import * as React from "react"
import { createPortal } from "react-dom"
import { addPropertyControls, ControlType } from "framer"

type GalleryImage = {
    src?: string
    srcSet?: string
    alt?: string
}

type Slide = {
    image?: GalleryImage | string
}

type Props = {
    slides?: Slide[]
    minTileWidth?: number
    gap?: number
    cornerRadius?: number
    style?: React.CSSProperties
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export function BTSGallery(props: Props) {
    const {
        slides = [],
        minTileWidth = 150,
        gap = 12,
        cornerRadius = 12,
        style,
    } = props
    const [activeIndex, setActiveIndex] = React.useState<number | null>(null)

    const images = React.useMemo(
        () =>
            slides
                .map((slide) => {
                    const value = slide?.image
                    return typeof value === "string" ? { src: value } : value
                })
                .filter((image): image is GalleryImage => Boolean(image?.src)),
        [slides]
    )

    React.useEffect(() => {
        if (activeIndex === null) return
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setActiveIndex(null)
            if (event.key === "ArrowRight") {
                setActiveIndex((index) =>
                    index === null ? null : (index + 1) % images.length
                )
            }
            if (event.key === "ArrowLeft") {
                setActiveIndex((index) =>
                    index === null
                        ? null
                        : (index - 1 + images.length) % images.length
                )
            }
        }
        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [activeIndex, images.length])

    const activeImage = activeIndex === null ? null : images[activeIndex]

    return (
        <div style={{ width: "100%", ...style }}>
            {images.length === 0 ? (
                <div
                    style={{
                        minHeight: 120,
                        display: "grid",
                        placeItems: "center",
                        border: "1px dashed #d4d1c9",
                        borderRadius: cornerRadius,
                        color: "#77756e",
                        fontSize: 14,
                    }}
                >
                    Connect the Images property to the Project Gallery field
                </div>
            ) : (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${minTileWidth}px), 1fr))`,
                        gap,
                    }}
                >
                    {images.map((image, index) => (
                        <button
                            key={`${image.src}-${index}`}
                            type="button"
                            aria-label={`Open image ${index + 1} of ${images.length}`}
                            onClick={() => setActiveIndex(index)}
                            style={{
                                display: "block",
                                width: "100%",
                                aspectRatio: "1 / 1",
                                padding: 0,
                                border: 0,
                                borderRadius: cornerRadius,
                                overflow: "hidden",
                                background: "#e8e6e0",
                                cursor: "zoom-in",
                            }}
                        >
                            <img
                                src={image.src}
                                srcSet={image.srcSet}
                                alt={image.alt || `Behind the scenes image ${index + 1}`}
                                loading="lazy"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    display: "block",
                                }}
                            />
                        </button>
                    ))}
                </div>
            )}

            {activeImage &&
                typeof document !== "undefined" &&
                createPortal(
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Behind the scenes photo"
                        onClick={() => setActiveIndex(null)}
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 2147483647,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 12,
                            padding: 24,
                            background: "rgba(0, 0, 0, 0.9)",
                        }}
                    >
                        <button
                            type="button"
                            aria-label="Close gallery"
                            onClick={() => setActiveIndex(null)}
                            style={{ ...controlStyle, position: "absolute", top: 20, right: 20 }}
                        >
                            ×
                        </button>
                        {images.length > 1 && (
                            <button
                                type="button"
                                aria-label="Previous image"
                                onClick={(event) => {
                                    event.stopPropagation()
                                    setActiveIndex((index) =>
                                        index === null
                                            ? null
                                            : (index - 1 + images.length) % images.length
                                    )
                                }}
                                style={controlStyle}
                            >
                                ‹
                            </button>
                        )}
                        <img
                            src={activeImage.src}
                            srcSet={activeImage.srcSet}
                            alt={activeImage.alt || "Behind the scenes photo"}
                            onClick={(event) => event.stopPropagation()}
                            style={{
                                maxWidth: "min(100%, 1100px)",
                                maxHeight: "85vh",
                                objectFit: "contain",
                            }}
                        />
                        {images.length > 1 && (
                            <button
                                type="button"
                                aria-label="Next image"
                                onClick={(event) => {
                                    event.stopPropagation()
                                    setActiveIndex((index) =>
                                        index === null ? null : (index + 1) % images.length
                                    )
                                }}
                                style={controlStyle}
                            >
                                ›
                            </button>
                        )}
                    </div>,
                    document.body
                )}
        </div>
    )
}

const controlStyle: React.CSSProperties = {
    flex: "none",
    width: 42,
    height: 42,
    border: 0,
    borderRadius: 12,
    background: "#ffffff",
    color: "#222222",
    fontSize: 30,
    lineHeight: 1,
    cursor: "pointer",
}

BTSGallery.defaultProps = {
    slides: [],
    minTileWidth: 150,
    gap: 12,
    cornerRadius: 12,
}

addPropertyControls(BTSGallery, {
    slides: {
        type: ControlType.Array,
        title: "Images",
        control: {
            type: ControlType.Object,
            controls: {
                image: {
                    type: ControlType.ResponsiveImage,
                    title: "Image",
                },
            },
        },
    },
    minTileWidth: {
        type: ControlType.Number,
        title: "Min Tile Width",
        min: 80,
        max: 400,
        step: 10,
        defaultValue: 150,
    },
    gap: {
        type: ControlType.Number,
        title: "Gap",
        min: 0,
        max: 40,
        step: 1,
        defaultValue: 12,
    },
    cornerRadius: {
        type: ControlType.Number,
        title: "Radius",
        min: 0,
        max: 40,
        step: 1,
        defaultValue: 12,
    },
})
