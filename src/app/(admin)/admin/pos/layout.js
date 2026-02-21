'use client';

export default function POSLayout({ children }) {
  // El POS ocupa toda la pantalla sin sidebar ni header
  return (
    <div className="fixed inset-0 z-50 bg-background">
      {children}
    </div>
  );
}
