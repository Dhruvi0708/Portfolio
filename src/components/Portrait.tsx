import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { profile } from '../content';

/*
 * The portrait in "Field notes": an arched frame revealed from the bottom up
 * while a scan line passes over it, then a slow parallax and a pointer tilt.
 * The particle sphere in the 3D scene sits behind it as a halo.
 */
export default function Portrait() {
  const root = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const reveal = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 80%' } });
      reveal
        .fromTo('[data-frame]', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' })
        .fromTo('[data-photo]', { scale: 1.35 }, { scale: 1.08, duration: 2, ease: 'expo.out' }, 0)
        .fromTo('[data-scan]', { top: '100%', opacity: 1 }, { top: '0%', duration: 1.5, ease: 'expo.inOut' }, 0)
        .to('[data-scan]', { opacity: 0, duration: 0.4 }, '-=0.1')
        .fromTo('[data-tag]', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'expo.out' }, '-=0.6');

      gsap.fromTo('[data-photo]', { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    }, el);

    const fine = window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(tilt.current, { rotateY: px * 10, rotateX: -py * 8, duration: 0.9, ease: 'power3.out' });
    };
    const leave = () => gsap.to(tilt.current, { rotateY: 0, rotateX: 0, duration: 1.2, ease: 'elastic.out(1, 0.5)' });
    if (fine) {
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerleave', leave);
    }
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      ctx.revert();
    };
  }, []);

  return (
    <figure ref={root} className="relative mx-auto w-full max-w-[420px]" style={{ perspective: '1200px' }} data-cursor>
      <div ref={tilt} className="relative [transform-style:preserve-3d]">
        {/* crop marks */}
        {['left-0 top-[18%] border-l border-t', 'right-0 top-[18%] border-r border-t', 'left-0 bottom-0 border-b border-l', 'right-0 bottom-0 border-b border-r'].map((c) => (
          <span key={c} aria-hidden className={`absolute z-[3] h-5 w-5 -m-3 border-glacier/70 ${c}`} />
        ))}

        <div data-frame className="relative aspect-[3/4] overflow-hidden rounded-b-[6px] rounded-t-[999px] bg-ink-2">
          <img
            data-photo
            src="/dhruvi.webp"
            alt={`${profile.name}, smiling, in a rose shirt and grey earmuffs beside a glacial river`}
            width={1000}
            height={1333}
            loading="lazy"
            className="h-full w-full object-cover object-[50%_35%]"
          />
          {/* cool slate grade + grain so the photo sits inside the page palette */}
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/10 mix-blend-multiply" />
          <div data-scan aria-hidden className="pointer-events-none absolute inset-x-0 z-[2] h-px bg-glacier shadow-[0_0_24px_4px_rgba(143,214,200,0.7)]" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
            <span data-tag className="label rounded-full bg-ink/60 px-3 py-1.5 text-bone backdrop-blur-md">
              Subject 00
            </span>
            <span data-tag className="label flex items-center gap-2 rounded-full bg-ink/60 px-3 py-1.5 text-glacier backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-glacier" style={{ animation: 'blink 1.4s steps(1) infinite' }} />
              Identified
            </span>
          </div>
        </div>

        {/* rotating seal */}
        <div aria-hidden className="absolute right-2 top-[46%] z-[4] grid h-24 w-24 place-items-center md:-right-12 md:h-32 md:w-32" style={{ transform: 'translateZ(40px)' }}>
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" style={{ animation: 'spin 22s linear infinite' }}>
            <defs>
              <path id="seal" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
            </defs>
            <circle cx="50" cy="50" r="49" className="fill-accent" />
            <text className="fill-ink font-mono text-[8.4px] uppercase tracking-[0.2em]">
              <textPath href="#seal">Dhruvi Patel · curious by default · </textPath>
            </text>
          </svg>
          <span className="relative font-serif text-3xl italic text-ink">D·P</span>
        </div>
      </div>
      <figcaption className="label mt-14 text-right text-bone-faint">Fig. 00 — Off-grid, between commits</figcaption>
    </figure>
  );
}
