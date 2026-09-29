// Dados do negócio usados para SEO (Schema.org, canonical, sitemap).
// Os links visíveis (WhatsApp, Instagram, Maps) ficam direto no index.html.

export const SITE = {
  // Preencha com o domínio definitivo (sem barra no final) antes do deploy,
  // ex.: 'https://www.turbofastgarage.com.br'. Com ele preenchido o build
  // gera <link rel="canonical">, og:url, og:image absoluto e sitemap.xml.
  url: process.env.SITE_URL || '',

  name: 'TurboFast Garage',
  description:
    'TurboFast Garage em São José dos Campos. Manutenção, diagnóstico, preparação e estética automotiva com experiência, precisão e atenção aos detalhes.',
  telephone: '+55 12 93485-7571',
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
    'https://www.instagram.com/turbofast.datails/',
    'https://www.tiktok.com/@turbofast.garage',
  ],
  services: [
    'Manutenção automotiva',
    'Diagnóstico automotivo',
    'Preparação automotiva',
    'Estética automotiva e detailing',
  ],
};
