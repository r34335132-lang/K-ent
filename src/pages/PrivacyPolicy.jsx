import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link
            to={createPageUrl('Kiosk')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-slate-800">Política de Privacidad</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Logo / Branding */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Política de Privacidad</h1>
          <p className="text-slate-500 mt-2">Administraciones Integrales K'eni · K'eni Connect</p>
          <p className="text-slate-400 text-sm mt-1">Última actualización: 23 de febrero de 2026</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">1. Responsable del Tratamiento de Datos</h2>
            <p>
              <strong>Administraciones Integrales K'eni</strong>, con domicilio en el Municipio de Huixquilucan,
              Estado de México, es el responsable del tratamiento de los datos personales recopilados a través
              de la aplicación <strong>K'eni Connect</strong>, en términos de lo dispuesto por la Ley Federal de
              Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y su Reglamento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">2. Datos Personales Recabados</h2>
            <p>A través de K'eni Connect se podrán recopilar los siguientes datos personales:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Nombre completo del residente o inquilino</li>
              <li>Número de departamento o unidad habitacional</li>
              <li>Correo electrónico (para notificaciones y suscripciones)</li>
              <li>Número telefónico de contacto (opcional)</li>
              <li>Mensajes y comentarios enviados a través del buzón</li>
              <li>Reportes de mantenimiento generados desde el kiosco</li>
            </ul>
            <p className="mt-3">
              No se recaban datos sensibles en los términos del artículo 3, fracción VI de la LFPDPPP.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">3. Finalidades del Tratamiento</h2>
            <p>Los datos personales serán utilizados para las siguientes finalidades <strong>primarias</strong>:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Gestión administrativa del condominio</li>
              <li>Atención y seguimiento de reportes de mantenimiento</li>
              <li>Comunicación de avisos, circulares y eventos del condominio</li>
              <li>Respuesta a mensajes del buzón por parte de la administración</li>
              <li>Envío de notificaciones por correo electrónico cuando el residente lo solicite</li>
            </ul>
            <p className="mt-3">Finalidades <strong>secundarias</strong> (opcionales):</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Generación de reportes estadísticos de actividad del condominio</li>
              <li>Mejora continua del servicio de administración</li>
            </ul>
            <p className="mt-3">
              Si el titular no desea que sus datos sean tratados para las finalidades secundarias,
              podrá manifestarlo enviando un correo a la administración del condominio correspondiente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">4. Transferencia de Datos</h2>
            <p>
              Administraciones Integrales K'eni <strong>no transferirá</strong> datos personales a terceros
              sin consentimiento del titular, salvo en los casos previstos en el artículo 37 de la LFPDPPP,
              o cuando sea requerido por autoridad competente.
            </p>
            <p className="mt-3">
              Los datos se alojan en servidores seguros provistos por Base44 Inc., empresa que actúa como
              encargada del tratamiento bajo estándares de seguridad internacionales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">5. Derechos ARCO</h2>
            <p>
              El titular de los datos personales tiene derecho a <strong>Acceder, Rectificar, Cancelar u Oponerse</strong>
              (derechos ARCO) al tratamiento de sus datos. Para ejercer estos derechos, el titular deberá:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Presentar solicitud escrita ante la administración del condominio</li>
              <li>Identificarse con documento oficial</li>
              <li>Indicar claramente el derecho que desea ejercer y los datos correspondientes</li>
            </ul>
            <p className="mt-3">
              La administración tendrá un plazo de <strong>20 días hábiles</strong> para atender la solicitud
              a partir de su recepción.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">6. Seguridad de los Datos</h2>
            <p>
              K'eni Connect implementa medidas técnicas, administrativas y físicas para proteger los datos
              personales contra daño, pérdida, alteración, destrucción o uso no autorizado. El acceso al
              panel de administración está protegido mediante autenticación con roles diferenciados
              (Admin General, Admin Residente, Comité de Vigilancia).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">7. Uso de Cookies y Tecnologías Similares</h2>
            <p>
              La aplicación puede utilizar almacenamiento local (<em>localStorage</em>) del navegador para
              mantener la sesión activa y guardar preferencias del usuario. No se utilizan cookies de
              seguimiento ni publicidad de terceros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">8. Cambios al Aviso de Privacidad</h2>
            <p>
              Administraciones Integrales K'eni se reserva el derecho de actualizar este aviso de privacidad
              en cualquier momento. Los cambios serán notificados a través de los avisos publicados en la
              aplicación K'eni Connect y en los tableros de información de cada condominio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">9. Jurisdicción y Legislación Aplicable</h2>
            <p>
              El presente aviso se rige por las leyes vigentes en los Estados Unidos Mexicanos, en particular
              por la Ley Federal de Protección de Datos Personales en Posesión de los Particulares
              (DOF 05-07-2010), su Reglamento y los Lineamientos del INAI. Para cualquier controversia,
              las partes se someten a la jurisdicción de los tribunales del Municipio de Huixquilucan,
              Estado de México.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">10. Contacto</h2>
            <p>
              Para cualquier consulta relacionada con el tratamiento de sus datos personales, puede
              comunicarse directamente con la administración de su condominio a través del buzón
              disponible en la aplicación K'eni Connect o en las oficinas administrativas ubicadas
              en Huixquilucan, Estado de México.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-slate-100 text-center text-slate-400 text-sm">
          <p>© 2026 Administraciones Integrales K'eni. Todos los derechos reservados.</p>
          <p className="mt-1">K'eni Connect · Huixquilucan, Estado de México</p>
        </div>
      </main>
    </div>
  );
}