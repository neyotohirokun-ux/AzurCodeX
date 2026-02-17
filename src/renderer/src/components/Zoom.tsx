import { useEffect, useRef, useState } from "react";

interface ZoomProps {
  src: string;
  alt?: string;
  enabled?: boolean; // only zoom when true
  maxScale?: number;
  minScale?: number;
}

interface Translate {
  x: number;
  y: number;
}

export default function Zoom({
  src,
  alt = "",
  enabled = false,
  maxScale = 3,
  minScale = 1,
}: ZoomProps) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState<Translate>({ x: 0, y: 0 });

  const isDragging = useRef(false);
  const dragStart = useRef<Translate>({ x: 0, y: 0 });

  // Reset when disabled
  useEffect(() => {
    if (!enabled) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    }
  }, [enabled]);

  // Wheel zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (!enabled) return;
      e.preventDefault();

      setScale((prev) => {
        const step = 0.1;
        let next = prev + (e.deltaY < 0 ? step : -step);
        next = Math.min(Math.max(next, minScale), maxScale);

        if (next === 1) {
          setTranslate({ x: 0, y: 0 }); // snap back to center
        }

        return next;
      });
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [enabled, minScale, maxScale]);

  // Dragging
  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    setTranslate({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const onMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  const onMouseDown = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!enabled || scale === 1 || e.button !== 0) return;

    isDragging.current = true;
    dragStart.current = {
      x: e.clientX - translate.x,
      y: e.clientY - translate.y,
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "relative",
        cursor: enabled
          ? scale > 1
            ? isDragging.current
              ? "grabbing"
              : "grab"
            : "zoom-in"
          : "default",
      }}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        draggable={false}
        onMouseDown={onMouseDown}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          transformOrigin: "center center",
          maxWidth: "100%",
          maxHeight: "100%",
          userSelect: "none",
          pointerEvents: enabled ? "all" : "none",
          transition: isDragging.current ? "none" : "transform 0.1s ease-out",
        }}
      />
    </div>
  );
}
