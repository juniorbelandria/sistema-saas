'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

const Toaster = ({ ...props }) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      visibleToasts={1}
      duration={800}
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-content1 group-[.toaster]:text-foreground group-[.toaster]:border-divider group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-foreground/60',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-content2 group-[.toast]:text-foreground/60',
          success: 'group-[.toast]:bg-success/10 group-[.toast]:text-success group-[.toast]:border-success/20',
          error: 'group-[.toast]:bg-danger/10 group-[.toast]:text-danger group-[.toast]:border-danger/20',
          warning: 'group-[.toast]:bg-warning/10 group-[.toast]:text-warning group-[.toast]:border-warning/20',
          info: 'group-[.toast]:bg-primary/10 group-[.toast]:text-primary group-[.toast]:border-primary/20',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
