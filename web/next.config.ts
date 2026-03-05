import type { NextConfig } from "next";
import path from "path";

const sharedPath = path.resolve(process.cwd(), '../shared/src');

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: 'standalone',
  // Required for Docker: makes Next.js trace shared/ files into the standalone
  // output. Without this, files outside web/ are not included and the server
  // fails to start in the container.
  outputFileTracingRoot: path.join(__dirname, '../'),
  turbopack: {
    resolveAlias: {
      '@shared': sharedPath,
    },
    root: path.resolve(process.cwd(), '..'),
  },
};

export default nextConfig;
