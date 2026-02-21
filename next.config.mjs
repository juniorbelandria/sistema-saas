/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // 1. Forzar el uso del compilador SWC para minificación (es mucho más rápido que Terser)
  swcMinify: true,

  images: {
    formats: ['image/avif', 'image/webp'],
    // Mantengo tus tamaños, están bien equilibrados
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // 2. Optimización de salida para despliegues (Docker, Vercel, etc.)
  // 'standalone' reduce drásticamente el tamaño de la imagen de despliegue
  output: 'standalone',

  experimental: {
    optimizePackageImports: [
      '@heroui/react', 
      'lucide-react', 
      'date-fns', // Añadido: Librerías comunes que pesan mucho
      'lodash-es'
    ],
  },

  // 3. Cabeceras de seguridad y rendimiento (Opcional pero recomendado)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          }
        ]
      }
    ];
  }
};

export default nextConfig;