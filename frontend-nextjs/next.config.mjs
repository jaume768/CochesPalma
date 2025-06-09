/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'www.autocasionmallorca.com',
                port: '',
                pathname: '/**', // Permite cualquier ruta dentro de este dominio
            },
            {
                protocol: 'https',
                hostname: 'fotos.inventario.pro',
                port: '',
                pathname: '/**', // Permite imágenes de este otro dominio también
            },
            {
                protocol: 'https',
                hostname: 'www.portalclub.es',
                port: '',
                pathname: '/**', // Y este, por si acaso
            },
            {
                protocol: 'https',
                hostname: 'example.com',
                port: '',
                pathname: '/**', // Permite cualquier ruta dentro de este dominio
            },
            {
                protocol: 'https',
                hostname: 'carweb.rent',
                port: '',
                pathname: '/**', // Permite cualquier ruta dentro de este dominio
            }
        ],
        dangerouslyAllowSVG: true,
        unoptimized: true,
    },
    experimental: {
        externalDir: true
    }
};

export default nextConfig;
