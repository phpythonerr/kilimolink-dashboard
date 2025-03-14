import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kilimolink.ams3.cdn.digitaloceanspaces.com",
        port: "",
        pathname: "/kilimolink/**",
      },

      {
        protocol: "https",
        hostname: "kilimolink.s3.eu-west-2.amazonaws.com",
        port: "",
        pathname: "/**",
      },

      {
        protocol: "https",
        hostname: "static.kilimolink-cdn.site",
        port: "",
        pathname: "/kilimolink/**",
      },
      {
        protocol: "https",
        hostname: "api.kilimolink.site",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
