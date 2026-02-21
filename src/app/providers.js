'use client'; // OBLIGATORIO

import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/toast";
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useEffect, useState } from "react";

export function Providers({ children }) {
  const [mounted, setMounted] = useState(false);

  // Esto evita el error de hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="opacity-0">{children}</div>;

  return (
    <NextThemesProvider attribute="class" defaultTheme="light">
      <HeroUIProvider>
        <ToastProvider 
          maxVisibleToasts={1}
          placement="top-right" 
          duration={800}
          disableAnimation={false}
          classNames={{
            toast: "text-sm py-2 px-3 max-w-[280px]",
            title: "text-xs font-bold",
            description: "text-[11px] leading-tight"
          }}
        />
        {children}
      </HeroUIProvider>
    </NextThemesProvider>
  );
}
