'use client';

export default function TermsOfService() {
  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="rounded-2xl p-8 md:p-12" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E4EBFA' }}>
          <h1 className="text-3xl font-bold mb-8" style={{ color: '#1D1D1F' }}>Términos del Servicio</h1>

          <div className="space-y-6 text-sm leading-relaxed" style={{ color: '#1D1D1F99' }}>
            <section>
              <h2 className="text-lg font-semibold mb-3" style={{ color: '#1D1D1F' }}>1. Aceptación de los términos</h2>
              <p>Al acceder y utilizar Eventos, aceptas cumplir con estos términos del servicio. Si no estás de acuerdo con alguna parte, no debes utilizar la plataforma.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3" style={{ color: '#1D1D1F' }}>2. Descripción del servicio</h2>
              <p>Eventos es una plataforma de gestión de eventos que permite a los usuarios crear, gestionar y promocionar eventos, así como conectar sus cuentas de Instagram para sincronizar y mostrar publicaciones.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3" style={{ color: '#1D1D1F' }}>3. Cuentas de usuario</h2>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Eres responsable de mantener la confidencialidad de tu cuenta</li>
                <li>Debes proporcionar información precisa y actualizada</li>
                <li>No puedes utilizar la plataforma para actividades ilegales</li>
                <li>Nos reservamos el derecho de suspender cuentas que violen estos términos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3" style={{ color: '#1D1D1F' }}>4. Conexión con Instagram</h2>
              <p>Al conectar tu cuenta de Instagram, aceptas los términos de la plataforma de Meta. La sincronización de publicaciones se realiza bajo los permisos que autorices durante el proceso de autenticación.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3" style={{ color: '#1D1D1F' }}>5. Limitación de responsabilidad</h2>
              <p>Eventos no se hace responsable por daños directos o indirectos derivados del uso de la plataforma, incluyendo la pérdida de datos o la interrupción del servicio.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3" style={{ color: '#1D1D1F' }}>6. Cambios en los términos</h2>
              <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en la plataforma.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3" style={{ color: '#1D1D1F' }}>7. Contacto</h2>
              <p>Para consultas sobre estos términos, contáctanos a través de nuestro correo electrónico.</p>
            </section>

            <p className="text-xs pt-4" style={{ color: '#1D1D1F66' }}>Última actualización: Mayo 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
