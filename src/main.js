import 'lenis/dist/lenis.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/sections.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

import { media } from './js/env.js';
import { initSmoothScroll, scrollToTarget } from './js/smooth.js';
import { runPreloader } from './js/preloader.js';
import { initHeader } from './js/header.js';
import { initHero } from './js/hero.js';
import { initReveals } from './js/reveals.js';
import { initSections } from './js/sections.js';
import { initMarquee } from './js/marquee.js';
import { initButtons } from './js/buttons.js';
import { initContact } from './js/contact.js';
import { initLightboxTriggers } from './js/gallery.js';

gsap.registerPlugin(ScrollTrigger, SplitText);
ScrollTrigger.config({ ignoreMobileResize: true });

const reduced = media.reduced.matches;
const fine = media.fine.matches;
const hashTarget = location.hash.length > 1 ? document.getElementById(location.hash.slice(1)) : null;

// a experiência começa sempre pelo topo (exceto quando o link aponta para uma seção)
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (!hashTarget) window.scrollTo(0, 0);

const lenis = initSmoothScroll({ reduced });
lenis?.stop();

// cursor personalizado: só em desktop com mouse — carregado sob demanda
if (fine && !reduced) import('./js/cursor.js').then((m) => m.initCursor());

const preloader = runPreloader({ reduced });

initButtons({ fine, reduced });
initContact({ reduced });
initLightboxTriggers({ lenis });
initHeader({ lenis, reduced });
const hero = initHero({ reduced, fine });

preloader.ready.then(() => {
  // fontes prontas: agora é seguro dividir textos e medir o layout
  initReveals({ reduced });
  initSections({ reduced, fine });
  initMarquee({ reduced });
  ScrollTrigger.refresh();

  const intro = hero.intro().pause();
  preloader
    .exit()
    .call(() => intro.play(), null, reduced ? 0 : 0.7)
    .then(() => {
      document.documentElement.classList.add('is-ready');
      lenis?.start();
      if (hashTarget) scrollToTarget(hashTarget, lenis, { immediate: true });
    });
});

window.addEventListener('load', () => ScrollTrigger.refresh());
