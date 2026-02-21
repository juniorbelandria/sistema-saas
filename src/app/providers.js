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
            toast: "max-w-[250px] py-1.5 px-2.5",
            title: "text-[11px] font-extrabold",
            description: "text-[10px] leading-tight"
          }}
        />
        {children}
      </HeroUIProvider>
    </NextThemesProvider>
  );
}
