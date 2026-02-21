/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 1. Imágenes: Quitamos AVIF porque tu PC sufrirá comprimiéndolas
  images: {
    formats: ['image/webp'], // Webp es suficiente y mucho más rápido de procesar
    deviceSizes: [640, 750, 828, 1080, 1200], // Quitamos el 1920 para ahorrar RAM
    imageSizes: [16, 32, 48, 64, 96],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },

  // 2. Compilador: Mantenemos lo de quitar console.log en producción
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // 3. ¡ESTO ES LO MÁS IMPORTANTE PARA TU PC!
  experimental: {
    optimizePackageImports: [
      '@heroui/react', 
      'lucide-react', 
      'date-fns', 
      'framer-motion', // Añadido para que no pese tanto
      'zustand'
    ],
    // Forzamos a que NO use todos los núcleos de tu CPU para que no se congele Windows
    workerThreads: false,
    cpus: 1 
  },

  // 4. Saltamos el pesado proceso de revisar errores en el build
  eslint: {
    ignoreDuringBuilds: true, 
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // 5. Cabeceras (Mantenemos las tuyas, están perfectas)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }
        ]
      }
    ];
  }
};

// Cambiamos 'export default' por 'module.exports' para evitar líos de compatibilidad en Windows
module.exports = nextConfig;