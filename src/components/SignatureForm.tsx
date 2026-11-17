import React, { useRef } from 'react';
import {
  AlertTriangle,
  Building2,
  Globe,
  Image as ImageIcon,
  Mail,
  MapPin,
  Phone,
  QrCode,
  RotateCcw,
  Upload,
  User,
  Briefcase,
} from 'lucide-react';
import {
  CustomLogoConfig,
  DEFAULT_LOGO_PATH,
  ExportScale,
  ImageFormat,
  LOGO_SPECS,
  QrAction,
  SignatureData,
  SignatureStyleOptions,
} from '../types/signature';
import { getWhatsAppWebLink } from '../utils/qrRenderer';

interface SignatureFormProps {
  data: SignatureData;
  styleOptions: SignatureStyleOptions;
  customLogo: CustomLogoConfig | null;
  logoError: string | null;
  onChangeData: (updater: (prev: SignatureData) => SignatureData) => void;
  onChangeStyle: (updater: (prev: SignatureStyleOptions) => SignatureStyleOptions) => void;
  onUploadLogo: (file: File) => void;
  onResetLogo: () => void;
  onReset: () => void;
}

export const SignatureForm: React.FC<SignatureFormProps> = ({
  data,
  styleOptions,
  customLogo,
  logoError,
  onChangeData,
  onChangeStyle,
  onUploadLogo,
  onResetLogo,
  onReset,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const updateField = <K extends keyof SignatureData>(key: K, value: SignatureData[K]) => {
    onChangeData((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadLogo(file);
    }
    e.target.value = '';
  };

  const isLowResLogo =
    customLogo !== null &&
    (customLogo.width < LOGO_SPECS.minWidth || customLogo.height < LOGO_SPECS.minHeight);

  return (
    <aside className="w-full lg:w-[410px] xl:w-[430px] shrink-0 bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Top quick actions */}
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Datos de la firma</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Personaliza cada campo manteniendo la identidad Bailac
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4695]"
          title="Restablecer valores originales"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restablecer
        </button>
      </div>

      {/* Logo Section: Default BAILAC logo + optional replacement with exact specs */}
      <div className="p-5 border-b border-slate-200 space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#1B4695]" />
            <span className="text-xs font-semibold text-slate-700">
              Logotipo de la firma
            </span>
          </div>
          {customLogo && (
            <button
              type="button"
              onClick={onResetLogo}
              className="text-xs font-medium text-[#1B4695] hover:underline whitespace-nowrap"
            >
              Volver al original
            </button>
          )}
        </div>

        <div className="flex items-center gap-3.5">
          <div className="w-24 h-14 shrink-0 rounded-lg border border-slate-200 bg-white flex items-center justify-center p-1.5 overflow-hidden">
            <img
              src={customLogo ? customLogo.dataUrl : DEFAULT_LOGO_PATH}
              alt="Vista previa del logotipo activo"
              className="max-w-full max-h-full object-contain"
            />
          </div>

          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="text-xs font-medium text-slate-800 truncate">
              {customLogo ? customLogo.fileName : 'Oficial BAILAC 100 Años (Por defecto)'}
            </div>
            <div className="text-[11px] text-slate-500 font-mono-tabular">
              {customLogo
                ? `${customLogo.width} × ${customLogo.height} px`
                : '714 × 417 px · PNG 3x oficial'}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 hover:border-[#1B4695] hover:text-[#1B4695] rounded-md transition-colors whitespace-nowrap"
              >
                <Upload className="w-3.5 h-3.5" />
                Cambiar imagen
              </button>
            </div>
          </div>
        </div>

        {/* Technical specs so uploaded logos render cleanly */}
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-[11px] text-slate-600 space-y-1 leading-relaxed">
          <div className="font-semibold text-slate-700">
            Especificaciones para verse correcta:
          </div>
          <div>
            Tamaño recomendado:{' '}
            <span className="font-mono-tabular font-medium text-slate-800">
              {LOGO_SPECS.recommendedWidth} × {LOGO_SPECS.recommendedHeight} px
            </span>{' '}
            (mínimo{' '}
            <span className="font-mono-tabular">
              {LOGO_SPECS.minWidth} × {LOGO_SPECS.minHeight} px
            </span>
            )
          </div>
          <div>
            Proporción ideal:{' '}
            <span className="font-medium text-slate-800">{LOGO_SPECS.aspectRatioLabel}</span>
          </div>
          <div>
            Formato: <span className="font-medium text-slate-800">PNG, SVG, WebP o JPG</span> con
            fondo blanco o transparente (máx. {LOGO_SPECS.maxFileSizeMb} MB).
          </div>
        </div>

        {isLowResLogo && (
          <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <span>
              La imagen mide {customLogo.width} × {customLogo.height} px. Se recomienda al menos{' '}
              {LOGO_SPECS.recommendedWidth} × {LOGO_SPECS.recommendedHeight} px para evitar pérdida
              de nitidez.
            </span>
          </div>
        )}

        {logoError && (
          <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2.5">
            {logoError}
          </div>
        )}
      </div>

      {/* Section 1: Identity */}
      <div className="p-5 border-b border-slate-200 space-y-4">
        <div className="text-xs font-semibold text-slate-700">01. Identidad corporativa</div>

        <div>
          <label htmlFor="sig-fullname" className="block text-xs font-medium text-slate-600 mb-1.5">
            Nombre y apellido
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="sig-fullname"
              type="text"
              value={data.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
              placeholder="Ej: Nombre Apellido"
              className="w-full pl-9 pr-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1B4695] focus:ring-2 focus:ring-[#1B4695]/15 transition-colors"
            />
          </div>
        </div>

        <div>
          <label htmlFor="sig-role" className="block text-xs font-medium text-slate-600 mb-1.5">
            Cargo o especialidad
          </label>
          <div className="relative">
            <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="sig-role"
              type="text"
              value={data.role}
              onChange={(e) => updateField('role', e.target.value)}
              placeholder="Ej: Jefe de Operaciones OTR"
              className="w-full pl-9 pr-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1B4695] focus:ring-2 focus:ring-[#1B4695]/15 transition-colors"
            />
          </div>
        </div>

        <div>
          <label htmlFor="sig-company" className="block text-xs font-medium text-slate-600 mb-1.5">
            Empresa / Razón social
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="sig-company"
              type="text"
              value={data.company}
              onChange={(e) => updateField('company', e.target.value)}
              placeholder="Bailac Argentina SRL"
              className="w-full pl-9 pr-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1B4695] focus:ring-2 focus:ring-[#1B4695]/15 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Contact channels */}
      <div className="p-5 border-b border-slate-200 space-y-3.5">
        <div className="text-xs font-semibold text-slate-700">02. Canales de contacto</div>

        {/* Email */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="sig-email" className="text-xs font-medium text-slate-600">
              Correo electrónico
            </label>
            <label className="inline-flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={data.showEmail}
                onChange={(e) => updateField('showEmail', e.target.checked)}
                className="rounded border-slate-300 text-[#1B4695] focus:ring-[#1B4695]"
              />
              Mostrar
            </label>
          </div>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="sig-email"
              type="email"
              disabled={!data.showEmail}
              value={data.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="email@bailac.cl"
              className="w-full pl-9 pr-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1B4695] focus:ring-2 focus:ring-[#1B4695]/15 disabled:bg-slate-50 disabled:text-slate-400 transition-colors"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="sig-phone" className="text-xs font-medium text-slate-600">
              Teléfono móvil / Directo
            </label>
            <label className="inline-flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={data.showPhone}
                onChange={(e) => updateField('showPhone', e.target.checked)}
                className="rounded border-slate-300 text-[#1B4695] focus:ring-[#1B4695]"
              />
              Mostrar
            </label>
          </div>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="sig-phone"
              type="tel"
              disabled={!data.showPhone}
              value={data.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="+569 7927 0000"
              className="w-full pl-9 pr-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1B4695] focus:ring-2 focus:ring-[#1B4695]/15 disabled:bg-slate-50 disabled:text-slate-400 transition-colors"
            />
          </div>
        </div>

        {/* Website */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="sig-web" className="text-xs font-medium text-slate-600">
              Sitio web
            </label>
            <label className="inline-flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={data.showWebsite}
                onChange={(e) => updateField('showWebsite', e.target.checked)}
                className="rounded border-slate-300 text-[#1B4695] focus:ring-[#1B4695]"
              />
              Mostrar
            </label>
          </div>
          <div className="relative">
            <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="sig-web"
              type="text"
              disabled={!data.showWebsite}
              value={data.website}
              onChange={(e) => updateField('website', e.target.value)}
              placeholder="bailac.com.ar"
              className="w-full pl-9 pr-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1B4695] focus:ring-2 focus:ring-[#1B4695]/15 disabled:bg-slate-50 disabled:text-slate-400 transition-colors"
            />
          </div>
        </div>

        {/* Optional Extra Location / Branch Line */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="sig-extra" className="text-xs font-medium text-slate-600">
              Sucursal o faena (opcional)
            </label>
            <label className="inline-flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={data.showExtra}
                onChange={(e) => updateField('showExtra', e.target.checked)}
                className="rounded border-slate-300 text-[#1B4695] focus:ring-[#1B4695]"
              />
              Incluir
            </label>
          </div>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="sig-extra"
              type="text"
              disabled={!data.showExtra}
              value={data.extraLine}
              onChange={(e) => updateField('extraLine', e.target.value)}
              placeholder="Ej: Antofagasta · Planta Norte"
              className="w-full pl-9 pr-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1B4695] focus:ring-2 focus:ring-[#1B4695]/15 disabled:bg-slate-50 disabled:text-slate-400 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Optional WhatsApp / vCard QR Code */}
      <div className="p-5 border-b border-slate-200 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-[#1B4695]" />
            <span className="text-xs font-semibold text-slate-700">
              03. Código QR de WhatsApp (Opcional)
            </span>
          </div>
          <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={styleOptions.showQr}
              onChange={(e) =>
                onChangeStyle((s) => ({ ...s, showQr: e.target.checked }))
              }
              className="rounded border-slate-300 text-[#1B4695] focus:ring-[#1B4695]"
            />
            Incluir
          </label>
        </div>

        {styleOptions.showQr && (
          <div className="space-y-3.5 pt-1">
            <div>
              <span className="block text-xs font-medium text-slate-600 mb-1.5">
                Acción al escanear con el celular
              </span>
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
                {(
                  [
                    { id: 'whatsapp', label: 'Abrir WhatsApp' },
                    { id: 'vcard', label: 'Agendar vCard' },
                  ] as Array<{ id: QrAction; label: string }>
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChangeStyle((s) => ({ ...s, qrAction: opt.id }))}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      styleOptions.qrAction === opt.id
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="sig-qr-phone" className="block text-xs font-medium text-slate-600 mb-1.5">
                N° WhatsApp (si es distinto al teléfono)
              </label>
              <input
                id="sig-qr-phone"
                type="tel"
                value={data.qrPhoneOverride}
                onChange={(e) => updateField('qrPhoneOverride', e.target.value)}
                placeholder={data.phone || '+569 7927 0000'}
                className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1B4695] focus:ring-2 focus:ring-[#1B4695]/15 transition-colors"
              />
            </div>

            {styleOptions.qrAction === 'whatsapp' && (
              <div>
                <label htmlFor="sig-qr-msg" className="block text-xs font-medium text-slate-600 mb-1.5">
                  Mensaje predeterminado en WhatsApp (opcional)
                </label>
                <input
                  id="sig-qr-msg"
                  type="text"
                  value={data.qrWhatsappMessage}
                  onChange={(e) => updateField('qrWhatsappMessage', e.target.value)}
                  placeholder="Ej: Hola, me contacto desde tu firma de correo"
                  className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1B4695] focus:ring-2 focus:ring-[#1B4695]/15 transition-colors"
                />
              </div>
            )}

            <div className="text-[11px] text-slate-500 font-mono-tabular truncate">
              {styleOptions.qrAction === 'whatsapp'
                ? `Enlace: ${getWhatsAppWebLink(data)}`
                : `Formato vCard 3.0 · ${data.fullName || 'Colaborador'}`}
            </div>
          </div>
        )}
      </div>

      {/* Section 4: Technical Export Optimization */}
      <div className="p-5 space-y-4">
        <div className="text-xs font-semibold text-slate-700">04. Optimización del archivo</div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="block text-xs font-medium text-slate-600 mb-1.5">
              Densidad (Nitidez)
            </span>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg">
              {([1, 2, 3] as ExportScale[]).map((sc) => (
                <button
                  key={sc}
                  type="button"
                  onClick={() => onChangeStyle((s) => ({ ...s, scale: sc }))}
                  className={`py-1.5 text-xs font-medium font-mono-tabular rounded-md transition-colors ${
                    styleOptions.scale === sc
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {sc}x
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-xs font-medium text-slate-600 mb-1.5">
              Formato de imagen
            </span>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg">
              {(['png', 'jpeg', 'webp'] as ImageFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() =>
                    onChangeStyle((s) => ({
                      ...s,
                      imageFormat: fmt,
                    }))
                  }
                  className={`py-1.5 text-xs font-medium uppercase rounded-md transition-colors ${
                    styleOptions.imageFormat === fmt
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {fmt === 'jpeg' ? 'JPG' : fmt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {styleOptions.imageFormat !== 'png' && (
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-slate-600">Calidad de compresión</span>
              <span className="font-mono-tabular text-slate-700">
                {Math.round(styleOptions.jpegQuality * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0.75}
              max={0.98}
              step={0.01}
              value={styleOptions.jpegQuality}
              onChange={(e) =>
                onChangeStyle((s) => ({ ...s, jpegQuality: parseFloat(e.target.value) }))
              }
              className="w-full accent-[#1B4695]"
            />
          </div>
        )}

        <p className="text-[11px] text-slate-500 leading-relaxed">
          Diseño, colores, fondo blanco y tipografía estandarizados para mantener uniformidad en toda la empresa.
        </p>
      </div>
    </aside>
  );
};
