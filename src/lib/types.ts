

export type NavItem = {
  id: string;
  type: "internal" | "external";
  href: string;
  label_ro: string;
  label_en: string;
  order: number;
  enabled: boolean;
  isCta?: boolean; // Flag to identify the CTA button
  target?: "_self" | "_blank";
};

export type NavigationSettings = {
  updatedAt?: any;
  items: NavItem[];
};

export type FooterLink = {
  id: string;
  label_ro: string;
  label_en: string;
  href: string;
  enabled: boolean;
  order: number;
};

export type FooterColumn = {
  id: string;
  title_ro: string;
  title_en: string;
  order: number;
  enabled: boolean;
  links: FooterLink[];
};

export type SocialLink = {
  id: string;
  label: string;
  href: string;
  enabled: boolean;
  order: number;
};

export type FooterSettings = {
  updatedAt?: any;
  columns: FooterColumn[];
  bottomLinks: FooterLink[];
  socials: SocialLink[];
  contact: {
    phone?: string;
    email?: string;
    city_ro?: string;
    city_en?: string;
  };
};

type ColorPalette = {
  accent: string;      // HEX format e.g. #B8923B
  background: string;  // HEX format e.g. #F5F0E8
  surface: string;     // HEX format e.g. #FFFFFF
  text: string;        // HEX format e.g. #1A1A1A
}

export type ThemeSettings = {
  updatedAt?: any;
  brand: {
    logoLightUrl?: string;
    logoDarkUrl?: string;
    faviconUrl?: string
  },
  colors: {
    light: ColorPalette,
    dark: ColorPalette
  }
};


export type ProjectType = {
    id: string;
    label_ro: string;
    label_en: string;
    slug: string;
    order: number;
    active: boolean;
}


export type Project = {
    id: string;
    name: string;
    slug?: string;
    category: string;
    categorySlug?: string;
    summary?: string;
    content?: string;
    location?: string;
    rating?: number;
    isPublished: boolean;
    publishedAt?: string;
    createdAt: string;
    coverMediaId?: string;
    media: ImagePlaceholder[]; // Changed from mediaIds
    image?: ImagePlaceholder;
}

export type ProjectData = Omit<Project, 'id' | 'createdAt' | 'publishedAt' | 'image' >;

export type Lead = {
    id: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    projectType: string;
    budget?: string;
    message: string;
    status: 'new' | 'contacted' | 'qualified' | 'lost' | 'won';
    createdAt: string;
};

export type LeadFormData = Omit<Lead, 'id' | 'createdAt' | 'status'>;

export type ContactMessage = {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    isRead: boolean;
    createdAt: string;
};

export type ContactFormData = Omit<ContactMessage, 'id' | 'createdAt' | 'isRead'>;


export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  rating?: number;
  isTop?: boolean;
};

export type GalleryImage = {
    id: string;
    projectId: string;
    projectSlug?: string;
    projectName: string;
    category: string;
    image: ImagePlaceholder;
    publishedAt?: string;
}
