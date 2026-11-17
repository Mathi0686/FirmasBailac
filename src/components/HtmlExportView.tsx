import React, { useMemo, useState } from 'react';
import { Check, Copy, Download, FileText } from 'lucide-react';
import { SignatureData, SignatureStyleOptions } from '../types/signature';
import { RenderedSignatureMetrics } from '../utils/signatureCanvas';
import {
  EmailIconAssets,
  generateHybridEmailHtml,
  generateImageEmailHtml,
  generatePlainTextSignature,
} from '../utils/signatureHtml';

interface HtmlExportViewProps {
  data: SignatureData;
  styleOptions: SignatureStyleOptions;
  onChangeStyle: (updater: (prev: SignatureStyleOptions) => SignatureStyleOptions) => void;
  metrics: RenderedSignatureMetrics | null;
  logoDataUrl: string;
  logoDims?: { width: number; height: number };
  iconDataUrls: EmailIconAssets;
  qrDataUrl?: string;
  copiedState: string | null;
  onCopyText: (text: string, key: string) => void;
  onCopyRichHtml: (html: string, plainText: string, key: string) => void;
  onDownloadHtm: (html: string) => void;
}

type HtmlVariant = 'hybrid' | 'single-image';

export const HtmlExportView: React.FC<HtmlExportViewProps> = ({
  data,
  styleOptions,
  onChangeStyle,
  metrics,
  logoDataUrl,
  logoDims,
  iconDataUrls,
  qrDataUrl,
  copiedState,
  onCopyText,
  onCopyRichHtml,
  onDownloadHtm,
}) => {
  const [variant, setVariant] = useState<HtmlVariant>('hybrid');

  const hybridHtml = useMemo(
    () =>
      generateHybridEmailHtml(
        data,
        styleOptions,
        logoDataUrl,
        iconDataUrls,
        qrDataUrl,
        logoDims
      ),
    [data, styleOptions, logoDataUrl, iconDataUrls, qrDataUrl, logoDims]
  );

  const singleImageHtml = useMemo(() => {
    if (!metrics) return '';
    const aspect = metrics.logicalWidth / metrics.logicalHeight;
    return generateImageEmailHtml(data, styleOptions, metrics.dataUrl, aspect);
  }, [data, styleOptions, metrics]);

  const plainText = useMemo(() => generatePlainTextSignature(data), [data]);

  const activeHtml = variant === 'hybrid' ? hybridHtml : singleImageHtml;

  return (
    <div className="space-y-6">
      {/* Top Config & Variant Switcher */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-slate-900">
            Exportación HTML y compatibilidad con clientes
          </h2>
          <p className="text-xs text-slate-500">
            Código estructurado con tablas inline (compatible con Outlook Desktop, Gmail, Apple Mail y Thunderbird)
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setVariant('hybrid')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              variant === 'hybrid'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tabla híbrida (Enlaces clicables)
          </button>
          <button
            type="button"
            onClick={() => setVariant('single-image')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              variant === 'single-image'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Imagen única optimizada
          </button>
        </div>
      </div>

      {/* Live HTML Render Check */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-semibold text-slate-700">
            Vista previa renderizada del bloque HTML
          </div>
          {variant === 'single-image' && (
            <div className="flex items-center gap-3 text-xs">
              <label htmlFor="html-display-width" className="text-slate-600 font-medium">
                Ancho en correo:
              </label>
              <input
                id="html-display-width"
                type="range"
                min={420}
                max={640}
                step={10}
                value={styleOptions.emailDisplayWidth}
                onChange={(e) =>
                  onChangeStyle((s) => ({
                    ...s,
                    emailDisplayWidth: parseInt(e.target.value, 10),
                  }))
                }
                className="w-28 accent-[#1B4695]"
              />
              <span className="font-mono-tabular text-slate-700 w-12 text-right">
                {styleOptions.emailDisplayWidth}px
              </span>
            </div>
          )}
        </div>

        <div className="p-6 md:p-8 bg-slate-50 flex justify-center overflow-x-auto">
          <div
            className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm"
            dangerouslySetInnerHTML={{ __html: activeHtml }}
          />
        </div>

        <div className="px-5 py-3.5 border-t border-slate-200 bg-white flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onCopyRichHtml(activeHtml, plainText, 'rich-html-tab')}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#1B4695] hover:bg-[#163a7d] rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            {copiedState === 'rich-html-tab' ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Firma enriquecida copiada
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copiar firma enriquecida (Pegar directo en Gmail/Outlook)
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onCopyText(activeHtml, 'html-code')}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-200 hover:border-[#1B4695] hover:text-[#1B4695] rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            {copiedState === 'html-code' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Código HTML copiado
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copiar código HTML
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onDownloadHtm(activeHtml)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-200 hover:border-[#1B4695] hover:text-[#1B4695] rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Descargar archivo .HTM
          </button>
        </div>
      </div>

      {/* Code & Plain Text Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              Código fuente HTML ({variant === 'hybrid' ? 'Tabla Híbrida' : 'Imagen Única'})
            </span>
            <span className="text-xs font-mono-tabular text-slate-500">
              {activeHtml.length.toLocaleString('es-CL')} caracteres
            </span>
          </div>
          <pre className="p-4 text-[11px] leading-relaxed font-mono-tabular text-slate-700 bg-slate-50 overflow-x-auto max-h-72">
            <code>{activeHtml}</code>
          </pre>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Versión texto plano
            </span>
            <button
              type="button"
              onClick={() => onCopyText(plainText, 'plain-text')}
              className="text-xs font-medium text-[#1B4695] hover:underline whitespace-nowrap"
            >
              {copiedState === 'plain-text' ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <pre className="p-4 text-xs leading-relaxed font-mono-tabular text-slate-700 bg-slate-50 flex-1 whitespace-pre-wrap">
            {plainText}
          </pre>
        </div>
      </div>
    </div>
  );
};
