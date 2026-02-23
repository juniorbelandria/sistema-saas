import { Suspense } from 'react';
import VerifyEmailClient from './VerifyEmailClient';

// Configuración de segmento de ruta (solo en Server Components)
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

// Server Component que recibe searchParams
export default function VerifyEmailPage({ searchParams }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-foreground/60">Cargando seguridad...</p>
        </div>
      </div>
    }>
      <VerifyEmailClient searchParamsPromise={searchParams} />
    </Suspense>
  );
}
