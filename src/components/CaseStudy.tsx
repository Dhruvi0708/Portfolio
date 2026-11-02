import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Project } from '../content';
import { T } from './Text';
import { lockScroll } from '../lib/smooth';

export const THEMES: Record<Project['theme'], { bg: string; fg: string; dim: string; accent: string; rule: string }> = {
  forensic: { bg: '#e9e1d2', fg: '#1a1714', dim: 'rgba(26,23,20,0.6)', accent: '#c4321a', rule: 'rgba(26,23,20,0.15)' },
  cipher: { bg: '#0a0c07', fg: '#e6f0d0', dim: 'rgba(230,240,208,0.55)', accent: '#c8f560', rule: 'rgba(200,245,96,0.15)' },
  lumina: { bg: '#f4efe6', fg: '#1a1714', dim: 'rgba(26,23,20,0.55)', accent: '#d9822b', rule: 'rgba(26,23,20,0.12)' },
};

function Block({ n, title, children, rule, dim }: { n: string; title: string; children: React.ReactNode; rule: string; dim: string }) {
  return (
    <section className="grid gap-4 border-t py-10 md:grid-cols-12 md:gap-10 md:py-14" style={{ borderColor: rule }}>
      <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] md:col-span-3" style={{ color: dim }}>
        {n} — {title}
      </h3>
      <div className="md:col-span-9">{children}</div>
    </section>
  );
}

export default function CaseStudy({ project, onClose }: { project: Project; onClose: () => void }) {
  const th = THEMES[project.theme];
  const close = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    lockScroll(true);
    const prev = document.activeElement as HTMLElement | null;
    close.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      lockScroll(false);
      window.removeEventListener('keydown', onKey);
      prev?.focus();
    };
  }, [onClose]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-title"
      data-lenis-prevent
      className="fixed inset-0 z-[70] overflow-y-auto overscroll-contain"
      style={{ background: th.bg, color: th.fg }}
      initial={{ clipPath: 'inset(100% 0 0 0)' }}
      animate={{ clipPath: 'inset(0% 0 0 0)' }}
      exit={{ clipPath: 'inset(0 0 100% 0)' }}
      transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-5 backdrop-blur-md md:px-10" style={{ background: `${th.bg}cc` }}>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: th.dim }}>
          Case file {project.index} / {project.kicker}
        </span>
        <button ref={close} onClick={onClose} className="group flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em]" data-cursor>
          Close
          <span className="grid h-10 w-10 place-items-center rounded-full border transition-transform duration-500 group-hover:rotate-90" style={{ borderColor: th.rule }}>
            ✕
          </span>
        </button>
      </div>

      <motion.div
        className="px-5 pb-24 md:px-10"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <header className="pb-14 pt-10 md:pb-20 md:pt-16">
          <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: th.accent }}>
            {project.kicker}
          </p>
          <h2 id="case-title" className="display text-[17vw] md:text-[11vw]">
            {project.title}
          </h2>
          <p className="mt-8 max-w-3xl font-serif text-2xl leading-snug md:text-4xl">{project.oneLiner}</p>
          <dl className="mt-10 grid grid-cols-2 gap-6 font-mono text-[12px] md:max-w-xl">
            <div>
              <dt className="uppercase tracking-[0.18em]" style={{ color: th.dim }}>
                Year
              </dt>
              <dd className="mt-1">
                <T>{project.year}</T>
              </dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.18em]" style={{ color: th.dim }}>
                Role
              </dt>
              <dd className="mt-1">
                <T>{project.role}</T>
              </dd>
            </div>
          </dl>
        </header>

        <Block n="01" title="The problem" rule={th.rule} dim={th.dim}>
          <p className="max-w-3xl text-lg leading-relaxed md:text-2xl">
            <T>{project.problem}</T>
          </p>
        </Block>
        <Block n="02" title="Why I built it" rule={th.rule} dim={th.dim}>
          <p className="max-w-3xl text-lg leading-relaxed md:text-2xl">
            <T>{project.why}</T>
          </p>
        </Block>
        <Block n="03" title="How it works" rule={th.rule} dim={th.dim}>
          <p className="max-w-3xl text-lg leading-relaxed">
            <T>{project.how}</T>
          </p>
        </Block>
        <Block n="04" title="Architecture" rule={th.rule} dim={th.dim}>
          <ol className="relative">
            <span className="absolute bottom-3 left-[7px] top-3 w-px" style={{ background: th.rule }} aria-hidden />
            {project.architecture.map((a, i) => (
              <li key={i} className="relative flex gap-6 pb-7 last:pb-0">
                <span className="relative z-[1] mt-1.5 h-[15px] w-[15px] shrink-0 rounded-full border-2" style={{ borderColor: th.accent, background: th.bg }} />
                <div>
                  <p className="font-serif text-2xl md:text-3xl">
                    <T>{a.label}</T>
                  </p>
                  <p className="mt-1 max-w-2xl text-[15px] leading-relaxed" style={{ color: th.dim }}>
                    <T>{a.detail}</T>
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Block>
        <Block n="05" title="Technologies" rule={th.rule} dim={th.dim}>
          <ul className="flex flex-wrap gap-2">
            {project.tech.map((t) => (
              <li key={t} className="rounded-full border px-4 py-1.5 font-mono text-[12px]" style={{ borderColor: th.rule }}>
                <T>{t}</T>
              </li>
            ))}
          </ul>
        </Block>
        <Block n="06" title="My contribution" rule={th.rule} dim={th.dim}>
          <p className="max-w-3xl text-lg leading-relaxed md:text-2xl">
            <T>{project.contribution}</T>
          </p>
        </Block>
        <Block n="07" title="Technical challenges" rule={th.rule} dim={th.dim}>
          <div className="grid gap-x-10 gap-y-10 md:grid-cols-2">
            {project.challenges.map((c, i) => (
              <div key={i}>
                <p className="font-mono text-[11px]" style={{ color: th.accent }}>
                  {String(i + 1).padStart(2, '0')}
                </p>
                <p className="mt-2 font-serif text-2xl md:text-3xl">
                  <T>{c.title}</T>
                </p>
                <p className="mt-2 text-[15px] leading-relaxed" style={{ color: th.dim }}>
                  <T>{c.body}</T>
                </p>
              </div>
            ))}
          </div>
        </Block>

        <div className="flex flex-wrap items-center justify-between gap-6 border-t pt-10" style={{ borderColor: th.rule }}>
          {project.link ? (
            <a href={project.link} target="_blank" rel="noreferrer" className="font-serif text-3xl italic underline decoration-1 underline-offset-8" data-cursor>
              Visit project ↗
            </a>
          ) : (
            <span />
          )}
          <button onClick={onClose} className="font-mono text-[11px] uppercase tracking-[0.18em] underline underline-offset-4" data-cursor>
            Back to case files
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
