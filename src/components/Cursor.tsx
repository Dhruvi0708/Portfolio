import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/** A small dot + lagging ring. Grows over interactive elements. Mouse only. */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const d = dot.current!;
    const r = ring.current!;
    d.style.display = r.style.display = 'block';
    gsap.set([d, r], { opacity: 0 });
    let shown = false;
    const dx = gsap.quickTo(d, 'x', { duration: 0.08 });
    const dy = gsap.quickTo(d, 'y', { duration: 0.08 });
    const rx = gsap.quickTo(r, 'x', { duration: 0.45, ease: 'power3' });
    const ry = gsap.quickTo(r, 'y', { duration: 0.45, ease: 'power3' });
    const move = (e: PointerEvent) => {
      if (!shown) {
        shown = true;
        gsap.set([d, r], { x: e.clientX, y: e.clientY });
        gsap.to([d, r], { opacity: 1, duration: 0.3 });
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
      const hit = (e.target as HTMLElement).closest('a,button,[data-cursor]');
      r.dataset.hover = hit ? '1' : '';
    };
    const leave = () => gsap.to([d, r], { opacity: 0, duration: 0.3 });
    const enter = () => gsap.to([d, r], { opacity: 1, duration: 0.3 });
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    document.addEventListener('pointerenter', enter);
    return () => {
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
      document.removeEventListener('pointerenter', enter);
    };
  }, []);

  return (
    <>
      <div ref={dot} className="blend-white pointer-events-none fixed left-0 top-0 z-[90] -ml-[3px] -mt-[3px] hidden h-1.5 w-1.5 rounded-full bg-bone mix-blend-difference" />
      <div
        ref={ring}
        className="blend-white pointer-events-none fixed left-0 top-0 z-[90] -ml-5 -mt-5 hidden h-10 w-10 rounded-full border border-bone/50 mix-blend-difference transition-[width,height,margin,background-color] duration-300 data-[hover='1']:-ml-8 data-[hover='1']:-mt-8 data-[hover='1']:h-16 data-[hover='1']:w-16 data-[hover='1']:bg-bone"
      />
    </>
  );
}
