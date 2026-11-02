import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { about } from '../content';
import { RiseText, Reveal, T, Scramble } from '../components/Text';
import Portrait from '../components/Portrait';

/*
 * Field notes. An editorial spread instead of a two-column bio:
 * the manifesto is lit word by word as you read it, the principles sit in
 * the margin like annotations, and interests rotate through a single slot.
 */
export default function About() {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(0);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-mw]',
        { opacity: 0.12 },
        {
          opacity: 1,
          stagger: 0.1,
          ease: 'none',
          scrollTrigger: { trigger: '[data-manifesto]', start: 'top 75%', end: 'bottom 45%', scrub: true },
        },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  const words = about.manifesto.split(' ');
  const highlighted = new Set(['black', 'boxes,', 'hidden', 'beautiful']);

  return (
    <section ref={root} id="about" data-stage={1} className="relative px-5 py-28 md:px-10 md:py-44" aria-labelledby="about-title">
      <div className="grid gap-16 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-7">
          <p className="label mb-4 text-accent">
            <Scramble text="01 — Field notes" />
          </p>
          <RiseText as="h2" text="The person inside the box." className="display max-w-[12ch] text-[15vw] md:text-[7.4vw]" />
          <span id="about-title" className="sr-only">
            About
          </span>
        </div>
        <div className="md:col-span-5 md:col-start-8 md:row-span-3 md:pt-6">
          <div className="md:sticky md:top-28">
            <Portrait />
          </div>
        </div>

        <p data-manifesto className="font-serif text-[2rem] leading-[1.08] md:col-span-7 md:text-[3.1rem]">
          {words.map((w, i) => (
            <span key={i} data-mw className={highlighted.has(w.toLowerCase()) ? 'italic text-accent' : ''}>
              {w}{' '}
            </span>
          ))}
        </p>

        {/* Marginalia */}
        <aside className="md:col-span-7" aria-label="Principles">
          <p className="label mb-6 text-bone-dim">Working principles</p>
          <ol className="border-t border-bone/15">
            {about.principles.map((p, i) => (
              <li key={p.k} className="border-b border-bone/15">
                <button
                  className="flex w-full items-baseline gap-4 py-4 text-left"
                  onClick={() => setOpen(i)}
                  onMouseEnter={() => setOpen(i)}
                  aria-expanded={open === i}
                  data-cursor
                >
                  <span className="label w-6 shrink-0 text-bone-faint">{String(i + 1).padStart(2, '0')}</span>
                  <span className={`font-serif text-2xl transition-colors duration-300 ${open === i ? 'italic text-bone' : 'text-bone/60'}`}>{p.k}</span>
                </button>
                <div className={`grid transition-[grid-template-rows] duration-500 ease-out ${open === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <p className="overflow-hidden pl-10 text-[15px] leading-relaxed text-bone-dim">
                    <span className="block pb-5">{p.v}</span>
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </div>

      {/* Interests as a slow, continuous ticker of what I'm curious about */}
      <div className="relative -mx-5 mt-28 overflow-hidden border-y border-bone/10 py-6 md:-mx-10 md:mt-40" aria-label="Interests">
        <ul className="flex w-max gap-12 whitespace-nowrap pr-12" style={{ animation: 'marquee 48s linear infinite' }}>
          {[...about.interests, ...about.interests].map((it, i) => (
            <li key={i} className="flex items-center gap-12 font-serif text-4xl text-bone/80 md:text-6xl" aria-hidden={i >= about.interests.length}>
              <span className={i % 2 ? 'italic' : ''}>{it}</span>
              <span className="text-xl text-accent">✳</span>
            </li>
          ))}
        </ul>
      </div>

      <Reveal className="mt-20 grid gap-6 md:mt-28 md:grid-cols-12">
        <p className="label text-bone-dim md:col-span-3">Where this is going</p>
        <p className="font-serif text-2xl leading-snug md:col-span-7 md:text-4xl">
          <T>{about.ambition}</T>
        </p>
      </Reveal>
    </section>
  );
}
