import React from 'react';
import {
  Building2,
  Globe,
  Mail,
  MapPin,
  Phone,
  QrCode,
  RotateCcw,
  User,
  Briefcase,
} from 'lucide-react';
import {
  COMPANY_PRESETS,
  EXAMPLE_PROFILES,
  ExportScale,
  ImageFormat,
  QrAction,
  SignatureData,
  SignatureStyleOptions,
} from '../types/signature';
import { getWhatsAppWebLink } from '../utils/qrRenderer';

interface SignatureFormProps {
  data: SignatureData;
  styleOptions: SignatureStyleOptions;
  onChangeData: (updater: (prev: SignatureData) => SignatureData) => void;
  onChangeStyle: (updater: (prev: SignatureStyleOptions) => SignatureStyleOptions) => void;
  onReset: () => void;
}

export const SignatureForm: React.FC<SignatureFormProps> = ({
  data,
  styleOptions,
  onChangeData,
  onChangeStyle,
  onReset,
}) => {
  const updateField = <K extends keyof SignatureData>(key: K, value: SignatureData[K]) => {
    onChangeData((prev) => ({ ...prev, [key]: value }));
  };

  const applyProfile = (partial: Partial<SignatureData>) => {
    onChangeData((prev) => ({ ...prev, ...partial }));
  };

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

      {/* Quick example profiles */}
      <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-200">
        <div className="text-xs font-medium text-slate-500 mb-2">Ejemplos rápidos</div>
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLE_PROFILES.map((profile) => (
            <button
              key={profile.label}
              type="button"
              onClick={() => applyProfile(profile.data)}
              className="px-2.5 py-1 text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:border-[#1B4695] hover:text-[#1B4695] rounded-md transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4695]"
            >
              {profile.label}
            </button>
          ))}
        </div>
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
              placeholder="Bailac SAN Ltda."
              className="w-full pl-9 pr-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1B4695] focus:ring-2 focus:ring-[#1B4695]/15 transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {COMPANY_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => updateField('company', preset)}
                className={`px-2 py-0.5 text-[11px] font-medium rounded border transition-colors whitespace-nowrap shrink-0 ${
                  data.company === preset
                    ? 'bg-[#1B4695]/8 border-[#1B4695]/40 text-[#1B4695]'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                {preset}
              </button>
            ))}
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
              placeholder="www.bailac.cl"
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
