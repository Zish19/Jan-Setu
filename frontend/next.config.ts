import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silence Turbopack error since we have a custom webpack config
  serverExternalPackages: ['sharp', 'onnxruntime-node'],
  turbopack: {},
  // Override webpack config for transformers.js WASM
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "sharp$": false,
      "onnxruntime-node$": false,
    }
    return config;
  },
};

export default nextConfig;
