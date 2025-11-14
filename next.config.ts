import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@supabase/supabase-js",
    "@supabase/auth-js",
    "@supabase/ssr",
  ],
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".js": [".js", ".ts", ".tsx"],
    };
    return config;
  },
  // Configuration des images pour autoriser Supabase Storage
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // Désactiver ESLint pendant le build pour Netlify
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Désactiver la vérification des types pendant le build
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
