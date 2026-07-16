/**
 * Play a one-shot animation WHEN IT IS ACTUALLY ON SCREEN — once.
 *
 * Why this exists: the hero previously fired on a timer ~370ms after paint.
 * Measured on the live deployment, the diagram sat 785px down on desktop and
 * 1213px down on mobile, so the animation ran at 13% visibility (desktop) or
 * completely off-screen (mobile) and was finished before the visitor scrolled
 * to it. The motion worked; nobody could see it.
 *
 * Rules encoded here:
 *  · Fire only when a meaningful fraction of the element is really visible.
 *  · Fire once. Never re-run on scroll-back.
 *  · Respect prefers-reduced-motion — the base state is already the resolved
 *    diagram, so doing nothing is the correct reduced-motion behaviour.
 *  · Replay stays available on demand.
 */

export interface PlayOnceOptions {
  /** Fraction of the element that must be visible before it plays. */
  threshold?: number;
  /** How long the sequence runs before `.play` is removed. */
  duration?: number;
  /** Extra delay once visible, so it starts after the eye lands. */
  delay?: number;
}

export function playOnce(el: HTMLElement, opts: PlayOnceOptions = {}) {
  const { threshold = 0.25, duration = 1500, delay = 80 } = opts;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let timer: number | undefined;

  function run() {
    if (reduce.matches) return;
    window.clearTimeout(timer);
    el.classList.remove('play');
    void el.offsetWidth; // reflow, so a replay genuinely restarts
    el.classList.add('play');
    timer = window.setTimeout(() => el.classList.remove('play'), duration);
  }

  if (reduce.matches) return { run };

  // A tall element can never reach a high visibility fraction on a short
  // viewport, so accept EITHER enough of the element being visible OR the
  // element filling most of the viewport.
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const fillsViewport = e.intersectionRect.height >= window.innerHeight * 0.5;
        if (e.isIntersecting && (e.intersectionRatio >= threshold || fillsViewport)) {
          io.disconnect();
          window.setTimeout(run, delay);
        }
      }
    },
    { threshold: [0, threshold, 0.5, 0.75] }
  );

  io.observe(el);
  return { run };
}
