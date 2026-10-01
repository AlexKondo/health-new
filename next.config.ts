import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      // Uploads de imagem (banners, logos, etc.) passam pela server action
      // como multipart/form-data. O padrão do Next (1MB) é menor que o
      // limite de 3MB que o próprio app já valida em lib/storage.ts — sem
      // isso, um upload entre 1MB e 3MB era rejeitado pelo framework antes
      // mesmo de chegar no código, com uma tela de erro genérica.
      bodySizeLimit: "5mb",
    },
  },
  images: {
    remotePatterns: [
      // Imagens enviadas pelo admin ficam no Supabase Storage.
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
