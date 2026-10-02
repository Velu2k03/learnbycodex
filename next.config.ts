import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  async headers() {
    return [
      {
        source: "/lab-runtime-worker.js",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'none'; script-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com 'wasm-unsafe-eval'; connect-src https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://api.github.com; img-src data: blob:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; worker-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'",
          },
        ],
      },
    ];
  },
};
export default nextConfig;
