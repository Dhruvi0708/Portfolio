import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { profile } from '../content';
import { scrollToId, lockScroll } from '../lib/smooth';
import { store } from '../lib/store';

export const SECTIONS = [
  { id: 'hero', label: 'Signal', stage: 0 },
  { id: 'about', label: 'Field notes', stage: 1 },
  { id: 'tech', label: 'Instruments', stage: 2 },
  { id: 'work', label: 'Case files', stage: 3 },
  { id: 'journey', label: 'Signal log', stage: 6 },
  { id: 'contact', label: 'Transmit', stage: 7 },
];

function sectionFor(stage: number) {
  let idx = 0;
  SECTIONS.forEach((s, i) => {
    if (stage >= s.stage) idx = i;
  });
  return idx;
}

export default function Nav({ visible }: { visible: boolean }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const menuBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let raf = 0;
    let last = -1;
    const loop = () => {
      const a = sectionFor(store.stage);
      if (a !== last) {
        last = a;
        setActive(a);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    lockScroll(open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    // wait for the overlay to start closing so the scroll lock is released
    setTimeout(() => scrollToId(id), open ? 350 : 0);
  };

  return (
    <>
      <header
        className={`blend-white fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-5 text-bone mix-blend-difference transition-opacity duration-700 md:px-10 md:py-7 ${visible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        <button onClick={() => go('hero')} className="group flex items-center gap-3" aria-label="Back to top" data-cursor>
          <span className="relative grid h-7 w-7 place-items-center">
            <span className="absolute inset-0 rounded-full border border-bone/60 transition-transform duration-500 group-hover:scale-125" />
            <span className="h-1.5 w-1.5 rounded-full bg-bone" />
          </span>
          <span className="font-serif text-xl italic tracking-tight">{profile.name}</span>
        </button>

        <div className="label hidden items-center gap-3 md:flex" aria-live="polite">
          <span className="tabular-nums">{String(active + 1).padStart(2, '0')}</span>
          <span className="h-px w-10 bg-bone/50" />
          <span className="relative inline-block h-[1.2em] min-w-[9rem] overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={active}
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                exit={{ y: '-110%' }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="absolute left-0"
              >
                {SECTIONS[active].label}
              </motion.span>
            </AnimatePresence>
          </span>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={() => go('contact')} className="label hidden md:inline-block" data-cursor>
            Let’s talk
          </button>
          <button
            ref={menuBtn}
            onClick={() => setOpen((o) => !o)}
            className="label flex items-center gap-3"
            aria-expanded={open}
            aria-controls="site-menu"
            data-cursor
          >
            <span>{open ? 'Close' : 'Menu'}</span>
            <span className="relative block h-3 w-6">
              <span className={`absolute left-0 h-px w-full bg-bone transition-transform duration-500 ${open ? 'top-1.5 rotate-45' : 'top-0.5'}`} />
              <span className={`absolute left-0 h-px w-full bg-bone transition-transform duration-500 ${open ? 'top-1.5 -rotate-45' : 'top-2.5'}`} />
            </span>
          </button>
        </div>
      </header>

      {/* Section rail */}
      <nav
        aria-label="Sections"
        className={`blend-white fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-3 mix-blend-difference transition-opacity duration-700 lg:flex ${visible ? 'opacity-100' : 'opacity-0'}`}
      >
        {SECTIONS.map((s, i) => (
          <button key={s.id} onClick={() => go(s.id)} className="group flex items-center gap-3 py-1" aria-label={s.label} aria-current={i === active} data-cursor>
            <span className="label translate-x-2 text-bone opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100">{s.label}</span>
            <span className={`block h-px bg-bone transition-all duration-500 ${i === active ? 'w-8' : 'w-3 opacity-40 group-hover:w-5 group-hover:opacity-100'}`} />
          </button>
        ))}
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="fixed inset-0 z-[45] flex flex-col justify-between bg-ink px-5 pb-8 pt-28 md:px-10"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(100% 0 0 0)' }}
            transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          >
            <ul className="flex flex-col">
              {SECTIONS.map((s, i) => (
                <li key={s.id} className="overflow-hidden border-b border-bone/10">
                  <motion.button
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.3 + i * 0.05, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => go(s.id)}
                    className="group flex w-full items-baseline gap-5 py-2 text-left md:py-3"
                    autoFocus={i === 0}
                    data-cursor
                  >
                    <span className="label w-8 text-bone-faint">{String(i + 1).padStart(2, '0')}</span>
                    <span className={`display text-[13vw] transition-all duration-500 group-hover:translate-x-4 group-hover:italic group-hover:text-accent md:text-[6.5vw] ${i === active ? 'text-bone' : 'text-bone/70'}`}>
                      {s.label}
                    </span>
                  </motion.button>
                </li>
              ))}
            </ul>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="label flex flex-wrap justify-between gap-4 text-bone-dim">
              <span>{profile.role}</span>
              <span>Esc to close</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
