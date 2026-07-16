/**
 * Play a one-shot animation WHEN THE VISITOR CAN ACTUALLY SEE IT — once.
 *
 * History, because it went wrong three times and each reason matters:
 *
 *  1. Fired on a setTimeout ~370ms after paint. Measured live, the diagram sat
 *     785px down on desktop / 1213px on mobile, so it played at 13% visibility
 *     or entirely off-screen and was static before anyone scrolled to it.
 *
 *  2. Fired at `intersectionRatio >= 0.25`, which on a ~700px diagram is the
 *     top ~175px sliver. Same failure, milder. A ratio is the wrong rule for a
 *     tall element — hence `readyToPlay()` below, which asks whether the
 *     diagram's MIDDLE is on screen.
 *
 *  3. Bailed out entirely on prefers-reduced-motion — including when the
 *     visitor pressed Replay. Anyone with the OS setting on (common on Windows)
 *     saw a permanently frozen diagram and a dead button. Reported from
 *     production as "completely unresponsive", and they were right.
 *
 * The rule now: reduced motion suppresses AUTOPLAY only. An explicit press is a
 * request for motion and is always honoured.
 */

export interface PlayOnceOptions {
  /** How long the sequence runs before `.play` is removed. */
  duration?: number;
  /** Settle time once the condition is met, so it starts after the eye lands. */
  delay?: number;
}

export interface PlayOnceHandle {
  /** Explicit, user-initiated play. Always runs, reduced motion or not. */
  run: () => void;
  /** True when the visitor asked the OS for less motion. */
  reduced: boolean;
}

export function playOnce(el: HTMLElement, opts: PlayOnceOptions = {}): PlayOnceHandle {
  const { duration = 1500, delay = 140 } = opts;
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  let timer: number | undefined;

  /**
   * @param explicit true when the visitor pressed a control asking for this.
   */
  function play(explicit: boolean) {
    if (mq.matches && !explicit) return; // never autoplay into reduced motion

    // Lift the global reduced-motion clamp for this one requested run, then put
    // it straight back. Scoped in time, not switched off.
    if (mq.matches) document.documentElement.setAttribute('data-motion-override', '');

    window.clearTimeout(timer);
    el.classList.remove('play');
    void el.offsetWidth; // reflow, so a replay genuinely restarts
    el.classList.add('play');

    timer = window.setTimeout(() => {
      el.classList.remove('play');
      document.documentElement.removeAttribute('data-motion-override');
    }, duration);
  }

  // Let the component adapt its label/hint for reduced-motion visitors.
  el.dataset.reducedMotion = String(mq.matches);

  if (!mq.matches) {
    function readyToPlay(): boolean {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom <= 0 || r.top >= vh) return false;

      const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
      // The element's own midpoint has entered the viewport…
      const mid = r.top + r.height / 2;
      const midOnScreen = mid > 0 && mid < vh * 0.9;
      // …or it is taller than the screen and now dominates it.
      const dominates = visible >= vh * 0.6;
      return midOnScreen || dominates;
    }

    let done = false;
    const fire = () => {
      if (done || !readyToPlay()) return;
      done = true;
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.setTimeout(() => play(false), delay);
    };

    // The scroll listener does the real evaluation (a ratio threshold is
    // unreliable on tall elements whose height shifts as fonts settle); the
    // observer wakes it up and covers "already in place on load". Both detach
    // after the single fire.
    let ticking = false;
    var onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { ticking = false; fire(); });
    };

    var io = new IntersectionObserver(() => fire(), { threshold: [0, 0.25, 0.5, 0.75, 1] });
    io.observe(el);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
  }

  return { run: () => play(true), reduced: mq.matches };
}
