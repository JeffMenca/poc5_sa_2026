import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  transpilePackages: ["@poc5/contracts"],
  turbopack: { root: path.join(__dirname, "..", "..") },
};

export default nextConfig;
