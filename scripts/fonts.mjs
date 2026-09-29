// Copia as fontes (subset latin, woff2) do node_modules para /public/fonts,
// permitindo self-hosting + <link rel="preload"> sem depender do Google Fonts.
import { copyFileSync, mkdirSync } from 'node:fs';

const out = new URL('../public/fonts/', import.meta.url);
mkdirSync(out, { recursive: true });

const fonts = [
  ['@fontsource/anton/files/anton-latin-400-normal.woff2', 'anton-400.woff2'],
  ['@fontsource-variable/inter/files/inter-latin-wght-normal.woff2', 'inter-var.woff2'],
  ['@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2', 'jetbrains-mono-var.woff2'],
];

for (const [src, dest] of fonts) {
  copyFileSync(new URL(`../node_modules/${src}`, import.meta.url), new URL(dest, out));
  console.log('✓', dest);
}
