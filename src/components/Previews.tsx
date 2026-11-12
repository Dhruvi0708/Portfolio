import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: '100px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, inView] as const;
}

/* ────────────────────────────────────────────────────────────
 * AUTOPSY — an illustrative replay of an investigation.
 * Inputs mirror the real synthetic pricing target's fields;
 * the numbers are generated on the fly and labelled as such.
 * ──────────────────────────────────────────────────────────── */
const DEVICES = ['Desktop', 'Mobile', 'Tablet'];
const SEGMENTS = ['Standard', 'Student', 'Business', 'Enterprise'];
const REGIONS = ['North America', 'Europe', 'Asia'];
const PLANS = ['Basic', 'Plus', 'Pro'];
const FEATURES = ['subscriptionPlan', 'region', 'usageLevel', 'customerSegment', 'deviceType'];
const STATUS = ['candidate', 'supported', 'validated'] as const;

type Row = { id: number; input: string; out: string };

export function AutopsyPreview() {
  const [ref, inView] = useInView<HTMLDivElement>();
  const [rows, setRows] = useState<Row[]>([]);
  const [budget, setBudget] = useState(20);
  const [status, setStatus] = useState<number[]>([0, 0, 0, 0, -1]);
  const n = useRef(0);

  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => {
      n.current += 1;
      const k = n.current;
      const pick = <T,>(a: T[]) => a[(Math.random() * a.length) | 0];
      const usage = (Math.random() * 100) | 0;
      setRows((r) =>
        [
          {
            id: k,
            input: `${pick(DEVICES)} · ${pick(SEGMENTS)} · ${pick(REGIONS)} · ${pick(PLANS)} · u=${usage}`,
            out: (18 + Math.random() * 60).toFixed(2),
          },
          ...r,
        ].slice(0, 6),
      );
      setBudget((b) => (b <= 1 ? 20 : b - 1));
      setStatus((s) => (k % 20 === 0 ? [0, 0, 0, 0, -1] : s.map((v, i) => (i === 4 ? -1 : Math.min(2, v + (Math.random() < 0.18 ? 1 : 0))))));
    }, 900);
    return () => clearInterval(id);
  }, [inView]);

  return (
    <div ref={ref} className="relative overflow-hidden rounded-[2px] bg-[#e9e1d2] p-5 font-mono text-[11px] text-[#1a1714] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)] md:p-8 md:text-[12px]">
      <div className="pointer-events-none absolute -right-6 top-8 rotate-[14deg] border-2 border-[#c4321a] px-4 py-1 text-[13px] font-medium tracking-[0.3em] text-[#c4321a] opacity-80">
        CASE FILE 01
      </div>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2 border-b border-[#1a1714]/20 pb-4">
        <span className="uppercase tracking-[0.2em]">Investigation · pricing target</span>
        <span className="text-[#1a1714]/60">illustrative replay — synthetic data</span>
      </div>
      <div className="grid gap-6 md:grid-cols-5">
        <div className="md:col-span-3">
          <div className="mb-2 flex justify-between uppercase tracking-[0.15em] text-[#1a1714]/60">
            <span>Experiments</span>
            <span>output</span>
          </div>
          <ul className="space-y-1.5">
            {rows.map((r, i) => (
              <li key={r.id} className="flex justify-between gap-3 border-b border-dashed border-[#1a1714]/15 pb-1.5" style={{ opacity: 1 - i * 0.14 }}>
                <span className="truncate">
                  <span className="mr-2 text-[#c4321a]">#{String(r.id).padStart(3, '0')}</span>
                  {r.input}
                </span>
                <span className="tabular-nums">{r.out}</span>
              </li>
            ))}
            {rows.length === 0 && <li className="text-[#1a1714]/50">awaiting first query…</li>}
          </ul>
        </div>
        <div className="md:col-span-2">
          <div className="mb-2 uppercase tracking-[0.15em] text-[#1a1714]/60">Query budget</div>
          <div className="mb-6 flex gap-[3px]">
            {Array.from({ length: 20 }, (_, i) => (
              <span key={i} className={`h-4 flex-1 transition-colors duration-500 ${i < budget ? 'bg-[#1a1714]' : 'bg-[#1a1714]/15'}`} />
            ))}
          </div>
          <div className="mb-2 uppercase tracking-[0.15em] text-[#1a1714]/60">Hypotheses</div>
          <ul className="space-y-1.5">
            {FEATURES.map((f, i) => (
              <li key={f} className="flex items-center justify-between gap-2">
                <span>{f}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider transition-colors duration-500 ${
                    status[i] === -1 ? 'border border-[#1a1714]/30 text-[#1a1714]/50' : status[i] === 2 ? 'bg-[#c4321a] text-[#e9e1d2]' : status[i] === 1 ? 'bg-[#1a1714] text-[#e9e1d2]' : 'border border-[#1a1714] '
                  }`}
                >
                  {status[i] === -1 ? 'no effect' : STATUS[status[i]]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * Debug Decrypt — a cipher grid that decodes under the pointer
 * (or under a scanning beam when nobody is touching it).
 * ──────────────────────────────────────────────────────────── */
const COLS = 28;
const ROWS = 11;
const MSG = 'A S T R I O N';
const HEX = '0123456789ABCDEF<>/{}#*';

export function CipherPreview() {
  const [ref, inView] = useInView<HTMLDivElement>();
  const grid = useRef<HTMLDivElement>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const g = grid.current;
    if (!g || !inView) return;
    const cells = Array.from(g.children) as HTMLElement[];
    const msgRow = Math.floor(ROWS / 2);
    const msgStart = Math.floor((COLS - MSG.length) / 2);
    let raf = 0;
    let last = 0;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (t - last < 70) return;
      last = t;
      const sweep = ((t / 2600) % 1.4) * COLS - COLS * 0.2;
      cells.forEach((c, i) => {
        const x = i % COLS;
        const y = Math.floor(i / COLS);
        const p = pointer.current;
        const d = p ? Math.hypot((x - p.x) * 0.9, (y - p.y) * 1.6) : Math.abs(x - sweep) * 1.2;
        const reveal = d < (p ? 4.2 : 2.6);
        const inMsg = y === msgRow && x >= msgStart && x < msgStart + MSG.length;
        if (reveal) {
          c.textContent = inMsg ? MSG[x - msgStart] : '·';
          c.dataset.on = inMsg ? '2' : '1';
        } else {
          if (Math.random() < 0.3) c.textContent = HEX[(Math.random() * HEX.length) | 0];
          c.dataset.on = '';
        }
      });
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-[2px] border border-[#c8f560]/20 bg-[#0a0c07] p-4 shadow-[0_40px_120px_-30px_rgba(200,245,96,0.15)] md:p-6"
      onPointerMove={(e) => {
        const r = (grid.current as HTMLElement).getBoundingClientRect();
        pointer.current = { x: ((e.clientX - r.left) / r.width) * COLS, y: ((e.clientY - r.top) / r.height) * ROWS };
      }}
      onPointerLeave={() => (pointer.current = null)}
      data-cursor
    >
      <div className="mb-3 flex justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-[#c8f560]/60">
        <span>scattered signals</span>
        <span>hover to connect</span>
      </div>
      <div
        ref={grid}
        aria-hidden
        className="grid select-none font-mono text-[10px] leading-[1.7] text-[#c8f560]/30 sm:text-[12px] md:text-[14px] [&>[data-on='1']]:text-[#c8f560]/70 [&>[data-on='2']]:font-medium [&>[data-on='2']]:text-[#c8f560] [&>[data-on='2']]:[text-shadow:0_0_12px_#c8f560]"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: COLS * ROWS }, (_, i) => (
          <span key={i} className="text-center">
            {HEX[(i * 7) % HEX.length]}
          </span>
        ))}
      </div>
      <span className="sr-only">Animated cipher grid that decodes the word Astrion.</span>
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0,transparent_2px,rgba(0,0,0,0.25)_3px)]" />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * Web Lumina — stacked glass planes catching light; they fan out
 * and tilt toward the pointer.
 * ──────────────────────────────────────────────────────────── */
export function LuminaPreview() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const planes = el.querySelectorAll<HTMLElement>('[data-plane]');
    const stack = el.querySelector('[data-stack]');
    const ctx = gsap.context(() => {
      gsap.set(stack, { xPercent: -50, yPercent: -50, rotateY: -25, rotateX: 12 });
      planes.forEach((pl, i) => {
        gsap.fromTo(
          pl,
          { z: 0, x: 0, opacity: 0 },
          { z: (i - 2) * 60, x: (i - 2) * 34, opacity: 1, duration: 1.6, delay: i * 0.08, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 80%' } },
        );
      });
    }, el);
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(stack, { rotateY: -25 + px * 30, rotateX: 12 - py * 20, duration: 1, ease: 'power3.out' });
      el.style.setProperty('--lx', `${(px + 0.5) * 100}%`);
      el.style.setProperty('--ly', `${(py + 0.5) * 100}%`);
    };
    el.addEventListener('pointermove', move);
    return () => {
      el.removeEventListener('pointermove', move);
      ctx.revert();
    };
  }, []);

  const tints = ['#ffcf8a', '#ffb1a1', '#f6e7b8', '#bfe3d6', '#b9cdf2'];
  return (
    <div
      ref={root}
      className="relative h-[380px] overflow-hidden rounded-[2px] bg-[#f4efe6] md:h-[480px]"
      style={{ perspective: '1100px', ['--lx' as string]: '60%', ['--ly' as string]: '40%' }}
      data-cursor
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_50%_at_var(--lx)_var(--ly),rgba(255,214,150,0.65),transparent_70%)] transition-[background] duration-300" />
      <div data-stack className="absolute left-1/2 top-1/2 h-[220px] w-[160px] [transform-style:preserve-3d] md:h-[290px] md:w-[210px]" >
        {tints.map((c, i) => (
          <div
            key={c}
            data-plane
            className="absolute inset-0 rounded-[3px] border border-white/70"
            style={{
              background: `linear-gradient(135deg, ${c}cc, ${c}33 60%, transparent)`,
              boxShadow: '0 30px 60px -20px rgba(80,60,30,0.25)',
            }}
          >
            {i === tints.length - 1 && <span className="absolute bottom-4 left-4 font-serif text-3xl italic text-[#1a1714]">TruthLens</span>}
          </div>
        ))}
      </div>
      <div className="absolute bottom-4 left-4 right-4 flex justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-[#1a1714]/50">
        <span>fake or real</span>
        <span>move to focus</span>
      </div>
    </div>
  );
}
