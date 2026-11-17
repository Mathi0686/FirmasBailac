import {
  BAILAC_COLORS,
  DEFAULT_LOGO_PATH,
  SignatureData,
  SignatureStyleOptions,
} from '../types/signature';
import { drawQrCodeBlock } from './qrRenderer';

const LOGO_URL = DEFAULT_LOGO_PATH;

let cachedLogoRaw: HTMLImageElement | null = null;
let cachedLogoDataUrl: string | null = null;
let logoLoadPromise: Promise<HTMLImageElement> | null = null;

export function loadBailacLogo(customSrc?: string | null): Promise<HTMLImageElement> {
  if (customSrc) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = customSrc;
    });
  }

  if (cachedLogoRaw && cachedLogoRaw.complete) {
    return Promise.resolve(cachedLogoRaw);
  }
  if (logoLoadPromise) {
    return logoLoadPromise;
  }

  logoLoadPromise = new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      cachedLogoRaw = img;
      resolve(img);
    };
    img.onerror = (err) => {
      logoLoadPromise = null;
      reject(err);
    };
    img.src = LOGO_URL;
  });

  return logoLoadPromise;
}

export async function getLogoPngDataUrl(): Promise<string> {
  if (cachedLogoDataUrl) return cachedLogoDataUrl;
  const img = await loadBailacLogo();
  const c = document.createElement('canvas');
  c.width = img.naturalWidth || 238;
  c.height = img.naturalHeight || 139;
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.drawImage(img, 0, 0);
    cachedLogoDataUrl = c.toDataURL('image/png');
  } else {
    cachedLogoDataUrl = LOGO_URL;
  }
  return cachedLogoDataUrl;
}

type ContactIconKind = 'email' | 'phone' | 'web' | 'extra';

function drawCircularContactIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  kind: ContactIconKind
) {
  ctx.save();
  // Outer corporate dark-blue circle
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = BAILAC_COLORS.deepBlue;
  ctx.fill();

  ctx.strokeStyle = '#FFFFFF';
  ctx.fillStyle = '#FFFFFF';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const s = radius / 10; // normalized to radius 10

  if (kind === 'email') {
    const w = 10.6 * s;
    const h = 7.4 * s;
    const x0 = cx - w / 2;
    const y0 = cy - h / 2;
    ctx.lineWidth = 1.25 * s;
    ctx.beginPath();
    ctx.roundRect(x0, y0, w, h, 1 * s);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x0 + 0.6 * s, y0 + 0.8 * s);
    ctx.lineTo(cx, cy + 0.9 * s);
    ctx.lineTo(x0 + w - 0.6 * s, y0 + 0.8 * s);
    ctx.stroke();
  } else if (kind === 'phone') {
    // Crisp solid handset icon tilted diagonally
    ctx.translate(cx, cy);
    ctx.rotate(-0.12);
    ctx.beginPath();
    ctx.moveTo(-3.4 * s, -4.4 * s);
    ctx.quadraticCurveTo(-4.6 * s, -4.4 * s, -4.5 * s, -2.5 * s);
    ctx.quadraticCurveTo(-3.8 * s, 1.9 * s, 2.5 * s, 4.5 * s);
    ctx.quadraticCurveTo(4.4 * s, 4.6 * s, 4.4 * s, 3.3 * s);
    ctx.lineTo(4.4 * s, 1.9 * s);
    ctx.quadraticCurveTo(4.4 * s, 1.2 * s, 3.5 * s, 1.0 * s);
    ctx.lineTo(2.1 * s, 0.7 * s);
    ctx.quadraticCurveTo(1.5 * s, 0.6 * s, 1.1 * s, 1.2 * s);
    ctx.lineTo(0.6 * s, 1.7 * s);
    ctx.quadraticCurveTo(-1.0 * s, 0.9 * s, -1.7 * s, -0.6 * s);
    ctx.lineTo(-1.2 * s, -1.1 * s);
    ctx.quadraticCurveTo(-0.6 * s, -1.5 * s, -0.7 * s, -2.1 * s);
    ctx.lineTo(-1.0 * s, -3.5 * s);
    ctx.quadraticCurveTo(-1.2 * s, -4.4 * s, -1.9 * s, -4.4 * s);
    ctx.closePath();
    ctx.fill();
  } else if (kind === 'web') {
    // Crisp globe outline with meridians
    const gr = 5.2 * s;
    ctx.lineWidth = 1.15 * s;
    ctx.beginPath();
    ctx.arc(cx, cy, gr, 0, Math.PI * 2);
    ctx.stroke();

    // Vertical ellipse
    ctx.beginPath();
    ctx.ellipse(cx, cy, gr * 0.48, gr, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Horizontal equator & latitudes
    ctx.beginPath();
    ctx.moveTo(cx - gr, cy);
    ctx.lineTo(cx + gr, cy);
    ctx.moveTo(cx - gr * 0.84, cy - gr * 0.48);
    ctx.lineTo(cx + gr * 0.84, cy - gr * 0.48);
    ctx.moveTo(cx - gr * 0.84, cy + gr * 0.48);
    ctx.lineTo(cx + gr * 0.84, cy + gr * 0.48);
    ctx.stroke();
  } else {
    // Location pin
    ctx.lineWidth = 1.25 * s;
    ctx.beginPath();
    ctx.arc(cx, cy - 1.3 * s, 3.6 * s, Math.PI * 0.85, Math.PI * 0.15, false);
    ctx.lineTo(cx, cy + 5.2 * s);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy - 1.3 * s, 1.3 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export function generateIconPngDataUrl(kind: ContactIconKind): string {
  const size = 38; // 2x resolution for crisp 19x19 rendering in Outlook / Gmail
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  if (ctx) {
    drawCircularContactIcon(ctx, size / 2, size / 2, 18, kind);
  }
  return c.toDataURL('image/png');
}

export interface RenderedSignatureMetrics {
  logicalWidth: number;
  logicalHeight: number;
  pixelWidth: number;
  pixelHeight: number;
  blob: Blob;
  dataUrl: string;
}

interface ContactRowItem {
  kind: ContactIconKind;
  text: string;
  isEmail?: boolean;
}

const SIGNATURE_FONT_STACK = 'Calibri, "Segoe UI", "DM Sans", Arial, Helvetica, sans-serif';

export async function renderSignatureCanvas(
  targetCanvas: HTMLCanvasElement | null,
  data: SignatureData,
  style: SignatureStyleOptions,
  customLogoSrc?: string | null
): Promise<RenderedSignatureMetrics> {
  const logoImg = await loadBailacLogo(customLogoSrc);

  // Build visible contact rows
  const contactRows: ContactRowItem[] = [];
  if (data.showEmail && data.email.trim()) {
    contactRows.push({ kind: 'email', text: data.email.trim(), isEmail: true });
  }
  if (data.showPhone && data.phone.trim()) {
    contactRows.push({ kind: 'phone', text: data.phone.trim() });
  }
  if (data.showWebsite && data.website.trim()) {
    contactRows.push({ kind: 'web', text: data.website.trim() });
  }
  if (data.showExtra && data.extraLine.trim()) {
    contactRows.push({ kind: 'extra', text: data.extraLine.trim() });
  }

  // Measurement context
  const measureCanvas = document.createElement('canvas');
  const mctx = measureCanvas.getContext('2d')!;

  const nameText = data.fullName.trim() || 'Nombre Apellido';
  const roleText = data.role.trim();
  const companyText = data.company.trim();

  mctx.font = `400 15px ${SIGNATURE_FONT_STACK}`;
  const nameWidth = mctx.measureText(nameText).width;

  mctx.font = `400 13.5px ${SIGNATURE_FONT_STACK}`;
  const roleWidth = roleText ? mctx.measureText(roleText).width : 0;

  mctx.font = `400 13.5px ${SIGNATURE_FONT_STACK}`;
  const companyWidth = companyText ? mctx.measureText(companyText).width : 0;

  mctx.font = `400 13px ${SIGNATURE_FONT_STACK}`;
  const maxContactTextWidth = contactRows.reduce(
    (max, r) => Math.max(max, mctx.measureText(r.text).width),
    0
  );

  // Reference geometry (1x logical pixels matching 464x202 proportion with generous breathing room)
  const logoX = 16;
  const logoW = 238;
  const logoH = 139;
  const dividerX = 270;
  const contentX = 290;
  const iconRadius = 9.5;
  const iconCenterX = contentX + iconRadius;
  const contactTextX = contentX + iconRadius * 2 + 10;

  const roleBarWidth = Math.max(158, roleWidth + 18);
  const rightContentEnd = Math.max(
    contentX + nameWidth,
    roleText ? contentX + roleBarWidth : 0,
    companyText ? contentX + companyWidth : 0,
    contactRows.length > 0 ? contactTextX + maxContactTextWidth : 0
  );

  const qrBoxSize = 74;
  const qrSepX = Math.max(456, Math.ceil(rightContentEnd + 16));
  const qrX = qrSepX + 14;

  const logicalWidth = style.showQr
    ? qrX + qrBoxSize + 18
    : Math.max(486, Math.ceil(rightContentEnd + 24));

  // Vertical layout
  const topY = 30;
  let currentY = topY;

  const nameY = currentY + 13;
  currentY += 20;

  const roleBarY = currentY;
  const roleBarH = 18;
  if (roleText) {
    currentY += 23;
  }

  const companyY = currentY + 11;
  if (companyText) {
    currentY += 22;
  }

  // Gap before contact rows
  currentY += 6;
  const contactsStartY = currentY;
  const rowStep = 26;
  const contactsEndY =
    contactRows.length > 0
      ? contactsStartY + (contactRows.length - 1) * rowStep + iconRadius * 2
      : contactsStartY;

  const logicalHeight = Math.max(198, Math.ceil(Math.max(contactsEndY + 22, 31 + logoH + 26)));

  // Center logo vertically inside signature height
  const logoY = Math.round((logicalHeight - logoH) / 2);

  const scale = style.scale;
  const canvas = targetCanvas || document.createElement('canvas');
  canvas.width = Math.round(logicalWidth * scale);
  canvas.height = Math.round(logicalHeight * scale);

  const ctx = canvas.getContext('2d')!;
  ctx.save();
  ctx.scale(scale, scale);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Standardized solid white corporate background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, logicalWidth, logicalHeight);

  // Draw logo centered and aspect-fitted inside the 238x139 official slot
  const natW = logoImg.naturalWidth || logoW;
  const natH = logoImg.naturalHeight || logoH;
  const fitRatio = Math.min(logoW / natW, logoH / natH);
  const drawLogoW = natW * fitRatio;
  const drawLogoH = natH * fitRatio;
  const drawLogoX = logoX + (logoW - drawLogoW) / 2;
  const drawLogoY = logoY + (logoH - drawLogoH) / 2;
  ctx.drawImage(logoImg, drawLogoX, drawLogoY, drawLogoW, drawLogoH);

  // Draw vertical divider bar alongside contact icons (matching reference image)
  if (contactRows.length > 0) {
    const divTop = contactsStartY - 1;
    const divBottom = contactsEndY + 2;
    ctx.fillStyle = BAILAC_COLORS.dividerBlue;
    ctx.fillRect(dividerX, divTop, 2.2, divBottom - divTop);
  } else {
    ctx.fillStyle = BAILAC_COLORS.dividerBlue;
    ctx.fillRect(dividerX, topY + 2, 2.2, Math.max(60, currentY - topY));
  }

  // Draw Name
  ctx.font = `400 15px ${SIGNATURE_FONT_STACK}`;
  ctx.fillStyle = BAILAC_COLORS.textBlue;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(nameText, contentX, nameY);

  // Draw Role (official Bailac gray bar)
  if (roleText) {
    ctx.fillStyle = BAILAC_COLORS.roleBarGray;
    ctx.fillRect(contentX - 2, roleBarY, roleBarWidth, roleBarH);
    ctx.font = `400 13.5px ${SIGNATURE_FONT_STACK}`;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(roleText, contentX + 2, roleBarY + 13.5);
  }

  // Draw Company
  if (companyText) {
    ctx.font = `400 13.5px ${SIGNATURE_FONT_STACK}`;
    ctx.fillStyle = BAILAC_COLORS.textBlue;
    ctx.fillText(companyText, contentX, companyY);
  }

  // Draw Contact Rows
  contactRows.forEach((row, index) => {
    const cy = contactsStartY + index * rowStep + iconRadius;
    drawCircularContactIcon(ctx, iconCenterX, cy, iconRadius, row.kind);

    ctx.font = `400 13px ${SIGNATURE_FONT_STACK}`;
    ctx.fillStyle = row.isEmail ? BAILAC_COLORS.emailLinkBlue : BAILAC_COLORS.textBlue;
    const textY = cy + 4.5;
    ctx.fillText(row.text, contactTextX, textY);
  });

  // Draw subtle, compact WhatsApp / vCard QR Code block on the right
  if (style.showQr) {
    const totalQrBlockH = qrBoxSize + 13;
    const qrY = Math.round((logicalHeight - totalQrBlockH) / 2) + 8;

    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(qrSepX, qrY + 4, 1, totalQrBlockH - 6);

    drawQrCodeBlock(ctx, qrX, qrY, qrBoxSize, data, style);

    const captionText = style.qrAction === 'vcard' ? 'Contacto' : 'WhatsApp';
    ctx.save();
    ctx.font = `400 9.5px ${SIGNATURE_FONT_STACK}`;
    ctx.fillStyle = BAILAC_COLORS.textBlue;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(captionText, qrX + qrBoxSize / 2, qrY + qrBoxSize + 11.5);
    ctx.restore();
  }

  ctx.restore();

  const mimeType =
    style.imageFormat === 'jpeg'
      ? 'image/jpeg'
      : style.imageFormat === 'webp'
      ? 'image/webp'
      : 'image/png';
  const quality = style.imageFormat === 'png' ? undefined : style.jpegQuality;

  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else resolve(new Blob([], { type: mimeType }));
      },
      mimeType,
      quality
    );
  });

  const dataUrl = canvas.toDataURL(mimeType, quality);

  return {
    logicalWidth,
    logicalHeight,
    pixelWidth: canvas.width,
    pixelHeight: canvas.height,
    blob,
    dataUrl,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  return `${kb.toFixed(1)} KB`;
}
