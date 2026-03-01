import type { NextConfig } from "next";

const nextConfig: any = {
  output: "export",
  basePath: "/crm",
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true }
};

export default nextConfig;
