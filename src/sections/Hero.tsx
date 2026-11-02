import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { profile } from '../content';
import { scrollToId } from '../lib/smooth';
import { store } from '../lib/store';

export default function Hero({ entered }: { entered: boolean }) {
  const root = useRef<HTMLElement>(null);
  const name = useRef<HTMLHeadingElement>(null);

  // Entrance — runs as the loader shutter opens.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.set('[data-char]', { yPercent: 120, rotateX: -80, opacity: 0 });
      gsap.set('[data-hero-fade]', { opacity: 0, y: 24 });
      gsap.set('[data-hero-line]', { scaleX: 0 });
      if (!entered) return;
      const tl = gsap.timeline({ delay: 0.35 });
      tl.to('[data-char]', { yPercent: 0, rotateX: 0, opacity: 1, duration: 1.6, ease: 'expo.out', stagger: 0.06 })
        .to('[data-hero-line]', { scaleX: 1, duration: 1.4, ease: 'expo.inOut' }, '-=1.2')
        .to('[data-hero-fade]', { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08 }, '-=1.0');
    }, el);
    return () => ctx.revert();
  }, [entered]);

  // Scroll-out: the name drifts up and dissolves as the box opens.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.to('[data-hero-name]', {
        yPercent: -35,
        opacity: 0,
        filter: 'blur(10px)',
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
      });
      gsap.to('[data-hero-meta]', {
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: '40% top', scrub: true },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  // Letters lean away from the pointer.
  useEffect(() => {
    if (store.reducedMotion || !window.matchMedia('(pointer: fine)').matches) return;
    const chars = name.current?.querySelectorAll<HTMLElement>('[data-char-wrap]');
    if (!chars) return;
    const onMove = (e: PointerEvent) => {
      chars.forEach((c) => {
        const r = c.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
        const dy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
        const near = Math.max(0, 1 - Math.hypot(dx, dy) * 3);
        gsap.to(c, { y: -near * 26, skewX: -dx * 14 * near, duration: 0.8, ease: 'power3.out', overwrite: true });
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <section ref={root} id="hero" data-stage={0} className="relative flex h-[100svh] min-h-[560px] flex-col justify-between px-5 pb-6 pt-24 md:px-10 md:pb-10 md:pt-28" aria-label="Introduction">
      <div data-hero-meta className="flex items-start justify-between gap-6">
        <div data-hero-fade className="label max-w-[16rem] leading-relaxed text-bone-dim">
          Personal index
          <br />
          <span className="text-bone">{profile.role}</span>
        </div>
        <div data-hero-fade className="label hidden text-right leading-relaxed text-bone-dim md:block">
          Status
          <br />
          <span className="inline-flex items-center gap-2 text-bone">
            <span className="h-1.5 w-1.5 rounded-full bg-phosphor" style={{ animation: 'blink 1.6s steps(1) infinite' }} />
            {profile.status}
          </span>
        </div>
      </div>

      <div data-hero-name>
        <p data-hero-fade className="label mb-4 text-sodium md:mb-6">
          ( Signal / Noise ) — a portfolio
        </p>
        <h1 ref={name} className="display select-none text-[27vw] text-bone [perspective:900px] md:text-[19vw]" aria-label={profile.name}>
          {profile.name.split('').map((c, i) => (
            <span key={i} data-char-wrap className="inline-block will-change-transform" aria-hidden>
              <span className="inline-block overflow-hidden pb-[0.06em]">
                <span data-char className={`inline-block origin-bottom ${i === profile.name.length - 1 ? 'italic text-sodium' : ''}`}>
                  {c}
                </span>
              </span>
            </span>
          ))}
        </h1>
        <div data-hero-line className="hairline mt-3 origin-left border-t md:mt-5" />
        <div className="mt-5 grid gap-6 md:mt-7 md:grid-cols-12 md:items-end">
          <p data-hero-fade className="max-w-xl font-serif text-[1.65rem] leading-[1.1] text-bone md:col-span-6 md:text-[2.4rem]">
            {profile.intro}
          </p>
          <div data-hero-fade className="flex items-end justify-between gap-6 md:col-span-6 md:justify-end">
            <button onClick={() => scrollToId('about')} className="group flex items-center gap-4" data-cursor>
              <span className="label text-left leading-relaxed text-bone-dim transition-colors group-hover:text-bone">
                Scroll to
                <br />
                open the box
              </span>
              <span className="relative grid h-14 w-14 place-items-center rounded-full border border-bone/25 transition-colors duration-500 group-hover:border-sodium group-hover:bg-sodium">
                <svg width="14" height="18" viewBox="0 0 14 18" fill="none" className="transition-transform duration-500 group-hover:translate-y-1" aria-hidden>
                  <path d="M7 1v15M1 10l6 6 6-6" stroke="currentColor" strokeWidth="1.3" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
