'use client';

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react';
import { FileText } from 'lucide-react';

export default function TerminosModal({ isOpen, onClose }) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="5xl"
      scrollBehavior="inside"
      backdrop="blur"
      classNames={{
        base: "max-h-[90vh]",
        header: "border-b border-divider",
        footer: "border-t border-divider",
        body: "py-6"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <span className="text-xl font-bold">Términos y Condiciones de Uso</span>
        </ModalHeader>
        <ModalBody>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="text-xs text-foreground/60 mb-4">Última actualización: Febrero 2026</p>

            <section className="mb-6">
              <h3 className="text-base font-bold text-foreground mb-2">1. ACEPTACIÓN DE LOS TÉRMINOS</h3>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Al acceder y utilizar el Sistema POS (en adelante "la Plataforma"), usted (en adelante "el Usuario" o "el Negocio") 
                acepta estar legalmente vinculado por estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos 
                términos, no debe utilizar la Plataforma.
              </p>
            </section>

            <section className="mb-6">
              <h3 className="text-base font-bold text-foreground mb-2">2. DESCRIPCIÓN DEL SERVICIO</h3>
              <p className="text-sm text-foreground/80 leading-relaxed mb-2">
                La Plataforma es un sistema de punto de venta que permite:
              </p>
              <ul className="text-sm text-foreground/80 space-y-1 ml-4">
                <li>• Gestión de inventario y productos</li>
                <li>• Registro de ventas y transacciones</li>
                <li>• Generación de comprobantes de venta</li>
                <li>• Reportes y análisis de negocio</li>
                <li>• Gestión multi-moneda</li>
                <li>• Control de usuarios y permisos</li>
              </ul>
            </section>

            <section className="mb-6">
              <h3 className="text-base font-bold text-foreground mb-2">3. RESPONSABILIDADES DEL USUARIO</h3>
              
              <h4 className="text-sm font-semibold text-foreground mt-3 mb-2">3.1 Obligaciones Fiscales</h4>
              <p className="text-sm text-foreground/80 leading-relaxed mb-2">El Usuario reconoce y acepta que:</p>
              <ul className="text-sm text-foreground/80 space-y-1 ml-4">
                <li><strong>a)</strong> Es el único responsable del cumplimiento de todas las obligaciones fiscales, tributarias y legales aplicables en su jurisdicción.</li>
                <li><strong>b)</strong> Debe verificar que los comprobantes generados cumplan con los requisitos legales de su país.</li>
                <li><strong>c)</strong> Debe mantener registros contables adecuados según las leyes locales.</li>
                <li><strong>d)</strong> Debe declarar y pagar todos los impuestos correspondientes a las autoridades fiscales competentes (SENIAT, SAT, DIAN, SRI, SUNAT, AFIP, u otras).</li>
              </ul>

              <h4 className="text-sm font-semibold text-foreground mt-3 mb-2">3.2 Veracidad de la Información</h4>
              <p className="text-sm text-foreground/80 leading-relaxed mb-2">El Usuario garantiza que:</p>
              <ul className="text-sm text-foreground/80 space-y-1 ml-4">
                <li><strong>a)</strong> Toda la información fiscal ingresada (RIF, RFC, RUC, CUIT, NIT, etc.) es verídica y actualizada.</li>
                <li><strong>b)</strong> Los datos del negocio (razón social, dirección, actividad económica) son correctos y verificables.</li>
                <li><strong>c)</strong> Actualizará inmediatamente cualquier cambio en su información fiscal o legal.</li>
              </ul>
            </section>

            <section className="mb-6">
              <h3 className="text-base font-bold text-foreground mb-2">4. LIMITACIONES DEL SERVICIO</h3>
              
              <h4 className="text-sm font-semibold text-foreground mt-3 mb-2">4.1 Facturación Electrónica</h4>
              <p className="text-sm text-foreground/80 leading-relaxed mb-2">
                La Plataforma <strong>NO es un Proveedor Autorizado de Certificación (PAC)</strong> ni un sistema de facturación 
                electrónica certificado.
              </p>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Para facturación electrónica válida ante autoridades fiscales, el Usuario debe contratar un PAC autorizado en su país 
                e integrar dicho servicio con la Plataforma (si aplica).
              </p>

              <h4 className="text-sm font-semibold text-foreground mt-3 mb-2">4.2 Validación Fiscal</h4>
              <p className="text-sm text-foreground/80 leading-relaxed mb-2">La Plataforma:</p>
              <ul className="text-sm text-foreground/80 space-y-1 ml-4">
                <li><strong>a)</strong> NO valida la información fiscal ante autoridades tributarias.</li>
                <li><strong>b)</strong> NO certifica que los documentos cumplan con requisitos legales específicos.</li>
                <li><strong>c)</strong> NO garantiza la aceptación de comprobantes por parte de autoridades fiscales.</li>
                <li><strong>d)</strong> NO proporciona asesoría legal, fiscal o contable.</li>
              </ul>
            </section>

            <section className="mb-6">
              <h3 className="text-base font-bold text-foreground mb-2">5. EXENCIÓN DE RESPONSABILIDAD</h3>
              
              <h4 className="text-sm font-semibold text-foreground mt-3 mb-2">5.1 Responsabilidad Fiscal</h4>
              <p className="text-sm text-foreground/80 leading-relaxed mb-2">
                <strong>Nos eximimos completamente</strong> de cualquier responsabilidad por:
              </p>
              <ul className="text-sm text-foreground/80 space-y-1 ml-4">
                <li>• Multas, sanciones o penalizaciones impuestas por autoridades fiscales</li>
                <li>• Auditorías fiscales o investigaciones tributarias</li>
                <li>• Rechazo de comprobantes por parte de clientes o autoridades</li>
                <li>• Pérdidas económicas derivadas del incumplimiento de obligaciones fiscales</li>
                <li>• Errores en la información fiscal ingresada por el Usuario</li>
              </ul>

              <h4 className="text-sm font-semibold text-foreground mt-3 mb-2">5.2 Responsabilidad Técnica</h4>
              <p className="text-sm text-foreground/80 leading-relaxed mb-2">No somos responsables por:</p>
              <ul className="text-sm text-foreground/80 space-y-1 ml-4">
                <li>• Pérdida de datos debido a fallas técnicas, errores del usuario, o causas de fuerza mayor</li>
                <li>• Interrupciones del servicio por mantenimiento, actualizaciones o problemas técnicos</li>
                <li>• Incompatibilidades con sistemas de terceros</li>
                <li>• Daños indirectos, incidentales o consecuentes derivados del uso de la Plataforma</li>
              </ul>
            </section>

            <section className="mb-6">
              <h3 className="text-base font-bold text-foreground mb-2">6. PROTECCIÓN DE DATOS</h3>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Tratamos los datos personales conforme a nuestra Política de Privacidad y las leyes aplicables de protección de datos 
                (GDPR, LGPD, LOPD, etc.). Implementamos medidas de seguridad razonables, pero el Usuario reconoce que ningún sistema 
                es 100% seguro.
              </p>
            </section>

            <section className="mb-6">
              <h3 className="text-base font-bold text-foreground mb-2">7. MODIFICACIONES</h3>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Nos reservamos el derecho de modificar estos Términos en cualquier momento. Los cambios serán notificados a través 
                de la Plataforma. Podemos modificar, suspender o descontinuar funcionalidades sin previo aviso.
              </p>
            </section>

            <section className="mb-6">
              <h3 className="text-base font-bold text-foreground mb-2">8. CONTACTO</h3>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Para consultas sobre estos Términos:<br />
                Email: legal@sistemapos.com<br />
                Sitio web: www.sistemapos.com
              </p>
            </section>

            <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm font-semibold text-foreground mb-2">IMPORTANTE:</p>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Si tiene dudas sobre sus obligaciones fiscales o legales, consulte con un profesional calificado 
                (contador, abogado tributario, etc.) en su jurisdicción.
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onPress={onClose}>
            Entendido
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
