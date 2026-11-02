import { useEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Renders a content string; "TODO:" strings are shown as marked placeholders. */
export function T({ children, className = '' }: { children: string; className?: string }) {
  if (children.startsWith('TODO:')) {
    return (
      <span className={`todo ${className}`} title="Placeholder — edit src/content.ts">
        {children.replace(/^TODO:\s*/, '')}
      </span>
    );
  }
  return <span className={className}>{children}</span>;
}

export const isTodo = (s: string) => s.startsWith('TODO:');

/**
 * Splits a headline into masked lines/words that rise in on scroll.
 * Words stay real text nodes, so screen readers read the sentence normally.
 */
export function RiseText({
  text,
  className = '',
  as: Tag = 'h2',
  delay = 0,
  immediate = false,
}: {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  delay?: number;
  immediate?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const words = el.querySelectorAll<HTMLElement>('[data-w]');
    const ctx = gsap.context(() => {
      // fromTo with explicit y: StrictMode's revert would otherwise leave a cached px offset.
      gsap.fromTo(words, { y: 0, yPercent: 115, rotate: 4 }, {
        y: 0,
        yPercent: 0,
        rotate: 0,
        duration: 1.25,
        ease: 'expo.out',
        stagger: 0.06,
        delay,
        scrollTrigger: immediate ? undefined : { trigger: el, start: 'top 85%' },
      });
    }, el);
    return () => ctx.revert();
  }, [delay, immediate]);

  return (
    <Tag ref={ref as never} className={className}>
      {text.split(' ').map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <span data-w className="inline-block will-change-transform">
            {w}
            {' '}
          </span>
        </span>
      ))}
    </Tag>
  );
}

/** Fades & lifts children into view once. */
export function Reveal({ children, className = '', y = 40, delay = 0 }: { children: ReactNode; className?: string; y?: number; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { y, opacity: 0 }, {
        y: 0,
        opacity: 1,
        duration: 1.2,
        delay,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 88%' },
      });
    });
    return () => ctx.revert();
  }, [y, delay]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/** Characters cycle through glyphs before resolving — used for labels & Debug Decrypt. */
const GLYPHS = '01<>/{}[]#$%&*+=?ABCDEFXYZ';
export function Scramble({ text, className = '', trigger = 'view' }: { text: string; className?: string; trigger?: 'view' | 'hover' }) {
  const ref = useRef<HTMLSpanElement>(null);
  const run = useRef<() => void>(() => {});
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    run.current = () => {
      cancelAnimationFrame(raf);
      const start = performance.now();
      const dur = 700 + text.length * 18;
      const step = (now: number) => {
        const p = Math.min((now - start) / dur, 1);
        const shown = Math.floor(p * text.length);
        let out = '';
        for (let i = 0; i < text.length; i++) {
          if (i < shown || text[i] === ' ') out += text[i];
          else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
        el.textContent = out;
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let st: ScrollTrigger | undefined;
    if (trigger === 'view') st = ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => run.current() });
    return () => {
      cancelAnimationFrame(raf);
      st?.kill();
    };
  }, [text, trigger]);
  return (
    <span className={className} onMouseEnter={trigger === 'hover' ? () => run.current() : undefined}>
      <span className="sr-only">{text}</span>
      <span ref={ref} aria-hidden>
        {text}
      </span>
    </span>
  );
}
