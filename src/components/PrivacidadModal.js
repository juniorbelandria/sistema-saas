'use client';

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react';
import { Shield } from 'lucide-react';

export default function PrivacidadModal({ isOpen, onClose }) {
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
          <Shield className="w-5 h-5 text-primary" />
          <span className="text-xl font-bold">Política de Privacidad</span>
        </ModalHeader>
        <ModalBody>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="text-xs text-foreground/60 mb-4">Última actualización: Febrero 2026</p>

            <section className="mb-6">
              <h3 className="text-base font-bold text-foreground mb-2">1. INTRODUCCIÓN</h3>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Esta Política de Privacidad describe cómo Sistema POS recopila, usa, almacena y protege la información personal 
                de los usuarios. Al utilizar nuestra Plataforma, usted acepta las prácticas descritas en esta política.
              </p>
            </section>

            <section className="mb-6">
              <h3 className="text-base font-bold text-foreground mb-2">2. INFORMACIÓN QUE RECOPILAMOS</h3>
              
              <h4 className="text-sm font-semibold text-foreground mt-3 mb-2">2.1 Información Proporcionada Directamente</h4>
              <p className="text-sm text-foreground/80 leading-relaxed mb-2"><strong>Registro de Cuenta:</strong></p>
              <ul className="text-sm text-foreground/80 space-y-1 ml-4 mb-3">
                <li>• Nombre completo</li>
                <li>• Correo electrónico</li>
                <li>• Teléfono</li>
                <li>• Contraseña (encriptada)</li>
              </ul>

              <p className="text-sm text-foreground/80 leading-relaxed mb-2"><strong>Información del Negocio:</strong></p>
              <ul className="text-sm text-foreground/80 space-y-1 ml-4 mb-3">
                <li>• Nombre comercial y razón social</li>
                <li>• Dirección física</li>
                <li>• Identificación fiscal (RIF, RFC, RUC, CUIT, NIT, etc.)</li>
                <li>• Régimen fiscal</li>
                <li>• País y moneda de operación</li>
              </ul>

              <h4 className="text-sm font-semibold text-foreground mt-3 mb-2">2.2 Información Recopilada Automáticamente</h4>
              <ul className="text-sm text-foreground/80 space-y-1 ml-4">
                <li>• Dirección IP</li>
                <li>• Tipo de navegador y versión</li>
                <li>• Sistema operativo</li>
                <li>• Fecha y hora de acceso</li>
                <li>• Cookies de sesión y preferencias</li>
              </ul>
            </section>

            <section className="mb-6">
              <h3 className="text-base font-bold text-foreground mb-2">3. CÓMO USAMOS SU INFORMACIÓN</h3>
              <p className="text-sm text-foreground/80 leading-relaxed mb-2">Utilizamos su información para:</p>
              <ul className="text-sm text-foreground/80 space-y-1 ml-4">
                <li>• Crear y gestionar su cuenta</li>
                <li>• Procesar transacciones</li>
                <li>• Generar comprobantes de venta</li>
                <li>• Proporcionar soporte técnico</li>
                <li>• Enviar notificaciones importantes del servicio</li>
                <li>• Analizar el uso de la Plataforma</li>
                <li>• Mejorar la experiencia del usuario</li>
                <li>• Prevenir fraudes y abusos</li>
              </ul>
            </section>

            <section className="mb-6">
              <h3 className="text-base font-bold text-foreground mb-2">4. COMPARTIR INFORMACIÓN</h3>
              
              <div className="p-3 bg-success/10 rounded-lg border border-success/20 mb-3">
                <p className="text-sm font-semibold text-success mb-1">✓ NO Vendemos sus Datos</p>
                <p className="text-sm text-foreground/80">
                  Nunca vendemos, alquilamos o comercializamos su información personal a terceros.
                </p>
              </div>

              <h4 className="text-sm font-semibold text-foreground mt-3 mb-2">Compartimos Información Solo Cuando:</h4>
              <ul className="text-sm text-foreground/80 space-y-1 ml-4">
                <li><strong>• Proveedores de Servicios:</strong> Hosting, procesadores de pago, servicios de análisis</li>
                <li><strong>• Requisitos Legales:</strong> Cuando lo requiera la ley o procesos legales</li>
                <li><strong>• Transferencia de Negocio:</strong> En caso de fusión o adquisición</li>
              </ul>
            </section>

            <section className="mb-6">
              <h3 className="text-base font-bold text-foreground mb-2">5. SEGURIDAD DE LA INFORMACIÓN</h3>
              <p className="text-sm text-foreground/80 leading-relaxed mb-2">
                Implementamos medidas técnicas y organizativas para proteger su información:
              </p>
              <ul className="text-sm text-foreground/80 space-y-1 ml-4">
                <li>• Encriptación SSL/TLS para transmisión de datos</li>
                <li>• Encriptación de contraseñas (bcrypt/argon2)</li>
                <li>• Firewalls y sistemas de detección de intrusiones</li>
                <li>• Respaldos regulares y cifrados</li>
                <li>• Acceso restringido a datos personales</li>
              </ul>
              <p className="text-sm text-foreground/80 leading-relaxed mt-2">
                <strong>Nota:</strong> Ningún sistema es 100% seguro. Aunque implementamos medidas razonables, 
                no podemos garantizar seguridad absoluta.
              </p>
            </section>

            <section className="mb-6">
              <h3 className="text-base font-bold text-foreground mb-2">6. SUS DERECHOS</h3>
              <p className="text-sm text-foreground/80 leading-relaxed mb-2">
                Dependiendo de su jurisdicción, usted tiene derecho a:
              </p>
              <ul className="text-sm text-foreground/80 space-y-1 ml-4">
                <li>• <strong>Acceso:</strong> Obtener copia de sus datos personales</li>
                <li>• <strong>Rectificación:</strong> Corregir datos inexactos</li>
                <li>• <strong>Supresión:</strong> Solicitar eliminación de sus datos</li>
                <li>• <strong>Portabilidad:</strong> Recibir sus datos en formato estructurado</li>
                <li>• <strong>Oposición:</strong> Oponerse al procesamiento de sus datos</li>
                <li>• <strong>Limitación:</strong> Restringir el procesamiento en ciertos casos</li>
              </ul>
              <p className="text-sm text-foreground/80 leading-relaxed mt-2">
                Para ejercer cualquier derecho, contáctenos en: <strong>privacidad@sistemapos.com</strong>
              </p>
            </section>

            <section className="mb-6">
              <h3 className="text-base font-bold text-foreground mb-2">7. COOKIES Y TECNOLOGÍAS DE RASTREO</h3>
              <p className="text-sm text-foreground/80 leading-relaxed mb-2">Usamos cookies para:</p>
              <ul className="text-sm text-foreground/80 space-y-1 ml-4">
                <li>• <strong>Cookies Esenciales:</strong> Autenticación de sesión y seguridad</li>
                <li>• <strong>Cookies de Funcionalidad:</strong> Recordar preferencias del usuario</li>
                <li>• <strong>Cookies Analíticas:</strong> Análisis de uso y métricas de rendimiento</li>
              </ul>
              <p className="text-sm text-foreground/80 leading-relaxed mt-2">
                Puede controlar cookies a través de la configuración de su navegador.
              </p>
            </section>

            <section className="mb-6">
              <h3 className="text-base font-bold text-foreground mb-2">8. RETENCIÓN DE DATOS</h3>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Conservamos su información mientras su cuenta esté activa o sea necesario para proporcionar servicios. 
                Después de la cancelación de cuenta:
              </p>
              <ul className="text-sm text-foreground/80 space-y-1 ml-4 mt-2">
                <li>• Datos personales: eliminados en 30 días</li>
                <li>• Datos fiscales: conservados según requisitos legales (5-10 años)</li>
                <li>• Datos anonimizados: pueden conservarse para análisis estadísticos</li>
              </ul>
            </section>

            <section className="mb-6">
              <h3 className="text-base font-bold text-foreground mb-2">9. PRIVACIDAD DE MENORES</h3>
              <p className="text-sm text-foreground/80 leading-relaxed">
                La Plataforma está destinada a usuarios mayores de 18 años. No recopilamos intencionalmente información 
                de menores de edad. Si descubrimos que hemos recopilado datos de un menor, los eliminaremos inmediatamente.
              </p>
            </section>

            <section className="mb-6">
              <h3 className="text-base font-bold text-foreground mb-2">10. CONTACTO</h3>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Para consultas sobre privacidad o sus datos personales:<br />
                <strong>Email:</strong> privacidad@sistemapos.com<br />
                <strong>Sitio web:</strong> www.sistemapos.com/privacidad
              </p>
              <p className="text-sm text-foreground/80 leading-relaxed mt-2">
                Tiene derecho a presentar una queja ante la autoridad de protección de datos de su país si considera 
                que hemos violado sus derechos de privacidad.
              </p>
            </section>

            <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm font-semibold text-foreground mb-2">Cumplimiento Legal:</p>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Esta Política de Privacidad está diseñada para cumplir con las principales regulaciones de protección 
                de datos a nivel mundial, incluyendo GDPR (UE), LGPD (Brasil), CCPA (California), y otras leyes aplicables.
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
