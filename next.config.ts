import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Medusa seeded product images hosted on S3
      {
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
      // Images uploaded via the Medusa admin (served from /static on the backend)
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/static/**",
      },
      // Same, but for the deployed Render backend (production)
      {
        protocol: "https",
        hostname: "foodorder-backend-q1hp.onrender.com",
        pathname: "/static/**",
      },
    ],
  },
};

export default nextConfig;
