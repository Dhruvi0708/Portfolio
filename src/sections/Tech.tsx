import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { stack } from '../content';
import { store } from '../lib/store';
import { RiseText, Scramble } from '../components/Text';

/*
 * Instruments. Each category is one orbit in the 3D scene; choosing a
 * category lights up its ring and lays its tools out along an ellipse.
 */
export default function Tech() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    store.activeRing = active;
  }, [active]);
  useEffect(() => () => void (store.activeRing = -1), []);

  const cat = stack[active];

  return (
    <section id="tech" data-stage={2} className="relative min-h-[130vh] px-5 py-28 md:px-10 md:py-40" aria-labelledby="tech-title">
      <p className="label mb-4 text-sodium">
        <Scramble text="02 — Instruments" />
      </p>
      <RiseText as="h2" text="Six orbits I work in." className="display max-w-[12ch] text-[15vw] md:text-[8.5vw]" />
      <h2 id="tech-title" className="sr-only">
        Technical skills
      </h2>
      <p className="mt-6 max-w-md text-bone-dim">
        Every ring in the scene is a discipline. Pick one to bring it into focus — no progress bars, just the tools I reach for.
      </p>

      <div className="mt-16 grid gap-12 md:mt-24 md:grid-cols-12">
        <div role="tablist" aria-label="Technology categories" aria-orientation="vertical" className="border-t border-bone/15 md:col-span-5">
          {stack.map((c, i) => (
            <button
              key={c.id}
              role="tab"
              id={`tab-${c.id}`}
              aria-selected={active === i}
              aria-controls={`panel-${c.id}`}
              tabIndex={active === i ? 0 : -1}
              onClick={() => setActive(i)}
              onMouseEnter={() => setActive(i)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                  e.preventDefault();
                  const n = (i + (e.key === 'ArrowDown' ? 1 : stack.length - 1)) % stack.length;
                  setActive(n);
                  document.getElementById(`tab-${stack[n].id}`)?.focus();
                }
              }}
              className="group relative flex w-full items-center justify-between gap-4 border-b border-bone/15 py-4 text-left md:py-5"
              data-cursor
            >
              <span className="flex items-baseline gap-4">
                <span className="label w-6 text-bone-faint">R{i + 1}</span>
                <span className={`font-serif text-4xl transition-all duration-500 md:text-5xl ${active === i ? 'translate-x-2 italic text-bone' : 'text-bone/45 group-hover:text-bone/80'}`}>
                  {c.label}
                </span>
              </span>
              <span className={`label tabular-nums transition-colors ${active === i ? 'text-sodium' : 'text-bone-faint'}`}>{String(c.items.length).padStart(2, '0')}</span>
              <span className={`absolute bottom-[-1px] left-0 h-px bg-sodium transition-all duration-700 ${active === i ? 'w-full' : 'w-0'}`} />
            </button>
          ))}
        </div>

        {/* Orbit readout */}
        <div id={`panel-${cat.id}`} role="tabpanel" aria-labelledby={`tab-${cat.id}`} className="relative md:col-span-7 md:min-h-[520px]">
          <AnimatePresence mode="wait">
            <motion.div key={cat.id} initial="hide" animate="show" exit="hide" className="h-full">
              <motion.p
                variants={{ hide: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                className="label mb-6 text-bone-dim md:absolute md:right-0 md:top-0 md:mb-0 md:text-right"
              >
                Orbit R{active + 1} · {cat.note}
              </motion.p>
              {/* Mobile / small: a clean list */}
              <ul className="flex flex-wrap gap-x-6 gap-y-3 md:hidden">
                {cat.items.map((it, i) => (
                  <motion.li
                    key={it}
                    variants={{ hide: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { delay: i * 0.04 } } }}
                    className="flex items-center gap-2 font-mono text-sm"
                  >
                    <span className="h-1 w-1 rounded-full bg-sodium" />
                    {it}
                  </motion.li>
                ))}
              </ul>
              {/* Desktop: items laid out along an ellipse */}
              <ul className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden={false}>
                {cat.items.map((it, i) => {
                  const a = -Math.PI / 2 + (i / cat.items.length) * Math.PI * 2 + active * 0.4;
                  const x = 50 + Math.cos(a) * 34;
                  const y = 52 + Math.sin(a) * 34;
                  return (
                    <motion.li
                      key={it}
                      variants={{
                        hide: { opacity: 0, scale: 0.6, filter: 'blur(8px)' },
                        show: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { delay: 0.05 + i * 0.05, duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${x}%`, top: `${y}%` }}
                    >
                      <span className="flex items-center gap-2 whitespace-nowrap rounded-full border border-bone/15 bg-ink/60 px-4 py-2 font-mono text-[13px] backdrop-blur-md">
                        <span className="h-1.5 w-1.5 rounded-full bg-sodium" />
                        {it}
                      </span>
                    </motion.li>
                  );
                })}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
