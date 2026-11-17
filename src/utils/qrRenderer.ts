import QRCode from 'qrcode';
import { BAILAC_COLORS, SignatureData, SignatureStyleOptions } from '../types/signature';

export function getEffectiveQrPhone(data: SignatureData): string {
  const raw = data.qrPhoneOverride.trim() || data.phone.trim() || '+569 7927 0000';
  return raw;
}

export function sanitizeDigitsForWa(phone: string): string {
  return phone.replace(/[^\d]/g, '');
}

export function buildQrPayload(data: SignatureData, style: SignatureStyleOptions): string {
  const effectivePhone = getEffectiveQrPhone(data);
  const waDigits = sanitizeDigitsForWa(effectivePhone);

  if (style.qrAction === 'vcard') {
    const fullName = (data.fullName || 'Colaborador Bailac').trim();
    const parts = fullName.split(/\s+/);
    const firstName = parts[0] || fullName;
    const lastName = parts.slice(1).join(' ');
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${lastName};${firstName};;;`,
      `FN:${fullName}`,
      data.company.trim() ? `ORG:${data.company.trim()}` : '',
      data.role.trim() ? `TITLE:${data.role.trim()}` : '',
      `TEL;TYPE=CELL,VOICE:${effectivePhone}`,
      data.email.trim() ? `EMAIL;TYPE=WORK:${data.email.trim()}` : '',
      data.website.trim()
        ? `URL:${/^https?:\/\//i.test(data.website.trim()) ? data.website.trim() : `https://${data.website.trim()}`}`
        : '',
      'END:VCARD',
    ].filter(Boolean);
    return lines.join('\n');
  }

  const baseUrl = `https://wa.me/${waDigits || '56979270000'}`;
  const msg = data.qrWhatsappMessage.trim();
  if (msg) {
    return `${baseUrl}?text=${encodeURIComponent(msg)}`;
  }
  return baseUrl;
}

export function getWhatsAppWebLink(data: SignatureData): string {
  const digits = sanitizeDigitsForWa(getEffectiveQrPhone(data));
  const baseUrl = `https://wa.me/${digits || '56979270000'}`;
  const msg = data.qrWhatsappMessage.trim();
  return msg ? `${baseUrl}?text=${encodeURIComponent(msg)}` : baseUrl;
}

function drawWhatsAppEmblem(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number
) {
  ctx.save();

  // Proportional white halo for clean separation from QR modules
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.24, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  // Corporate Bailac blue circle matching contact icons
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = BAILAC_COLORS.deepBlue;
  ctx.fill();

  // Crisp white WhatsApp speech bubble + handset glyph
  const s = radius / 12;
  ctx.strokeStyle = '#FFFFFF';
  ctx.fillStyle = '#FFFFFF';
  ctx.lineWidth = 1.8 * s;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.arc(cx, cy - 0.3 * s, 6.8 * s, Math.PI * 0.78, Math.PI * 2.52, false);
  ctx.lineTo(cx - 6.6 * s, cy + 6.4 * s);
  ctx.closePath();
  ctx.stroke();

  ctx.save();
  ctx.translate(cx + 0.1 * s, cy - 0.3 * s);
  ctx.rotate(-0.08);
  ctx.beginPath();
  ctx.moveTo(-2.5 * s, -3.1 * s);
  ctx.quadraticCurveTo(-3.4 * s, -3.1 * s, -3.3 * s, -1.7 * s);
  ctx.quadraticCurveTo(-2.7 * s, 1.5 * s, 1.8 * s, 3.3 * s);
  ctx.quadraticCurveTo(3.2 * s, 3.4 * s, 3.2 * s, 2.4 * s);
  ctx.lineTo(3.2 * s, 1.4 * s);
  ctx.quadraticCurveTo(3.2 * s, 0.9 * s, 2.5 * s, 0.75 * s);
  ctx.lineTo(1.5 * s, 0.55 * s);
  ctx.quadraticCurveTo(1.0 * s, 0.45 * s, 0.75 * s, 0.9 * s);
  ctx.lineTo(0.45 * s, 1.25 * s);
  ctx.quadraticCurveTo(-0.75 * s, 0.65 * s, -1.25 * s, -0.45 * s);
  ctx.lineTo(-0.9 * s, -0.75 * s);
  ctx.quadraticCurveTo(-0.45 * s, -1.05 * s, -0.55 * s, -1.55 * s);
  ctx.lineTo(-0.75 * s, -2.5 * s);
  ctx.quadraticCurveTo(-0.9 * s, -3.1 * s, -1.4 * s, -3.1 * s);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

export function drawQrCodeBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  boxSize: number,
  data: SignatureData,
  style: SignatureStyleOptions
): void {
  const payload = buildQrPayload(data, style);
  const qr = QRCode.create(payload, { errorCorrectionLevel: 'H' });
  const moduleCount = qr.modules.size;
  const qrData = qr.modules.data;

  ctx.save();

  // Subtle compact container integrated with signature surface
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#E4EBF5';
  ctx.lineWidth = Math.max(0.75, boxSize * 0.01);
  ctx.beginPath();
  ctx.roundRect(x, y, boxSize, boxSize, Math.max(4, boxSize * 0.065));
  ctx.fill();
  ctx.stroke();

  const innerPad = Math.max(4, boxSize * 0.065);
  const qrSize = boxSize - innerPad * 2;
  const cellSize = qrSize / moduleCount;
  const originX = x + innerPad;
  const originY = y + innerPad;

  const centerIdx = moduleCount / 2;
  const clearRadiusModules = moduleCount * 0.135;

  const isFinderArea = (r: number, c: number) =>
    (r < 7 && c < 7) ||
    (r < 7 && c >= moduleCount - 7) ||
    (r >= moduleCount - 7 && c < 7);

  ctx.fillStyle = BAILAC_COLORS.deepBlue;

  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      const bit = qrData[r * moduleCount + c];
      if (!bit) continue;

      if (!isFinderArea(r, c)) {
        const dx = c + 0.5 - centerIdx;
        const dy = r + 0.5 - centerIdx;
        if (Math.hypot(dx, dy) < clearRadiusModules) {
          continue;
        }
      }

      const mx = originX + c * cellSize;
      const my = originY + r * cellSize;
      ctx.fillRect(mx, my, cellSize + 0.2, cellSize + 0.2);
    }
  }

  // Subtle corporate WhatsApp badge in center
  drawWhatsAppEmblem(
    ctx,
    x + boxSize / 2,
    y + boxSize / 2,
    qrSize * 0.115
  );

  ctx.restore();
}

export function generateQrPngDataUrl(
  data: SignatureData,
  style: SignatureStyleOptions,
  sizePx = 152
): string {
  const canvas = document.createElement('canvas');
  canvas.width = sizePx;
  canvas.height = sizePx;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    drawQrCodeBlock(ctx, 0, 0, sizePx, data, style);
  }
  return canvas.toDataURL('image/png');
}
