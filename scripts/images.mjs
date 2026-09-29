// Pipeline de imagens da TurboFast Garage.
// Lê as fotos originais em /assets, aplica o tratamento de cor e gera
// AVIF + WebP em múltiplas larguras em /public/img, além de um manifesto
// (src/data/images.json) usado pelo plugin <tf-img> do vite.config.js.
//
// Para adicionar uma foto nova: coloque o arquivo em /assets, inclua uma
// linha em `photos` abaixo e rode `npm run images`.
import sharp from 'sharp';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SRC = join(ROOT, 'assets');
const OUT = join(ROOT, 'public/img');
const PUBLIC = join(ROOT, 'public');
const MANIFEST = join(ROOT, 'src/data/images.json');

mkdirSync(OUT, { recursive: true });

// grade: 'cine' = seções escuras (oficina/preparação) · 'clean' = detailing · 'none' = original
const photos = [
  { src: 'bmwx2.jpeg', name: 'bmw-x2', grade: 'cine' },
  { src: 'bmw435i.jpeg', name: 'bmw-435i', grade: 'cine' },
  { src: 'peugeot308.jpeg', name: 'peugeot-308', grade: 'cine' },
  { src: 'preparandopramontagem.jpeg', name: 'bancada-cabecote', grade: 'cine' },
  { src: 'azera2009.jpeg', name: 'azera', grade: 'cine' },
  { src: 'opala.jpeg', name: 'opala-motor', grade: 'cine' },
  { src: 'motoropala.jpeg', name: 'opala-bloco', grade: 'cine' },
  { src: 'motoropalapintado.jpeg', name: 'opala-pintura', grade: 'cine' },
  { src: 'motoropalapintado1.jpeg', name: 'opala-montagem', grade: 'cine' },
  { src: 'i30data.jpeg', name: 'i30-espuma', grade: 'clean' },
  { src: 'i30datatils.jpeg', name: 'i30-resultado', grade: 'clean' },
  { src: 'i30datails.jpeg', name: 'i30-porta-malas', grade: 'clean' },
  { src: 'i30datails1.jpeg', name: 'i30-banco-traseiro', grade: 'clean' },
  { src: 'i30datails2.jpeg', name: 'i30-porta', grade: 'clean' },
  { src: 'WhatsApp Image 2026-09-28 at 20.13.35.jpeg', name: 'i30-interior', grade: 'clean' },
  { src: 'TurboFastDatails.jpeg', name: 'details-marca', grade: 'none' },
  { src: 'MatheusHenrique.png', name: 'matheus', grade: 'none', widths: [560, 1089] },
];

const CANDIDATE_WIDTHS = [480, 800, 1200, 1600];

function widthsFor(original, preset) {
  if (preset) return preset.filter((w) => w <= original);
  const list = CANDIDATE_WIDTHS.filter((w) => w < original);
  if (original <= 1600) {
    // evita pares quase idênticos (ex.: 1200 e 1202)
    if (list.length && original - list[list.length - 1] < 240) list.pop();
    list.push(original);
  }
  return list;
}

// Vinheta: radial branco → cinza, aplicada em "multiply" (escurece só as bordas)
const vignette = (w, h) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <defs><radialGradient id="v" cx="50%" cy="48%" r="72%">
        <stop offset="50%" stop-color="#ffffff"/><stop offset="100%" stop-color="#4a4a4a"/>
      </radialGradient></defs>
      <rect width="100%" height="100%" fill="url(#v)"/>
    </svg>`
  );

async function graded(file, grade) {
  const base = sharp(file).rotate();
  const { width, height } = await base.metadata();
  if (grade === 'cine') {
    const buf = await base
      .modulate({ brightness: 0.86, saturation: 0.72 })
      .linear(1.16, -14)
      .composite([{ input: vignette(width, height), blend: 'multiply' }])
      .toBuffer();
    return { buf, width, height };
  }
  if (grade === 'clean') {
    const buf = await base.modulate({ brightness: 1.0, saturation: 0.86 }).linear(1.06, -6).toBuffer();
    return { buf, width, height };
  }
  return { buf: await base.toBuffer(), width, height };
}

async function emit(buf, name, widths, { alpha = false } = {}) {
  for (const w of widths) {
    const resized = sharp(buf).resize({ width: w, withoutEnlargement: true });
    await resized.clone().avif({ quality: alpha ? 60 : 52, effort: 5 }).toFile(join(OUT, `${name}-${w}.avif`));
    await resized.clone().webp({ quality: 80, alphaQuality: 90, effort: 5 }).toFile(join(OUT, `${name}-${w}.webp`));
  }
}

// Remove o fundo branco do logo: flood fill a partir das bordas + "color to alpha"
// (mesma ideia do filtro do GIMP), preservando o antialiasing do contorno.
async function cutoutLogo(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const isBg = (p) => {
    const i = p * 4;
    return Math.min(data[i], data[i + 1], data[i + 2]) > 212;
  };
  const bg = new Uint8Array(W * H);
  const stack = new Int32Array(W * H);
  let top = 0;
  const seed = (x, y) => (stack[top++] = y * W + x);
  for (let x = 0; x < W; x++) seed(x, 0), seed(x, H - 1);
  for (let y = 0; y < H; y++) seed(0, y), seed(W - 1, y);
  while (top > 0) {
    const p = stack[--top];
    if (bg[p] || !isBg(p)) continue;
    bg[p] = 1;
    const x = p % W;
    const y = (p / W) | 0;
    if (x > 0 && !bg[p - 1]) stack[top++] = p - 1;
    if (x < W - 1 && !bg[p + 1]) stack[top++] = p + 1;
    if (y > 0 && !bg[p - W]) stack[top++] = p - W;
    if (y < H - 1 && !bg[p + W]) stack[top++] = p + W;
  }
  // dilata 2px para alcançar a franja antialiasing
  let region = bg;
  for (let k = 0; k < 2; k++) {
    const next = region.slice();
    for (let p = 0; p < W * H; p++) {
      if (region[p]) continue;
      const x = p % W;
      if ((x > 0 && region[p - 1]) || (x < W - 1 && region[p + 1]) || region[p - W] || region[p + W]) next[p] = 1;
    }
    region = next;
  }
  for (let p = 0; p < W * H; p++) {
    if (!region[p]) continue;
    const i = p * 4;
    // o "branco" do arquivo original tem ruído: alphas muito baixos viram 0
    const raw = Math.max(255 - data[i], 255 - data[i + 1], 255 - data[i + 2]) / 255;
    const a = Math.max(0, (raw - 0.08) / 0.92);
    if (a <= 0.004) {
      data[i + 3] = 0;
      continue;
    }
    for (let c = 0; c < 3; c++) data[i + c] = Math.max(0, Math.min(255, Math.round(255 - (255 - data[i + c]) / Math.max(raw, 0.001))));
    data[i + 3] = Math.round(a * 255);
  }
  return sharp(data, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
}

// `npm run images -- logo` reprocessa só o que tiver "logo" no nome
const only = process.argv[2];
const manifest = only ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {};

for (const photo of photos) {
  if (only && !photo.name.includes(only)) continue;
  const file = join(SRC, photo.src);
  const { buf, width, height } = await graded(file, photo.grade);
  const widths = widthsFor(width, photo.widths);
  const alpha = photo.src.endsWith('.png');
  await emit(buf, photo.name, widths, { alpha });
  manifest[photo.name] = { w: width, h: height, widths, alpha };
  console.log('✓', photo.name, widths.join(','));
}

// Logo
if (!only || 'logo'.includes(only)) {
  const cut = await cutoutLogo(join(SRC, 'logo.png'));
  const trimmed = await sharp(cut).trim({ threshold: 1 }).png().toBuffer();
  const { width, height } = await sharp(trimmed).metadata();
  const widths = [360, 720, 1400];
  await emit(trimmed, 'logo', widths, { alpha: true });
  await sharp(trimmed).resize({ width: 1400 }).png({ compressionLevel: 9, palette: true }).toFile(join(OUT, 'logo-1400.png'));
  manifest.logo = { w: width, h: height, widths, alpha: true };
  console.log('✓ logo', `${width}x${height}`);
}

// Ícones a partir do favicon.svg
if (!only) {
  const svg = readFileSync(join(PUBLIC, 'favicon.svg'));
  await sharp(svg, { density: 600 }).resize(180, 180).png().toFile(join(PUBLIC, 'apple-touch-icon.png'));
  await sharp(svg, { density: 300 }).resize(32, 32).png().toFile(join(PUBLIC, 'favicon-32.png'));
  await sharp(svg, { density: 600 }).resize(512, 512).png().toFile(join(PUBLIC, 'icon-512.png'));
  console.log('✓ ícones');
}

// Open Graph 1200x630: logo à esquerda, foto da oficina à direita com fade
if (!only || 'logo'.includes(only)) {
  const W = 1200;
  const H = 630;
  const photoW = 620;
  const { buf } = await graded(join(SRC, 'bmwx2.jpeg'), 'cine');
  const photo = await sharp(buf).resize(photoW, H, { fit: 'cover', position: 'centre' }).toBuffer();
  const fade = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${photoW}" height="${H}">
      <defs><linearGradient id="f" x1="0" x2="1"><stop offset="0" stop-color="#050505"/><stop offset=".55" stop-color="#050505" stop-opacity="0"/></linearGradient></defs>
      <rect width="100%" height="100%" fill="url(#f)"/>
    </svg>`
  );
  const stripe = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <rect x="0" y="${H - 10}" width="${W * 0.62}" height="10" fill="#FFD400"/>
      <rect x="${W * 0.62}" y="${H - 10}" width="${W * 0.38}" height="10" fill="#6C00FF"/>
    </svg>`
  );
  const logo = await sharp(join(OUT, 'logo-1400.png')).resize({ width: 600 }).toBuffer();
  const logoMeta = await sharp(logo).metadata();
  await sharp({ create: { width: W, height: H, channels: 3, background: '#050505' } })
    .composite([
      { input: photo, left: W - photoW, top: 0 },
      { input: fade, left: W - photoW, top: 0 },
      { input: logo, left: 60, top: Math.round((H - logoMeta.height) / 2) },
      { input: stripe, left: 0, top: 0 },
    ])
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(join(PUBLIC, 'og-image.jpg'));
  console.log('✓ og-image');
}

writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
console.log('\nManifesto salvo em src/data/images.json');
