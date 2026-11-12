import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { journey } from '../content';
import { RiseText, Scramble, T } from '../components/Text';

const KIND: Record<(typeof journey)[number]['kind'], string> = {
  learning: 'Learning',
  hackathon: 'Hackathon',
  event: 'Event',
  build: 'Build',
  work: 'Internship',
  next: 'Next',
};

/* A seismograph path with one burst per journey entry. */
function tracePath(n: number, w: number, h: number) {
  const mid = h / 2;
  const step = w / n;
  let d = `M 0 ${mid}`;
  for (let x = 0; x <= w; x += 6) {
    const k = Math.round((x - step / 2) / step);
    const c = step / 2 + k * step;
    const dx = x - c;
    const burst = Math.exp(-(dx * dx) / 900) * Math.sin(dx / 3.2) * (h * 0.42);
    const hum = Math.sin(x / 13) * 2 + Math.sin(x / 5.3) * 1.2;
    d += ` L ${x} ${(mid + burst + hum).toFixed(1)}`;
  }
  return d;
}

export default function Journey() {
  const outer = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const t = track.current!;
      const len = path.current!.getTotalLength();
      gsap.set(path.current, { strokeDasharray: len, strokeDashoffset: len });
      const distance = () => t.scrollWidth - window.innerWidth;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pin.current,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
      tl.fromTo(t, { x: 0 }, { x: () => -distance(), ease: 'none' }, 0).to(path.current, { strokeDashoffset: 0, ease: 'none' }, 0)
        // the title steps aside once the trace starts moving so entries never collide with it
        .fromTo(heading.current, { opacity: 1, y: 0 }, { opacity: 0, y: -40, ease: 'none', duration: 0.08 }, 0.04);
      gsap.utils.toArray<HTMLElement>('[data-entry]').forEach((el) => {
        gsap.fromTo(el.querySelectorAll('[data-entry-in]'), { y: 40, opacity: 0 }, {
          y: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 1,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, containerAnimation: tl, start: 'left 80%' },
        });
      });
    });
    return () => mm.revert();
  }, []);

  const W = journey.length * 600;

  return (
    <div ref={outer} id="journey" data-stage={6} aria-labelledby="journey-title">
      <section ref={pin} className="relative overflow-hidden md:h-[100svh]">
        <div ref={heading} className="px-5 pt-28 md:absolute md:inset-x-0 md:top-0 md:z-10 md:px-10 md:pt-28">
          <p className="label mb-4 text-accent">
            <Scramble text="04 — Signal log" />
          </p>
          <RiseText as="h2" text="Every spike is a story." className="display max-w-[14ch] text-[15vw] md:text-[6vw]" />
          <h2 id="journey-title" className="sr-only">
            Journey
          </h2>
        </div>

        {/* Desktop: horizontal track */}
        <div ref={track} className="relative hidden h-full w-max items-center md:flex" style={{ paddingLeft: '30vw', paddingRight: '20vw' }}>
          <svg className="pointer-events-none absolute left-[30vw] top-1/2 -translate-y-1/2" width={W} height="220" viewBox={`0 0 ${W} 220`} aria-hidden>
            <line x1="0" x2={W} y1="110" y2="110" stroke="currentColor" className="text-bone/10" strokeDasharray="2 6" />
            <path ref={path} d={tracePath(journey.length, W, 220)} fill="none" stroke="#ff4f8b" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
          {journey.map((j, i) => (
            <div key={i} data-entry className="relative flex h-full w-[600px] shrink-0 flex-col items-center justify-center">
              <span data-entry-in className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-accent bg-ink" />
              <div className={`absolute w-[320px] text-center ${i % 2 ? 'bottom-[calc(50%+90px)]' : 'top-[calc(50%+90px)]'}`}>
                <p data-entry-in className="label mb-3 flex items-center justify-center gap-3 text-bone-dim">
                  <span className={j.kind === 'next' ? 'text-accent' : ''}>{KIND[j.kind]}</span>
                  <span className="h-px w-6 bg-bone/30" />
                  <T>{j.when}</T>
                </p>
                <h3 data-entry-in className="font-serif text-4xl leading-none">
                  <T>{j.title}</T>
                </h3>
                <p data-entry-in className="mt-3 text-[15px] leading-relaxed text-bone-dim">
                  <T>{j.body}</T>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: vertical trace */}
        <ol className="relative mx-5 mt-14 border-l border-accent/50 pb-24 md:hidden">
          {journey.map((j, i) => (
            <li key={i} className="relative pb-12 pl-8 last:pb-0">
              <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full border-2 border-accent bg-ink" />
              <p className="label mb-2 text-bone-dim">
                <span className={j.kind === 'next' ? 'text-accent' : ''}>{KIND[j.kind]}</span> · <T>{j.when}</T>
              </p>
              <h3 className="font-serif text-3xl leading-none">
                <T>{j.title}</T>
              </h3>
              <p className="mt-2 leading-relaxed text-bone-dim">
                <T>{j.body}</T>
              </p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
