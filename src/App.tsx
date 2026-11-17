/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { SignatureForm } from './components/SignatureForm';
import { SignaturePreviewStage } from './components/SignaturePreviewStage';
import { InstallGuideView } from './components/InstallGuideView';
import {
  CustomLogoConfig,
  DEFAULT_LOGO_PATH,
  DEFAULT_SIGNATURE_DATA,
  DEFAULT_STYLE_OPTIONS,
  LOGO_SPECS,
  PreviewMode,
  SignatureData,
  SignatureStyleOptions,
} from './types/signature';
import {
  generateIconPngDataUrl,
  getLogoPngDataUrl,
  RenderedSignatureMetrics,
  renderSignatureCanvas,
} from './utils/signatureCanvas';
import { generateQrPngDataUrl } from './utils/qrRenderer';
import {
  EmailIconAssets,
  generateHybridEmailHtml,
  generateOutlookHtmDocument,
  generatePlainTextSignature,
} from './utils/signatureHtml';

type ActiveTab = 'editor' | 'guide';

const STORAGE_KEY_DATA = 'bailac_signature_data_v2';
const STORAGE_KEY_STYLE = 'bailac_signature_style_v2';
const STORAGE_KEY_LOGO = 'bailac_signature_custom_logo_v1';

function slugifyFilename(name: string): string {
  const clean = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return clean || 'colaborador';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('editor');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('canvas');

  const [data, setData] = useState<SignatureData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DATA);
      if (saved) return { ...DEFAULT_SIGNATURE_DATA, ...JSON.parse(saved) };
    } catch {
      // Ignore storage errors
    }
    return DEFAULT_SIGNATURE_DATA;
  });

  const [styleOptions, setStyleOptions] = useState<SignatureStyleOptions>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STYLE);
      if (saved) return { ...DEFAULT_STYLE_OPTIONS, ...JSON.parse(saved) };
    } catch {
      // Ignore storage errors
    }
    return DEFAULT_STYLE_OPTIONS;
  });

  const [metrics, setMetrics] = useState<RenderedSignatureMetrics | null>(null);
  const [isRendering, setIsRendering] = useState<boolean>(true);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [defaultLogoDataUrl, setDefaultLogoDataUrl] = useState<string>(DEFAULT_LOGO_PATH);
  const [customLogo, setCustomLogo] = useState<CustomLogoConfig | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGO);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore storage errors
    }
    return null;
  });
  const [logoError, setLogoError] = useState<string | null>(null);
  const [copiedState, setCopiedState] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeLogoDataUrl = customLogo ? customLogo.dataUrl : defaultLogoDataUrl;
  const activeLogoDims = useMemo(
    () =>
      customLogo
        ? { width: customLogo.width, height: customLogo.height }
        : { width: 714, height: 417 },
    [customLogo]
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderSeqRef = useRef<number>(0);

  const iconDataUrls: EmailIconAssets = useMemo(() => {
    if (typeof document === 'undefined') {
      return { email: '', phone: '', web: '', extra: '' };
    }
    return {
      email: generateIconPngDataUrl('email'),
      phone: generateIconPngDataUrl('phone'),
      web: generateIconPngDataUrl('web'),
      extra: generateIconPngDataUrl('extra'),
    };
  }, []);

  const qrDataUrl = useMemo(() => {
    if (typeof document === 'undefined' || !styleOptions.showQr) {
      return undefined;
    }
    return generateQrPngDataUrl(data, styleOptions, 148);
  }, [data, styleOptions]);

  useEffect(() => {
    getLogoPngDataUrl()
      .then((url) => setDefaultLogoDataUrl(url))
      .catch(() => {
        // Fallback to relative asset path
      });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(data));
    } catch {
      // Ignore storage errors
    }
  }, [data]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STYLE, JSON.stringify(styleOptions));
    } catch {
      // Ignore storage errors
    }
  }, [styleOptions]);

  useEffect(() => {
    try {
      if (customLogo) {
        localStorage.setItem(STORAGE_KEY_LOGO, JSON.stringify(customLogo));
      } else {
        localStorage.removeItem(STORAGE_KEY_LOGO);
      }
    } catch {
      // Ignore storage errors if custom image exceeds quota
    }
  }, [customLogo]);

  useEffect(() => {
    const seq = ++renderSeqRef.current;
    setIsRendering(true);
    setRenderError(null);

    const timer = window.setTimeout(() => {
      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }
      renderSignatureCanvas(
        canvasRef.current,
        data,
        styleOptions,
        customLogo ? customLogo.dataUrl : null
      )
        .then((res) => {
          if (seq === renderSeqRef.current) {
            setMetrics(res);
            setIsRendering(false);
          }
        })
        .catch(() => {
          if (seq === renderSeqRef.current) {
            setRenderError('No se pudo cargar el logotipo de la firma.');
            setIsRendering(false);
          }
        });
    }, 35);

    return () => window.clearTimeout(timer);
  }, [data, styleOptions, customLogo]);

  const showToast = useCallback((msg: string, copiedKey?: string) => {
    setToastMessage(msg);
    if (copiedKey) {
      setCopiedState(copiedKey);
      window.setTimeout(() => {
        setCopiedState((curr) => (curr === copiedKey ? null : curr));
      }, 2200);
    }
    window.setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3200);
  }, []);

  const triggerDownload = useCallback((blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, []);

  const handleDownloadImage = useCallback(() => {
    if (!metrics) return;
    const ext = styleOptions.imageFormat === 'jpeg' ? 'jpg' : styleOptions.imageFormat;
    const filename = `firma-bailac-${slugifyFilename(data.fullName)}.${ext}`;
    triggerDownload(metrics.blob, filename);
    showToast(`Imagen descargada: ${filename}`);
  }, [metrics, styleOptions.imageFormat, data.fullName, triggerDownload, showToast]);

  const handleCopyImage = useCallback(async () => {
    if (!metrics) return;
    try {
      // ClipboardItem requires image/png across browsers
      let pngBlob = metrics.blob;
      if (styleOptions.imageFormat !== 'png') {
        const tempCanvas = document.createElement('canvas');
        const pngRes = await renderSignatureCanvas(
          tempCanvas,
          data,
          {
            ...styleOptions,
            imageFormat: 'png',
          },
          customLogo ? customLogo.dataUrl : null
        );
        pngBlob = pngRes.blob;
      }

      if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': pngBlob }),
        ]);
        showToast('Imagen PNG copiada al portapapeles. Pégala en tu cliente de correo.', 'image');
      } else {
        handleDownloadImage();
      }
    } catch {
      handleDownloadImage();
      showToast('El navegador restringió el portapapeles de imagen; se descargó el archivo.');
    }
  }, [metrics, styleOptions, data, customLogo, showToast, handleDownloadImage]);

  const copyRichHtmlFallback = useCallback((html: string) => {
    const container = document.createElement('div');
    container.innerHTML = html;
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.background = '#ffffff';
    document.body.appendChild(container);

    const range = document.createRange();
    range.selectNodeContents(container);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    const ok = document.execCommand('copy');
    sel?.removeAllRanges();
    document.body.removeChild(container);
    return ok;
  }, []);

  const handleCopyRichHtml = useCallback(
    async (html: string, plain: string, key: string) => {
      try {
        if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
          await navigator.clipboard.write([
            new ClipboardItem({
              'text/html': new Blob([html], { type: 'text/html' }),
              'text/plain': new Blob([plain], { type: 'text/plain' }),
            }),
          ]);
          showToast('Firma enriquecida copiada. Pégala con Ctrl+V en Gmail u Outlook.', key);
          return;
        }
      } catch {
        // Try execCommand fallback
      }

      if (copyRichHtmlFallback(html)) {
        showToast('Firma enriquecida copiada al portapapeles.', key);
      } else {
        showToast('No se pudo copiar automáticamente. Usa "Archivo .HTM" o "Copiar código HTML".');
      }
    },
    [copyRichHtmlFallback, showToast]
  );

  const handleCopyDefaultRichSignature = useCallback(() => {
    const html = generateHybridEmailHtml(
      data,
      styleOptions,
      activeLogoDataUrl,
      iconDataUrls,
      qrDataUrl,
      activeLogoDims
    );
    const plain = generatePlainTextSignature(data);
    handleCopyRichHtml(html, plain, 'rich');
  }, [data, styleOptions, activeLogoDataUrl, iconDataUrls, qrDataUrl, activeLogoDims, handleCopyRichHtml]);

  const handleDownloadHtm = useCallback(
    (customInnerHtml?: string) => {
      const inner =
        customInnerHtml ||
        generateHybridEmailHtml(
          data,
          styleOptions,
          activeLogoDataUrl,
          iconDataUrls,
          qrDataUrl,
          activeLogoDims
        );
      const doc = generateOutlookHtmDocument(inner, data.fullName || 'Bailac');
      const blob = new Blob([doc], { type: 'text/html;charset=utf-8' });
      const filename = `firma-bailac-${slugifyFilename(data.fullName)}.htm`;
      triggerDownload(blob, filename);
      showToast(`Archivo Outlook descargado: ${filename}`);
    },
    [data, styleOptions, activeLogoDataUrl, iconDataUrls, qrDataUrl, activeLogoDims, triggerDownload, showToast]
  );

  const handleUploadLogo = useCallback(
    (file: File) => {
      setLogoError(null);
      const maxBytes = LOGO_SPECS.maxFileSizeMb * 1024 * 1024;
      if (file.size > maxBytes) {
        setLogoError(`El archivo supera el límite de ${LOGO_SPECS.maxFileSizeMb} MB.`);
        return;
      }
      if (!/^image\/(png|jpeg|webp|svg\+xml)$/i.test(file.type)) {
        setLogoError('Formato no compatible. Usa PNG, SVG, JPG o WebP.');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === 'string' ? reader.result : '';
        if (!result) {
          setLogoError('No se pudo leer la imagen seleccionada.');
          return;
        }
        const img = new Image();
        img.onload = () => {
          const w = img.naturalWidth || 238;
          const h = img.naturalHeight || 139;
          // Normalize SVG/oversized uploads to crisp PNG data URL so Outlook/Gmail support it universally
          if (file.type === 'image/svg+xml' || w > 960) {
            const scaleDown = w > 960 ? 960 / w : 2;
            const c = document.createElement('canvas');
            c.width = Math.round(w * scaleDown);
            c.height = Math.round(h * scaleDown);
            const ctx = c.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, c.width, c.height);
              setCustomLogo({
                dataUrl: c.toDataURL('image/png'),
                fileName: file.name,
                width: w,
                height: h,
              });
              showToast(`Logotipo actualizado: ${file.name}`);
              return;
            }
          }
          setCustomLogo({
            dataUrl: result,
            fileName: file.name,
            width: w,
            height: h,
          });
          showToast(`Logotipo actualizado: ${file.name}`);
        };
        img.onerror = () => {
          setLogoError('No se pudo decodificar la imagen seleccionada.');
        };
        img.src = result;
      };
      reader.onerror = () => {
        setLogoError('Error al leer el archivo de imagen.');
      };
      reader.readAsDataURL(file);
    },
    [showToast]
  );

  const handleResetLogo = useCallback(() => {
    setCustomLogo(null);
    setLogoError(null);
    showToast('Logotipo restablecido al oficial BAILAC 100 Años.');
  }, [showToast]);

  const handleReset = useCallback(() => {
    setData(DEFAULT_SIGNATURE_DATA);
    setStyleOptions(DEFAULT_STYLE_OPTIONS);
    setCustomLogo(null);
    setLogoError(null);
    showToast('Valores restablecidos a la plantilla oficial.');
  }, [showToast]);

  const formatExtLabel =
    styleOptions.imageFormat === 'jpeg' ? 'JPG' : styleOptions.imageFormat.toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('editor');
            }}
            className="text-lg font-bold tracking-tight text-slate-900 font-display whitespace-nowrap shrink-0"
          >
            Bailac Argentina <span className="text-[#1B4695]">Firmas</span>
          </a>

          {/* Zone 2: Clean single-line nav links */}
          <nav className="flex items-center gap-6 text-sm font-medium overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`py-5 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'editor'
                  ? 'border-[#E9540D] text-slate-900'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Editor y vista previa
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('guide')}
              className={`py-5 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'guide'
                  ? 'border-[#E9540D] text-slate-900'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Guía por cliente
            </button>
          </nav>

          {/* Zone 3: 1 Primary CTA */}
          <div className="hidden sm:flex items-center shrink-0">
            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={!metrics}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#E9540D] hover:bg-[#d14809] rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E9540D] focus-visible:ring-offset-2"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar {formatExtLabel}
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 py-6 md:py-8">
        {renderError && (
          <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg">
            {renderError}
          </div>
        )}

        {activeTab === 'editor' && (
          <div className="flex flex-col lg:flex-row items-start gap-6">
            <SignatureForm
              data={data}
              styleOptions={styleOptions}
              customLogo={customLogo}
              logoError={logoError}
              onChangeData={setData}
              onChangeStyle={setStyleOptions}
              onUploadLogo={handleUploadLogo}
              onResetLogo={handleResetLogo}
              onReset={handleReset}
            />

            <SignaturePreviewStage
              data={data}
              styleOptions={styleOptions}
              previewMode={previewMode}
              onChangePreviewMode={setPreviewMode}
              metrics={metrics}
              isRendering={isRendering}
              copiedState={copiedState}
              onDownloadImage={handleDownloadImage}
              onCopyImage={handleCopyImage}
              onCopyRichSignature={handleCopyDefaultRichSignature}
              onDownloadHtm={() => handleDownloadHtm()}
            />
          </div>
        )}

        {activeTab === 'guide' && <InstallGuideView />}
      </main>

      {/* Subtle Footer */}
      <footer className="border-t border-slate-200 bg-white mt-auto">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <span>BAILAC · 100 Años · Ahorrando Neumáticos, desde 1925</span>
          <span>Procesamiento 100% local en tu navegador · Sin envío de datos a terceros</span>
        </div>
      </footer>

      {/* Non-intrusive Feedback Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 max-w-sm bg-slate-900 text-white text-xs font-medium px-4 py-3 rounded-lg shadow-lg border border-slate-800"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
