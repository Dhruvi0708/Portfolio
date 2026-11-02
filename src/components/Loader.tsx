import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

/*
 * Opening sequence: a calibration counter that waits for the WebGL scene and
 * fonts, then splits open like a shutter.
 */
const LINES = ['initialising renderer', 'sampling noise field', 'locking onto signal'];

export default function Loader({ ready, onDone }: { ready: boolean; onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [line, setLine] = useState(0);
  const finished = useRef(false);
  const progress = useRef({ v: 0 });

  useEffect(() => {
    const t = gsap.to(progress.current, {
      v: 86,
      duration: 1.6,
      ease: 'power2.out',
      onUpdate: () => setCount(Math.round(progress.current.v)),
    });
    const id = setInterval(() => setLine((l) => Math.min(l + 1, LINES.length - 1)), 650);
    return () => {
      t.kill();
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (!ready || finished.current) return;
    finished.current = true;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      const tl = gsap.timeline({ delay: 0.25 });
      tl.to(progress.current, { v: 100, duration: 0.7, ease: 'power3.inOut', onUpdate: () => setCount(Math.round(progress.current.v)) })
        .to('[data-loader-fade]', { opacity: 0, y: -12, duration: 0.45, stagger: 0.04, ease: 'power2.in' }, '+=0.15')
        .add(onDone, '-=0.1')
        .to('[data-shutter="top"]', { yPercent: -100, duration: 1.25, ease: 'expo.inOut' }, '<')
        .to('[data-shutter="bottom"]', { yPercent: 100, duration: 1.25, ease: 'expo.inOut' }, '<')
        .set(root.current, { display: 'none' });
    });
    return () => {
      cancelled = true;
    };
  }, [ready, onDone]);

  return (
    <div ref={root} className="fixed inset-0 z-[80]" role="status" aria-live="polite" aria-label={`Loading ${count}%`}>
      <div data-shutter="top" className="absolute inset-x-0 top-0 h-1/2 border-b border-bone/10 bg-ink" />
      <div data-shutter="bottom" className="absolute inset-x-0 bottom-0 h-1/2 bg-ink" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        <div data-loader-fade className="label mb-6 flex items-center gap-3 text-bone-dim">
          <span className="h-1.5 w-1.5 rounded-full bg-sodium" style={{ animation: 'blink 0.9s steps(1) infinite' }} />
          {LINES[line]}
        </div>
        <div data-loader-fade className="display text-[22vw] tabular-nums text-bone md:text-[13vw]">
          {String(count).padStart(3, '0')}
        </div>
        <div data-loader-fade className="mt-8 h-px w-[min(420px,70vw)] bg-bone/10">
          <div className="h-full bg-sodium" style={{ width: `${count}%` }} />
        </div>
        <div data-loader-fade className="label mt-4 text-bone-faint">
          Noise → Signal
        </div>
      </div>
    </div>
  );
}
