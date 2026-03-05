import type { NextConfig } from "next";
import path from "path";

const sharedPath = path.resolve(process.cwd(), '../shared/src');

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: 'standalone',
  // Required for production/Docker: traces shared/ into standalone output.
  // Only set for build — during dev it breaks resolution (tailwindcss etc.
  // resolved from monorepo root instead of web/node_modules).
  ...(process.env.NODE_ENV === 'production' && {
    outputFileTracingRoot: path.join(__dirname, '../'),
  }),
  turbopack: {
    resolveAlias: {
      '@shared': sharedPath,
    },
  },
};

export default nextConfig;
