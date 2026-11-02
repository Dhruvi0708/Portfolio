import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { links, profile } from '../content';
import { RiseText, Scramble } from '../components/Text';
import { scrollToId } from '../lib/smooth';

/** Pulls toward the pointer while hovered. */
function Magnetic({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia('(pointer: fine)').matches) return;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.3);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.3);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, []);
  return (
    <div ref={ref} className={`inline-block ${className}`}>
      {children}
    </div>
  );
}

/** Dhruvi's portrait, set inline in the headline; the pill opens like an eye on scroll. */
function FacePill() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { width: '0em', opacity: 0 }, { width: '1.55em', opacity: 1, duration: 1.4, ease: 'expo.inOut', delay: 0.3, scrollTrigger: { trigger: el, start: 'top 85%' } });
    });
    return () => ctx.revert();
  }, []);
  return (
    <span ref={ref} className="relative mx-[0.08em] inline-block h-[0.72em] w-[1.55em] -translate-y-[0.04em] overflow-hidden rounded-full align-baseline ring-1 ring-accent/60">
      <img src="/dhruvi-face.webp" alt="" aria-hidden width={360} height={360} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-[50%_60%]" />
    </span>
  );
}

const CHANNELS = [
  { key: 'github', label: 'GitHub' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'resume', label: 'Resume' },
] as const;

export default function Contact() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!links.email) return;
    try {
      await navigator.clipboard.writeText(links.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = `mailto:${links.email}`;
    }
  };

  return (
    <section id="contact" data-stage={7} className="relative flex min-h-[100svh] flex-col justify-between px-5 pb-8 pt-28 md:px-10 md:pt-40" aria-labelledby="contact-title">
      <div>
        <p className="label mb-4 text-accent">
          <Scramble text="05 — Transmit" />
        </p>
        <h2 className="display max-w-[14ch] text-[16vw] md:text-[9.5vw]">
          <RiseText as="span" text="Got a signal" />
          <FacePill />
          <RiseText as="span" text="worth chasing?" />
        </h2>
        <span id="contact-title" className="sr-only">
          Contact
        </span>
      </div>

      <div className="mt-16 grid gap-12 md:mt-10 md:grid-cols-12 md:items-end">
        <div className="md:col-span-7">
          <p className="mb-6 max-w-md text-bone-dim">Hackathon team, internship, a strange idea that needs building — send it over. I read everything.</p>
          <Magnetic>
            {links.email ? (
              <div className="flex flex-wrap items-center gap-4">
                <a href={`mailto:${links.email}`} className="group relative inline-flex items-center gap-4 rounded-full bg-accent px-8 py-5 text-ink md:px-10 md:py-6" data-cursor>
                  <span className="font-serif text-2xl md:text-4xl">Start a conversation</span>
                  <span className="transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1">↗</span>
                </a>
                <button onClick={copy} className="label text-bone-dim underline underline-offset-4 hover:text-bone" data-cursor aria-live="polite">
                  {copied ? 'Copied ✓' : links.email}
                </button>
              </div>
            ) : (
              <span className="inline-flex items-center gap-4 rounded-full border border-dashed border-bone/30 px-8 py-5" title="Add your email in src/content.ts">
                <span className="todo font-serif text-2xl md:text-3xl">Email — add in content.ts</span>
              </span>
            )}
          </Magnetic>
        </div>

        <ul className="md:col-span-5">
          {CHANNELS.map(({ key, label }) => {
            const href = links[key];
            return (
              <li key={key} className="border-t border-bone/15 last:border-b">
                {href ? (
                  <a
                    href={href}
                    target={key === 'resume' ? undefined : '_blank'}
                    rel="noreferrer"
                    download={key === 'resume' ? '' : undefined}
                    className="group flex items-center justify-between py-5"
                    data-cursor
                  >
                    <span className="font-serif text-4xl transition-all duration-500 group-hover:translate-x-3 group-hover:italic md:text-5xl">{label}</span>
                    <span className="label text-bone-dim transition-colors group-hover:text-accent">{key === 'resume' ? 'PDF ↓' : 'Open ↗'}</span>
                  </a>
                ) : (
                  <div className="flex items-center justify-between py-5" title={`Add your ${label} link in src/content.ts`}>
                    <span className="font-serif text-4xl text-bone/35 md:text-5xl">{label}</span>
                    <span className="todo label">add link</span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <footer className="mt-24 flex flex-wrap items-end justify-between gap-6 border-t border-bone/10 pt-6">
        <p className="label text-bone-faint">
          © {new Date().getFullYear()} {profile.name} — built with React, Three.js & GSAP
        </p>
        <button onClick={() => scrollToId('hero')} className="label text-bone-dim hover:text-bone" data-cursor>
          Back to the box ↑
        </button>
      </footer>
    </section>
  );
}
