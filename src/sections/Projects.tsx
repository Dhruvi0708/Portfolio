import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { projects, type Project } from '../content';
import { RiseText, Scramble, T, isTodo } from '../components/Text';
import { AutopsyPreview, CipherPreview, LuminaPreview } from '../components/Previews';
import CaseStudy from '../components/CaseStudy';

const PREVIEW = { forensic: AutopsyPreview, cipher: CipherPreview, lumina: LuminaPreview };
const ACCENT = { forensic: 'text-accent', cipher: 'text-[#9cc23a]', lumina: 'text-[#d9822b]' };

function Chapter({ p, stage, onOpen }: { p: Project; stage: number; onOpen: (p: Project) => void }) {
  const root = useRef<HTMLElement>(null);
  const Preview = PREVIEW[p.theme];

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      // The giant index number drifts against the scroll for depth.
      gsap.fromTo('[data-index]', { yPercent: 30 }, { yPercent: -30, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.fromTo('[data-preview]', { y: 0, yPercent: 18, rotateX: 14, opacity: 0 }, {
        y: 0,
        yPercent: 0,
        rotateX: 0,
        opacity: 1,
        duration: 1.6,
        ease: 'expo.out',
        scrollTrigger: { trigger: '[data-preview]', start: 'top 90%' },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  const meta = [
    ['Year', p.year],
    ['Role', p.role],
  ].filter(([, v]) => !isTodo(v));

  return (
    <article ref={root} id={p.id} data-stage={stage} className="relative px-5 py-28 md:px-10 md:py-40" aria-labelledby={`${p.id}-title`}>
      <span data-index aria-hidden className="display pointer-events-none absolute right-2 top-10 select-none text-[42vw] text-bone/[0.04] md:right-10 md:text-[30vw]">
        {p.index}
      </span>

      <div className="relative grid gap-10 md:grid-cols-12">
        <div className="md:col-span-6">
          <p className={`label mb-5 ${ACCENT[p.theme]}`}>
            <Scramble text={`Case ${p.index} — ${p.kicker}`} />
          </p>
          <RiseText
            as="h3"
            text={p.title}
            className={`display text-[17vw] md:text-[9vw] ${p.theme === 'cipher' ? 'font-mono !text-[11vw] !tracking-tight md:!text-[6.4vw]' : ''}`}
          />
          <span id={`${p.id}-title`} className="sr-only">
            {p.title}
          </span>
          <p className="mt-8 max-w-xl font-serif text-2xl leading-snug md:text-[2rem]">{p.oneLiner}</p>

          {meta.length > 0 && (
            <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-3">
              {meta.map(([k, v]) => (
                <div key={k}>
                  <dt className="label text-bone-faint">{k}</dt>
                  <dd className="mt-1 font-mono text-sm">{v}</dd>
                </div>
              ))}
            </dl>
          )}

          <ul className="mt-8 flex max-w-xl flex-wrap gap-x-5 gap-y-2 font-mono text-[12px] text-bone-dim">
            {p.tech
              .filter((t) => !isTodo(t))
              .slice(0, 8)
              .map((t) => (
                <li key={t}>/ {t}</li>
              ))}
          </ul>

          <button onClick={() => onOpen(p)} className="group mt-12 flex items-center gap-5" data-cursor>
            <span className="relative grid h-16 w-16 place-items-center overflow-hidden rounded-full border border-bone/25">
              <span className="absolute inset-0 origin-bottom scale-y-0 bg-accent transition-transform duration-500 ease-out group-hover:scale-y-100" />
              <span className="relative transition-transform duration-500 group-hover:rotate-45">↗</span>
            </span>
            <span className="font-serif text-3xl transition-all duration-500 group-hover:italic">
              Open case file <span className="sr-only">for {p.title}</span>
            </span>
          </button>
        </div>
      </div>

      <div data-preview className="relative mt-20 md:ml-[33%] md:mt-28" style={{ perspective: '1200px' }}>
        <Preview />
        <p className="label mt-4 text-bone-faint">
          Fig. {p.index} — {p.theme === 'forensic' ? 'Investigation workbench, replayed' : p.theme === 'cipher' ? 'Knowledge field, connecting' : 'Every article under the lens'}
        </p>
      </div>

      {/* Quick read of the case for people who won't open the file */}
      {!(isTodo(p.problem) && isTodo(p.how)) && (
      <div className="mt-16 grid gap-8 border-t border-bone/15 pt-8 md:ml-[33%] md:grid-cols-2">
        <div>
          <p className="label mb-3 text-bone-faint">Problem</p>
          <p className="leading-relaxed text-bone-dim">
            <T>{p.problem}</T>
          </p>
        </div>
        <div>
          <p className="label mb-3 text-bone-faint">How it works</p>
          <p className="leading-relaxed text-bone-dim">
            <T>{p.how}</T>
          </p>
        </div>
      </div>
      )}
    </article>
  );
}

export default function Projects() {
  const [open, setOpen] = useState<Project | null>(null);
  const close = useCallback(() => setOpen(null), []);

  return (
    <section id="work" aria-labelledby="work-title">
      <div className="px-5 pt-20 md:px-10 md:pt-32">
        <p className="label mb-4 text-accent">
          <Scramble text="03 — Case files" />
        </p>
        <RiseText as="h2" text="Three investigations." className="display max-w-[12ch] text-[15vw] md:text-[8.5vw]" />
        <h2 id="work-title" className="sr-only">
          Projects
        </h2>
        <p className="mt-6 max-w-md text-bone-dim">Each project gets its own visual language. Open a case file for the full story — problem, architecture, challenges.</p>
      </div>
      {projects.map((p, i) => (
        <Chapter key={p.id} p={p} stage={3 + i} onOpen={setOpen} />
      ))}
      {createPortal(<AnimatePresence>{open && <CaseStudy project={open} onClose={close} />}</AnimatePresence>, document.body)}
    </section>
  );
}
