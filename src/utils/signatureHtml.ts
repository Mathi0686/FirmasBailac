import { BAILAC_COLORS, SignatureData, SignatureStyleOptions } from '../types/signature';
import { getWhatsAppWebLink } from './qrRenderer';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeWebsiteHref(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return 'https://www.bailac.cl';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function normalizeTelHref(phone: string): string {
  return `tel:${phone.replace(/[^+\d]/g, '')}`;
}

export interface EmailIconAssets {
  email: string;
  phone: string;
  web: string;
  extra: string;
}

/**
 * Generates bulletproof email-safe HTML table signature with clickable links
 * and Outlook/Gmail-compatible inline styles + PNG icon badges.
 */
export function generateHybridEmailHtml(
  data: SignatureData,
  style: SignatureStyleOptions,
  logoSrc: string,
  icons: EmailIconAssets,
  qrDataUrl?: string
): string {
  const name = escapeHtml(data.fullName.trim() || 'Nombre Apellido');
  const role = escapeHtml(data.role.trim());
  const company = escapeHtml(data.company.trim());
  const email = data.email.trim();
  const phone = data.phone.trim();
  const website = data.website.trim();
  const extra = data.extraLine.trim();

  const font = 'Calibri, Arial, Helvetica, sans-serif';
  const bgStyle = 'background-color:#ffffff;';

  const roleHtml = role
    ? `<tr>
          <td style="padding:2px 0 3px 0;mso-line-height-rule:exactly;line-height:18px;">
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;">
              <tr>
                <td bgcolor="${BAILAC_COLORS.roleBarGray}" style="background-color:${BAILAC_COLORS.roleBarGray};color:#ffffff;font-family:${font};font-size:13px;line-height:17px;padding:1px 14px 1px 4px;mso-line-height-rule:exactly;">
                  ${role}
                </td>
              </tr>
            </table>
          </td>
        </tr>`
    : '';

  const companyHtml = company
    ? `<tr>
        <td style="font-family:${font};font-size:13px;color:${BAILAC_COLORS.textBlue};line-height:18px;padding:0 0 8px 0;">
          ${company}
        </td>
      </tr>`
    : '';

  const contactRowsHtml: string[] = [];

  if (data.showEmail && email) {
    contactRowsHtml.push(`<tr>
      <td width="26" valign="middle" style="padding:3px 8px 3px 0;">
        <img src="${icons.email}" width="19" height="19" alt="Correo" style="display:block;border:0;width:19px;height:19px;" />
      </td>
      <td valign="middle" style="font-family:${font};font-size:13px;line-height:19px;padding:3px 0;">
        <a href="mailto:${escapeHtml(email)}" style="color:${BAILAC_COLORS.emailLinkBlue};text-decoration:underline;">${escapeHtml(email)}</a>
      </td>
    </tr>`);
  }

  if (data.showPhone && phone) {
    contactRowsHtml.push(`<tr>
      <td width="26" valign="middle" style="padding:3px 8px 3px 0;">
        <img src="${icons.phone}" width="19" height="19" alt="Teléfono" style="display:block;border:0;width:19px;height:19px;" />
      </td>
      <td valign="middle" style="font-family:${font};font-size:13px;line-height:19px;padding:3px 0;">
        <a href="${escapeHtml(normalizeTelHref(phone))}" style="color:${BAILAC_COLORS.textBlue};text-decoration:none;">${escapeHtml(phone)}</a>
      </td>
    </tr>`);
  }

  if (data.showWebsite && website) {
    contactRowsHtml.push(`<tr>
      <td width="26" valign="middle" style="padding:3px 8px 3px 0;">
        <img src="${icons.web}" width="19" height="19" alt="Sitio web" style="display:block;border:0;width:19px;height:19px;" />
      </td>
      <td valign="middle" style="font-family:${font};font-size:13px;line-height:19px;padding:3px 0;">
        <a href="${escapeHtml(normalizeWebsiteHref(website))}" target="_blank" rel="noopener noreferrer" style="color:${BAILAC_COLORS.textBlue};text-decoration:none;">${escapeHtml(website)}</a>
      </td>
    </tr>`);
  }

  if (data.showExtra && extra) {
    contactRowsHtml.push(`<tr>
      <td width="26" valign="middle" style="padding:3px 8px 3px 0;">
        <img src="${icons.extra}" width="19" height="19" alt="Ubicación" style="display:block;border:0;width:19px;height:19px;" />
      </td>
      <td valign="middle" style="font-family:${font};font-size:13px;color:${BAILAC_COLORS.textBlue};line-height:19px;padding:3px 0;">
        ${escapeHtml(extra)}
      </td>
    </tr>`);
  }

  const dividerCell = `border-left:2px solid ${BAILAC_COLORS.dividerBlue};padding-left:16px;`;

  const contactsBlockHtml =
    contactRowsHtml.length > 0
      ? `<tr>
          <td style="${dividerCell}">
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;">
              ${contactRowsHtml.join('\n              ')}
            </table>
          </td>
        </tr>`
      : '';

  const qrCaption = style.qrAction === 'vcard' ? 'Contacto' : 'WhatsApp';
  const qrHref = escapeHtml(getWhatsAppWebLink(data));
  const qrImgHtml = qrDataUrl
    ? style.qrAction === 'whatsapp'
      ? `<a href="${qrHref}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;border:0;">
          <img src="${qrDataUrl}" width="74" height="74" alt="Código QR ${qrCaption}" style="display:block;border:0;width:74px;height:74px;" />
        </a>`
      : `<img src="${qrDataUrl}" width="74" height="74" alt="Código QR ${qrCaption}" style="display:block;border:0;width:74px;height:74px;" />`
    : '';

  const qrColumnHtml =
    style.showQr && qrDataUrl
      ? `\n    <td valign="middle" style="padding:12px 10px 8px 14px;border-left:1px solid #e2e8f0;">
      <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;">
        <tr>
          <td align="center" style="padding:0;">
            ${qrImgHtml}
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-top:4px;font-family:${font};font-size:10px;font-weight:400;color:${BAILAC_COLORS.textBlue};line-height:12px;">
            ${qrCaption}
          </td>
        </tr>
      </table>
    </td>`
      : '';

  return `<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;${bgStyle}font-family:${font};">
  <tr>
    <td valign="middle" style="padding:10px 18px 10px 8px;">
      <a href="${escapeHtml(normalizeWebsiteHref(website))}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;border:0;">
        <img src="${logoSrc}" width="238" height="139" alt="BAILAC 100 Años - Ahorrando Neumáticos, desde 1925" style="display:block;border:0;width:238px;height:139px;" />
      </a>
    </td>
    <td valign="middle" style="padding:10px 14px 10px 4px;">
      <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;">
        <tr>
          <td style="padding-left:18px;">
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;">
              <tr>
                <td style="font-family:${font};font-size:15px;font-weight:400;color:${BAILAC_COLORS.textBlue};line-height:20px;padding:0 0 2px 0;">
                  ${name}
                </td>
              </tr>
              ${roleHtml}
              ${companyHtml}
            </table>
          </td>
        </tr>
        ${contactsBlockHtml}
      </table>
    </td>${qrColumnHtml}
  </tr>
</table>`;
}

/**
 * Generates an unbreakable single-image HTML signature wrapper for Outlook/Gmail.
 */
export function generateImageEmailHtml(
  data: SignatureData,
  style: SignatureStyleOptions,
  signatureImageDataUrl: string,
  aspectRatio: number
): string {
  const displayWidth = style.emailDisplayWidth;
  const displayHeight = Math.round(displayWidth / aspectRatio);
  const websiteHref = escapeHtml(normalizeWebsiteHref(data.website));
  const altText = escapeHtml(
    `${data.fullName || 'Firma'} - ${data.role ? data.role + ' - ' : ''}${data.company || 'Bailac'}`
  );

  return `<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;">
  <tr>
    <td style="padding:4px 0;">
      <a href="${websiteHref}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;border:0;">
        <img src="${signatureImageDataUrl}" width="${displayWidth}" height="${displayHeight}" alt="${altText}" style="display:block;border:0;width:${displayWidth}px;max-width:100%;height:auto;" />
      </a>
    </td>
  </tr>
</table>`;
}

export function generateOutlookHtmDocument(innerHtml: string, titleName: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>Firma Corporativa - ${escapeHtml(titleName)}</title>
</head>
<body style="margin:0;padding:0;">
${innerHtml}
</body>
</html>`;
}

export function generatePlainTextSignature(data: SignatureData): string {
  const lines: string[] = [];
  if (data.fullName.trim()) lines.push(data.fullName.trim());
  if (data.role.trim()) lines.push(data.role.trim());
  if (data.company.trim()) lines.push(data.company.trim());
  lines.push('—');
  if (data.showEmail && data.email.trim()) lines.push(`Email: ${data.email.trim()}`);
  if (data.showPhone && data.phone.trim()) lines.push(`Tel: ${data.phone.trim()}`);
  if (data.showWebsite && data.website.trim()) lines.push(`Web: ${data.website.trim()}`);
  if (data.showExtra && data.extraLine.trim()) lines.push(data.extraLine.trim());
  lines.push('BAILAC · 100 Años · Ahorrando Neumáticos, desde 1925');
  return lines.join('\n');
}
