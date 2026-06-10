import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const backendHost = process.env.NEXT_PUBLIC_BACKEND_HOST || "localhost";
const backendPort = process.env.NEXT_PUBLIC_BACKEND_PORT || "5000";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: backendHost,
        port: backendPort,
        pathname: "/uploads/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
