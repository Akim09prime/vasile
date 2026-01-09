
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
             {
                protocol: 'https',
                hostname: 'firebasestorage.googleapis.com',
            },
            {
                protocol: 'https',
                hostname: 'storage.googleapis.com',
            }
        ]
    },
    experimental: {
        allowedDevOrigins: [
            "http://localhost:3000",
            "http://localhost",
            "http://0.0.0.0",
            "https://*.cloudworkstations.dev",
            "https://9000-firebase-studio-1767455703282.cluster-55m56i2mgjalcvl276gecmncu6.cloudworkstations.dev"
        ]
    }
};

export default nextConfig;

    