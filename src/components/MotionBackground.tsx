import { useEffect, useRef } from "react";

export function MotionBackground() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;
    let raf = 0;
    let tx = 50, ty = 40, x = 50, y = 40;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width) * 100;
      ty = ((e.clientY - r.top) / r.height) * 100;
    };
    const tick = () => {
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      ref.current?.style.setProperty("--mx", `${x}%`);
      ref.current?.style.setProperty("--my", `${y}%`);
      raf = requestAnimationFrame(tick);
    };
    el.addEventListener("pointermove", move);
    raf = requestAnimationFrame(tick);
    return () => {
      el.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className="motion-bg pointer-events-none absolute inset-0 overflow-hidden">
      <div className="motion-blob motion-blob-a" />
      <div className="motion-blob motion-blob-b" />
      <div className="motion-grid absolute inset-0" />
      <div className="motion-spot absolute inset-0" />
    </div>
  );
}
