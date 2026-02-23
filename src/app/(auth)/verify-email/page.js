import { Suspense } from 'react';
import VerifyEmailContent from './VerifyEmailContent';

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-background items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-foreground/60">Cargando...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
