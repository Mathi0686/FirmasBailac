import React from 'react';
import { CheckCircle2, Mail, Monitor, Smartphone } from 'lucide-react';

interface GuideClient {
  id: string;
  name: string;
  recommendedFormat: string;
  steps: string[];
  tip: string;
}

const CLIENT_GUIDES: GuideClient[] = [
  {
    id: 'gmail',
    name: 'Gmail (Web / Corporativo)',
    recommendedFormat: 'Copiar para Gmail/OWA o Imagen PNG 2x',
    steps: [
      'Haz clic en "Copiar para Gmail/OWA" (para conservar enlaces clicables) o en "Descargar PNG" si prefieres firma en imagen única.',
      'Abre Gmail, presiona el ícono de engranaje arriba a la derecha y selecciona "Ver todos los ajustes".',
      'Desplázate hasta la sección "Firma", haz clic en "Crear nueva" y asígnale un nombre (ej. Bailac 100 Años).',
      'Pega directamente con Ctrl+V (o Cmd+V en Mac), o usa el ícono de "Insertar imagen" si descargaste el PNG.',
      'En "Valores predeterminados de firma", selecciona tu firma para correos nuevos y respuestas, y guarda los cambios abajo.',
    ],
    tip: 'Si insertas la imagen PNG 2x en Gmail, selecciónala en el editor y elige tamaño "Original" o "Grande" para que no pierda nitidez.',
  },
  {
    id: 'outlook-desktop',
    name: 'Microsoft Outlook (Escritorio Windows / Mac)',
    recommendedFormat: 'PNG 2x Optimizado o Archivo .HTM',
    steps: [
      'En Outlook, ve a Archivo → Opciones → Correo → Firmas (en Nuevo Outlook: Configuración → Cuentas → Firmas).',
      'Crea una firma nueva o edita la existente.',
      'Haz clic en "Copiar imagen" aquí y pégala directamente en el recuadro, o insértala usando el botón de imagen con el archivo PNG descargado.',
      'Si prefieres usar la versión HTML con enlaces, guarda el archivo .HTM descargado en la carpeta %AppData%\\Microsoft\\Signatures.',
      'Asigna la firma a tu cuenta para "Mensajes nuevos" y "Respuestas o reenvíos", y haz clic en Aceptar.',
    ],
    tip: 'Para Outlook Clásico en Windows, la escala 2x con fondo Blanco Sólido evita bordes dentados y mantiene el contraste en Modo Oscuro.',
  },
  {
    id: 'outlook-web',
    name: 'Outlook Web (Office 365 / OWA)',
    recommendedFormat: 'Copiar para Gmail/OWA o PNG 2x',
    steps: [
      'Haz clic en "Copiar para Gmail/OWA" en el panel de exportación.',
      'Abre Outlook en tu navegador y entra a Configuración (ícono de engranaje) → Correo → Redactar y responder.',
      'Crea una nueva firma, haz clic en el cuadro de texto y pega con Ctrl+V (o Cmd+V).',
      'Verifica que el correo y sitio web queden como enlaces activos y presiona "Guardar".',
    ],
    tip: 'Si OWA comprime el ancho de tu pantalla en móviles, la versión "Imagen única optimizada" mantiene alineados el logo y el divisor azul.',
  },
  {
    id: 'apple-mail',
    name: 'Apple Mail (macOS / iOS)',
    recommendedFormat: 'Imagen PNG 2x (Retina)',
    steps: [
      'Descarga la firma en formato PNG con densidad 2x (Retina HD) y fondo blanco sólido.',
      'En Mac: abre Mail → Ajustes → Firmas, selecciona tu cuenta y crea una firma nueva.',
      'Desmarca "Usar siempre el tipo de letra predeterminado del mensaje" y arrastra el archivo PNG dentro del editor.',
      'En iPhone/iPad: copia la imagen desde Safari o Fotos y pégala en Ajustes → Mail → Firma.',
    ],
    tip: 'Apple Mail invierte colores de texto HTML en modo oscuro; usar la imagen PNG con fondo blanco garantiza los colores corporativos exactos de Bailac.',
  },
];

export const InstallGuideView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <h2 className="text-base font-semibold text-slate-900">
            Guía de instalación por cliente de correo
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Sigue las instrucciones según tu plataforma de mensajería para asegurar nitidez Retina,
            peso ligero y compatibilidad con modo oscuro.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-1.5">
            <Monitor className="w-4 h-4 text-[#1B4695]" />
            <span>Escritorio</span>
          </div>
          <span aria-hidden="true">·</span>
          <div className="flex items-center gap-1.5">
            <Mail className="w-4 h-4 text-[#1B4695]" />
            <span>Webmail</span>
          </div>
          <span aria-hidden="true">·</span>
          <div className="flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-[#1B4695]" />
            <span>Móvil</span>
          </div>
        </div>
      </div>

      {/* 2x2 Client Guides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {CLIENT_GUIDES.map((guide) => (
          <article
            key={guide.id}
            className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-5"
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">{guide.name}</h3>
                <p className="text-xs text-[#1B4695] font-medium mt-0.5">
                  Recomendado: {guide.recommendedFormat}
                </p>
              </div>

              <ol className="space-y-2.5 text-sm text-slate-600 leading-relaxed">
                {guide.steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="font-mono-tabular text-xs font-semibold text-slate-400 mt-0.5 shrink-0 w-4">
                      {idx + 1}.
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{guide.tip}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
