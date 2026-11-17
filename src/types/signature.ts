export type ExportScale = 1 | 2 | 3;
export type ImageFormat = 'png' | 'jpeg' | 'webp';
export type PreviewMode = 'canvas' | 'email-light' | 'email-dark';
export type QrAction = 'whatsapp' | 'vcard';

export interface CustomLogoConfig {
  dataUrl: string;
  fileName: string;
  width: number;
  height: number;
}

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

export const DEFAULT_LOGO_PATH = '/assets/aistudio/logo_bailac_100_3x_3db341dc.png';

export const LOGO_SPECS = {
  minWidth: 238,
  minHeight: 139,
  recommendedWidth: 714,
  recommendedHeight: 417,
  aspectRatioLabel: '1.7 : 1 (Horizontal)',
  maxFileSizeMb: 5,
} as const;

export const DEFAULT_SIGNATURE_DATA: SignatureData = {
  fullName: 'Nombre Apellido',
  role: 'Cargo',
  company: 'Bailac Argentina SRL',
  email: 'email@bailac.cl',
  phone: '+569 7927 0000',
  website: 'bailac.com.ar',
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
