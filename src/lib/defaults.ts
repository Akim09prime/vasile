

import type { NavigationSettings, FooterSettings, ThemeSettings, ProjectType } from './types';

export const defaultNavigation: NavigationSettings = {
  items: [
    { id: '1', label_ro: "Despre", label_en: "About", href: "/despre", order: 1, enabled: true, type: 'internal', target: '_self' },
    { id: '2', label_ro: "Servicii", label_en: "Services", href: "/servicii", order: 2, enabled: true, type: 'internal', target: '_self' },
    { id: '3', label_ro: "Portofoliu", label_en: "Portfolio", href: "/portofoliu", order: 3, enabled: true, type: 'internal', target: '_self' },
    { id: '4', label_ro: "Galerie", label_en: "Gallery", href: "/galerie-mobilier", order: 4, enabled: true, type: 'internal', target: '_self' },
    { id: '5', label_ro: "Contact", label_en: "Contact", href: "/contact", order: 5, enabled: true, type: 'internal', target: '_self' },
    { id: 'cta', label_ro: "Cere Ofertă", label_en: "Request Quote", href: "/cerere-oferta", order: 99, enabled: true, type: 'internal', isCta: true, target: '_self' },
  ],
};

export const defaultFooter: FooterSettings = {
  columns: [
    {
      id: 'col1', title_ro: 'Companie', title_en: 'Company', order: 1, enabled: true,
      links: [
        { id: 'f1', label_ro: 'Despre Noi', label_en: 'About Us', href: '/despre', enabled: true, order: 1 },
        { id: 'f2', label_ro: 'Portofoliu', label_en: 'Portfolio', href: '/portofoliu', enabled: true, order: 2 },
      ]
    },
    {
      id: 'col2', title_ro: 'Resurse', title_en: 'Resources', order: 2, enabled: true,
      links: [
        { id: 'f3', label_ro: 'Proces și Garanții', label_en: 'Process & Guarantees', href: '/proces-garantii', enabled: true, order: 1 },
        { id: 'f4', label_ro: 'Recenzii', label_en: 'Reviews', href: '/recenzii', enabled: true, order: 2 },
      ]
    }
  ],
  bottomLinks: [
    { id: 'bl1', label_ro: 'Termeni și Condiții', label_en: 'Terms & Conditions', href: '/p/termeni-si-conditii', enabled: true, order: 1 },
    { id: 'bl2', label_ro: 'Confidențialitate', label_en: 'Privacy Policy', href: '/p/politica-de-confidentialitate', enabled: true, order: 2 },
  ],
  socials: [
    { id: 's1', label: 'Facebook', href: '#', enabled: true, order: 1 },
    { id: 's2', label: 'Instagram', href: '#', enabled: true, order: 2 },
  ],
  contact: {
    phone: '+40 720 000 000',
    email: 'contact@carvello.ro',
    city_ro: 'București, România',
    city_en: 'Bucharest, Romania',
  }
};

export const defaultTheme: ThemeSettings = {
  brand: {
    logoLightUrl: '',
    logoDarkUrl: '',
    faviconUrl: ''
  },
  colors: {
    light: {
      accent: '#B8923B',
      background: '#F5F0E8',
      surface: '#FFFFFF',
      text: '#1A1A1A'
    },
    dark: {
       accent: '#C9A24A',
       background: '#0B0D10',
       surface: '#121722',
       text: '#F2F2EF'
    }
  }
};

export const defaultProjectTypes: ProjectType[] = [
    { id: "bucatarii", label_ro: "Bucătării", label_en: "Kitchens", slug: "bucatarii", order: 1, active: true },
    { id: "dressing-uri", label_ro: "Dressing-uri", label_en: "Wardrobes", slug: "dressing-uri", order: 2, active: true },
    { id: "living", label_ro: "Living", label_en: "Living Rooms", slug: "living", order: 3, active: true },
    { id: "bai", label_ro: "Băi", label_en: "Bathrooms", slug: "bai", order: 4, active: true },
    { id: "dormitoare", label_ro: "Dormitoare", label_en: "Bedrooms", slug: "dormitoare", order: 5, active: true },
    { id: "birou", label_ro: "Mobilier Birou", label_en: "Office Furniture", slug: "mobilier-birou", order: 6, active: true },
];
