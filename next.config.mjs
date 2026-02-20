/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimizaciones de rendimiento
  reactStrictMode: true,
  
  // Optimización de imágenes - Next.js optimizará automáticamente
  images: {
    formats: ['image/avif', 'image/webp'], // Next.js convierte automáticamente a estos formatos
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 31536000, // Cache de 1 año
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Optimización de compilación
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Experimental features para mejor rendimiento
  experimental: {
    optimizePackageImports: ['@heroui/react', 'lucide-react'],
  },
};

export default nextConfig;
