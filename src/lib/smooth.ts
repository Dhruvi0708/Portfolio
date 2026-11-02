import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { computeStage, store } from './store';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

export function initSmoothScroll() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  store.reducedMotion = reduced;
  const tick = (time: number) => lenis?.raf(time * 1000);
  const onNativeScroll = () => {
    if (!lenis) computeStage();
  };

  if (!reduced) {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 });
    lenis.on('scroll', (e: Lenis) => {
      store.velocity = e.velocity;
      computeStage();
      ScrollTrigger.update();
    });
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
  }
  window.addEventListener('scroll', onNativeScroll, { passive: true });
  window.addEventListener('resize', computeStage);
  computeStage();

  return () => {
    gsap.ticker.remove(tick);
    window.removeEventListener('scroll', onNativeScroll);
    window.removeEventListener('resize', computeStage);
    lenis?.destroy();
    lenis = null;
  };
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { duration: 1.8, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
  else el.scrollIntoView({ behavior: store.reducedMotion ? 'auto' : 'smooth' });
}

export function lockScroll(lock: boolean) {
  if (lock) lenis?.stop();
  else lenis?.start();
  document.documentElement.style.overflow = lock ? 'hidden' : '';
}
