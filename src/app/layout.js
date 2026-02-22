import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from './providers';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata = {
  title: "POS Sistema",
  description: "Sistema POS con Next.js y Supabase",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="light">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased font-sans text-foreground bg-background`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
