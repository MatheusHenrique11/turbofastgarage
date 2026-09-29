import { qsa } from './env.js';

// Abre fotos em lightbox. O módulo do lightbox só é baixado no primeiro uso
// (code splitting); sem JS, o link abre a imagem normalmente.
export function initLightboxTriggers({ lenis }) {
  const load = () => import('./lightbox.js');

  qsa('[data-lightbox]').forEach((link) => link.addEventListener('pointerenter', load, { once: true }));

  document.addEventListener('click', async (e) => {
    const link = e.target.closest('[data-lightbox]');
    if (!link || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const group = qsa('[data-lightbox]', link.closest('section') || document);
    const { openLightbox } = await load();
    openLightbox(group, group.indexOf(link), { lenis });
  });
}
