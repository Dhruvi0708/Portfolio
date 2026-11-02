import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { profile } from '../content';
import { store } from '../lib/store';
import { lockScroll } from '../lib/smooth';

const IntroScene = lazy(() => import('../three/IntroScene'));

/*
 * Opening sequence. While the site loads, the portrait particles drift as
 * noise; once everything is ready they converge into the photo and the name
 * pulls into focus with them. After a short hold (or any click, key or
 * scroll) the portrait spirals away and the site takes over.
 */
const HOLD = 3.2;

export default function Intro({ ready, webgl, onDone }: { ready: boolean; webgl: boolean; onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const [photoReady, setPhotoReady] = useState(false);
  const [count, setCount] = useState(0);
  const [locked, setLocked] = useState(false);
  const [gone, setGone] = useState(false);
  const progress = useRef({ v: 0 });
  const canSkip = useRef(false);
  const exiting = useRef(false);
  const hold = useRef<gsap.core.Tween | null>(null);
  const animated = webgl && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const onPhoto = useCallback(() => setPhotoReady(true), []);

  // Loading readout creeps up while assets arrive.
  useEffect(() => {
    const t = gsap.to(progress.current, { v: 84, duration: 1.8, ease: 'power2.out', onUpdate: () => setCount(Math.round(progress.current.v)) });
    return () => void t.kill();
  }, []);

  const exit = useCallback(() => {
    if (exiting.current || !canSkip.current) return;
    exiting.current = true;
    hold.current?.kill();
    const el = root.current;
    const tl = gsap.timeline({
      onComplete: () => {
        lockScroll(false);
        setGone(true);
      },
    });
    tl.to('[data-intro-char]', { yPercent: -60, opacity: 0, filter: 'blur(16px)', duration: 0.8, stagger: 0.025, ease: 'power3.in' }, 0)
      .to(['[data-intro-ui]', '[data-intro-fade]'], { opacity: 0, duration: 0.5 }, 0)
      .to(store.intro, { exit: 1, duration: 1.7, ease: 'power2.in' }, 0.1)
      .add(onDone, 0.9)
      .to(el, { backgroundColor: 'rgba(11,14,15,0)', duration: 0.9, ease: 'power1.inOut' }, 0.8)
      .to(el, { autoAlpha: 0, duration: 0.4 }, 1.5);
  }, [onDone]);

  // Main sequence, once the portrait, the site scene and the fonts are ready.
  useEffect(() => {
    if (!ready || (animated && !photoReady)) return;
    let cancelled = false;
    let tl: gsap.core.Timeline | undefined;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      tl = gsap.timeline();
      tl.to(progress.current, { v: 100, duration: 0.6, ease: 'power2.inOut', onUpdate: () => setCount(Math.round(progress.current.v)) })
        .add(() => setLocked(true))
        .to(store.intro, { form: 1, duration: animated ? 3.4 : 0.01, ease: 'power2.inOut' }, '<')
        .fromTo(
          '[data-intro-char]',
          { opacity: 0, yPercent: 30, filter: 'blur(18px)' },
          { opacity: 1, yPercent: 0, filter: 'blur(0px)', duration: 1.6, stagger: 0.07, ease: 'expo.out' },
          animated ? '-=2.4' : '<',
        )
        .fromTo('[data-intro-fade]', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: 'expo.out' }, '-=1.1')
        .add(() => {
          canSkip.current = true;
          // the ring around "Enter" counts down the hold, then we leave on our own
          hold.current = gsap.fromTo('[data-ring]', { strokeDashoffset: 132 }, { strokeDashoffset: 0, duration: HOLD, ease: 'none', onComplete: exit });
        });
      // allow skipping as soon as the portrait has mostly formed
      gsap.delayedCall(1.6, () => (canSkip.current = true));
    });
    return () => {
      cancelled = true;
      tl?.kill();
    };
  }, [ready, photoReady, animated, exit]);

  // Click, key or scroll skips ahead.
  useEffect(() => {
    const skip = () => exit();
    const onKey = (e: KeyboardEvent) => {
      if (['Enter', ' ', 'Escape', 'ArrowDown', 'PageDown'].includes(e.key)) skip();
    };
    window.addEventListener('wheel', skip, { passive: true });
    window.addEventListener('touchmove', skip, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel', skip);
      window.removeEventListener('touchmove', skip);
      window.removeEventListener('keydown', onKey);
    };
  }, [exit]);

  if (gone) return null;

  const [first, ...rest] = profile.name.split(' ');
  const last = rest.join(' ');

  return (
    <div ref={root} className="fixed inset-0 z-[80] bg-ink" onClick={exit} role="region" aria-label="Introduction">
      {animated ? (
        <Suspense fallback={null}>
          <IntroScene onLoaded={onPhoto} />
        </Suspense>
      ) : (
        <img
          src="/dhruvi.webp"
          alt=""
          aria-hidden
          className="absolute right-[6vw] top-1/2 h-[70vh] w-auto -translate-y-1/2 rounded-t-full object-cover opacity-90 max-md:left-1/2 max-md:right-auto max-md:top-[30%] max-md:h-[45vh] max-md:-translate-x-1/2"
        />
      )}

      {/* top bar */}
      <div data-intro-ui className="absolute inset-x-0 top-0 flex items-center justify-between px-5 py-5 md:px-10 md:py-7">
        <span className="label text-bone-dim">Portfolio · {new Date().getFullYear()}</span>
        <span className="label flex items-center gap-3 text-bone-dim" aria-live="polite">
          <span className={`h-1.5 w-1.5 rounded-full ${locked ? 'bg-glacier' : 'bg-accent'}`} style={{ animation: locked ? undefined : 'blink 0.8s steps(1) infinite' }} />
          {locked ? 'Signal locked' : `Acquiring signal ${String(count).padStart(3, '0')}%`}
        </span>
      </div>

      {/* name */}
      <div className="pointer-events-none absolute inset-x-5 bottom-[16vh] md:inset-x-10 md:bottom-auto md:top-1/2 md:-translate-y-1/2">
        <p data-intro-fade className="label mb-4 text-accent opacity-0 md:mb-6">
          ( Hello, I’m )
        </p>
        <h1 className="display text-[22vw] text-bone md:text-[12.5vw]" aria-label={profile.name}>
          <span aria-hidden className="block">
            {first.split('').map((c, i) => (
              <span key={i} data-intro-char className="inline-block opacity-0">
                {c}
              </span>
            ))}
          </span>
          <span aria-hidden className="block pl-[0.6em] italic text-accent">
            {last.split('').map((c, i) => (
              <span key={i} data-intro-char className="inline-block opacity-0">
                {c}
              </span>
            ))}
          </span>
        </h1>
        <p data-intro-fade className="label mt-5 max-w-sm leading-relaxed text-bone-dim opacity-0 md:mt-8">
          {profile.role}
          <br />
          <span className="text-bone-faint">Noise → signal. Move your cursor across the portrait.</span>
        </p>
      </div>

      {/* enter */}
      <div data-intro-ui className="absolute inset-x-0 bottom-0 flex items-end justify-between px-5 pb-6 md:px-10 md:pb-10">
        <div className="h-px w-[min(380px,40vw)] bg-bone/10" aria-hidden>
          <div className="h-full bg-accent transition-[width] duration-300" style={{ width: `${count}%` }} />
        </div>
        <button
          data-intro-fade
          onClick={(e) => {
            e.stopPropagation();
            canSkip.current = true;
            exit();
          }}
          className="group flex items-center gap-4 opacity-0"
          data-cursor
        >
          <span className="label text-bone-dim transition-colors group-hover:text-bone">Enter</span>
          <span className="relative grid h-14 w-14 place-items-center">
            <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90" aria-hidden>
              <circle cx="22" cy="22" r="21" fill="none" stroke="currentColor" className="text-bone/15" strokeWidth="1" />
              <circle data-ring cx="22" cy="22" r="21" fill="none" stroke="#ff4f8b" strokeWidth="1.4" strokeDasharray="132" strokeDashoffset="132" />
            </svg>
            <svg width="14" height="18" viewBox="0 0 14 18" fill="none" className="text-bone transition-transform duration-500 group-hover:translate-y-1" aria-hidden>
              <path d="M7 1v15M1 10l6 6 6-6" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}
