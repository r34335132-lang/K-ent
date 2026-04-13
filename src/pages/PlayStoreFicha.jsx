import React, { useState } from 'react';
import { Copy, Check, Download, Smartphone, Globe, FileText, Tag, AlignLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FICHA = {
  nombre_completo: "K'eni Connect",
  nombre_corto: "K'eni",
  descripcion_corta: "Portal de gestión condominial para residentes y administradores de Administraciones Integrales K'eni en Huixquilucan.",
  descripcion_larga: `K'eni Connect es la plataforma digital oficial de Administraciones Integrales K'eni para la gestión integral de condominios residenciales en Huixquilucan, Estado de México.

Con K'eni Connect, los residentes pueden:
• Consultar avisos, comunicados y reglamentos del condominio en tiempo real
• Enviar sugerencias, quejas o felicitaciones a la administración a través del buzón interactivo
• Ver el calendario de eventos, reuniones y trabajos de mantenimiento programados
• Consultar el historial de gastos y transparencia financiera del condominio
• Recibir notificaciones por correo sobre avisos urgentes

Los administradores tienen acceso a:
• Panel de control con gestión de múltiples condominios
• Módulo de mantenimiento con seguimiento de tickets por área
• Control de gastos con reportes mensuales exportables
• Gestión de residentes por departamento
• Sistema de tokens de acceso por condominio
• Panel de buzón agrupado por sede para atención centralizada

Diseñada para funcionar en tablets instaladas en los elevadores de cada edificio, K'eni Connect facilita la comunicación transparente entre administración y residentes.`,
  categoria: "Negocios / Productividad",
  keywords: [
    "condominio", "administración", "residentes", "huixquilucan",
    "kiosk", "mantenimiento", "buzón", "avisos", "transparencia",
    "portal condominial", "k'eni", "elevador", "tablet", "gestión"
  ],
  privacidad_url: `${window.location.origin}/privacy-policy`,
  contacto: "Administraciones Integrales K'eni, Huixquilucan, Estado de México",
  version: "1.0.0",
  idioma_principal: "Español (México)",
  clasificacion_contenido: "Apto para todos (E)",
  requiere_internet: "Sí (funciones principales). Acceso offline parcial al reglamento.",
};

function CopyField({ label, value, multiline = false, icon: Icon }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(Array.isArray(value) ? value.join(', ') : value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-blue-600" />}
          <span className="text-sm font-semibold text-slate-700">{label}</span>
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
            copied ? 'bg-green-100 text-green-700' : 'bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-700'
          }`}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      {multiline ? (
        <pre className="text-sm text-slate-600 whitespace-pre-wrap font-sans leading-relaxed bg-slate-50 rounded-xl p-4 max-h-48 overflow-y-auto">
          {value}
        </pre>
      ) : Array.isArray(value) ? (
        <div className="flex flex-wrap gap-1.5">
          {value.map(k => (
            <span key={k} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-medium">{k}</span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-700 font-medium">{value}</p>
      )}
    </div>
  );
}

export default function PlayStoreFicha() {
  const handleExportAll = () => {
    const content = `
FICHA TÉCNICA — K'eni Connect
Google Play Console
Generada: ${new Date().toLocaleDateString('es-MX')}
${'='.repeat(60)}

NOMBRE COMPLETO: ${FICHA.nombre_completo}
NOMBRE CORTO: ${FICHA.nombre_corto}
VERSIÓN: ${FICHA.version}
CATEGORÍA: ${FICHA.categoria}
CLASIFICACIÓN: ${FICHA.clasificacion_contenido}
IDIOMA: ${FICHA.idioma_principal}

DESCRIPCIÓN CORTA (80 chars):
${FICHA.descripcion_corta}

DESCRIPCIÓN LARGA (4000 chars):
${FICHA.descripcion_larga}

PALABRAS CLAVE:
${FICHA.keywords.join(', ')}

URL POLÍTICA DE PRIVACIDAD:
${FICHA.privacidad_url}

CONTACTO:
${FICHA.contacto}

ACCESO A INTERNET:
${FICHA.requiere_internet}
`.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "keni-connect-ficha-playstore.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Ficha Google Play Console</h1>
              <p className="text-slate-400 text-sm">K'eni Connect · Parámetros para publicación</p>
            </div>
          </div>
          <Button
            onClick={handleExportAll}
            className="bg-green-600 hover:bg-green-700 rounded-xl h-10 gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar todo (.txt)
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-8 space-y-4">

        {/* Aviso */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 text-blue-700 text-sm">
          <strong>Instrucciones:</strong> Copia cada campo directamente a la sección correspondiente de la Google Play Console.
          Usa "Exportar todo" para descargar un archivo .txt con todos los datos.
        </div>

        {/* Identidad */}
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider pt-2">Identidad de la App</h2>
        <div className="grid grid-cols-2 gap-4">
          <CopyField label="Nombre completo" value={FICHA.nombre_completo} icon={Smartphone} />
          <CopyField label="Nombre corto" value={FICHA.nombre_corto} icon={Smartphone} />
          <CopyField label="Versión" value={FICHA.version} icon={Tag} />
          <CopyField label="Categoría" value={FICHA.categoria} icon={Tag} />
          <CopyField label="Clasificación de contenido" value={FICHA.clasificacion_contenido} icon={Tag} />
          <CopyField label="Idioma principal" value={FICHA.idioma_principal} icon={Globe} />
        </div>

        {/* Descripciones */}
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider pt-2">Descripciones</h2>
        <CopyField label="Descripción corta (máx. 80 caracteres)" value={FICHA.descripcion_corta} icon={AlignLeft} />
        <CopyField label="Descripción larga (máx. 4,000 caracteres)" value={FICHA.descripcion_larga} icon={AlignLeft} multiline />

        {/* SEO / Keywords */}
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider pt-2">Palabras Clave</h2>
        <CopyField label="Keywords (separadas por coma)" value={FICHA.keywords} icon={Tag} />

        {/* Legal */}
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider pt-2">Legal y Contacto</h2>
        <div className="grid grid-cols-1 gap-4">
          <CopyField label="URL Política de Privacidad" value={FICHA.privacidad_url} icon={FileText} />
          <CopyField label="Contacto del desarrollador" value={FICHA.contacto} icon={Globe} />
          <CopyField label="Acceso a Internet" value={FICHA.requiere_internet} icon={Globe} />
        </div>

        {/* Footer */}
        <div className="pt-8 pb-4 text-center text-slate-400 text-sm">
          K'eni Connect · Administraciones Integrales K'eni · Huixquilucan, Estado de México
        </div>
      </main>
    </div>
  );
}