import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { profile } from '../content';
import { scrollToId } from '../lib/smooth';
import { store } from '../lib/store';

/*
 * The name is typed in one letter at a time: a highlight block wipes across
 * each letter's cell, the letter appears underneath, and the block wipes away.
 * First name in bone under a rose highlight, surname in rose under glacier.
 */
function NameWord({ word, line }: { word: string; line: number }) {
  return (
    <span className={`block whitespace-nowrap ${line === 1 ? 'md:pl-[11vw]' : ''}`}>
      {word.split('').map((c, i) => (
        <span key={i} data-char-wrap className="relative inline-block will-change-transform">
          <span data-char className={`relative z-[1] inline-block ${line === 1 ? 'italic text-accent' : ''}`}>
            {c}
          </span>
          <span
            data-hl
            aria-hidden
            className={`absolute inset-x-[-0.03em] bottom-[0.06em] top-[0.12em] z-[2] origin-left scale-x-0 ${line === 1 ? 'bg-glacier' : 'bg-accent'}`}
          />
        </span>
      ))}
    </span>
  );
}

export default function Hero({ entered }: { entered: boolean }) {
  const root = useRef<HTMLElement>(null);
  const name = useRef<HTMLHeadingElement>(null);
  const words = profile.name.split(' ');

  // Entrance — runs as the loader shutter opens.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const chars = gsap.utils.toArray<HTMLElement>('[data-char]', el);
      const hls = gsap.utils.toArray<HTMLElement>('[data-hl]', el);
      gsap.set(chars, { opacity: 0, y: 0, yPercent: 18 });
      gsap.set(hls, { scaleX: 0, transformOrigin: 'left center' });
      gsap.set('[data-hero-fade]', { opacity: 0, y: 24 });
      gsap.set('[data-hero-line]', { scaleX: 0 });
      gsap.set('[data-caret]', { opacity: 0 });
      if (!entered) return;

      if (store.reducedMotion) {
        gsap.set(chars, { opacity: 1, yPercent: 0 });
        gsap.set(['[data-hero-fade]', '[data-hero-line]', '[data-caret]'], { opacity: 1, y: 0, scaleX: 1 });
        return;
      }

      const tl = gsap.timeline({ delay: 0.3 });
      // a blinking caret waits a beat before typing starts
      tl.to('[data-caret]', { opacity: 1, duration: 0.01, repeat: 4, yoyo: true, repeatDelay: 0.2 });
      const STEP = 0.085;
      const start = tl.duration();
      chars.forEach((ch, i) => {
        const at = start + i * STEP + (i >= words[0].length ? 0.22 : 0); // small pause between words
        tl.fromTo(hls[i], { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: 0.14, ease: 'power2.in' }, at)
          .set(ch, { opacity: 1, yPercent: 0 }, at + 0.14)
          .set(hls[i], { transformOrigin: 'right center' }, at + 0.14)
          .to(hls[i], { scaleX: 0, duration: 0.26, ease: 'power3.out' }, at + 0.16);
      });
      tl.to('[data-caret]', { opacity: 0, duration: 0.3 }, '-=0.1')
        .to('[data-hero-line]', { scaleX: 1, duration: 1.2, ease: 'expo.inOut' }, '-=0.5')
        .to('[data-hero-fade]', { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08 }, '-=0.9');
    }, el);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `words` is derived from static content
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
    <section ref={root} id="hero" data-stage={0} className="relative flex h-[100svh] min-h-[600px] flex-col justify-between px-5 pb-6 pt-24 md:px-10 md:pb-10 md:pt-28" aria-label="Introduction">
      <div data-hero-meta className="flex items-start justify-between gap-6">
        <div data-hero-fade className="label max-w-[16rem] leading-relaxed text-bone-dim">
          Hi, I’m Dhruvi
          <br />
          <span className="text-bone">{profile.role}</span>
        </div>
        <div data-hero-fade className="label hidden text-right leading-relaxed text-bone-dim md:block">
          Status
          <br />
          <span className="inline-flex items-center gap-2 text-bone">
            <span className="h-1.5 w-1.5 rounded-full bg-glacier" style={{ animation: 'blink 1.6s steps(1) infinite' }} />
            {profile.status}
          </span>
        </div>
      </div>

      <div data-hero-name>
        <p data-hero-fade className="label mb-3 text-accent md:mb-5">
          ( Signal / Noise ) — a portfolio
        </p>
        <h1 ref={name} className="display relative select-none text-[25vw] text-bone md:text-[14.5vw]" aria-label={profile.name}>
          <span aria-hidden>
            {words.map((w, i) => (
              <NameWord key={w + i} word={w} line={i} />
            ))}
          </span>
          <span
            data-caret
            aria-hidden
            className="absolute left-0 top-[0.1em] h-[0.72em] w-[0.06em] bg-accent"
          />
        </h1>
        <div data-hero-line className="hairline mt-3 origin-left border-t md:mt-5" />
        <div className="mt-5 grid gap-6 md:mt-7 md:grid-cols-12 md:items-end">
          <p data-hero-fade className="max-w-xl font-serif text-[1.55rem] leading-[1.1] text-bone md:col-span-6 md:text-[2.3rem]">
            {profile.intro}
          </p>
          <div data-hero-fade className="flex items-end justify-between gap-6 md:col-span-6 md:justify-end">
            <button onClick={() => scrollToId('about')} className="group flex items-center gap-4" data-cursor>
              <span className="label text-left leading-relaxed text-bone-dim transition-colors group-hover:text-bone">
                Scroll to
                <br />
                open the box
              </span>
              <span className="relative grid h-14 w-14 place-items-center rounded-full border border-bone/25 transition-colors duration-500 group-hover:border-accent group-hover:bg-accent">
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
