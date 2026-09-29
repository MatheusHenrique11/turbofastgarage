// Helpers compartilhados e media queries usadas pelos módulos
const mq = (query) => window.matchMedia(query);

export const media = {
  reduced: mq('(prefers-reduced-motion: reduce)'),
  fine: mq('(hover: hover) and (pointer: fine)'),
  desktop: mq('(min-width: 900px)'),
};

export const qs = (selector, root = document) => root.querySelector(selector);
export const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];
