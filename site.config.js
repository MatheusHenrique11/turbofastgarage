// Dados do negócio usados no SEO e na substituição dos links no HTML.

export const SITE = {
  // O build gera canonical, Open Graph e sitemap para este endereço.
  url: process.env.SITE_URL || 'https://turbofastgarage.vercel.app',

  name: 'Turbo Fast Garage',
  description:
    'Elétrica e eletrônica automotiva, chicotes, injeção programável, som, acessórios e estética automotiva em São José dos Campos, no Parque Novo Horizonte.',
  telephone: '+5512981606882',
  whatsapp: {
    number: '5512981606882',
    display: '+55 12 98160-6882',
  },
  email: 'gturbofast@gmail.com',
  instagram: {
    garage: {
      handle: '@turbofast.garage',
      url: 'https://www.instagram.com/turbofast.garage/',
    },
    details: {
      handle: '@turbofast.details',
      url: 'https://www.instagram.com/turbofast.details/',
    },
  },
  tiktok: 'https://www.tiktok.com/@turbofast.garage',
  founder: 'Matheus Henrique',
  address: {
    streetAddress: 'Rua das Datilógrafas, 290',
    neighborhood: 'Parque Novo Horizonte',
    addressLocality: 'São José dos Campos',
    addressRegion: 'SP',
    postalCode: '12225-820',
    addressCountry: 'BR',
  },
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Rua%20das%20Datil%C3%B3grafas%2C%20290%20-%20Parque%20Novo%20Horizonte%2C%20S%C3%A3o%20Jos%C3%A9%20dos%20Campos%20-%20SP%2C%2012225-820',
  sameAs: [
    'https://www.instagram.com/turbofast.garage/',
    'https://www.instagram.com/turbofast.details/',
    'https://www.tiktok.com/@turbofast.garage',
  ],
  services: [
    'Elétrica e eletrônica automotiva',
    'Som e acessórios automotivos',
    'Estética automotiva e detailing',
  ],
};
