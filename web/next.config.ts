import type { NextConfig } from "next";
import path from "path";

const sharedPath = path.resolve(process.cwd(), '../shared/src');

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: 'standalone',
  turbopack: {
    resolveAlias: {
      '@shared': sharedPath,
    },
  },
};

export default nextConfig;
