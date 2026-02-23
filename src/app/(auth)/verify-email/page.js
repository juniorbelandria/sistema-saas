import { Suspense } from 'react';
import { connection } from 'next/server';
import VerifyEmailContent from './VerifyEmailContent';

// Componente SERVIDOR que envuelve el componente cliente en Suspense
export default async function VerifyEmailPage() {
  // Forzar renderizado dinámico usando connection() - Next.js 16
  await connection();
  
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-foreground/60">Cargando verificador...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
