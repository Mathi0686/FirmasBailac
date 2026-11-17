export type ExportScale = 1 | 2 | 3;
export type ImageFormat = 'png' | 'jpeg' | 'webp';
export type PreviewMode = 'canvas' | 'email-light' | 'email-dark';
export type QrAction = 'whatsapp' | 'vcard';

export interface SignatureData {
  fullName: string;
  role: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  extraLine: string;
  showEmail: boolean;
  showPhone: boolean;
  showWebsite: boolean;
  showExtra: boolean;
  qrPhoneOverride: string;
  qrWhatsappMessage: string;
}

export interface SignatureStyleOptions {
  scale: ExportScale;
  imageFormat: ImageFormat;
  jpegQuality: number;
  emailDisplayWidth: number;
  showQr: boolean;
  qrAction: QrAction;
}

export const BAILAC_COLORS = {
  deepBlue: '#1B4695',
  dividerBlue: '#1D4896',
  textBlue: '#4472C4',
  emailLinkBlue: '#467886',
  roleBarGray: '#7F8184',
  brandOrange: '#E9540D',
  sloganNavy: '#1B3668',
  sloganCyan: '#269BD6',
} as const;

export const DEFAULT_SIGNATURE_DATA: SignatureData = {
  fullName: 'Nombre Apellido',
  role: 'Cargo',
  company: 'Bailac SAN Ltda.',
  email: 'email@bailac.cl',
  phone: '+569 7927 0000',
  website: 'www.bailac.cl',
  extraLine: '',
  showEmail: true,
  showPhone: true,
  showWebsite: true,
  showExtra: false,
  qrPhoneOverride: '',
  qrWhatsappMessage: '',
};

export const DEFAULT_STYLE_OPTIONS: SignatureStyleOptions = {
  scale: 2,
  imageFormat: 'png',
  jpegQuality: 0.92,
  emailDisplayWidth: 560,
  showQr: true,
  qrAction: 'whatsapp',
};

export const COMPANY_PRESETS = [
  'Bailac SAN Ltda.',
  'Bailac Thor Ltda.',
  'Servicios Mineros Bailac',
  'Recauchajes Bailac S.A.',
];

export const EXAMPLE_PROFILES: Array<{ label: string; data: Partial<SignatureData> }> = [
  {
    label: 'Plantilla Base',
    data: {
      fullName: 'Nombre Apellido',
      role: 'Cargo',
      company: 'Bailac SAN Ltda.',
      email: 'email@bailac.cl',
      phone: '+569 7927 0000',
      website: 'www.bailac.cl',
      extraLine: '',
      showExtra: false,
    },
  },
  {
    label: 'Operaciones Mineras',
    data: {
      fullName: 'Rodrigo Fuentealba Vega',
      role: 'Jefe de Operaciones OTR',
      company: 'Bailac SAN Ltda.',
      email: 'rfuentealba@bailac.cl',
      phone: '+569 7927 4810',
      website: 'www.bailac.cl',
      extraLine: 'Antofagasta · Faena Escondida',
      showExtra: false,
    },
  },
  {
    label: 'Comercial Corporativo',
    data: {
      fullName: 'Camila Valdivia Soto',
      role: 'Ejecutiva Comercial Corporativa',
      company: 'Bailac Thor Ltda.',
      email: 'cvaldivia@bailac.cl',
      phone: '+569 8412 3390',
      website: 'www.bailac.cl',
      extraLine: 'Av. Américo Vespucio 2700, Santiago',
      showExtra: false,
    },
  },
];
