import React from 'react';
import {
  Check,
  Code2,
  Copy,
  Download,
  FileCode,
  Mail,
  Monitor,
  Moon,
  Sun,
} from 'lucide-react';
import {
  PreviewMode,
  SignatureData,
  SignatureStyleOptions,
} from '../types/signature';
import { formatBytes, RenderedSignatureMetrics } from '../utils/signatureCanvas';

interface SignaturePreviewStageProps {
  data: SignatureData;
  styleOptions: SignatureStyleOptions;
  previewMode: PreviewMode;
  onChangePreviewMode: (mode: PreviewMode) => void;
  metrics: RenderedSignatureMetrics | null;
  isRendering: boolean;
  copiedState: string | null;
  onDownloadImage: () => void;
  onCopyImage: () => void;
  onCopyRichSignature: () => void;
  onDownloadHtm: () => void;
  onOpenHtmlTab: () => void;
}

export const SignaturePreviewStage: React.FC<SignaturePreviewStageProps> = ({
  data,
  styleOptions,
  previewMode,
  onChangePreviewMode,
  metrics,
  isRendering,
  copiedState,
  onDownloadImage,
  onCopyImage,
  onCopyRichSignature,
  onDownloadHtm,
  onOpenHtmlTab,
}) => {
  const formatLabel =
    styleOptions.imageFormat === 'jpeg'
      ? 'JPG'
      : styleOptions.imageFormat.toUpperCase();

  const fileWeightStatus = metrics
    ? metrics.blob.size <= 150 * 1024
      ? 'Óptimo para correo (< 150 KB)'
      : 'Peso elevado: considera usar escala 2x o JPG'
    : 'Calculando...';

  return (
    <section className="flex-1 min-w-0 space-y-5">
      {/* Preview Viewport Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {/* Stage Toolbar */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => onChangePreviewMode('canvas')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                previewMode === 'canvas'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              Lienzo puro
            </button>
            <button
              type="button"
              onClick={() => onChangePreviewMode('email-light')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                previewMode === 'email-light'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              Simulador correo
            </button>
            <button
              type="button"
              onClick={() => onChangePreviewMode('email-dark')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                previewMode === 'email-dark'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              Prueba modo oscuro
            </button>
          </div>

          {/* Unboxed tabular telemetry */}
          {metrics && (
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono-tabular">
              <span>
                {metrics.pixelWidth} × {metrics.pixelHeight} px
              </span>
              <span aria-hidden="true">·</span>
              <span>{formatBytes(metrics.blob.size)}</span>
              <span aria-hidden="true">·</span>
              <span>
                {formatLabel} {styleOptions.scale}x
              </span>
            </div>
          )}
        </div>

        {/* Render Viewport */}
        <div
          className={`p-6 md:p-10 transition-colors duration-200 flex items-center justify-center min-h-[300px] ${
            previewMode === 'email-dark'
              ? 'bg-slate-950'
              : previewMode === 'email-light'
              ? 'bg-slate-100'
              : 'bg-slate-50'
          }`}
        >
          {previewMode === 'canvas' && (
            <div
              className={`inline-block rounded-lg overflow-hidden transition-opacity duration-150 bg-white border border-slate-200/80 shadow-sm ${
                isRendering ? 'opacity-70' : 'opacity-100'
              }`}
            >
              {metrics ? (
                <img
                  src={metrics.dataUrl}
                  alt={`Vista previa de firma digital para ${data.fullName || 'colaborador Bailac'}`}
                  style={{
                    width: `${metrics.logicalWidth}px`,
                    maxWidth: '100%',
                    height: 'auto',
                  }}
                  className="block"
                />
              ) : (
                <div className="w-[486px] h-[198px] bg-slate-100 animate-pulse" />
              )}
            </div>
          )}

          {(previewMode === 'email-light' || previewMode === 'email-dark') && (
            <div
              className={`w-full max-w-2xl rounded-xl border overflow-hidden ${
                previewMode === 'email-dark'
                  ? 'bg-slate-900 border-slate-800 text-slate-200'
                  : 'bg-white border-slate-200 text-slate-800 shadow-sm'
              }`}
            >
              {/* Mock Email Header */}
              <div
                className={`px-5 py-3 border-b text-xs space-y-1.5 ${
                  previewMode === 'email-dark'
                    ? 'border-slate-800 bg-slate-900/80 text-slate-400'
                    : 'border-slate-100 bg-slate-50/80 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" />
                    <span
                      className={`font-medium ${
                        previewMode === 'email-dark' ? 'text-slate-200' : 'text-slate-800'
                      }`}
                    >
                      Nuevo mensaje corporativo
                    </span>
                  </div>
                  <span>{previewMode === 'email-dark' ? 'Cliente Dark Mode' : 'Outlook / Gmail'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 shrink-0">Para:</span>
                  <span className={previewMode === 'email-dark' ? 'text-slate-300' : 'text-slate-700'}>
                    operaciones@cliente.cl
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 shrink-0">Asunto:</span>
                  <span className={previewMode === 'email-dark' ? 'text-slate-200' : 'text-slate-800'}>
                    Informe técnico de inspección y rendimiento de neumáticos OTR
                  </span>
                </div>
              </div>

              {/* Email Body + Embedded Signature */}
              <div className="p-6 space-y-4 text-sm leading-relaxed">
                <p>Estimado equipo,</p>
                <p>
                  Adjunto el reporte consolidado de seguimiento y recomendaciones operacionales
                  correspondientes al último turno en faena. Quedo atento a sus comentarios para
                  coordinar la revisión en terreno.
                </p>
                <p>Saludos cordiales,</p>

                <div className="pt-2">
                  {metrics && (
                    <img
                      src={metrics.dataUrl}
                      alt="Firma corporativa en correo simulado"
                      style={{
                        width: `${Math.min(metrics.logicalWidth, styleOptions.emailDisplayWidth)}px`,
                        maxWidth: '100%',
                        height: 'auto',
                      }}
                      className="block rounded-sm"
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Telemetry & Guidance Strip */}
        <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>{fileWeightStatus}</span>
            <span aria-hidden="true">·</span>
            <span>
              Ancho sugerido en correo:{' '}
              <strong className="font-mono-tabular font-medium text-slate-800">
                {metrics ? `${Math.min(metrics.logicalWidth, styleOptions.emailDisplayWidth)} px` : '—'}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Export Actions Panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Exportar firma lista para correo
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Elige descarga de imagen optimizada o formato HTML compatible con Outlook, Gmail y Apple Mail
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
          {/* 1. Primary Image Download */}
          <button
            type="button"
            onClick={onDownloadImage}
            disabled={!metrics}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#E9540D] hover:bg-[#d14809] rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E9540D] focus-visible:ring-offset-2"
          >
            <Download className="w-4 h-4 shrink-0" />
            Descargar {formatLabel}
          </button>

          {/* 2. Copy Image to Clipboard */}
          <button
            type="button"
            onClick={onCopyImage}
            disabled={!metrics}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-800 bg-white border border-slate-200 hover:border-[#1B4695] hover:text-[#1B4695] rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4695]"
          >
            {copiedState === 'image' ? (
              <>
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                Imagen copiada
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 shrink-0" />
                Copiar imagen
              </>
            )}
          </button>

          {/* 3. Copy Rich HTML Signature (Clickable links in Gmail / OWA) */}
          <button
            type="button"
            onClick={onCopyRichSignature}
            disabled={!metrics}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#1B4695] hover:bg-[#163a7d] rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4695] focus-visible:ring-offset-2"
          >
            {copiedState === 'rich' ? (
              <>
                <Check className="w-4 h-4 shrink-0" />
                Firma copiada
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 shrink-0" />
                Copiar para Gmail/OWA
              </>
            )}
          </button>

          {/* 4. Download Outlook .HTM */}
          <button
            type="button"
            onClick={onDownloadHtm}
            disabled={!metrics}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-800 bg-white border border-slate-200 hover:border-[#1B4695] hover:text-[#1B4695] rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4695]"
          >
            <FileCode className="w-4 h-4 shrink-0" />
            Archivo .HTM (Outlook)
          </button>
        </div>

        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            ¿Necesitas el código fuente HTML o versión de texto plano para servidor Exchange?
          </span>
          <button
            type="button"
            onClick={onOpenHtmlTab}
            className="inline-flex items-center gap-1.5 font-medium text-[#1B4695] hover:underline whitespace-nowrap shrink-0"
          >
            <Code2 className="w-3.5 h-3.5" />
            Abrir inspector HTML y texto plano
          </button>
        </div>
      </div>
    </section>
  );
};
