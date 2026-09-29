import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { qs, qsa } from './env.js';
import { scrollToTarget } from './smooth.js';

// Seções → item do menu que fica ativo
const NAV_GROUPS = {
  inicio: 'inicio',
  sobre: 'sobre',
  matheus: 'sobre',
  servicos: 'servicos',
  diagnostico: 'servicos',
  preparacao: 'preparacao',
  detailing: 'detailing',
  galeria: 'galeria',
  localizacao: 'localizacao',
  contato: 'contato',
};

export function initHeader({ lenis }) {
  const html = document.documentElement;
  const header = qs('.header');
  const burger = qs('.burger');
  const menu = qs('#menu');

  // header transparente → vidro escuro ao rolar
  ScrollTrigger.create({
    start: 40,
    end: 'max',
    onToggle: (self) => header.classList.toggle('is-scrolled', self.isActive),
  });

  // sobre a seção clara (Details) o header troca para vidro claro
  ScrollTrigger.create({
    trigger: '.details__panel',
    start: 'top 38px',
    end: 'bottom 38px',
    onToggle: (self) => header.classList.toggle('is-light', self.isActive),
  });

  // link ativo conforme a seção visível
  const links = new Map(qsa('.nav__link').map((a) => [a.dataset.nav, a]));
  const setActive = (key) =>
    links.forEach((a, k) => {
      a.classList.toggle('is-active', k === key);
      if (k === key) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
  Object.entries(NAV_GROUPS).forEach(([id, key]) => {
    const section = document.getElementById(id);
    if (!section) return;
    ScrollTrigger.create({
      trigger: section,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => self.isActive && setActive(key),
    });
  });

  // menu mobile
  let open = false;
  const setMenu = (state) => {
    open = state;
    html.classList.toggle('menu-open', open);
    menu.classList.toggle('is-open', open);
    menu.inert = !open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    if (lenis) open ? lenis.stop() : lenis.start();
    else document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(!open));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) {
      setMenu(false);
      burger.focus();
    }
  });
  window.matchMedia('(min-width: 1181px)').addEventListener('change', (e) => e.matches && open && setMenu(false));

  // âncoras internas com scroll suave + foco acessível no destino
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute('href');
    const target = hash.length > 1 && document.querySelector(hash);
    if (!target) return;
    e.preventDefault();
    if (open) setMenu(false);
    scrollToTarget(target, lenis);
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });

  // WhatsApp flutuante (mobile): aparece depois do hero, some na seção de contato
  const floatWa = qs('.float-wa');
  if (floatWa) {
    let pastHero = false;
    let atContact = false;
    const update = () => floatWa.classList.toggle('is-visible', pastHero && !atContact);
    ScrollTrigger.create({
      trigger: '.hero',
      start: 'bottom 75%',
      onEnter: () => ((pastHero = true), update()),
      onLeaveBack: () => ((pastHero = false), update()),
    });
    ScrollTrigger.create({
      trigger: '.contact__cta',
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => ((atContact = self.isActive), update()),
    });
  }
}
