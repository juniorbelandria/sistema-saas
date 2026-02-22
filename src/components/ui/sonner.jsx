'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

const Toaster = ({ ...props }) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme}
      richColors
      className="toaster group"
      visibleToasts={1}
      duration={800}
      position="top-right"
      style={{ zIndex: 100 }}
      toastOptions={{
        className: 'my-toast',
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-content1 group-[.toaster]:text-foreground group-[.toaster]:border-2 group-[.toaster]:shadow-xl',
          description: 'group-[.toast]:text-foreground/70',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-content2 group-[.toast]:text-foreground/60',
          success: 'group-[.toast]:border-success group-[.toast]:bg-success/10',
          error: 'group-[.toast]:border-danger group-[.toast]:bg-danger/10',
          warning: 'group-[.toast]:border-warning group-[.toast]:bg-warning/10',
          info: 'group-[.toast]:border-primary group-[.toast]:bg-primary/10',
        },
        style: {
          borderRadius: '0.5rem',
          padding: '12px 16px',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
