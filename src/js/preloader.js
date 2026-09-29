import { gsap } from 'gsap';

// Preloader: turbo girando + barra de progresso real (fontes + imagem do hero),
// com tempo mínimo para a animação respirar e teto para nunca travar o site.
const MIN_TIME = 1.5; // s
const MAX_WAIT = 2400; // ms

export function runPreloader({ reduced }) {
  const el = document.querySelector('.preloader');
  if (!el || document.documentElement.classList.contains('is-ready')) {
    el?.remove();
    return { ready: document.fonts ? document.fonts.ready : Promise.resolve(), exit: () => gsap.timeline() };
  }

  const fill = el.querySelector('.preloader__fill');
  const count = el.querySelector('.preloader__count');
  const turbo = el.querySelector('.preloader__turbo');

  const assets = Promise.all([document.fonts ? document.fonts.ready : null, imageReady(document.querySelector('.hero__img'))]);
  const loaded = Promise.race([assets, new Promise((resolve) => setTimeout(resolve, MAX_WAIT))]);

  const state = { p: 0 };
  const render = () => {
    fill.style.transform = `scaleX(${state.p})`;
    count.textContent = String(Math.round(state.p * 100)).padStart(3, '0');
  };
  const spin = reduced ? null : gsap.to(turbo, { rotation: 360, duration: 1.1, ease: 'none', repeat: -1 });
  const warmup = gsap.to(state, { p: 0.86, duration: reduced ? 0.3 : MIN_TIME, ease: 'power2.out', onUpdate: render });

  const ready = Promise.all([loaded, warmup.then()]).then(
    () =>
      new Promise((resolve) => {
        if (spin) gsap.to(spin, { timeScale: 4, duration: 0.6, ease: 'power2.in' });
        gsap.to(state, { p: 1, duration: reduced ? 0.1 : 0.45, ease: 'power2.inOut', onUpdate: render, onComplete: resolve });
      })
  );

  const exit = () => {
    clearTimeout(window.__tfFailsafe);
    const tl = gsap.timeline({
      onComplete: () => {
        spin?.kill();
        el.remove();
      },
    });
    if (reduced) return tl.to(el, { autoAlpha: 0, duration: 0.35 });
    return tl
      .to(turbo, { scale: 0.3, autoAlpha: 0, duration: 0.5, ease: 'power3.in' }, 0)
      .to(el.querySelectorAll('.preloader__logo, .preloader__bar, .preloader__meta'), { y: -24, autoAlpha: 0, duration: 0.5, ease: 'power3.in', stagger: 0.05 }, 0)
      .to(el, { yPercent: -100, duration: 1.1, ease: 'expo.inOut' }, 0.35);
  };

  return { ready, exit };
}

function imageReady(img) {
  if (!img || (img.complete && img.naturalWidth)) return Promise.resolve();
  return new Promise((resolve) => {
    img.addEventListener('load', resolve, { once: true });
    img.addEventListener('error', resolve, { once: true });
  });
}
